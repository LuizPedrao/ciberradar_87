# Segurança, privacidade e preparação para publicação

> Revisão **estática preliminar** do código sincronizado em 22/10/2026; não equivale a auditoria, pentest ou execução de testes de segurança.

## Controles identificados no código
- `drizzle/migrations/0000_migration.sql`: RLS ativado em tabelas com dados de leads, clientes e administração; políticas condicionadas à função `is_admin()`.
- `src/routes/admin.tsx`: verificação de usuário autenticado e papel de administrador.
- `src/lib/leads.functions.ts`: submissão pelo servidor, recálculo do score, honeypot, identificador de requisição e limite de 5 registros por origem/hora.
- `src/lib/scoring.ts`: recomendações determinísticas, sem análise invasiva ou credenciais.
- `src/routes/resultado.tsx`: aviso de que a avaliação não é auditoria/certificação.
- `src/routes/privacidade.tsx` e `src/routes/termos.tsx`: páginas legais disponíveis, **mas com dados do responsável ainda pendentes**.

Os controles acima foram vistos no repositório. Ainda é necessário confirmar implantação efetiva no ambiente publicado e validar permissões com contas de teste.

## Atenções encontradas
1. O repositório foi encontrado como **privado**. A DIO exige visibilidade pública no momento da entrega, mas só após revisão.
2. O arquivo `.env` está versionado. A inspeção identificou URLs, IDs e **chaves publishable**, que são projetadas para uso público no cliente; não foi identificada nesse arquivo uma chave service-role. Ainda assim, revisar o histórico inteiro e garantir que não há senhas, tokens privados ou `sb_secret_...`.
3. Evitar apagar ou reescrever o histórico Git conectado ao Lovable. Alterações no `main` sincronizam com o editor.
4. As páginas legais contêm avisos de pendência de identificação/responsável; preencher antes de uso comercial ou de coletar dados pessoais reais.
5. O primeiro administrador precisa ser provisionado por procedimento seguro; verificar antes do teste de CRM.
6. Revisar se o serviço do backend aplica realmente as migrações RLS, inclusive com usuário não administrador.
7. Confirmar o número de WhatsApp comercial e e-mail de contato em `/admin/configuracoes`, sem divulgar dados pessoais desnecessários.
8. Como a aplicação foi construída com Lovable Cloud, segredos de backend devem permanecer em configurações seguras do ambiente, não em commits.

## Checklist de divulgação do GitHub
- [ ] Revisar `.env`, histórico de commits e varredura de segredos.
- [ ] Confirmar ausência de senhas, tokens privados e chaves de administrador.
- [ ] Validar segurança da área administrativa e RLS com usuário comum.
- [ ] Executar Security Review do Lovable e corrigir alertas relevantes.
- [ ] Revisar proteção contra abuso no formulário público.
- [ ] Completar informações e canais de contato nas páginas legais.
- [ ] Remover dados pessoais de prints e massa de testes.
- [ ] Confirmar links e documentos presentes no README.
- [ ] Só então tornar o repositório **público** em Settings → General → Danger Zone → Change repository visibility.
- [ ] Enviar na DIO o link do **repositório**, não o link do site.

## Limites do MVP
Não executa varredura técnica, pentest, certificação, auditoria ou monitoramento de infraestrutura. A pontuação é um indicador educativo derivado exclusivamente de respostas do visitante.

## Sobre o arquivo .env
**Não fazer limpeza destrutiva às cegas.** A presença de chaves `publishable` não equivale a vazamento de credencial privilegiada. Caso seja detectado segredo verdadeiro, rotacioná-lo primeiro; depois remover de commits futuros e tratar histórico com cuidado especial devido à sincronização com o Lovable.
