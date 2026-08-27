# Indicadores financeiros do admin

O painel financeiro separa três métricas que respondem a perguntas diferentes:

- **MRR atual:** fotografia das assinaturas ativas e em atraso na Stripe, normalizada para um mês. Descontos recorrentes ativos são subtraídos por padrão.
- **Faturamento por período:** vendas do site aprovadas entre as datas selecionadas. Inclui compras iniciais, renovações conciliadas e vendas do Shopify registradas na migração.
- **Faturamento mensal combinado:** MRR atual após descontos mais as vendas avulsas de produtos do tipo `training_program` acumuladas no mês atual. Cobranças de assinatura não entram novamente na parcela de programas, evitando duplicidade.

## Fontes

O Stripe é lido por `balance_transactions`, o que permite reconciliar valor bruto, taxas, reembolsos e líquido. Cada movimentação precisa estar ligada a um pedido, assinatura ou produto conhecido do site. O Mercado Pago é lido pela pesquisa de pagamentos e só aceita registros cujo `external_reference`, metadado ou ID do gateway corresponda a uma venda do site. Pagamentos da mesma conta que não tenham esse vínculo são ignorados e aparecem como exclusões no detalhamento da fonte.

O histórico do Shopify permanece vindo dos pedidos migrados. Para esses registros, o painel usa `shopify_purchase_date` e `shopify_amount_paid`, preservando a data e o valor da venda original mesmo quando o acesso foi migrado depois.

Se uma consulta oficial falhar ou não estiver configurada, o painel usa os pedidos locais daquele gateway e marca o resultado como **fallback**. Esse valor é parcial porque uma renovação pode não criar um novo pedido local.

As credenciais são lidas somente no servidor. As respostas financeiras ficam em cache por 60 segundos; o botão **Atualizar** ignora esse cache.

## Definições

- **Faturamento bruto:** soma dos pagamentos vinculados ao site que foram aprovados no período, antes de taxas e reembolsos.
- **Faturamento líquido:** saldo dos eventos financeiros do período após taxas, reembolsos e disputas informados pelos gateways.
- **Pagamentos aprovados:** quantidade de cobranças vinculadas ao site, inclusive renovações.
- **Ticket médio:** faturamento bruto dividido pelos pagamentos aprovados.

O faturamento mensal combinado é um indicador gerencial, não uma conciliação de caixa: o MRR representa a fotografia recorrente atual, enquanto as vendas de programas representam pagamentos já confirmados no mês. Em filtros diferentes de **Mês atual**, o painel mantém o indicador indisponível para não misturar períodos.

O filtro abre no mês atual e aceita hoje, últimos 7 ou 30 dias, mês anterior, ano atual e uma faixa personalizada de até 366 dias. A pesquisa do Mercado Pago está limitada aos últimos 12 meses pela API do provedor.

## MRR e descontos

```env
STRIPE_MRR_SUBTRACT_DISCOUNTS=true
```

O valor padrão subtrai descontos ativos encontrados nas assinaturas e nos itens. Configure `false` apenas se a conta Stripe estiver configurada para exibir MRR sem descontos. Impostos, períodos de teste, valores gratuitos e uso medido não entram no MRR estimado.
