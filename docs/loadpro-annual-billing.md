# Plano anual LoadPro — preparação e configuração

Esta branch prepara os anuais em BRL do Fundadores 30 por R$ 499 e do Fundadores 50 por R$ 699, aprovados em 14/09/2026. Os mensais continuam por R$ 49,90 e R$ 69,90, respectivamente, sem alterar seus limites. Recursos e limites da conta são preservados. Nenhuma migração foi aplicada a produção e nenhum envio ou pagamento real foi efetuado nesta tarefa.

## Fluxos

A escolha ocorre na área autenticada de assinatura. Na página de planos, quem ainda não tem conta começa o teste comercial existente pelo checkout mensal e depois confirma o anual na assinatura. O checkout mensal informa as condições mensais; clicar na oferta anual nunca muda um contrato sozinho.

A vitrine do site em `/apps` e `/links`, incluindo as versões em inglês, apresenta mensal e anual lado a lado no desktop e em cartões empilhados no celular. Os preços principais anuais são R$ 499/ano e R$ 699/ano à vista, com “12 meses pelo preço de 10” e economia de R$ 99,80/R$ 139,80. Cada par mensal/anual mantém 2 equipes e 30/50 atletas por equipe, respectivamente. Mostra os mesmos recursos/limites e explica cartão, Pix, dias preservados e o caminho de cadastro. O botão anual leva à assinatura autenticada; a página não cria cobrança nem confirma mudança. Publicar a oferta junto com a integração habilitada, após validação sandbox.

Cartão: cronograma na mesma assinatura Stripe, fase mensal/teste até o limite atual e fase anual a partir dele. Sem rateio e sem nova assinatura. O ano pago só é liberado após `invoice.paid` da fatura atual, no valor exato do plano confirmado: R$ 499 ou R$ 699 em BRL. A fatura, o preço atual e a confirmação devem corresponder ao mesmo plano; valor do outro plano é recusado. Atualizações de assinatura e retorno do checkout não comprovam pagamento. O período informado para o anual agendado é condicionado ao pagamento.

Pix: a revisão informa pagamento agora e interrupção da renovação mensal ao confirmar a escolha. O cancelamento da próxima mensal é confirmado antes de criar/exibir o Pix. Se o Pix não for pago, restam somente os dias atuais. Quando o provedor confirma, o início anual é o maior entre o fim do período protegido e a aprovação; acrescenta-se um ano de calendário, preservando anos bissextos e dias pagos. Renovação anual por Pix é manual e usa nova confirmação autenticada.

Erros após mutação no provedor deixam uma operação persistente para retomar pelo mesmo ID. Nunca se declara que nada mudou após um timeout. Operações travadas exigem reconciliação; não libere travas nem crie outra cobrança sem conferir o provedor. Pix recusado não reativa o mensal automaticamente.

## Configuração antes de habilitar

1. Revisar `supabase/loadpro-annual-billing.sql` e executar exclusivamente no Supabase LoadPro. Ela cria registros de operações e funções exclusivas de `service_role`, com RLS. Não muda registros existentes. Validar os gatilhos existentes de propagação a clubes.
2. Configurar `STRIPE_LOADPRO_ANNUAL_PRICE_ID`: preço ativo, BRL 49900, intervalo `year`, intervalo_count 1. Configurar também `STRIPE_LOADPRO_FOUNDERS_50_ANNUAL_PRICE_ID`: preço ativo, BRL 69900, `year`, intervalo_count 1. Manter os preços mensais atuais. O servidor lê e valida o catálogo antes de usar o preço.
3. Configurar `LOADPRO_ANNUAL_WEBHOOK_ORIGIN` como origem HTTPS do backend que receberá o Pix. Registrar `/api/loadpro/billing/annual/webhook` no Mercado Pago; assinatura HMAC obrigatória. Manter o webhook Stripe existente com `invoice.paid`, falha de pagamento, atualização e exclusão de assinatura. Verificar que o portal Stripe não permite alterações livres de plano que contornem a revisão do aplicativo.
4. Configurar `LOADPRO_ANNUAL_ALLOWED_ORIGINS` com origens exatas do preview do app (separadas por vírgula). Nada de wildcard.
5. No preview, usar Supabase separado, credenciais Stripe de teste e Mercado Pago sandbox. Definir `LOADPRO_ANNUAL_PIX_SANDBOX=true` apenas nesse ambiente; nunca copiar chaves live. `LOADPRO_ANNUAL_ENABLED` permanece ausente/false até terminar a validação. Os testes automatizados interceptam toda rede de pagamento.
6. Habilitar em preview com `LOADPRO_ANNUAL_ENABLED=true`, validar cartão com relógio de teste Stripe e Pix sandbox de ponta a ponta, falha, repetição, fim do teste e parcelas mensais ausentes. Só então aprovar a regra comercial e o deploy de produção dos dois projetos.

