# RumoAoPro

Primeira versão do novo site da RumoAoPro, com landing bilíngue para a assessoria online.

## Rotas

- `/`: home curta da nova estrutura.
- `/assessoria`: landing da assessoria em português.
- `/en/coaching`: landing da assessoria em inglês.
- `/programas`: vitrine dos programas atuais.
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
NEXT_PUBLIC_WHATSAPP_NUMBER=5519981331996
NEXT_PUBLIC_CONTACT_EMAIL=contato@rumoaopro.com.br
NEXT_PUBLIC_SHOPIFY_URL=https://www.rumoaopro.com.br
```
