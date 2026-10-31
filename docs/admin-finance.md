# Indicadores financeiros do admin

O painel financeiro separa três métricas que respondem a perguntas diferentes:

- **MRR atual:** fotografia somente das assinaturas ativas na Stripe, normalizada para um mês. Atrasos e testes aparecem separadamente e não entram no MRR nem no contador de assinaturas ativas. Descontos recorrentes ativos são subtraídos por padrão.
- **Faturamento por período:** vendas do site aprovadas entre as datas selecionadas. Inclui compras iniciais, renovações conciliadas, Preparador PRO na Kiwify e vendas do Shopify registradas na migração.
- **Indicador mensal combinado:** MRR atual após descontos mais as vendas avulsas de produtos do tipo `training_program` acumuladas no mês atual. Não representa faturamento recebido nem lucro. Fica indisponível quando as fontes estão parciais ou há moedas sem conversão.

## Fontes

O Stripe é lido por `balance_transactions`, o que permite reconciliar valor bruto, taxas, reembolsos e líquido. Cada movimentação precisa estar ligada a um pedido, assinatura ou produto conhecido do site. O Mercado Pago é lido pela pesquisa de pagamentos e identifica vendas do site pelo `external_reference`, metadado ou ID do gateway. Movimentações sem esse vínculo aparecem em uma seção separada: assessoria identificada, transferências entre contas, saídas conferidas ou classificação pendente. O vínculo ao site tem prioridade, impedindo dupla contagem.

A Kiwify é consultada exclusivamente para o produto **Preparador PRO**. O painel usa o ID configurado ou descobre todos os cadastros cujos nomes contêm “Preparador PRO” ou “Preparo Pro” e combina as vendas sem duplicá-las. Somente registros com status `paid` entram no faturamento bruto, líquido e na contagem; vendas reembolsadas ou contestadas ficam fora desses totais e aparecem no campo de reembolsos. Períodos maiores são divididos em janelas de até 90 dias, respeitando o limite da API. A fonte não possui fallback local: se a consulta falhar, o valor somado é zero e o painel marca a Kiwify como indisponível para impedir uma estimativa silenciosa.

