# Revisão para publicar o anual do LoadPro

Documento de preparação. Não autoriza migração, alteração de credenciais, envio ou publicação em produção. Os dois PRs permanecem rascunho.

## Revisão final concluída em 17/09

main foi atualizada e continua ancestral das duas branches anuais; previews aprovados, sem mudança funcional posterior aos testes registrados. No Supabase de produção LoadPro iqkzqdoyvxblnsgnsfbz, consultas somente de metadados confirmaram colunas, tipos, PK/referências, roles e gerador UUID; RLS ativo nos dados de cobrança e clubes/equipes/atletas/staff. Novas tabelas/funções anuais ainda ausentes, sem colisão. As restrições e funções atuais de propagação aceitam preço/prazo anual e preservam plano, limites e conta. Nenhum dado de cliente foi lido ou alterado. Banco Healthy; backup mostrado há 12 horas.

Stripe LIVE: destino we_1TuDM4A6RupMT8QsjkIHgUWg ativo em https://rumoaopro.com/api/webhooks/stripe, versão 2025-08-27.basil, com os 11 eventos necessários existentes. Painel Esta semana: 61 entregas e 0 falhas. Nenhuma configuração foi alterada. Flags de teste/preview ausentes de Production nos projetos aplicáveis, incluindo Shared. Chaves reais não foram reveladas. O anual permanece desligado.

Proposta concreta para liberação: (1) aplicar annual-billing, annual-reminders e reminder-delivery em ordem no banco LoadPro e conferir permissões; (2) integrar PR18 com oferta desligada e verificar backend/checkout atuais; (3) integrar PR132 e ativar/recompilar a oferta no backend/vitrine; (4) conferir preços, navegação e leitura autenticada em desktop/celular sem compra real. Preservar os avisos Stripe e manter os novos e-mails OFF. Não alterar assinaturas existentes para testes. A aprovação final é para essas migrações e publicação; cadastros de preços/credenciais já estão autorizados e concluídos.

## Configuração preparada em 17/09 — oferta ainda desligada

As autorizações específicas posteriores permitiram criar os dois preços Stripe LIVE e configurar a aplicação real LoadPro Anual Pix 2987567593319086, vendedor375473814. Os preços estão vinculados às duas variáveis anuais de Production. O webhook Orders real foi salvo no endereço previsto, somente evento Order (Mercado Pago). O titular renovou a chave; a comparação integral antes/depois confirmou a substituição e o vínculo com aplicação/vendedor. Somente a chave nova e a assinatura do webhook foram guardadas como Secret em Production no servidor RumoAoPro. Nenhum segredo consta nos arquivos.

Total preparado na Vercel: 10 Config e 2 Secret exclusivos Production, incluindo LOADPRO_ANNUAL_ENABLED=false. Nenhum Redeploy, migração de produção, merge, cobrança real ou campanha foi realizado. A integração antiga e as assinaturas existentes foram preservadas. Cadastro de configuração não comprova transação LIVE nem entrega ao endpoint ainda não publicado. Renovação e transferência de credenciais estão concluídas; não repetir essa etapa. Restam a conferência final das branches, preflight de produção somente leitura, migrações revisadas e autorização da publicação coordenada. Os novos lembretes permanecem desligados.

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
2. Revisar as migrações aditivas no banco LoadPro: loadpro-annual-billing.sql, loadpro-annual-reminders.sql e, para preparar a entrega opcional, loadpro-reminder-delivery.sql. A migração anual agora inclui termos v2, nova confirmação e prova de interrupção mensal; cotações v1 não confirmadas exigem nova revisão. Conferir projeto e permissões; nenhuma deve ser aplicada ao banco de checkout por engano. Nunca reaplicar o instalador de banco vazio usado no sandbox. Manter dados, limites e RLS existentes.
3. Preços anuais LIVE já criados com autorização explícita: price_1UGO63A6RupMT8QsIqFwXMxQ (BRL49900/year) e price_1UGO6bA6RupMT8QszaRjXI3g (BRL69900/year), zero assinaturas no momento do cadastro. Não criar duplicatas nem editar os mensais. Guardar STRIPE_LOADPRO_ANNUAL_PRICE_ID e STRIPE_LOADPRO_FOUNDERS_50_ANNUAL_PRICE_ID exclusivamente no servidor, após aprovação de produção. IDs TEST do preview são inválidos para vendas reais.
4. Revisar configuração LIVE do Mercado Pago Orders separada do legado mensal: vendedor/aplicação da empresa, segredo próprio, LOADPRO_ANNUAL_PIX_API=orders, LOADPRO_ANNUAL_MP_ORDERS_LIVE=true, TEST_APPROVAL=false e PIX_SANDBOX=false. Não copiar IDs ou chaves do vendedor fictício. Validar vínculo e assinatura do webhook /api/loadpro/billing/annual/orders/webhook.
5. Conferir webhooks Stripe de faturas/assinaturas e destino HTTPS real; manter reconciliação assinada e portal seguro. Nenhum teste deve criar cobrança real ou modificar um cliente existente.
6. Publicar backend com novas escolhas desabilitadas até migração/configuração verificadas; coordenar ativação LOADPRO_ANNUAL_ENABLED e publicação do app/vitrine. A vitrine agora usa a mesma flag: quando desabilitada/ausente, não renderiza os preços, links ou textos anuais, preservando os mensais em PT/EN. Recompilar ao alterar a flag, pois a vitrine é estática. Não anunciar a oferta enquanto as APIs estiverem indisponíveis. Validar navegação e leituras, sem transações reais de teste.

