# Checkout e Área do Cliente

Esta etapa transforma o site em uma base simples de venda e acesso a programas digitais, sem ligar Mercado Pago e Stripe em produção ainda.

## Estrutura encontrada

- Framework: Next.js 15 com App Router.
- Páginas públicas de venda: `app/programas/*` e `app/en/programs/*`.
- Botões de compra: componentes de venda usam `shopifyProducts` em `lib/content.ts`.
- Produtos de checkout: `lib/checkout/products.ts`.
- Backend/API: rotas em `app/api/*`.
- Banco: SQLite local via `node:sqlite`, com fallback para Supabase/Postgres em produção.
- Admin: login simples em `/admin/login`, protegido por cookie assinado.
- Storage privado: pasta configurável por `PRIVATE_FILES_DIR`.

## Produtos

Os produtos principais cadastrados são:

- Project 36
- Offseason 30 Days
- Adama Offseason Strength and Power
- Elanga In Season

Todos têm `base_price_usd = 40`, idioma `English` e `delivery_type = member_area`.

Slugs antigos continuam aceitos como aliases para não quebrar links antigos de checkout.

## Conversão USD para BRL

A taxa fica centralizada em `USD_TO_BRL_RATE`.

Funções:

- `getUsdToBrlRate()`
- `usdToBrl()`
- `calculateLocalizedPrice()`

O site exibe:

- preço internacional em USD
- estimativa aproximada em BRL

No checkout:

- Brasil cria pedido em BRL e salva `exchange_rate_used`
- exterior cria pedido em USD

## Checkout

Rota:

- `/checkout/[slug]`

Brasil:

- nome
- e-mail
- país Brasil
- CPF/CNPJ obrigatório
- moeda BRL

Exterior:

- nome
- e-mail
- país
- sem CPF/CNPJ
- moeda USD

API:

- `POST /api/checkout/start`

O pedido nasce como `pending`.

## Gateway mock

O padrão é `CHECKOUT_GATEWAY_MODE=mock`.

Depois de enviar o checkout, a página de sucesso mostra botões para:

- aprovar pagamento
- recusar pagamento

Endpoints:

- `POST /api/checkout/mock/[orderId]/approve`
- `POST /api/checkout/mock/[orderId]/decline`

A página de sucesso não marca pedido como pago sozinha. A aprovação passa por `markOrderAsPaid()`.

## Acesso aos programas

Quando um pedido vira `paid`:

1. `markOrderAsPaid()` atualiza o pedido.
2. `grantProductAccess()` cria ou encontra o usuário pelo e-mail da compra.
3. O pedido é vinculado ao `user_id`.
4. Um entitlement ativo é criado para o produto.
5. `triggerDelivery()` marca a entrega como liberada e dispara e-mail mockado.

Acesso é baseado em entitlement, não apenas no pedido pago.

Funções centrais:

- `markOrderAsPaid()`
- `markOrderAsFailed()`
- `markOrderAsRefunded()`
- `triggerDelivery()`
- `grantProductAccess()`
- `revokeProductAccess()`
- `userHasAccessToProduct()`
- `getUserPrograms()`
- `calculateLocalizedPrice()`
- `generatePrivateMaterialUrl()`

## Login do cliente

Rota:

- `/login`

O cliente informa o e-mail usado na compra e recebe um link mágico.

Em desenvolvimento ou com `EMAIL_PROVIDER=mock`, a API devolve o link na resposta para facilitar teste local.

Rotas:

- `POST /api/auth/request-login`
- `GET /api/auth/verify?token=...`
- `POST /api/auth/logout`

## Área do cliente

Biblioteca:

- `/my-programs`

Programa individual:

- `/my-programs/[slug]`

Regras:

- usuário precisa estar logado
- usuário precisa ter entitlement ativo para o produto
- se tentar acessar produto não comprado, a página mostra bloqueio e link para a página de venda

## Materiais

Materiais são registros em `program_materials`.

Campos principais:

- produto
- título
- descrição
- tipo
- ordem
- arquivo privado
- URL externa

Arquivos privados não ficam em URL pública permanente.

Rota protegida:

- `/api/account/materials/[id]`

Ela verifica sessão e entitlement antes de servir ou redirecionar o material.

## Admin

Pedidos:

- `/admin/orders`

Acessos:

- `/admin/entitlements`
- permite revogar acesso ativo

Produtos:

- `/admin/products`

Fiscal:

- `/admin/fiscal`
- exportação CSV em `/api/admin/fiscal/export`

O admin continua protegido pelo login existente.

## Banco em produção

Para Vercel/Supabase:

- `CHECKOUT_DB_DRIVER=postgres`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

O acesso ao Supabase acontece apenas no backend/server. Localmente, pode continuar com SQLite.

## Mercado Pago depois

O Pix real entra em:

- `createMercadoPagoPixPayment()` em `lib/checkout/payments.ts`
- webhook `/api/webhooks/mercado-pago`

Para ativar:

- `CHECKOUT_GATEWAY_MODE=live`
- `MERCADO_PAGO_ACCESS_TOKEN`
- `MERCADO_PAGO_WEBHOOK_SECRET`

O webhook já chama funções centrais de pedido.

## Stripe depois

Stripe entra em:

- `createStripeCheckoutSession()` em `lib/checkout/payments.ts`
- webhook `/api/webhooks/stripe`

Para ativar:

- `CHECKOUT_GATEWAY_MODE=live`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

O webhook já chama `markOrderAsPaid()` e `markOrderAsFailed()`.

## Teste local

1. Rode o site.
2. Abra `/checkout/offseason-30-days`.
3. Faça uma compra como Brasil ou exterior.
4. Na success page, clique `Aprovar`.
5. O pedido vira `paid`.
6. O acesso é criado.
7. O cliente é logado automaticamente no fluxo mock.
8. Abra `/my-programs`.
9. Abra o programa comprado.
10. Confira pedidos em `/admin/orders` e acessos em `/admin/entitlements`.

Para testar login separado:

1. Abra `/login`.
2. Informe o e-mail usado na compra.
3. Clique no link de teste exibido.
4. Você deve ser redirecionado para `/my-programs`.

## Falta antes de pagamento real

- configurar chaves reais/sandbox de Mercado Pago e Stripe
- validar webhooks reais em ambiente externo
- conectar PDFs finais em storage privado
- configurar e-mail real
- revisar impostos/notas fiscais antes de produção
- decidir taxa de câmbio operacional ou API de câmbio
