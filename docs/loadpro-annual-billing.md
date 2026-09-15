# Plano anual LoadPro — preparação e configuração

Esta branch prepara os anuais em BRL do Fundadores 30 por R$ 499 e do Fundadores 50 por R$ 699, aprovados em 14/09/2026. Os mensais continuam por R$ 49,90 e R$ 69,90, respectivamente, sem alterar seus limites. Recursos e limites da conta são preservados. Nenhuma migração foi aplicada a produção e nenhum envio ou pagamento real foi efetuado nesta tarefa.

## Estado atual — 15/09/2026

Os registros datados abaixo são históricos. O preview desta branch está habilitado com Supabase isolado e Stripe TEST; o Pix continua desabilitado. A conta fictícia autorizada concluiu o teste de sete dias e a fatura anual de R$ 499 com o relógio TEST, na mesma assinatura, com acesso até 21/09/2027. Reenvios assinados e atualizações repetidas não duplicaram o período. O webhook TEST antigo está ativo e a exceção temporária de proteção Vercel foi removida. Produção continua sem alterações; os dois PRs permanecem rascunhos.

Mais nove testes exercitam o serviço anual, adaptador e PostgreSQL reais com todas as chamadas externas interceptadas. Os 54 testes do backend, a verificação TypeScript e o build passam. Foram reproduzidas e corrigidas a mudança do corpo de criação Pix em uma repetição, a interrupção mensal antes de detectar configuração removida e a aceitação de uma notificação anual com IDs conflitantes. A criação repete a mesma chave e expiração ancorada na confirmação persistida; após essa janela, exige reconciliação em vez de gerar outra cobrança. O webhook anual exige segredo mesmo em sandbox e todo estado consultado deve corresponder ao pagamento/plano/moeda/ambiente confirmado. O checkout mensal legado não foi modificado.

Os testes locais cobrem R$ 499/R$ 699, teste grátis e mês pago, resposta perdida, falha ao salvar, Pix pendente/recusado/cancelado/aprovado, repetição e preservação de conta/limites/metadados. Não equivalem a aprovação Pix no provedor. Ainda faltam testes hospedados do Fundadores 50, transição de mensal já pago, falha da fatura anual e regressão completa do app. O bloqueio técnico anterior do navegador foi resolvido. O usuário criou o vendedor fictício Mercado Pago `LoadPro Anual QA Vendedor` e a aplicação `LoadPro Anual QA Pix` (IDs públicos de teste 3692348994/6020550837096527). A sessão agora está nessa conta fictícia, sem modificar configurações da integração real.

O adaptador Orders está preparado separadamente, com testes locais do serviço, SQL e validação de notificações. O padrão continua Payments; nenhuma chave Orders foi armazenada na Vercel e nenhuma cobrança Pix foi iniciada. Para ativar apenas no preview: `LOADPRO_ANNUAL_PIX_API=orders`, `LOADPRO_ANNUAL_PIX_SANDBOX=true` e as quatro variáveis privadas/contextuais `LOADPRO_ANNUAL_MP_ORDERS_ACCESS_TOKEN`, `LOADPRO_ANNUAL_MP_ORDERS_APPLICATION_ID`, `LOADPRO_ANNUAL_MP_ORDERS_SELLER_ID`, `LOADPRO_ANNUAL_MP_ORDERS_WEBHOOK_SECRET`. O preview exige exatamente o vendedor/aplicação fictícios acima, além do token correspondente. Antes de interromper qualquer mensal, o servidor valida as credenciais consultando `/users/me` e preserva o vendedor/aplicação da cotação. O APRO depende de `LOADPRO_ANNUAL_MP_ORDERS_TEST_APPROVAL=true`; essa decisão é congelada na cotação e nunca enviada em produção. Produção exige configuração própria, `LOADPRO_ANNUAL_MP_ORDERS_LIVE=true` e rejeita os IDs de QA.

O webhook Orders é `/api/loadpro/billing/annual/orders/webhook`, com segredo próprio, HMAC do ID em minúsculas, IDs/contexto consistentes e leitura GET do recurso autenticado. Os webhooks legados não mudam. Antes de liberar o ano, valida vendedor, aplicação, país/moeda, referência, valor total e pago, uma única transação Pix e status `processed/accredited` em ambos. Orders não documenta `date_approved`/`live_mode` na resposta GET: usa o contexto da conta fixada e a data `last_updated_date` do estado processado verificado, rejeitando datas inválidas/futuras. Pagamento/QR inicialmente ausente permanece pendente e pode ser recuperado pelo webhook ou atualização autenticada. Repetições usam o mesmo ID/chave/corpo; a expiração devolvida pelo provedor é exibida, sem recriar a cobrança. Confirmar esses campos com respostas reais do sandbox antes de habilitar vendas.

