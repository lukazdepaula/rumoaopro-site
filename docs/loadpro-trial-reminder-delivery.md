# Entrega do lembrete anual — preparada, desligada

Implementação interna de servidor, revisada em 16/09/2026. Não há rota pública, cron, campanha ou agendamento instalado. Instalar o código e a migração não envia mensagens. O aviso existente da Stripe continua sendo o único canal ativo.

## Fluxo e proteção contra duplicidade

`deliverAnnualTrialReminder(accessId)` consulta acesso, preferência autenticada e contrato atual na Stripe. Exige teste real de sete dias nas últimas 48 horas, mensal elegível, consentimento específico e ausência de anual confirmado ou cancelamento. Consulta o contato no Resend e suas supressões, sem cadastrar contatos, reativar descadastrados ou remover bloqueios. Contato ausente, permissão insuficiente e resposta desconhecida bloqueiam envio. Um 404 de supressão sozinho não comprova ausência: exige também lista bem formada, completa e sem o destinatário; lista parcial bloqueia.

A reserva durável por usuário/fim de teste é revalidada antes de enviar. `claim_loadpro_reminder_delivery` confere novamente versões, consentimento, período e estado, bloqueia concorrência e grava o conteúdo e estado `uncertain` antes da única tentativa de POST. A chave é `loadpro-trial-<id da reserva>`. Duas chamadas concorrentes não enviam dois e-mails.

`deliverReservedTrialReminder(id)` nunca repete um POST iniciado, mesmo após expirar a idempotência do provedor. `reconcileTrialReminder(id)` consulta somente GET: verifica ID, destinatário, remetente, assunto, corpo, tags e horário. Sem ID, procura nas primeiras cinco páginas de 100 mensagens. Ausência ou erro mantém `uncertain`, sem interpretar isso como autorização para reenviar. Não registra listas, conteúdo de e-mail ou credenciais em logs.

Uma falha depois de gravar a tentativa e antes do POST pode deixar um lembrete não enviado. Essa escolha deliberada prioriza impedir mensagens duplicadas. O operador deve investigar; não apagar a reserva nem restaurar seu estado para forçar reenvio. `sent` significa aceitação pelo provedor, não entrega na caixa de entrada; `provider_event` distingue aceitação, entrega e falhas. Recusa, reclamação ou supressão já registradas não são apagadas por confirmação atrasada.

## Instalação e configuração

Aplicar `supabase/loadpro-reminder-delivery.sql` depois de `loadpro-annual-reminders.sql`, no banco LoadPro correto. A mudança só acrescenta campos, índice e funções ao registro privado existente; mantém RLS e execução das funções restrita ao serviço. Aplicada e conferida somente no sandbox `xxibnkscktibljtrqmxy`: cinco colunas presentes, RLS ativo, serviço autorizado, clientes anon/authenticated sem execução. Produção não foi migrada.

Os padrões continuam `LOADPRO_TRIAL_REMINDER_OWNER=stripe`, `LOADPRO_STRIPE_TRIAL_REMINDER_DISABLED=false` e `LOADPRO_TRIAL_REMINDER_DELIVERY_ENABLED=false`. O serviço só permite envio quando todos forem aprovados e configurados para LoadPro, aviso Stripe desativado e entrega habilitada, junto de `LOADPRO_ANNUAL_ENABLED=true`, `VERCEL_ENV=production` e ausência de modo de teste. Preview e desenvolvimento sempre bloqueiam o envio antes de acessar os provedores.

Usa as configurações de servidor `RESEND_API_KEY` e `EMAIL_FROM` já existentes. Os overrides `LOADPRO_REMINDER_RESEND_API_KEY` e `LOADPRO_REMINDER_EMAIL_FROM` são opcionais. Nenhuma credencial nova foi criada ou alterada. A chave precisa permitir leitura de contato/supressões/e-mails e envio; remetente/domínio e permissões efetivas ainda precisam ser conferidos antes de ativar. Chave somente de envio não basta. Não imprimir, copiar para o frontend ou ampliar permissões sem revisão.

## O que falta para ativar

Manter desligado na primeira publicação anual é a recomendação atual. Para ativação posterior: confirmar permissões e formato das respostas reais em consulta autorizada, revisar o remetente, definir um único canal e implementar um executor autenticado com limites de volume e observação de resultados incertos. Os avisos de cobrança precisam continuar atendendo também quem não consentiu com ofertas. Não desligar o aviso Stripe até existir e ser validado esse substituto. A flag declarando Stripe desativada não desliga a configuração externa por conta própria.

Os testes usam os adaptadores reais com toda chamada HTTP interceptada e PostgreSQL isolado. Nenhum e-mail foi enviado, inclusive para contas fictícias. Cobrem concorrência, descadastro, erro do provedor, resposta perdida, falha antes do POST, mais de 24h, prova divergente, mudança de preferência/acesso/contrato, conta TEST em produção e permissões de banco. A migração foi executada duas vezes nos testes para conferir reaplicação segura. O sandbox hospedado validou instalação/permissões, não uma entrega real do Resend.

Referências oficiais: [contato](https://resend.com/docs/api-reference/contacts/get-contact), [supressão](https://resend.com/docs/api-reference/suppressions/get-suppression), [lista de supressões](https://resend.com/docs/api-reference/suppressions/list-suppressions), [erros](https://resend.com/docs/api-reference/errors), [envio](https://resend.com/docs/api-reference/emails/send-email), [consulta do e-mail](https://resend.com/docs/api-reference/emails/retrieve-email), [listagem](https://resend.com/docs/api-reference/emails/list-emails), [idempotência](https://resend.com/docs/dashboard/emails/idempotency-keys).