# RumoAoPro

Primeira versão do novo site da RumoAoPro, com landing bilíngue para a assessoria online.

## Rotas

- `/`: home curta da nova estrutura.
- `/assessoria`: landing da assessoria em português.
- `/en/coaching`: landing da assessoria em inglês.
- `/programas`: vitrine dos programas atuais.
- `/checkout/[slug]`: checkout próprio para programas digitais.
- `/admin`: painel interno protegido para pedidos, entrega e fiscal.
- `/links`: substituto do Komi/link da bio.
- `/obrigado` e `/en/thank-you`: páginas pós-aplicação.

## Rodar localmente

```bash
pnpm install
pnpm run dev
```

Em alguns ambientes macOS, o binário nativo do SWC pode ser bloqueado por
assinatura local. Nesse caso:

```bash
pnpm run dev:wasm
pnpm run build:wasm
```

## Deploy na Vercel

1. Crie um projeto na Vercel apontando para este repositório.
2. Configure o domínio `rumoaopro.com`.
3. Adicione as variáveis abaixo se quiser sobrescrever os valores padrão.
4. Use `pnpm run build` no deploy normal. Use `pnpm run build:wasm` apenas se o ambiente local bloquear o SWC nativo.

## Variáveis opcionais

```bash
NEXT_PUBLIC_CONTACT_EMAIL=contato@rumoaopro.com.br
NEXT_PUBLIC_SHOPIFY_URL=https://www.rumoaopro.com.br
```

## Checkout próprio

A estrutura inicial de vendas diretas está documentada em
[`docs/checkout.md`](docs/checkout.md).

Ela inclui:

- Mercado Pago/Pix para Brasil com CPF/CNPJ obrigatório;
- Stripe Checkout para clientes internacionais;
- banco SQLite local para pedidos;
- webhooks para confirmação real de pagamento;
- entrega digital por link temporário assinado;
- admin `/admin` com exportação fiscal em CSV.
