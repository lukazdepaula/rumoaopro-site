# Checkout RumoAoPro

Este projeto agora tem uma estrutura inicial para vender produtos digitais sem depender do Shopify.

## Stack encontrada

- Next.js 15 com App Router.
- React 19.
- Tailwind CSS.
- Componentes próprios em `components/`.
- Conteúdo central em `lib/content.ts`.
- Não havia banco, autenticação ou SDKs de pagamento.

Para manter a menor alteração possível, o checkout foi implementado com rotas nativas do App Router, `fetch` direto para Mercado Pago/Stripe e SQLite local via `node:sqlite`.

## Fluxo Brasil - Mercado Pago Pix

1. Cliente abre `/checkout/[slug]`.
2. Seleciona Brasil.
3. Informa nome completo, e-mail e CPF/CNPJ.
4. A API `/api/checkout/start` valida os dados e cria um pedido `pending`.
5. O sistema cria um pagamento Pix em `https://api.mercadopago.com/v1/payments`.
6. O front exibe QR Code/código Pix quando o Mercado Pago retorna esses dados.
7. O pedido só muda para `paid` quando `/api/webhooks/mercado-pago` confirma o pagamento consultando a API do Mercado Pago.
8. A entrega só roda depois do status `paid`.

## Fluxo internacional - Stripe

1. Cliente abre `/checkout/[slug]`.
2. Escolhe país diferente de Brasil.
3. Informa nome, e-mail e país. CPF/CNPJ não aparece.
4. A API cria o pedido interno `pending`.
5. O sistema cria uma Stripe Checkout Session.
6. O cliente é redirecionado para a Stripe.
7. O retorno `/checkout/success` não libera produto.
8. O pedido só muda para `paid` quando `/api/webhooks/stripe` recebe evento assinado e válido.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e configure:

```bash
NEXT_PUBLIC_SITE_URL=https://rumoaopro.com
CHECKOUT_DB_PATH=.data/rumoaopro.sqlite
PRIVATE_FILES_DIR=private-files
SIGNED_DOWNLOAD_SECRET=...

ADMIN_PASSWORD=...
ADMIN_SESSION_SECRET=...

MERCADO_PAGO_ACCESS_TOKEN=...
MERCADO_PAGO_WEBHOOK_SECRET=...

STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

EMAIL_PROVIDER=mock
EMAIL_FROM="RumoAoPro <no-reply@rumoaopro.com>"
INTERNAL_SALES_EMAIL=contato@rumoaopro.com.br
RESEND_API_KEY=
```

Preços ficam nas variáveis `RAP_PRICE_*`. Ajuste antes de produção.

## Arquivos privados

PDFs/ZIPs não devem ficar em `public/`. Coloque os arquivos em `PRIVATE_FILES_DIR`.

Nomes esperados inicialmente:

- `private-files/offseason-30-days.pdf`
- `private-files/adama-strength-power.pdf`
- `private-files/projeto-36kmh-speed-acceleration.zip`
- `private-files/projeto-pre-temporada.pdf`
- `private-files/de-volta-aos-gramados.pdf`
- `private-files/elanga-in-season.zip`

O download usa `/api/download/[orderId]` com assinatura HMAC e expiração. Se o arquivo privado não existir, o pedido pago vira `manual_required`.

## Webhooks

Configure no Mercado Pago:

```text
https://rumoaopro.com/api/webhooks/mercado-pago
```

Configure na Stripe:

```text
https://rumoaopro.com/api/webhooks/stripe
```

Eventos Stripe recomendados:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `payment_intent.payment_failed`

## Como testar em sandbox

Mercado Pago:

1. Use um access token de teste em `MERCADO_PAGO_ACCESS_TOKEN`.
2. Inicie uma compra no checkout com país Brasil.
3. Use CPF/CNPJ em formato básico, somente dígitos.
4. Pague o Pix em sandbox/teste conforme conta Mercado Pago.
5. Verifique se o webhook atualiza o pedido no admin.

Stripe:

1. Use `STRIPE_SECRET_KEY=sk_test_...`.
2. Use o Stripe CLI para encaminhar webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. Copie o `whsec_...` para `STRIPE_WEBHOOK_SECRET`.
4. Faça uma compra com país diferente de Brasil.
5. Use cartão de teste `4242 4242 4242 4242`.

## Admin

Acesse:

```text
/admin
```

O login usa `ADMIN_PASSWORD` e gera cookie httpOnly assinado com `ADMIN_SESSION_SECRET`.

O admin inclui:

- lista de pedidos;
- filtros por status, gateway, país e produto;
- detalhe do pedido;
- logs;
- ação para marcar nota como emitida;
- reenvio de entrega/e-mail;
- aba Fiscal;
- exportação CSV em `/api/admin/fiscal/export`.

## Fiscal

Regra inicial:

- Brasil: CPF/CNPJ obrigatório e `fiscal_status=pending`.
- Exterior: CPF/CNPJ não é pedido e `fiscal_status=not_required`.

A aba Fiscal lista vendas pagas e exporta CSV com dados básicos para emissão de nota.

## Decisões externas pendentes

- Provedor definitivo de e-mail. Hoje existe `mock` e suporte inicial a Resend.
- Banco persistente de produção. SQLite local funciona para desenvolvimento e servidor com disco persistente, mas Vercel serverless precisa de Postgres, Turso, Supabase ou serviço equivalente.
- Emissor fiscal e regras do contador para Brasil/exterior.
- Preços finais dos produtos.
- Upload dos PDFs/ZIPs finais para `PRIVATE_FILES_DIR` ou storage privado equivalente.
