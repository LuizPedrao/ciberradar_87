# Plano de testes e homologação

> Situação em 22/10/2026: **testes ainda não executados neste relatório**. Existem testes unitários no repositório em `src/lib/scoring.test.ts` e `src/test/app-routing.test.tsx`, mas a existência do arquivo não prova execução/aprovação.

## 1. Instalação e qualidade técnica
```bash
npm install
npm run lint
npm test
npm run build
npm run dev
```
Anotar versões de Node/npm, commit do teste, saída dos comandos e eventuais falhas.

## 2. Matriz funcional
| ID | Cenário | Resultado esperado | Status |
|---|---|---|---|
| T01 | Abrir / em aba anônima | Landing acessível e responsiva | Pendente |
| T02 | Avançar sem responder | Bloqueia e informa problema | Pendente |
| T03 | 10 respostas "Sim" | Pontuação 100 | Pendente |
| T04 | 10 respostas "Não" | Pontuação 0 | Pendente |
| T05 | 10 respostas "Não sei" | Pontuação 30 | Pendente |
| T06 | MFA "Não" | Recomendação para ativar MFA | Pendente |
| T07 | Resultado sem cadastro | Resultado aparece mesmo sem dados pessoais | Pendente |
| T08 | Envio de lead com dados inválidos | Validação impede envio | Pendente |
| T09 | Envio válido com aceite | Lead salvo uma vez; confirmação após persistência | Pendente |
| T10 | Atualizar painel após lead | Lead aparece com dados corretos | Pendente |
| T11 | Acessar /admin sem login | Redireciona para login | Pendente |
| T12 | Usuário autenticado sem papel admin | Negado no frontend e no backend | Pendente |
| T13 | Admin altera status e cadastra nota | Dados persistem após recarga | Pendente |
| T14 | Converter lead em cliente | Reaproveita dados e evita duplicação | Pendente |
| T15 | Criar e concluir lembrete | Atualização persistente | Pendente |
| T16 | Cadastrar e concluir entrega | Atualização persistente | Pendente |
| T17 | WhatsApp configurado | Link válido com mensagem codificada | Pendente |
| T18 | WhatsApp ausente | Não gera link inválido | Pendente |
| T19 | Navegação mobile | Sem quebra de layout | Pendente |
| T20 | Leitura pública da tabela de leads | Banco nega consulta anônima | Pendente |
| T21 | Login e logout | Sessão revogada e área protegida | Pendente |
| T22 | Revisão de segurança Lovable | Nenhuma falha crítica/alta não resolvida | Pendente |

## 3. Evidências necessárias
- Landing desktop e mobile.
- Questionário em andamento.
- Resultado de teste (sem dados pessoais reais).
- Formulário com consentimento.
- Painel de administrador com dados fictícios.
- Gestão de leads, clientes, entregas e lembretes.
- Tela de revisão de segurança sem alertas críticos.
- Registro de `npm test`, `npm run lint` e `npm run build`.

Salvar arquivos em `evidencias/` com nomes como `01-landing-desktop.png` e `02-diagnostico.png`. Remover ou mascarar nomes, e-mails, WhatsApp e dados de clientes.

## 4. Registro de execução
Data: **A preencher**
Responsável: **A preencher**
Commit: **A preencher**
Ambiente: **A preencher**
Quantidade de testes aprovados: **Não aferida**
Falhas abertas: **Não aferidas**

## 5. Critério de aceite
Não afirmar "100% testado" enquanto houver itens pendentes. Corrigir falhas de segurança altas/críticas antes de expor contatos reais ou tornar o repositório público.
