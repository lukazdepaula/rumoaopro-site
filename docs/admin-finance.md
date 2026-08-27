# Indicadores financeiros do admin

O painel financeiro separa duas métricas que respondem a perguntas diferentes:

- **MRR atual:** fotografia das assinaturas ativas e em atraso na Stripe, normalizada para um mês. Descontos recorrentes ativos são subtraídos por padrão.
- **Faturamento por período:** movimentação aprovada entre as datas selecionadas. Inclui compras iniciais e renovações localizadas diretamente nos gateways.

## Fontes

O Stripe é lido por `balance_transactions`, o que permite reconciliar valor bruto, taxas, reembolsos e líquido. O Mercado Pago é lido pela pesquisa de pagamentos aprovados. O histórico do Shopify permanece vindo dos pedidos migrados.

Se uma consulta oficial falhar ou não estiver configurada, o painel usa os pedidos locais daquele gateway e marca o resultado como **fallback**. Esse valor é parcial porque uma renovação pode não criar um novo pedido local.

As credenciais são lidas somente no servidor. As respostas financeiras ficam em cache por 60 segundos; o botão **Atualizar** ignora esse cache.

## Definições

- **Faturamento bruto:** soma dos pagamentos que foram aprovados no período, antes de taxas e reembolsos.
- **Faturamento líquido:** saldo dos eventos financeiros do período após taxas, reembolsos e disputas informados pelos gateways.
- **Pagamentos aprovados:** quantidade de cobranças aprovadas, inclusive renovações.
- **Ticket médio:** faturamento bruto dividido pelos pagamentos aprovados.

O filtro abre no mês atual e aceita hoje, últimos 7 ou 30 dias, mês anterior, ano atual e uma faixa personalizada de até 366 dias. A pesquisa do Mercado Pago está limitada aos últimos 12 meses pela API do provedor.

## MRR e descontos

```env
STRIPE_MRR_SUBTRACT_DISCOUNTS=true
```

O valor padrão subtrai descontos ativos encontrados nas assinaturas e nos itens. Configure `false` apenas se a conta Stripe estiver configurada para exibir MRR sem descontos. Impostos, períodos de teste, valores gratuitos e uso medido não entram no MRR estimado.