A tela Mercado Pago de configuração foi preenchida em **Modo de teste**, somente evento **Order (Mercado Pago)**, para o endereço exato do backend anual com esse novo caminho. **Ainda não foi salva**: a assinatura secreta será gerada nessa etapa. Configuração Vercel e teste oficial completo continuam pendentes; a proteção Vercel permanece restaurada. Fontes: [idempotência do Pix Payments](https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks/payment-brick/payment-submission/pix), [simulação Pix Orders](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/integration-test/pix), [consulta Orders](https://www.mercadopago.com.br/developers/pt/reference/online-payments/checkout-api/get-order/get), [notificações Orders](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/notifications).

## Fluxos

A escolha ocorre na área autenticada de assinatura. Na página de planos, quem ainda não tem conta começa o teste comercial existente pelo checkout mensal e depois confirma o anual na assinatura. O checkout mensal informa as condições mensais; clicar na oferta anual nunca muda um contrato sozinho.

A vitrine do site em `/apps` e `/links`, incluindo as versões em inglês, apresenta mensal e anual lado a lado no desktop e em cartões empilhados no celular. Os preços principais anuais são R$ 499/ano e R$ 699/ano à vista, com “12 meses pelo preço de 10” e economia de R$ 99,80/R$ 139,80. Cada par mensal/anual mantém 2 equipes e 30/50 atletas por equipe, respectivamente. Mostra os mesmos recursos/limites e explica cartão, Pix, dias preservados e o caminho de cadastro. O botão anual leva à assinatura autenticada; a página não cria cobrança nem confirma mudança. Publicar a oferta junto com a integração habilitada, após validação sandbox.

Cartão: cronograma na mesma assinatura Stripe, fase mensal/teste até o limite atual e fase anual a partir dele. Sem rateio e sem nova assinatura. O ano pago só é liberado após `invoice.paid` da fatura atual, no valor exato do plano confirmado: R$ 499 ou R$ 699 em BRL. A fatura, o preço atual e a confirmação devem corresponder ao mesmo plano; valor do outro plano é recusado. Atualizações de assinatura e retorno do checkout não comprovam pagamento. O período informado para o anual agendado é condicionado ao pagamento.

Pix: a revisão informa pagamento agora e interrupção da renovação mensal ao confirmar a escolha. O cancelamento da próxima mensal é confirmado antes de criar/exibir o Pix. Se o Pix não for pago, restam somente os dias atuais. Quando o provedor confirma, o início anual é o maior entre o fim do período protegido e a aprovação; acrescenta-se um ano de calendário, preservando anos bissextos e dias pagos. Renovação anual por Pix é manual e usa nova confirmação autenticada.

Erros após mutação no provedor deixam uma operação persistente para retomar pelo mesmo ID. Nunca se declara que nada mudou após um timeout. Operações travadas exigem reconciliação; não libere travas nem crie outra cobrança sem conferir o provedor. Pix recusado não reativa o mensal automaticamente.

## Configuração antes de habilitar

1. Revisar `supabase/loadpro-annual-billing.sql` e executar exclusivamente no Supabase LoadPro. Ela cria registros de operações e funções exclusivas de `service_role`, com RLS. Não muda registros existentes. Validar os gatilhos existentes de propagação a clubes.
2. Configurar `STRIPE_LOADPRO_ANNUAL_PRICE_ID`: preço ativo, BRL 49900, intervalo `year`, intervalo_count 1. Configurar também `STRIPE_LOADPRO_FOUNDERS_50_ANNUAL_PRICE_ID`: preço ativo, BRL 69900, `year`, intervalo_count 1. Manter os preços mensais atuais. O servidor lê e valida o catálogo antes de usar o preço.
3. Configurar `LOADPRO_ANNUAL_WEBHOOK_ORIGIN` como origem HTTPS do backend que receberá o Pix. Registrar `/api/loadpro/billing/annual/webhook` no Mercado Pago; assinatura HMAC obrigatória. Manter o webhook Stripe existente com `invoice.paid`, falha de pagamento, atualização e exclusão de assinatura. Verificar que o portal Stripe não permite alterações livres de plano que contornem a revisão do aplicativo.
4. Configurar `LOADPRO_ANNUAL_ALLOWED_ORIGINS` com origens exatas do preview do app (separadas por vírgula). Nada de wildcard.
5. No preview, usar Supabase separado, credenciais Stripe de teste e Mercado Pago sandbox. Definir `LOADPRO_ANNUAL_PIX_SANDBOX=true` apenas nesse ambiente; nunca copiar chaves live. `LOADPRO_ANNUAL_ENABLED` permanece ausente/false até terminar a validação. Os testes automatizados interceptam toda rede de pagamento.
6. Habilitar em preview com `LOADPRO_ANNUAL_ENABLED=true`, validar cartão com relógio de teste Stripe e Pix sandbox de ponta a ponta, falha, repetição, fim do teste e parcelas mensais ausentes. Só então aprovar a regra comercial e o deploy de produção dos dois projetos.

Variáveis de acesso ao Supabase e dos provedores são somente do servidor. Nunca colocar segredos no app estático. `LOADPRO_ANNUAL_ENABLED=false` bloqueia novas escolhas; webhooks de pagamentos já iniciados continuam reconciliando.

## Lembretes

Auditados: ativação de teste, conta existente, recuperação de senha e pagamento recusado na Stripe. Nenhum lembrete de fim de teste ou cron correspondente foi encontrado. O painel Stripe foi conferido em 14/09/2026: aviso 7 dias antes do fim de uma avaliação está **ativo**, avisos de renovações futuras **inativos**, expiração de cartão e falha no cartão **ativos**. Nenhum controle foi alterado. A configuração de campanhas fora do código no Resend ainda deve ser conferida.

`prepareAnnualTrialReminder` prepara PT/EN, somente nas últimas 48 horas de um teste comercial de sete dias, com cobrança mensal prevista e link autenticado. Exige consentimento comercial explícito e ausência de supressão; consentimento de rastreamento não equivale a consentimento de e-mail. Exclui anual escolhido/comprado, teste encerrado, cancelamento e chave já entregue. Não contém envio nem cron. Ao integrar ao remetente, reconsultar acesso e preferências no momento do envio e reservar a chave duravelmente com unicidade antes de enviar. Usar a mesma chave no Resend, registrar entrega e não reenviar em resultado incerto. A ativação do remetente/agendamento depende de aprovação; não disparar campanhas de teste.

## Limitações a aprovar

Assinaturas legadas no Mercado Pago, moedas diferentes de BRL, preço mensal diferente de R$ 49,90/R$ 69,90 no respectivo plano ou cronogramas externos exigem análise assistida. A oferta nunca converte essas contas automaticamente. Renovação ou fatura já em processamento (menos de 15 minutos até o vencimento) exige reconciliação antes de nova cotação. Para Pix recusado/abandonado após parar a mensal, o suporte deve revisar uma nova tentativa; não reiniciar cobrança automática silenciosamente.

Documentação dos provedores: https://docs.stripe.com/billing/subscriptions/subscription-schedules e https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks/payment-brick/payment-submission/pix.

## Validação de 14/09/2026

31 testes passaram (`node --test scripts/tests/loadpro-annual.test.mjs scripts/tests/loadpro-billing.test.mjs`), com PostgreSQL PGlite isolado, ambos os planos e testes mensais de regressão. TypeScript/build passaram. Há 28 cenários de UI do app e 16 verificações da vitrine PT/EN em desktop/celular no repositório LoadPro. Todos usam dados fictícios e rede de pagamento interceptada.

A configuração do app sandbox também precisa apontar Auth/REST do Supabase e API anual para os ambientes isolados. Os previews visuais existentes não devem ser usados para confirmar uma assinatura real. Nenhuma migração remota, preço de produção, assinatura, cobrança ou envio foi modificado.

O preparador exige `existingTrialReminder=false`, apurado pelo operador; com outro lembrete ativo ou situação desconhecida, não gera o novo envio. A Stripe atualmente tem esse aviso ativo, portanto o novo remetente deve continuar desligado até aprovar qual canal será responsável. Preferências, ausência de anual confirmado e unicidade precisam ser rechecadas no instante do envio. O código existente também envia aviso de falha de cartão; há possível sobreposição com a Stripe que precisa ser revisada antes de acrescentar mensagens.


## Preview isolado (14/09/2026)

O middleware fecha APIs, checkout e áreas privadas em Vercel Preview quando a configuração não está pronta. Para teste local usar `LOADPRO_TEST_MODE=true`; nunca copiar `.env` de produção. São necessários:

- `LOADPRO_PREVIEW_INTEGRATION_ENABLED=true`.
- `LOADPRO_TEST_SUPABASE_PROJECT_REF` correspondente exatamente a `LOADPRO_SUPABASE_URL`, com segredo somente do novo banco.
- `CHECKOUT_TEST_SUPABASE_PROJECT_REF` correspondente exatamente a `SUPABASE_URL`, `CHECKOUT_DB_DRIVER=postgres` e segredo somente do banco de pedidos de teste.
- `LOADPRO_APP_URL` e `NEXT_PUBLIC_SITE_URL` apontando para os previews, `CHECKOUT_GATEWAY_MODE=sandbox`, `STRIPE_SECRET_KEY=sk_test_...`, preços mensais/anuais e webhook Stripe de teste.
- E-mails e Meta ficam bloqueados mesmo se houver configurações herdadas. As contas de teste precisam ser preparadas no banco separado, sem depender de convites reais. O RaptorPro não tem acesso ao banco habitual no preview.

Executar `node --test scripts/tests/preview-safety.test.mjs scripts/tests/loadpro-annual.test.mjs scripts/tests/loadpro-billing.test.mjs` (42 testes), `pnpm check` e `pnpm build`. A configuração normal de produção permanece inalterada.

A API Pix implementada continua sendo Payments (`/v1/payments`). A [amostra oficial](https://github.com/mercadopago/pix-payment-sample-java#-testing) documenta teste pendente sem aprovação pelo QR. O teste APRO com credencial APP_USR pertence à [API Orders](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/integration-test/pix), outra integração. Não remover a restrição TEST- da integração atual para usar uma credencial produtiva. A decisão de adaptar somente o anual para Orders ou outro método oficial de testar aprovação continua pendente; nenhum Pix real foi gerado ou pago.

O build define `NEXT_PUBLIC_LOADPRO_APP_URL` a partir da origem de teste validada. Sem ela, os links de assinatura da página de vendas ficam no próprio preview; o login no checkout também não aponta para produção.


### Dedicated sandbox installed (2026-09-14)

The empty `loadpro-annual-sandbox` project (`xxibnkscktibljtrqmxy`) now has 29 RLS-protected tables and zero auth users, orders or entitlements. This test instance hosts the website checkout tables (service-only) and LoadPro tables (explicit tenant/RPC grants). Production databases remain separate and unchanged. A transactional empty-project installer was validated with 15 synthetic PostgreSQL checks before installation; metadata checks on the hosted project confirm that clients cannot modify memberships, billing or annual grants.

The annual preview branch now has the isolated Supabase server credentials, Stripe test key and new test-webhook signing secret stored as Vercel Secret variables after explicit user authorization. Four Stripe test prices are configured: 4990/6990 BRL cents monthly and 49900/69900 BRL cents yearly. The app uses only its public sandbox configuration. Integration and annual feature flags remain false; no provider sandbox payment has been performed.

`LOADPRO_PREVIEW_PROVISIONING_ENABLED=true` permits sandbox order events to synchronize access only when the complete isolated-preview checks pass. Production always skips sandbox provisioning, even with that flag present. Sandbox provisioning never sends invitations. Four additional tests exercise the event-to-access boundary, opt-in, invalid/live credentials, production skip and the unchanged live invitation flow; all 42 backend tests, type checks and the build pass.

A dedicated Stripe TEST webhook, `loadpro-annual-preview-20260914`, now targets the annual backend preview and listens to 13 checkout/subscription/invoice events (API 2025-08-27.basil). Before generating subscription/payment events, resolve the existing TEST destination `rumoaopro-site-test` (`we_1TrM2mA6RupMT8Qs5lcZOUme`) that points to `https://rumoaopro-site.vercel.app/api/webhooks/stripe`. It remains active and unchanged. A temporary pause of this old TEST destination, followed by restoration after QA, is proposed so synthetic events cannot reach the main site. Production/live destinations must remain untouched.

Pending: old TEST destination isolation approval; hosted synthetic accounts and complete test-clock/webhook validation; Payments API Pix sandbox approval support; legacy transfer/reset RPC recovery and broad hosted app regression. Do not merge or enable production.


### Hosted Stripe QA preparation

The user authorized temporarily pausing and restoring the pre-existing TEST webhook. It is paused only during this QA round; restore `we_1TrM2mA6RupMT8Qs5lcZOUme` before stopping work. Live webhook destinations and production remain unchanged.

The preview integration and annual flags are enabled only for `codex/loadpro-annual-billing`. `MERCADO_PAGO_ACCESS_TOKEN=disabled` on this branch explicitly masks inherited live Pix credentials. This sentinel permits Stripe-only QA, while all Pix provider calls remain blocked by their credential checks. Do not substitute a fabricated `TEST-` key.

Preview checkout return links derive a purpose-specific HMAC key from the validated Stripe test secret, pinned database reference and preview origin, ignoring any inherited production checkout secret. The opt-in preview now executes the same checkout reservation used in production so duplicates and returning-customer trial eligibility can be verified. Production secret selection and monthly checkout behavior remain unchanged. Validation now covers 45 tests, including token isolation, duplicate checkout rejection before order creation, and disabled Pix rejection.