O bruto do curso usa `payment.product_base_price`, sem juros de parcelamento cobrados do comprador. O líquido usa a participação da própria conta em `revenue_partners`, quando presente, ou `net_amount`; nunca `settlement_amount`. Taxas usam `payment.fee`. Valores ausentes tornam a fonte indisponível. Os campos seguem a [API oficial de vendas](https://docs.kiwify.com.br/api-reference/sales/single). Conferir novamente com vendas reais após publicar: a prévia local usa dados fictícios e não certifica os saldos do provedor.

O histórico do Shopify permanece vindo dos pedidos migrados. Para esses registros, o painel usa `shopify_purchase_date` e `shopify_amount_paid`, preservando a data e o valor da venda original mesmo quando o acesso foi migrado depois.

Se uma consulta oficial falhar ou não estiver configurada, o painel usa os pedidos locais daquele gateway e marca o resultado como **fallback**. Esse valor é parcial porque uma renovação pode não criar um novo pedido local. Falhas ao identificar recursos da Stripe também disparam esse fallback, em vez de excluir silenciosamente pagamentos como externos. Consultas de identificação são limitadas a quatro movimentações por lote.

As credenciais são lidas somente no servidor. As respostas financeiras ficam em cache por 60 segundos; o botão **Atualizar** ignora esse cache.

## Kiwify · Preparador PRO

Crie uma chave em **Kiwify > Apps > API > Criar API Key** com acesso de leitura a **Produtos** e **Vendas**. Cadastre os três valores abaixo como segredos de produção na Vercel:

```env
KIWIFY_ACCOUNT_ID=...
KIWIFY_CLIENT_ID=...
KIWIFY_CLIENT_SECRET=...
```

Se os cadastros não tiverem “Preparador PRO” ou “Preparo Pro” no nome, informe o ID exato. Mais de um ID pode ser separado por vírgula:

```env
KIWIFY_PREPARADOR_PRO_PRODUCT_ID=id_principal,id_antigo
```

Depois de salvar, faça um novo deploy e use **Atualizar** no admin. Nunca exponha esses valores com o prefixo `NEXT_PUBLIC_`.

## Definições

- **Faturamento bruto:** soma dos pagamentos vinculados ao site que foram aprovados no período, antes de taxas e reembolsos.
- **Faturamento líquido:** saldo dos eventos financeiros do período após taxas, reembolsos e disputas informados pelos gateways.
- **Pagamentos aprovados:** quantidade de cobranças vinculadas ao site, inclusive renovações.
- **Ticket médio:** faturamento bruto dividido pelos pagamentos aprovados.

O indicador mensal combinado não é uma conciliação de caixa: o MRR representa a fotografia recorrente atual, enquanto as vendas de programas representam pagamentos já confirmados no mês. Em filtros diferentes de **Mês atual**, o painel mantém o indicador indisponível para não misturar períodos.

**Saldo após custos informados:** usa receitas líquidas confirmadas do site e curso no mês atual menos custos informados, nunca MRR ou projeção de receita. A assessoria externa permanece apresentada separadamente. Não é lucro líquido contábil nem saldo bancário disponível e não inclui impostos. Fontes de custo pendentes, falhas, moedas sem conversão ou receitas parciais impedem o cálculo. Vercel e ManyChat aparecem explicitamente como pendências até a conciliação das respectivas faturas; custos desconhecidos nunca são considerados zero.

As fontes têm bases temporais diferentes: Stripe usa a data da movimentação; Mercado Pago usa a aprovação do pagamento e seu estado atual; Kiwify usa a aprovação e exclui vendas atualmente reembolsadas. Portanto, bruto menos taxas menos reembolsos não é uma identidade para o agregado. O painel é gerencial, não um livro-caixa de estornos por data.

## Assessoria externa e transferências

Configurações somente no servidor, sem IDs reais no repositório:

```env
ADMIN_FINANCE_STRIPE_COACHING_PRODUCT_IDS=prod_example
ADMIN_FINANCE_MP_CLASSIFICATIONS={"123456":"coaching","654321":"internal_transfer","789012":"outgoing_payment"}
```

A classificação Stripe exige que todos os produtos identificados pertençam à lista confirmada. A ligação também passa por `invoice_payments` nas versões que não expõem `charge.invoice`. Faturas mistas ficam pendentes e respostas incompletas disparam fallback. No Mercado Pago, somente IDs individualmente conferidos são classificados; Pix ou `bank_transfer` não indicam por si só uma venda ou transferência própria. A lista precisa ser atualizada após novas conferências.

O total da operação soma site, curso e assessoria externa identificada. Transferências próprias, saídas conferidas e movimentos pendentes ficam fora. Configuração inválida, falha de consulta ou moeda sem conversão impede um total consolidado. Nunca classificar pelo nome do pagador ou por semelhança de valores.

A pesquisa de pagamentos do Mercado Pago também pode retornar pagamentos feitos pela própria conta, com valores positivos. A categoria `outgoing_payment` é reservada a IDs conferidos no extrato com débito e no detalhe da transação. O cartão mostra o valor informado pelo pagamento como saída conferida, separado das vendas e das pendências. Isso não equivale ao total de despesas da conta e não alimenta automaticamente os custos: pagamento de fatura não comprova a natureza das compras e poderia duplicar despesas já registradas.

## Funil e cobertura

O admin pagina todos os pedidos e eventos do período, com ordenação estável e limite superior de data. Uma página curta do banco não prova que o histórico acabou. Atingir o limite de segurança interrompe o relatório com indisponibilidade explícita.

Cada etapa conta uma sessão por produto, deduplicando idioma, rota e repetição por mudança de consentimento. A taxa relaciona sessões com visita consentida a pedidos pagos do mesmo produto, criados após a visita e com o mesmo `marketing_session_id` e consentimento. Vendas sem esse vínculo ficam fora da taxa e continuam nos contadores de vendas. Sem denominador confiável, a taxa é indisponível. Acessos diretos podem entrar em etapas posteriores; as colunas não representam uma sequência obrigatória. Eventos antigos que não foram coletados não são reconstruídos.

Programas usam pedidos locais pagos do tipo `training_program`; o curso tem cartão próprio e fica fora do indicador MRR mais programas. Valores locais em moeda estrangeira usam o câmbio do pedido e podem diferir da liquidação do gateway.

O filtro abre no mês atual e aceita hoje, últimos 7 ou 30 dias, mês anterior, ano atual e uma faixa personalizada de até 366 dias. A pesquisa do Mercado Pago está limitada aos últimos 12 meses pela API do provedor.

## MRR e descontos

```env
STRIPE_MRR_SUBTRACT_DISCOUNTS=true
```

O valor padrão subtrai descontos ativos encontrados nas assinaturas e nos itens. Configure `false` apenas se a conta Stripe estiver configurada para exibir MRR sem descontos. Impostos, períodos de teste, valores gratuitos e uso medido não entram no MRR estimado.
