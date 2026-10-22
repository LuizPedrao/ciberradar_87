# Mega prompt — especificação funcional do CiberRadar PME

> Registro do **prompt-base preparado com ChatGPT** para orientar a construção no Lovable. A versão exata efetivamente enviada ao construtor e os prompts intermediários devem ser conferidos no histórico do projeto. Este documento não afirma que todas as exigências foram testadas.

## Papel
Atue como uma equipe de Product Manager, engenheiro full-stack, especialista em UX e profissional de segurança da informação. Crie um MVP SaaS B2B funcional e responsivo chamado **CiberRadar PME**, em português do Brasil. Não entregue apenas telas estáticas.

## Problema e proposta
Pequenas empresas não sabem quais práticas básicas de segurança digital priorizar. Entregar avaliação inicial educativa gratuita, recomendações personalizadas e possibilidade de atendimento por WhatsApp, sem varredura de sistemas ou promessas de certificação.

## Identidade visual
- Marca CiberRadar PME; slogan: "Descubra o nível de proteção digital da sua empresa."
- Azul-marinho #0B1220, azul secundário #11233F, verde tecnológico #16C784 e verde claro #5EE6B0.
- Layout SaaS corporativo, tipografia legível, ícones vetoriais, telas responsivas.
- Landing com hero, CTA, explicação de funcionamento, benefícios, FAQ e rodapé legal.
- Não inventar avaliações, clientes, certificações ou métricas.

## Arquitetura
- Frontend TypeScript, React e Tailwind.
- Backend e persistência no **Lovable Cloud**; utilizar a infraestrutura gerenciada que a ferramenta disponibiliza.
- Autenticação de administradores e regras de acesso no banco (RLS).
- Cálculo local para resposta imediata e recálculo no servidor antes de salvar lead.
- Separação de componentes, lógica de pontuação e persistência.
- Não conectar pagamentos, Resend, n8n ou API paga no MVP.

## Fluxo público
1. Visitante abre / e escolhe iniciar diagnóstico.
2. Responde exatamente dez perguntas de segurança, uma por etapa, com barra de progresso, botão voltar e validação.
3. Opções para cada pergunta: Sim (10 pontos), Não sei (3), Não (0).
4. Temas: MFA, antivírus/endpoint, backup, restauração de backup, contas individuais, revisão de acesso, atualizações, phishing, incidentes e política.
5. Em /resultado, mostrar pontuação 0–100, classificação, pontos positivos, atenção e recomendações determinísticas.
6. Faixas: 0–39 "Alta necessidade de atenção", 40–69 "Proteção em desenvolvimento", 70–100 "Boas práticas iniciais".
7. O diagnóstico funciona sem login nem dados pessoais; cadastro de contato é opcional.
8. Não apresentar resultado como auditoria, laudo, certificação ou garantia.
9. Na solicitação de orientação, pedir nome, empresa, WhatsApp, e-mail opcional, faixa de colaboradores, preocupação opcional e aceite explícito para contato; aceite de marketing separado.
10. Validar, limitar envios abusivos, persistir no backend, impedir duplicidade por duplo clique e só então mostrar sucesso.
11. Se houver WhatsApp comercial configurado, construir URL wa.me com mensagem codificada sobre nome, empresa, pontuação e interesse. Sem número, avisar que o atendimento ainda está em configuração.

## Painel administrativo
Criar /admin/login com login real e /admin com proteção a usuários comuns. Nenhum cadastro público pode conceder papel de administrador automaticamente. Painéis:
- **Visão geral**: contagens de leads, clientes, diagnósticos e lembretes baseadas em dados reais.
- **Leads**: filtro, busca, status, observações, próxima ação e conversão em cliente.
- **Clientes**: gestão e histórico com reaproveitamento de dados do lead.
- **Diagnósticos**: respostas e resultados vinculados a leads.
- **Entregas**: cliente, tipo, descrição, data e status.
- **Lembretes**: prazo, relacionamento e conclusão.
- **Configurações**: WhatsApp comercial, contato público, conta e sair.

## Dados
Estruturar tabelas para papéis autorizados, leads, clientes, entregas, lembretes, notas, configurações e log de atividades. Utilizar UUIDs, restrições, integridade referencial e índices.

## Segurança e privacidade
- RLS habilitado; dados de leads e clientes legíveis apenas por administradores autorizados.
- Validação no cliente **e no servidor**; funções privilegiadas exclusivamente no backend.
- Não versionar senhas, service-role keys ou tokens privados.
- Honeypot e limite de taxa para o cadastro.
- Páginas /privacidade e /termos, com responsável legal e contatos reais preenchidos antes de operação comercial.
- Exibir limitações da avaliação e direitos dos titulares.
- Implementar estados de carregamento, erros claros, confirmação antes de exclusão e acessibilidade básica.

## Fora do escopo
Pagamento integrado, chatbot, IA generativa, scanner de vulnerabilidades, monitoramento de rede, pentest e aplicativo nativo.

## Verificação solicitada
Testar a jornada de visitante, limites da pontuação, recomendações, gravação de lead, login, bloqueio a usuário não admin, gestão de clientes/lembretes/entregas, WhatsApp, responsividade e RLS. Informar separadamente testes efetivamente executados e pendências. Solicitar revisão de segurança antes de publicar.

## Entrega
Preparar README, arquitetura, instruções de execução, plano de testes e pontos manuais. Evitar recursos decorativos sem funcionamento. Entregar uma aplicação demonstrável para o desafio DIO.
