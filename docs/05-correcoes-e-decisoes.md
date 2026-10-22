# Histórico de decisões e correções

## Decisões de produto tomadas na preparação
| Tema | Decisão | Justificativa |
|---|---|---|
| Escopo | Diagnóstico educativo + CRM leve | Testar interesse sem construir plataforma grande |
| Venda | Conversa pelo WhatsApp | Evitar checkout antes de validar demanda |
| Pontuação | Regras fixas e determinísticas | Transparência, consistência e baixo custo |
| Diagnóstico | Gratuito sem cadastro obrigatório | Reduzir atrito e respeitar minimização de dados |
| Backend | Lovable Cloud / serviços gerenciados | Não administrar infraestrutura própria no MVP |
| Painel | Uso administrativo restrito | Proteger informações de leads |
| Integrações | Sem Resend, Stripe ou n8n | Simplificar versão inicial |
| Nome técnico | Repositório criado como `pixel-perfect-replay-4997` | Nome original do projeto sincronizado pelo Lovable; marca pública é CiberRadar PME |

## Evidências da evolução
- **22/10/2026:** definição do conceito CiberRadar PME, produção de prompt-base e link público informado: https://pixel-perfect-replay-4997.lovable.app/
- **22/10/2026:** sincronização Lovable/GitHub confirmada na interface pelo status "In sync with GitHub" e branch `main`.
- **22/10/2026:** documentação técnica/comercial adicionada ao repositório.

## Correções pós-construção
**Ainda não há lista confiável de defeitos observados e prompts corretivos executados registrada nesta conversa.** Não inventar iterações.

Use a tabela abaixo após a homologação:

| Data | Erro observado | Evidência | Prompt/alteração solicitado(a) ao Lovable | Reteste | Resultado |
|---|---|---|---|---|---|
| A preencher | — | — | — | Pendente | Pendente |

## Prompt único para pedir correções após os testes
```text
Atue como engenheiro full-stack e QA sênior. No projeto CiberRadar PME, corrija somente as falhas confirmadas nos testes abaixo. Preserve dados, rotas, design, configuração do Lovable Cloud, autenticação e políticas RLS. Para cada falha, explique causa, alteração aplicada e como testar novamente. Não apresente testes como concluídos sem executá-los.

FALHAS OBSERVADAS:
[COLE A LISTA DE FALHAS REAIS E PASSOS DE REPRODUÇÃO]

Depois de corrigir, execute testes disponíveis de pontuação, validação, login, persistência e responsividade. Informe riscos e pendências antes de republicar.
```
