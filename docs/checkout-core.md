# Checkout Core

Este core deixa a RumoAoPro vender produtos digitais com um fluxo testável antes de ligar Mercado Pago e Stripe em produção.

## O que existe agora

- Framework: Next.js App Router.
- Páginas de venda: rotas em `app/programas/*` e `app/en/programs/*`.
- Botões de compra: apontam para os links centralizados em `lib/checkout/products.ts` e `lib/content.ts`.
- Checkout: `/checkout/[slug]`.
- API de criação de pedido: `POST /api/checkout/start`.
- Admin protegido: `/admin/orders` e detalhe em `/admin/orders/[id]`.
- Banco local: SQLite via `node:sqlite`, salvo por padrão em `.data/rumoaopro.sqlite`.
- Autenticação simples do admin: senha por `ADMIN_PASSWORD` e cookie assinado com `ADMIN_SESSION_SECRET`.

## Fluxo

1. O cliente entra em `/checkout/[slug]`.
2. O formulário valida nome, e-mail e país.
3. Brasil exige CPF ou CNPJ; exterior não mostra esse campo.
4. `POST /api/checkout/start` valida tudo novamente no servidor.
5. Um pedido é criado como `pending`.
6. No modo padrão `CHECKOUT_GATEWAY_MODE=mock`, o cliente é enviado para `/checkout/success?order_id=...&mock=1`.
7. A tela de sucesso permite simular pagamento aprovado ou recusado.
8. Aprovação chama `markOrderAsPaid` e depois `triggerDelivery`.
9. Recusa chama `markOrderAsFailed` e não libera entrega.

## Produtos

Os produtos ficam em `lib/checkout/products.ts`. O modelo usa:

- `id`
- `name`
- `slug`
- `type`
- `price_brl`
- `price_usd`, equivalente ao preço internacional
- `active`
- `delivery_type`
- `file_id`

Os quatro programas em inglês estão configurados com preço internacional de `USD 40`.

## Pedido

O pedido é salvo com status e dados mínimos para conciliar pagamento, entrega e fiscal:

- cliente, e-mail, país e documento quando Brasil
- gateway: `mock`, `mercado_pago` ou `stripe`
- valor e moeda
- `status`
- `delivery_status`
- `fiscal_status`
- `metadata`
- datas de criação, atualização e pagamento

## Gateway mock

Para testar localmente:

1. Abra `/checkout/offseason-30-days`.
2. Preencha como Brasil com CPF/CNPJ, ou como exterior sem documento.
3. Envie o checkout.
4. Na página de sucesso, clique em `Aprovar` ou `Recusar`.
5. Confira o pedido em `/admin/orders`.

Endpoints do mock:

- `POST /api/checkout/mock/[orderId]/approve`
- `POST /api/checkout/mock/[orderId]/decline`

Esses endpoints só aceitam pedidos com `gateway = mock`.

## Entrega

A função central é `triggerDelivery(orderId)`, em `lib/checkout/order-events.ts`.

Para PDF, a estrutura já prepara link assinado e temporário usando arquivos em `PRIVATE_FILES_DIR`. Se o arquivo privado ainda não existir, o pedido fica com `delivery_status = manual_required` e o admin consegue ver que precisa agir.

Para onboarding ou entrega manual, a arquitetura já permite marcar como `delivered` ou `manual_required`.

## Mercado Pago depois

O código base de Pix já está em `lib/checkout/payments.ts` e o webhook em `app/api/webhooks/mercado-pago/route.ts`.

Para ativar na próxima etapa:

- configurar `CHECKOUT_GATEWAY_MODE=live`
- configurar `MERCADO_PAGO_ACCESS_TOKEN`
- configurar `MERCADO_PAGO_WEBHOOK_SECRET`
- cadastrar webhook para `/api/webhooks/mercado-pago`
- testar Pix real em sandbox

O webhook já usa `markOrderAsPaid`, `markOrderAsFailed`, `markOrderAsCancelled` e `markOrderAsRefunded`.

## Stripe depois

O código base de Checkout Session já está em `lib/checkout/payments.ts` e o webhook em `app/api/webhooks/stripe/route.ts`.

Para ativar na próxima etapa:

- configurar `CHECKOUT_GATEWAY_MODE=live`
- configurar `STRIPE_SECRET_KEY`
- configurar `STRIPE_WEBHOOK_SECRET`
- cadastrar webhook para `/api/webhooks/stripe`
- testar `checkout.session.completed` em ambiente test

O webhook já usa `markOrderAsPaid` e `markOrderAsFailed`.

## Variáveis de ambiente

Obrigatórias para o core:

- `CHECKOUT_GATEWAY_MODE=mock`
- `CHECKOUT_DB_PATH`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `SIGNED_DOWNLOAD_SECRET`
- `PRIVATE_FILES_DIR`
- `NEXT_PUBLIC_SITE_URL`

Futuras para produção:

- `MERCADO_PAGO_ACCESS_TOKEN`
- `MERCADO_PAGO_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`, caso o envio real de e-mail seja ativado

## Observação importante

`/checkout/success` nunca marca pedido como pago sozinho. A mudança para `paid` passa por uma ação de gateway, hoje mockada, e depois pelos webhooks reais.
