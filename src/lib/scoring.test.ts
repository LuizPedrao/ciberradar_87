import { describe, expect, it } from "vitest";
import { buildResult, classify, computeScore, decodeAnswers, type Answer } from "./scoring";
import { buildWhatsAppLink, normalizeBrPhone } from "./whatsapp";
import { leadFormSchema } from "./lead-schema";

const all = (a: Answer) => Array(10).fill(a) as Answer[];

describe("pontuação", () => {
  it("dez Sim = 100", () => expect(computeScore(all("sim"))).toBe(100));
  it("dez Não = 0", () => expect(computeScore(all("nao"))).toBe(0));
  it("dez Não sei = 30", () => expect(computeScore(all("nao_sei"))).toBe(30));
  it("rejeita respostas incompletas", () => expect(() => computeScore(all("sim").slice(0, 9))).toThrow());
  it("faixas de classificação", () => {
    expect(classify(39)).toBe("Alta necessidade de atenção");
    expect(classify(40)).toBe("Proteção em desenvolvimento");
    expect(classify(69)).toBe("Proteção em desenvolvimento");
    expect(classify(70)).toBe("Boas práticas iniciais");
  });
  it("decodifica somente códigos válidos", () => {
    expect(decodeAnswers("ssssssssss")).toEqual(all("sim"));
    expect(decodeAnswers("sss")).toBeNull();
    expect(decodeAnswers("ssssssssqq")).toBeNull();
  });
});

describe("recomendações", () => {
  it("MFA Não gera recomendação de MFA", () => {
    const a = all("sim");
    a[0] = "nao";
    expect(buildResult(a).recommendations[0].text).toBe(
      "Priorize a ativação de autenticação multifator nos sistemas que oferecem esse recurso.",
    );
  });
  it("Backup Não e Treinamento Não geram recomendações específicas", () => {
    const a = all("sim");
    a[2] = "nao";
    a[7] = "nao";
    const texts = buildResult(a).recommendations.map((r) => r.text);
    expect(texts).toContain("Estabeleça uma rotina de backup com cópias protegidas e verificações periódicas.");
    expect(texts).toContain("Promova orientações básicas sobre phishing e engenharia social.");
  });
  it("Não sei gera orientação de verificação", () => {
    const a = all("sim");
    a[4] = "nao_sei";
    expect(buildResult(a).recommendations[0].text).toBe(
      "Verifique com o responsável pela tecnologia se esta prática já está implementada.",
    );
  });
  it("tudo Sim não gera recomendações", () => expect(buildResult(all("sim")).recommendations).toHaveLength(0));
});

describe("WhatsApp e formulário", () => {
  it("valida telefone brasileiro", () => {
    expect(normalizeBrPhone("(11) 98765-4321")).toBe("11987654321");
    expect(normalizeBrPhone("+55 11 98765-4321")).toBe("11987654321");
    expect(normalizeBrPhone("12345")).toBeNull();
    expect(normalizeBrPhone("(11) 88765-4321")).toBeNull();
  });
  it("não gera link sem número configurado", () => {
    expect(buildWhatsAppLink(null, { company: "A", name: "B", score: 1, classification: "C" })).toBeNull();
  });
  it("gera link codificado quando configurado", () => {
    const link = buildWhatsAppLink("5511987654321", { company: "A&B", name: "Ana", score: 70, classification: "Boas práticas iniciais" })!;
    expect(link.startsWith("https://wa.me/5511987654321?text=")).toBe(true);
    expect(link).toContain(encodeURIComponent("Empresa: A&B"));
  });
  it("formulário exige consentimento de contato", () => {
    const r = leadFormSchema.safeParse({
      name: "Ana Souza", company: "Empresa X", whatsapp: "11987654321", email: "",
      company_size: "1-5", main_concern: "", consent_contact: false, consent_marketing: false,
    });
    expect(r.success).toBe(false);
  });
  it("formulário rejeita campos com marcação", () => {
    const r = leadFormSchema.safeParse({
      name: "<script>", company: "Empresa X", whatsapp: "11987654321", email: "",
      company_size: "1-5", consent_contact: true, consent_marketing: false,
    });
    expect(r.success).toBe(false);
  });
});
