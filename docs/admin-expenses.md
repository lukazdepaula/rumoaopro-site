# Painel de despesas do admin

O bloco **Despesas do mês** reúne custos mensais no painel administrativo. Todas as consultas são executadas no servidor e exigem uma sessão de administrador. Tokens nunca são enviados ao navegador.

## Indicadores

- **Acumulado no mês:** soma das fontes disponíveis convertida para BRL.
- **Projeção de fechamento:** ritmo diário de Meta Ads e GitHub, acrescido dos custos fixos estimados.
- **Lucro estimado:** faturamento projetado no ritmo do mês menos as despesas monitoradas projetadas.
- **Orçamento consumido:** percentual de `ADMIN_MONTHLY_EXPENSE_BUDGET_BRL` já utilizado.

O lucro exibido é um indicador operacional, não um resultado contábil. Ele não inclui impostos nem custos cuja fonte ainda esteja pendente, e por isso o painel identifica quando o valor é parcial.

As consultas externas ficam em cache por 15 minutos. O painel tenta atualizar automaticamente a cada 5 minutos e também oferece atualização manual.

## Meta Ads

Variáveis:

```env
META_AD_ACCOUNT_ID=1234567890
META_ADS_ACCESS_TOKEN=
META_GRAPH_API_VERSION=v23.0
```

Use um token de System User dedicado e com acesso somente de leitura (`ads_read`) à conta de anúncios. O ID pode ser informado com ou sem o prefixo `act_`. Não reutilize o token da Conversions API: ele atende outro fluxo e pode ter permissões diferentes.

O valor exibido é o campo `spend` da conta para o mês selecionado. A moeda é lida diretamente da conta de anúncios.

Referência: [Meta Marketing API Insights](https://developers.facebook.com/docs/marketing-api/insights/).

## GitHub

Variáveis:

```env
GITHUB_BILLING_ACCOUNT=nome-da-conta
GITHUB_BILLING_ACCOUNT_TYPE=user
GITHUB_BILLING_TOKEN=
```

Use `user` para uma conta pessoal ou `organization` para uma organização. O token deve ser fine-grained e ter somente a permissão de leitura necessária para faturamento: **Plan: read** em conta pessoal ou **Administration: read** na organização.

O painel soma `netAmount` do resumo mensal da Billing Usage API. Assinaturas fixas que não apareçam nesse resumo precisam ser controladas separadamente.

Referência: [GitHub Billing Usage API](https://docs.github.com/en/rest/billing/usage?apiVersion=2026-03-10).

## Supabase

Variável:

```env
SUPABASE_MONTHLY_ESTIMATE_USD=25.00
```

O Supabase mostra o total previsto em **Organization > Billing > Upcoming Invoice**, mas não expõe esse total pela API pública de gerenciamento. Por isso, o painel identifica esse valor como **Estimativa manual**. Atualize a variável quando o próximo faturamento mudar. Esse valor acompanha o ciclo de faturamento da organização, que pode não coincidir exatamente com o mês-calendário.

Referência: [Supabase Cost Control](https://supabase.com/docs/guides/platform/cost-control).

## Conversão e orçamento

```env
USD_TO_BRL_RATE=5.50
ADMIN_MONTHLY_EXPENSE_BUDGET_BRL=2500.00
```

Valores em USD usam a taxa configurada. BRL é somado diretamente. Uma moeda sem conversão conhecida permanece visível na fonte, mas fica fora do total em BRL.

## Configuração na Vercel

Cadastre as variáveis como secrets nos ambientes desejados e faça um novo deploy. Nunca coloque valores reais em `.env.example`, commits, logs ou mensagens.
