# Revisão para publicar o anual do LoadPro

Documento de preparação. Não autoriza migração, alteração de credenciais, envio ou publicação em produção. Os dois PRs permanecem rascunho.

## Oferta e transição aprovadas para preparação

| Plano | Mensal preservado | Anual à vista | Limites |
|---|---|---|---|
| Fundadores 30 | R$ 49,90 | R$ 499 | 2 equipes, 30 atletas por equipe |
| Fundadores 50 | R$ 69,90 | R$ 699 | 2 equipes, 50 atletas por equipe |

Cartão: após escolha e confirmação na conta, substitui a próxima mensalidade pelo anual na mesma assinatura. Preserva teste e mês pago; renovação anual automática.

Pix v2: gerar o QR mantém o mensal vigente. Somente depois de consultar e verificar a aprovação do pagamento, o backend interrompe a renovação mensal e confere possíveis faturas na virada do período. Então soma um ano aos dias grátis ou efetivamente pagos; renovação manual. Pix pendente, recusado, cancelado ou abandonado mantém as condições mensais. O usuário aprovou essa regra em 16/09 ao responder “entao mete marcha” à recomendação de parar o mensal somente após pagamento. A proposta anterior de parar antes do QR está substituída; a publicação em produção ainda exige aprovação.

Se uma mensalidade já tiver sido paga durante a confirmação, seu período será preservado. Fatura aberta elegível tem cobrança automática desativada e é anulada; rascunho fica congelado. Reconsulta obrigatória detecta pagamento concorrente e preserva o mês pago. Falha, fatura não visível ou resultado incerto mantém a mesma operação em reconciliação, sem conceder acesso anual nem solicitar outro Pix. O banco exige prova de interrupção mensal e não transforma período futuro não pago em crédito. Repetições são idempotentes.

## Dependências e ordem proposta

1. Revisar os diffs do app PR132 e do backend RumoAoPro PR18; conferir a branch de produção vigente antes de integrar. O checkout, os provedores, as chaves, os webhooks e a confirmação de acesso dependem do backend. Publicar apenas o app não habilita o anual.
2. Revisar as migrações aditivas no banco LoadPro: loadpro-annual-billing.sql e loadpro-annual-reminders.sql. A migração anual agora inclui termos v2, nova confirmação e prova de interrupção mensal; cotações v1 não confirmadas exigem nova revisão. Conferir projeto e permissões; nenhuma deve ser aplicada ao banco de checkout por engano. Nunca reaplicar o instalador de banco vazio usado no sandbox. Manter dados, limites e RLS existentes.
3. Conferir ou criar somente preços anuais LIVE separados em BRL49900/69900, intervalo year/1, sem editar os mensais. Guardar STRIPE_LOADPRO_ANNUAL_PRICE_ID e STRIPE_LOADPRO_FOUNDERS_50_ANNUAL_PRICE_ID exclusivamente no servidor, após aprovação de produção. IDs TEST do preview são inválidos para vendas reais.
4. Revisar configuração LIVE do Mercado Pago Orders separada do legado mensal: vendedor/aplicação da empresa, segredo próprio, LOADPRO_ANNUAL_PIX_API=orders, LOADPRO_ANNUAL_MP_ORDERS_LIVE=true, TEST_APPROVAL=false e PIX_SANDBOX=false. Não copiar IDs ou chaves do vendedor fictício. Validar vínculo e assinatura do webhook /api/loadpro/billing/annual/orders/webhook.
5. Conferir webhooks Stripe de faturas/assinaturas e destino HTTPS real; manter reconciliação assinada e portal seguro. Nenhum teste deve criar cobrança real ou modificar um cliente existente.
6. Publicar backend com novas escolhas desabilitadas até migração/configuração verificadas; coordenar ativação LOADPRO_ANNUAL_ENABLED e publicação do app/vitrine. Não anunciar a oferta enquanto as APIs estiverem indisponíveis. Validar navegação e leituras, sem transações reais de teste.

## Lembretes

A Stripe continua sendo o único canal ativo de aviso de fim de teste. OWNER=stripe e STRIPE_TRIAL_REMINDER_DISABLED=false são os padrões seguros; nenhuma configuração Stripe/Resend foi alterada. O texto com alternativa anual, a preferência autenticada (opt-in por padrão falso) e a reserva única por usuário/fim de teste estão preparados. A reserva consulta o contrato atual no provedor, exige consentimento e uma consulta recente de supressão, confere versões no banco e impede repetição. Retirar o consentimento invalida rascunhos reservados.

Não há remetente, cron ou campanha novos. Antes de ativar o e-mail com oferta, ainda é necessário implementar e revisar o adaptador do estado global de descadastro/supressão do Resend, a entrega com a mesma chave e reconciliação de resposta incerta, revalidar elegibilidade imediatamente antes do envio e aprovar um canal único. Não desligar o aviso Stripe sem um substituto de cobrança verificado também para quem não aceita ofertas. Preparar uma oferta não autoriza dispará-la.

## Verificações e limites

97 testes backend e 19 testes app passaram; TypeScript/build, sintaxe e QA aprovados. SQL executado em PostgreSQL isolado com chamadas dos provedores interceptadas. Cobertura inclui pagamento Pix pendente/recusado/aprovado, retentativas, fatura mensal paga/aberta/rascunho, aprovação atrasada, anulação concorrente com pagamento e fatura ainda não visível. Diálogo PT/EN e vitrine PT/EN conferidos em desktop 1440px e celular 390px, sem overflow. Funções v2 aplicadas somente no sandbox, com RLS e execução exclusiva de serviço verificadas.

**Antes de produção, falta validar a nova sequência v2 também contra os provedores hospedados de teste.** O Pix hospedado aprovado em 15/09 exercitou v1 (interrupção antes de pagar), portanto não comprova a nova ordem. Não usar cobranças reais para preencher essa lacuna. Os pagamentos e cancelamentos já validados no sandbox estão registrados em loadpro-annual-billing.md. A primeira fatura anual recusada e o cancelamento durante mês pago têm testes automatizados; a recusa hospedada foi de renovação e o cancelamento antes da primeira anual foi durante teste. PDF final nativo e janela privada não estão disponíveis nesta ferramenta e não são declarados aprovados.

## Interrupção segura da oferta

Se surgir falha, bloquear novas escolhas anuais com LOADPRO_ANNUAL_ENABLED=false e retirar a oferta da vitrine em uma alteração revisada. Manter webhooks, reconciliação, acesso já comprado e cancelamento funcionando. Não apagar migrações, operações, faturas ou assinaturas; não voltar automaticamente clientes para mensal. Reverter todo o backend antigo depois de vendas anuais pode interromper a confirmação de pagamentos e exige análise própria.

A reconciliação usa os comportamentos documentados em [controle automático de faturas Stripe](https://docs.stripe.com/api/invoices/update), [anulação de fatura](https://docs.stripe.com/api/invoices/void) e [cancelamento de assinatura](https://docs.stripe.com/billing/subscriptions/cancel). A instalação/testes desta rodada não alteraram produção, credenciais, proteção do preview ou assinaturas existentes.

Recontratação após cancelamento: a escolha anual antiga não é transferida para a nova assinatura. A correção preserva operações históricas, consentimento da mesma assinatura e ignora eventos de contratos substituídos. Três testes novos aprovados; rodada completa backend97/97, TypeScript/build e preview Ready (cbfd752). A nova simulação hospedada está aguardando autorização específica para pausar/restaurar o destino TEST antigo, bloqueada pela revisão automática; nenhuma transação foi enviada.
