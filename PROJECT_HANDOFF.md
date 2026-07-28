# RumoAoPro - Guia de continuidade

Este documento preserva o contexto necessario para continuar o projeto em outro computador ou em uma nova tarefa do Codex.

## Estado atual

- Site em producao na Vercel.
- Dominios principais: `rumoaopro.com` e `www.rumoaopro.com`.
- URL de apoio: `rumoaopro-site.vercel.app`.
- Banco, Storage, autenticacao de admin e acessos de clientes no Supabase.
- Pagamentos internacionais pelo Stripe e pagamentos brasileiros pelo Mercado Pago.
- E-mails transacionais pelo Resend.
- Admin, area do cliente, materiais privados, cupons, reviews e analytics ja implementados.

## Trabalho em andamento

O Projeto 36 esta sendo consolidado em uma unica oferta bilingue:

- Pagina PT: `/programas/projeto-36kmh`
- Pagina EN: `/en/programs/project-36kmh`
- Checkout: `/checkout/project-36`
- A rota antiga `/programas/projeto-36-2022` redireciona para a pagina nova.
- Capas e videos novos ficam em `public/assets/programs/project-36/`.
- Reviews e apresentacao do produto antigo devem permanecer associados ao produto novo.

Antes de novas mudancas, validar a pagina do Projeto 36 em desktop e celular, especialmente enquadramento, legibilidade e qualidade dos videos.

## Arquitetura

- Next.js 15 com App Router e React 19.
- Conteudo principal em `lib/content.ts`.
- Paginas em `app/` e componentes em `components/`.
- SQL do Supabase em `supabase/`.
- Documentacao adicional em `docs/`.
- Deploy automatico da branch `main` para a Vercel.

Webhooks de producao:

- Stripe: `/api/webhooks/stripe`
- Mercado Pago: `/api/webhooks/mercado-pago`

## Preparar um computador novo

Instale Git e Node.js 20 ou superior. Depois execute:

```bash
git clone https://github.com/lukazdepaula/rumoaopro-site.git
cd rumoaopro-site
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install
pnpm check
pnpm build
pnpm dev
```

Abra a pasta clonada no Codex e diga: `Leia AGENTS.md e PROJECT_HANDOFF.md e continue o projeto de onde paramos.`

## Variaveis de ambiente

Use `.env.example` como lista oficial. Nunca envie valores secretos ao GitHub ou ao chat.

No computador novo, a forma recomendada e recuperar o ambiente diretamente da Vercel:

```bash
npm install -g vercel
vercel login
vercel link
vercel env pull .env.local
```

Ao executar `vercel link`, selecione o projeto existente `rumoaopro-site`. As credenciais de producao continuam armazenadas na Vercel e nao precisam ser recriadas.

## Validacao antes de publicar

```bash
pnpm check
pnpm build
```

Depois, testar no celular e no desktop:

1. Navegacao PT/EN.
2. Pagina e checkout do produto alterado.
3. Stripe e Mercado Pago sem realizar cobrancas desnecessarias.
4. Liberacao de acesso e e-mails.
5. Admin e area do cliente.

## Proximas prioridades

1. Finalizar e revisar a pagina bilingue do Projeto 36.
2. Validar videos e capas em celular e desktop.
3. Concluir capas e traducoes restantes.
4. Monitorar analytics, funil de checkout e primeiras vendas reais.
5. Continuar simplificando paginas de venda sem revelar material interno em excesso.

