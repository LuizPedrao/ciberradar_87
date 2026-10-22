import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { submitLeadSchema } from "./lead-schema";
import { buildResult, decodeAnswers, answersToRecord } from "./scoring";
import { normalizeBrPhone } from "./whatsapp";

const MAX_PER_HOUR = 5;

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type SubmitLeadResult =
  | { ok: true; score: number; classification: string; company: string; name: string }
  | { ok: false; error: string };

// Endpoint público restrito ao cadastro de leads. Não lê nem devolve dados de terceiros.
export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => submitLeadSchema.parse(input))
  .handler(async ({ data }): Promise<SubmitLeadResult> => {
    // Honeypot: robôs preenchem o campo oculto. Respondemos de forma neutra.
    if (data.website && data.website.trim() !== "") {
      return { ok: false, error: "Não foi possível enviar. Tente novamente." };
    }
    const answers = decodeAnswers(data.answers);
    const phone = normalizeBrPhone(data.whatsapp);
    if (!answers || !phone) return { ok: false, error: "Dados inválidos." };

    const result = buildResult(answers); // recalculado no servidor
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ip =
      getRequestHeader("cf-connecting-ip") ||
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const sourceHash = await sha256(`ciberradar:${ip}`);

    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("source_hash", sourceHash)
      .gte("created_at", since);
    if ((count ?? 0) >= MAX_PER_HOUR) {
      return { ok: false, error: "Muitas solicitações recentes. Tente novamente mais tarde." };
    }

    const payload = {
      submission_id: data.submission_id,
      name: data.name,
      company: data.company,
      whatsapp: phone,
      email: data.email ? data.email.toLowerCase() : null,
      company_size: data.company_size,
      main_concern: data.main_concern || null,
      score: result.score,
      classification: result.classification,
      answers: answersToRecord(answers),
      consent_contact_at: new Date().toISOString(),
      consent_marketing: data.consent_marketing,
      source_hash: sourceHash,
    };

    const { error } = await supabaseAdmin.from("leads").insert(payload);
    // 23505 = envio repetido com o mesmo identificador: já está salvo.
    if (error && error.code !== "23505") {
      console.error("lead insert failed", error.code);
      return { ok: false, error: "Não foi possível registrar sua solicitação. Tente novamente." };
    }
    return {
      ok: true,
      score: result.score,
      classification: result.classification,
      company: data.company,
      name: data.name,
    };
  });
