import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso — CiberRadar PME" },
      { name: "description", content: "Condições de uso do diagnóstico de segurança digital CiberRadar PME." },
      { property: "og:title", content: "Termos de uso — CiberRadar PME" },
      { property: "og:description", content: "Condições de uso do CiberRadar PME." },
    ],
  }),
  component: () => (
    <LegalPage title="Termos de uso">
      <h2>Natureza do serviço</h2>
      <p>O CiberRadar PME oferece uma avaliação orientativa de práticas de segurança da informação, baseada exclusivamente nas respostas fornecidas pelo usuário.</p>
      <h2>Limitações</h2>
      <p>O resultado não constitui auditoria, certificação, laudo técnico ou garantia de conformidade, e não atesta a ausência de vulnerabilidades. Nenhum sistema da empresa é acessado ou analisado.</p>
      <h2>Responsabilidades do usuário</h2>
      <p>O usuário é responsável pela veracidade das informações fornecidas e não deve inserir senhas, credenciais ou dados sensíveis nos campos do formulário.</p>
      <h2>Uso adequado</h2>
      <p>É proibido utilizar a plataforma para envio automatizado, abuso ou tentativa de acesso não autorizado.</p>
      <h2>Alterações</h2>
      <p>Estes termos podem ser atualizados. A versão vigente estará sempre disponível nesta página.</p>
      <p className="rounded-lg border border-warning/40 bg-warning/10 p-3">Pendente: identificação do responsável legal e foro devem ser preenchidos antes da publicação oficial.</p>
    </LegalPage>
  ),
});
