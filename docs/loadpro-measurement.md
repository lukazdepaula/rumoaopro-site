# Medição comercial do LoadPro

Implementação preparada em 26/09/2026. Não altera anúncios, orçamento, preços,
campos de compra, direitos de acesso ou a página da assessoria.

## Decisão e regras

Lucas acompanha os resultados por semana para decidir se mantém, pausa ou amplia
o teste de anúncios. Antes de comparar criativos, separar estes indicadores:

| Indicador | Fonte e definição | Limitação |
| --- | --- | --- |
| Checkout visitado / formulário enviado | `analytics`, `checkout_view` / `checkout_submit`; sessões distintas por produto e etapa | Não são pessoas únicas. O aceite de cookies pode gerar um segundo registro da mesma sessão. |
| Teste iniciado | `analytics`, `trial_started`; assinatura Stripe confirmada como `trialing`, uma vez por assinatura | Vale R$ 0. Não significa ativação no app nem cliente pagante. Autorização legada do Mercado Pago não basta para confirmar teste gratuito. |
| Pagamento recebido | `analytics`, `payment_received`; valor positivo confirmado pelo provedor, uma vez por referência de pagamento | Inclui primeira cobrança e renovações; não equivale a novos clientes nem lucro. |

Para faturamento líquido, taxas, reembolsos, chargebacks e todas as receitas da
empresa, continuam valendo a conciliação financeira e os provedores de pagamento.
Não somar moedas diferentes nem converter silenciosamente para reais. Não foi
definida nova meta de ROAS/CPA: falta atribuição confirmada de vendas por anúncio.

Guardrails: nenhum envio publicitário sem consentimento; nenhuma cobrança ou
liberação de acesso causada por analytics; ambientes de teste fora dos resultados
de produção; cobrança de valor zero fora de `payment_received`.

## Eventos e origem

Os registros ficam na tabela existente `webhook_events`, com provider `analytics`.
Os novos tipos financeiros **não são aceitos pelo endpoint público** de analytics.
Somente handlers de pagamentos verificados podem criá-los. Não há migração de
banco nem alteração retroativa de pedidos.

- `trial_started`: chave estável por gateway e assinatura; valor zero; horário do
  início do teste quando informado pela Stripe.
- `payment_received`: chave estável por referência. Stripe usa o ID da fatura,
  não o ID de cada notificação. Uma renovação tem outra fatura e conta como outro
  pagamento. O horário de pagamento do provedor fica em `occurred_at` quando
  disponível; caso contrário usa-se o recebimento do evento.
- `created_at`: quando o registro foi salvo; não confundir com `occurred_at`.
- `session_id`: vínculo com a sessão do checkout somente se houve consentimento.
- `attribution.landing_attribution_id`: preserva `lp_attribution_id` recebido da
  página LoadPro somente após o consentimento no checkout.
- `attribution.status`: `consent_denied`, `campaign_identified` (UTM de campanha),
  `source_only` (origem/clique sem campanha) ou `unidentified`. Isso descreve
  disponibilidade de parâmetros, **não comprova atribuição causal ao anúncio**.

Os eventos internos registram fatos operacionais mesmo sem aceite publicitário,
sem nome, e-mail, telefone, documento, IP ou identificador de campanha. A Meta
continua recebendo dados apenas com o consentimento registrado no pedido.
O servidor descarta parâmetros de marketing enviados com consentimento negado.
URLs salvas não preservam tokens de acesso, e-mail ou parâmetros arbitrários.

`StartTrial` usa valor zero no navegador e no servidor. `Purchase` do LoadPro é
enviado pelo servidor: visitar/recarregar a página de sucesso não cria outra
compra com um ID diferente da fatura. Outros programas mantêm o comportamento
existente do navegador. `InitiateCheckout` mantém sua definição atual, sem
reinterpretar o histórico dos anúncios.

## Consulta operacional (somente leitura)

Exemplo: substituir as duas datas pelo período desejado. Dados financeiros são
agrupados pela hora do fato; visitas pelo registro. Moedas ficam separadas.

```sql
with bounds as (
  select timestamptz '2026-09-26 00:00:00-03' as start_at,
         timestamptz '2026-10-01 00:00:00-03' as end_at
), events as (
  select payload,
    case when payload->>'source' = 'billing_webhook'
      then (payload->>'occurred_at')::timestamptz else created_at end as happened_at
  from public.webhook_events
  where provider = 'analytics'
    and payload->>'product_id' in ('loadpro_founders', 'loadpro_founders_50')
)
select payload->>'product_id' as product,
       payload->>'type' as stage,
       payload->>'currency' as currency,
       count(*) as records,
       count(distinct nullif(payload->>'session_id', '')) as identified_sessions,
       sum(case when payload->>'type' = 'payment_received'
         then (payload->>'amount')::numeric else 0 end) as gross_received
from events, bounds
where happened_at >= bounds.start_at and happened_at < bounds.end_at
  and payload->>'type' in ('checkout_view', 'checkout_submit', 'trial_started', 'payment_received')
group by 1,2,3
order by 1,2,3;
```

Não usar `records` como contagem de visitas: usar `identified_sessions`. Para
conversão da mesma coorte, vincular sessões do mesmo produto e janela; não dividir
visitas do Meta por resultados de todas as origens. Sessões sem consentimento não
ganham vínculo retrospectivo com pedidos. Campanhas sem UTMs continuam sem nome;
esta mudança não edita nem inventa parâmetros nos anúncios.

## Cobertura e validação

- Novos registros passam a existir **após publicação**. A ausência histórica
  desses tipos não significa zero testes ou vendas. Consultar os webhooks
  originais/Stripe para períodos anteriores; nenhum backfill foi executado.
- A cobertura principal desta etapa é o checkout Stripe: testes, primeiras
  cobranças e renovações. Chamadas legadas de confirmação MP também podem gravar
  pagamentos, mas o fluxo separado de transição anual via Pix não foi alterado
  nem deve ser presumido como coberto. Para o total de todas as modalidades,
  continuar usando a conciliação financeira, não somente estes novos eventos.
- O status `pending` do pedido continua correto para um teste sem cobrança.
  A assinatura usa `metadata.subscription_status` e os dados do gateway; não
  presumir um campo plano `provider_subscription_status` no pedido.
- A disponibilidade da Meta pode continuar limitada por cookies, bloqueadores,
  configuração do dataset e campanhas sem parâmetros. Não há promessa de
  igualdade entre atribuição Meta e fatos internos.
- Falha ao gravar analytics não interrompe pagamento/acesso; a conciliação deve
  usar o webhook original. Estes registros não substituem o livro financeiro.
- Os testes usam fixtures e provedores simulados: nenhum cliente, cobrança,
  campanha, e-mail real ou evento publicitário foi criado.
- O painel administrativo visual não foi redesenhado. As novas etapas ficam
  consultáveis nos registros; não confundir com uma nova tela já publicada.

Comandos de verificação: `node --test scripts/tests/loadpro-measurement.test.mjs`,
suíte existente de pagamentos/segurança, `pnpm check` e `pnpm build`.
Antes de publicar: conferir o diff e validar o rastreamento em ambiente isolado.
O teste real de cartão/convite e confirmação no Gerenciador de Eventos da Meta
ainda precisa de uma verificação controlada após a publicação, sem inflar vendas.
