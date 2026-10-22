import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — CiberRadar PME" },
      { name: "description", content: "Como o CiberRadar PME coleta, usa e protege dados pessoais conforme a LGPD." },
      { property: "og:title", content: "Política de privacidade — CiberRadar PME" },
      { property: "og:description", content: "Tratamento de dados pessoais no CiberRadar PME." },
    ],
  }),
  component: () => (
    <LegalPage title="Política de privacidade">
      <p>Esta política descreve como o CiberRadar PME trata dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
      <h2>Dados coletados</h2>
      <p>O diagnóstico pode ser feito sem fornecer dados pessoais. Ao solicitar orientação, coletamos: nome, empresa, WhatsApp, e-mail (opcional), quantidade de colaboradores, principal preocupação (opcional), as respostas do diagnóstico e o registro dos consentimentos. Para prevenir abuso, armazenamos um identificador irreversível (hash) derivado do endereço de origem da solicitação.</p>
      <h2>Finalidade e base legal</h2>
      <p>Os dados são usados exclusivamente para entrar em contato sobre a orientação solicitada (base legal: consentimento). O envio de novidades ocorre apenas se você marcar a opção específica, e pode ser revogado a qualquer momento.</p>
      <h2>Compartilhamento</h2>
      <p>Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais. Os dados ficam armazenados em infraestrutura de nuvem com controle de acesso restrito a administradores autorizados.</p>
      <h2>Retenção</h2>
      <p>Os dados são mantidos pelo tempo necessário ao atendimento solicitado ou até a revogação do consentimento.</p>
      <h2>Seus direitos</h2>
      <p>Você pode solicitar confirmação, acesso, correção, anonimização, portabilidade ou exclusão dos seus dados, além de revogar consentimentos, pelos canais indicados na página de contato.</p>
      <h2>Controlador e encarregado</h2>
      <p className="rounded-lg border border-warning/40 bg-warning/10 p-3">Pendente: razão social, CNPJ e contato do encarregado (DPO) devem ser preenchidos pelo responsável antes da publicação oficial.</p>
    </LegalPage>
  ),
});