## Lembretes

A Stripe continua sendo o único canal ativo de aviso de fim de teste. OWNER=stripe e STRIPE_TRIAL_REMINDER_DISABLED=false são os padrões seguros; nenhuma configuração Stripe/Resend foi alterada. O texto com alternativa anual, a preferência autenticada (opt-in por padrão falso) e a reserva única por usuário/fim de teste estão preparados. A reserva consulta o contrato atual no provedor, exige consentimento e uma consulta recente de supressão, confere versões no banco e impede repetição. Retirar o consentimento invalida rascunhos reservados.

O adaptador Resend de descadastro/supressão, a entrega com tentativa única, a reconciliação somente por leitura e a revalidação imediatamente antes do envio estão implementados e testados. Não há rota, cron ou campanha novos. Preview nunca envia. A migração aditiva foi aplicada somente no sandbox e suas permissões foram conferidas. Ainda faltam conferir permissões/respostas reais do serviço, revisar o executor e aprovar um canal único. Recomendação: publicar primeiro o anual mantendo o aviso Stripe e a oferta por e-mail desligada. Não desligar o aviso Stripe sem um substituto de cobrança verificado também para quem não aceita ofertas. Ver docs/loadpro-trial-reminder-delivery.md.

## Verificações e limites

Preparação de publicação em 16/09: quatro novos testes de renderização passaram, cobrindo a oferta ligada/desligada em PT/EN; build e TypeScript aprovados. A vitrine desligada também foi conferida localmente em desktop e celular. Esses testes somam-se aos 121 testes backend já validados abaixo.

121 testes backend e 19 testes app passaram (120 na rodada completa e 23 afetados após a última correção, incluindo um novo caso); TypeScript/build, sintaxe e QA aprovados. SQL executado em PostgreSQL isolado com chamadas dos provedores interceptadas. Cobertura inclui pagamento Pix pendente/recusado/aprovado, retentativas, fatura mensal paga/aberta/rascunho, aprovação atrasada, anulação concorrente com pagamento e fatura ainda não visível. Diálogo PT/EN e vitrine PT/EN conferidos em desktop 1440px e celular 390px, sem overflow. Funções v2 aplicadas somente no sandbox, com RLS e execução exclusiva de serviço verificadas.

**Pix v2 validado com provedores hospedados TEST em 16/09.** A quarta conta fictícia pagou uma nova mensal de R$69,90 e confirmou Pix anual de R$699. Aprovação verificada às 18:08:18Z precedeu a interrupção mensal na Stripe às 18:08:21Z. Mercado Pago entregou order.processed com HTTP200 e live_mode=false. O acesso preservou o mês até 16/10/2026 e acrescentou um ano até 16/10/2027; sem próxima mensalidade. Repetição manteve o mesmo pagamento e validade. Não houve cobrança real. Os pagamentos e cancelamentos já validados no sandbox estão registrados em loadpro-annual-billing.md. A primeira fatura anual recusada e o cancelamento durante mês pago têm testes automatizados; a recusa hospedada foi de renovação e o cancelamento antes da primeira anual foi durante teste. PDF final nativo e janela privada não estão disponíveis nesta ferramenta e não são declarados aprovados.

## Interrupção segura da oferta

Se surgir falha, bloquear novas escolhas anuais com LOADPRO_ANNUAL_ENABLED=false e retirar a oferta da vitrine em uma alteração revisada. Manter webhooks, reconciliação, acesso já comprado e cancelamento funcionando. Não apagar migrações, operações, faturas ou assinaturas; não voltar automaticamente clientes para mensal. Reverter todo o backend antigo depois de vendas anuais pode interromper a confirmação de pagamentos e exige análise própria.

A reconciliação usa os comportamentos documentados em [controle automático de faturas Stripe](https://docs.stripe.com/api/invoices/update), [anulação de fatura](https://docs.stripe.com/api/invoices/void) e [cancelamento de assinatura](https://docs.stripe.com/billing/subscriptions/cancel). A rodada não alterou produção, credenciais ou assinaturas de clientes. A pausa do destino TEST antigo e a exceção temporária do preview foram restauradas após os testes autorizados.

Recontratação após cancelamento: a escolha anual antiga não é transferida à nova assinatura. Operações antigas de cartão são encerradas apenas com prova de cancelamento do contrato anterior, mantendo histórico e índice de exclusão de trocas simultâneas. Contrato ativo, identidade/cliente/ambiente divergentes ou a mesma assinatura permanecem bloqueados. Backend funcional 3b3ba23, 103/103 testes e build aprovados, preview Ready. PRs ainda rascunho, sem autorização de produção. A validação hospedada também confirmou o retorno ao LoadPro após uma compra mensal e o resumo anual em 390px/PT/escuro e 1440px/EN/claro, mantendo clube/equipe/atleta.
## Auditoria de configuração em 16/09 — somente leitura

Vercel, projeto rumoaopro-site: filtros Production nas abas Project e Shared não retornaram variáveis ANNUAL. Os preços anuais e integração Orders observados estão restritos a Preview da branch anual. RESEND_API_KEY, EMAIL_FROM e EMAIL_PROVIDER já existem nos ambientes Production e Preview; valores permaneceram mascarados. Isso confirma que ainda falta configurar e conferir os parâmetros LIVE; não comprova permissões da chave nem que os preços LIVE já existam no provedor. Nenhuma variável, proteção ou aviso foi alterado nesta rodada.