Variáveis de acesso ao Supabase e dos provedores são somente do servidor. Nunca colocar segredos no app estático. `LOADPRO_ANNUAL_ENABLED=false` bloqueia novas escolhas; webhooks de pagamentos já iniciados continuam reconciliando.

## Lembretes

Auditados: ativação de teste, conta existente, recuperação de senha e pagamento recusado na Stripe. Nenhum lembrete de fim de teste ou cron correspondente foi encontrado. O painel Stripe foi conferido em 14/09/2026: aviso 7 dias antes do fim de uma avaliação está **ativo**, avisos de renovações futuras **inativos**, expiração de cartão e falha no cartão **ativos**. Nenhum controle foi alterado. A configuração de campanhas fora do código no Resend ainda deve ser conferida.

`prepareAnnualTrialReminder` prepara PT/EN, somente nas últimas 48 horas de um teste comercial de sete dias, com cobrança mensal prevista e link autenticado. Exige consentimento comercial explícito e ausência de supressão; consentimento de rastreamento não equivale a consentimento de e-mail. Exclui anual escolhido/comprado, teste encerrado, cancelamento e chave já entregue. Não contém envio nem cron. Ao integrar ao remetente, reconsultar acesso e preferências no momento do envio e reservar a chave duravelmente com unicidade antes de enviar. Usar a mesma chave no Resend, registrar entrega e não reenviar em resultado incerto. A ativação do remetente/agendamento depende de aprovação; não disparar campanhas de teste.

## Limitações a aprovar

Assinaturas legadas no Mercado Pago, moedas diferentes de BRL, preço mensal diferente de R$ 49,90/R$ 69,90 no respectivo plano ou cronogramas externos exigem análise assistida. A oferta nunca converte essas contas automaticamente. Renovação ou fatura já em processamento (menos de 15 minutos até o vencimento) exige reconciliação antes de nova cotação. Para Pix recusado/abandonado após parar a mensal, o suporte deve revisar uma nova tentativa; não reiniciar cobrança automática silenciosamente.

Documentação dos provedores: https://docs.stripe.com/billing/subscriptions/subscription-schedules e https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks/payment-brick/payment-submission/pix.

## Validação de 14/09/2026

31 testes passaram (`node --test scripts/tests/loadpro-annual.test.mjs scripts/tests/loadpro-billing.test.mjs`), com PostgreSQL PGlite isolado, ambos os planos e testes mensais de regressão. TypeScript/build passaram. Há 28 cenários de UI do app e 16 verificações da vitrine PT/EN em desktop/celular no repositório LoadPro. Todos usam dados fictícios e rede de pagamento interceptada.

A configuração do app sandbox também precisa apontar Auth/REST do Supabase e API anual para os ambientes isolados. Os previews visuais existentes não devem ser usados para confirmar uma assinatura real. Nenhuma migração remota, preço de produção, assinatura, cobrança ou envio foi modificado.

O preparador exige `existingTrialReminder=false`, apurado pelo operador; com outro lembrete ativo ou situação desconhecida, não gera o novo envio. A Stripe atualmente tem esse aviso ativo, portanto o novo remetente deve continuar desligado até aprovar qual canal será responsável. Preferências, ausência de anual confirmado e unicidade precisam ser rechecadas no instante do envio. O código existente também envia aviso de falha de cartão; há possível sobreposição com a Stripe que precisa ser revisada antes de acrescentar mensagens.
