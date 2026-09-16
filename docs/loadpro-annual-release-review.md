# Revisão para publicar o anual do LoadPro

Documento de preparação. Não autoriza migração, alteração de credenciais, envio ou publicação em produção. Os dois PRs permanecem rascunho.

## Oferta e transição para revisão comercial

| Plano | Mensal preservado | Anual à vista | Limites |
|---|---|---|---|
| Fundadores 30 | R$ 49,90 | R$ 499 | 2 equipes, 30 atletas por equipe |
| Fundadores 50 | R$ 69,90 | R$ 699 | 2 equipes, 50 atletas por equipe |

Cartão: após escolha e confirmação na conta, substitui a próxima mensalidade pelo anual na mesma assinatura. Preserva teste e mês pago; renovação anual automática.

Pix: a revisão informa que confirmar interrompe a próxima mensalidade antes de gerar o QR. Os dias atuais continuam. Se o Pix for abandonado, não há retorno silencioso da mensal: o acesso termina ao fim dos dias atuais. Após aprovação verificada, soma um ano aos dias preservados; renovação manual. A pergunta comercial foi apresentada ao responsável em16/09; registrar a resposta antes de publicar. Não presumir aprovação pela passagem do tempo.

## Dependências e ordem proposta

1. Revisar os diffs do app PR132 e do backend RumoAoPro PR18; conferir a branch de produção vigente antes de integrar. O checkout, os provedores, as chaves, os webhooks e a confirmação de acesso dependem do backend. Publicar apenas o app não habilita o anual.
2. Revisar as migrações aditivas no banco LoadPro: loadpro-annual-billing.sql e loadpro-annual-reminders.sql. Conferir projeto e permissões; nenhuma deve ser aplicada ao banco de checkout por engano. Nunca reaplicar o instalador de banco vazio usado no sandbox. Manter dados, limites e RLS existentes.
3. Conferir ou criar somente preços anuais LIVE separados em BRL49900/69900, intervalo year/1, sem editar os mensais. Guardar STRIPE_LOADPRO_ANNUAL_PRICE_ID e STRIPE_LOADPRO_FOUNDERS_50_ANNUAL_PRICE_ID exclusivamente no servidor, após aprovação de produção. IDs TEST do preview são inválidos para vendas reais.
4. Revisar configuração LIVE do Mercado Pago Orders separada do legado mensal: vendedor/aplicação da empresa, segredo próprio, LOADPRO_ANNUAL_PIX_API=orders, LOADPRO_ANNUAL_MP_ORDERS_LIVE=true, TEST_APPROVAL=false e PIX_SANDBOX=false. Não copiar IDs ou chaves do vendedor fictício. Validar vínculo e assinatura do webhook /api/loadpro/billing/annual/orders/webhook.
5. Conferir webhooks Stripe de faturas/assinaturas e destino HTTPS real; manter reconciliação assinada e portal seguro. Nenhum teste deve criar cobrança real ou modificar um cliente existente.
6. Publicar backend com novas escolhas desabilitadas até migração/configuração verificadas; coordenar ativação LOADPRO_ANNUAL_ENABLED e publicação do app/vitrine. Não anunciar a oferta enquanto as APIs estiverem indisponíveis. Validar navegação e leituras, sem transações reais de teste.

## Lembretes

A Stripe continua sendo o único canal ativo de aviso de fim de teste. OWNER=stripe e STRIPE_TRIAL_REMINDER_DISABLED=false são os padrões seguros; nenhuma configuração Stripe/Resend foi alterada. O texto com alternativa anual, a preferência autenticada (opt-in por padrão falso) e a reserva única por usuário/fim de teste estão preparados. A reserva consulta o contrato atual no provedor, exige consentimento e uma consulta recente de supressão, confere versões no banco e impede repetição. Retirar o consentimento invalida rascunhos reservados.

Não há remetente, cron ou campanha novos. Antes de ativar o e-mail com oferta, ainda é necessário implementar e revisar o adaptador do estado global de descadastro/supressão do Resend, a entrega com a mesma chave e reconciliação de resposta incerta, revalidar elegibilidade imediatamente antes do envio e aprovar um canal único. Não desligar o aviso Stripe sem um substituto de cobrança verificado também para quem não aceita ofertas. Preparar uma oferta não autoriza dispará-la.

## Verificações e limites

Pagamentos e cancelamento já validados no sandbox estão registrados em loadpro-annual-billing.md. A primeira fatura anual recusada e o cancelamento durante mês pago têm testes automatizados; a recusa hospedada foi de renovação e o cancelamento antes da primeira anual foi durante teste. PDF final nativo e janela privada não estão disponíveis nesta ferramenta e não são declarados aprovados.

## Interrupção segura da oferta

Se surgir falha, bloquear novas escolhas anuais com LOADPRO_ANNUAL_ENABLED=false e retirar a oferta da vitrine em uma alteração revisada. Manter webhooks, reconciliação, acesso já comprado e cancelamento funcionando. Não apagar migrações, operações, faturas ou assinaturas; não voltar automaticamente clientes para mensal. Reverter todo o backend antigo depois de vendas anuais pode interromper a confirmação de pagamentos e exige análise própria.
