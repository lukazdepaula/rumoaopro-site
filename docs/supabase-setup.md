# Supabase Setup

Use este arquivo para criar a base de produção do checkout e da área do cliente.

## 1. Criar as tabelas

No painel do Supabase:

1. Abra o projeto `RumoAoPro.com`.
2. Clique em `SQL Editor` na barra lateral esquerda.
3. Clique em `New query`.
4. Copie todo o conteúdo de `supabase/schema.sql`.
5. Cole no editor.
6. Clique em `Run`.

Depois disso, volte em `Database > Tables`. As tabelas principais devem aparecer:

- `products`
- `orders`
- `users`
- `customer_login_tokens`
- `entitlements`
- `program_materials`
- `webhook_events`
- `order_logs`

## 2. Variáveis para Vercel

No Supabase:

1. Vá em `Project Settings`.
2. Abra `API`.
3. Copie `Project URL`.
4. Copie a chave secreta `sb_secret_...` em `API Keys`.

Na Vercel, adicione a variável:

```txt
CHECKOUT_DB_DRIVER=postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-secret-key
SUPABASE_SERVICE_ROLE_KEY=your-legacy-service-role-key
```

Importante: `SUPABASE_SECRET_KEY` e `SUPABASE_SERVICE_ROLE_KEY` são segredos de servidor. Prefira a chave opaca `sb_secret_...`; mantenha a chave legada apenas durante a migração. Não coloque nenhuma delas em variável pública nem exponha no front-end.

## 3. Fallback local

Localmente, o projeto pode continuar usando SQLite:

```txt
CHECKOUT_DB_DRIVER=sqlite
CHECKOUT_DB_PATH=.data/rumoaopro.sqlite
```

Na Vercel, use `CHECKOUT_DB_DRIVER=postgres`.
