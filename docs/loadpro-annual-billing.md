# Plano anual LoadPro — preparação e configuração

Esta branch prepara o anual do Fundadores 30 por R$ 499 em BRL. O mensal de R$ 49,90 e o Fundadores 50 permanecem no catálogo atual. Recursos e limites da conta são preservados. Nenhuma migração foi aplicada a produção e nenhum envio ou pagamento real foi efetuado nesta tarefa.

## Fluxos

A escolha ocorre na área autenticada de assinatura. Na página de planos, quem ainda não tem conta começa o teste comercial existente pelo checkout mensal e depois confirma o anual na assinatura. O checkout mensal informa as condições mensais; clicar na oferta anual nunca muda um contrato sozinho.

Cartão: cronograma na mesma assinatura Stripe, fase mensal/teste até o limite atual e fase anual a partir dele. Sem rateio e sem nova assinatura. O ano pago só é liberado após `invoice.paid` da fatura atual, de R$ 499 em BRL. Atualizações de assinatura e retorno do checkout não comprovam pagamento. O período informado para o anual agendado é condicionado ao pagamento.

Pix: a revisão informa pagamento agora e interrupção da renovação mensal ao confirmar a escolha. O cancelamento da próxima mensal é confirmado antes de criar/exibir o Pix. Se o Pix não for pago, restam somente os dias atuais. Quando o provedor confirma, o início anual é o maior entre o fim do período protegido e a aprovação; acrescenta-se um ano de calendário, preservando anos bissextos e dias pagos. Renovação anual por Pix é manual e usa nova confirmação autenticada.

Erros após mutação no provedor deixam uma operação persistente para retomar pelo mesmo ID. Nunca se declara que nada mudou após um timeout. Operações travadas exigem reconciliação; não libere travas nem crie outra cobrança sem conferir o provedor. Pix recusado não reativa o mensal automaticamente.

## Configuração antes de habilitar

1. Revisar `supabase/loadpro-annual-billing.sql` e executar exclusivamente no Supabase LoadPro. Ela cria registros de operações e funções exclusivas de `service_role`, com RLS. Não muda registros existentes. Validar os gatilhos existentes de propagação a clubes.
2. Configurar `STRIPE_LOADPRO_ANNUAL_PRICE_ID`: preço ativo, BRL 49900, intervalo `year`, intervalo_count 1. Manter preços mensais e Fundadores 50 atuais. O servidor lê e valida o catálogo antes de usar o preço.
3. Configurar `LOADPRO_ANNUAL_WEBHOOK_ORIGIN` como origem HTTPS do backend que receberá o Pix. Registrar `/api/loadpro/billing/annual/webhook` no Mercado Pago; assinatura HMAC obrigatória. Manter o webhook Stripe existente com `invoice.paid`, falha de pagamento, atualização e exclusão de assinatura. Verificar que o portal Stripe não permite alterações livres de plano que contornem a revisão do aplicativo.
4. Configurar `LOADPRO_ANNUAL_ALLOWED_ORIGINS` com origens exatas do preview do app (separadas por vírgula). Nada de wildcard.
5. No preview, usar Supabase separado, credenciais Stripe de teste e Mercado Pago sandbox. Definir `LOADPRO_ANNUAL_PIX_SANDBOX=true` apenas nesse ambiente; nunca copiar chaves live. `LOADPRO_ANNUAL_ENABLED` permanece ausente/false até terminar a validação. Os testes automatizados interceptam toda rede de pagamento.
6. Habilitar em preview com `LOADPRO_ANNUAL_ENABLED=true`, validar cartão com relógio de teste Stripe e Pix sandbox de ponta a ponta, falha, repetição, fim do teste e parcelas mensais ausentes. Só então aprovar a regra comercial e o deploy de produção dos dois projetos.

Variáveis de acesso ao Supabase e dos provedores são somente do servidor. Nunca colocar segredos no app estático. `LOADPRO_ANNUAL_ENABLED=false` bloqueia novas escolhas; webhooks de pagamentos já iniciados continuam reconciliando.

## Lembretes

Auditados: ativação de teste, conta existente, recuperação de senha e pagamento recusado na Stripe. Nenhum lembrete de fim de teste ou cron correspondente foi encontrado. Configurações de e-mails automáticos do painel Stripe/Resend ainda devem ser conferidas pelo operador para evitar duplicidade fora do código.

`prepareAnnualTrialReminder` prepara PT/EN, somente nas últimas 48 horas de um teste comercial de sete dias, com cobrança mensal prevista e link autenticado. Exige consentimento comercial explícito e ausência de supressão; consentimento de rastreamento não equivale a consentimento de e-mail. Exclui anual escolhido/comprado, teste encerrado, cancelamento e chave já entregue. Não contém envio nem cron. Ao integrar ao remetente, reconsultar acesso e preferências no momento do envio e reservar a chave duravelmente com unicidade antes de enviar. Usar a mesma chave no Resend, registrar entrega e não reenviar em resultado incerto. A ativação do remetente/agendamento depende de aprovação; não disparar campanhas de teste.

## Limitações a aprovar

Assinaturas legadas no Mercado Pago, moedas diferentes de BRL, preço mensal diferente de R$ 49,90 ou cronogramas externos exigem análise assistida. A oferta nunca converte essas contas automaticamente. Renovação ou fatura já em processamento (menos de 15 minutos até o vencimento) exige reconciliação antes de nova cotação. Para Pix recusado/abandonado após parar a mensal, o suporte deve revisar uma nova tentativa; não reiniciar cobrança automática silenciosamente.

Documentação dos provedores: https://docs.stripe.com/billing/subscriptions/subscription-schedules e https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks/payment-brick/payment-submission/pix.
