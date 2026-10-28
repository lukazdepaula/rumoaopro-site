# Segurança de compra e acesso — candidato de 28/10/2026

Este trabalho continua a revisão de 24/10, somente na cópia de testes. Não aplicar
migrações, ativar flags, publicar ou enviar e-mails aos clientes a partir deste documento.
O pacote integra o candidato anterior com `origin/main` (`ee38929`), preservando a
home, o catálogo, as páginas In-Season e o checkout internacional Power Pro.

## Resultado local

- `pnpm check`: passou.
- `pnpm build`: passou, Next 15.5.28, 40 páginas geradas.
- Suíte completa: 248 testes passaram, zero falhas ou testes ignorados.
- `pnpm audit --json`: zero avisos conhecidos na consulta de 28/10.
- Fluxo HTTP de MFA em servidor localhost e banco descartável: senha sozinha
  bloqueada, ativação, rejeição de TOTP repetido, dez códigos de recuperação,
  rejeição de reutilização, limite de tentativas, sessão após refresh e origem
  externa bloqueada. Nenhuma conta ou credencial real foi usada.
- Revisão do diff: nenhum ajuste na assessoria, home ou catálogo em relação ao
  main integrado; não houve alteração visual neste patch.
- Sem publicação, migração remota, cobrança, e-mail real ou mudança de conta.

Os resultados locais não substituem a homologação hospedada listada abaixo.

## Correções preparadas

- Next 15.5.28 e sharp 0.35.5, reaproveitando o patch de dependências de 24/10.
- Pagamento, reprocessamento, acesso direto e revogação usam a mesma exclusão por
  pedido quando `STRIPE_RETRY_SAFE_FULFILLMENT_ENABLED=true`. A propriedade é
  persistida no banco e reconferida antes de liberar acesso ou gerar links.
- Uma liberação atrasada não pode substituir a revogação no Raptor: a nova RPC
  mantém registro terminal por pedido, inclusive quando a criação da conta ainda
  não terminou. Uma nova compra usa outro pedido e continua podendo dar acesso.
- O banco do checkout recusa reabertura de programa encerrado e exige pedido pago
  correspondente para criar ou reativar um acesso local.
- Reembolso total Stripe (`charge.refunded`) revoga o acesso; parcial o preserva.
  A integração deve estar inscrita nesse evento antes da ativação.
- Mercado Pago passa a confirmar a conclusão persistida após o processamento,
  quando a flag está ligada. Falha/concorrência gera tentativa posterior; eventos
  históricos já registrados não são reexecutados automaticamente.
- E-mail vencido recebe `raptorpro_welcome_email_status=manual_review` e não cria
  convite nem envia novamente. O payload original permanece criptografado para
  manter a decisão conservadora. Logs não incluem respostas privadas dos provedores.

## Recuperação de e-mail fora da janela

O limite de 15 minutos permanece. Não apagar linhas de `checkout_retry_email`, não
alterar datas para reabrir a janela e não marcar `sent_at` sem prova de aceitação.

1. Abrir o pedido com a sessão administrativa e MFA. Conferir pagamento atual no
   provedor, ausência de reembolso/cancelamento e identidade do comprador pelo
   e-mail registrado. Não trocar o destinatário com base apenas em uma mensagem.
2. Conferir no Resend o destinatário, horário e resultado da tentativa. Se houve
   aceitação, não reenviar o convite. Falha de entrega, resposta perdida ou estado
   desconhecido continuam exigindo atendimento; um HTTP 200 isolado não comprova
   que o comprador leu o e-mail.
3. Confirmar no Raptor que a mesma conta tem o programa correto. Se faltar acesso,
   corrigir/reconciliar o provisionamento no ambiente autorizado antes de afirmar
   ao comprador que está liberado. Não criar uma nova compra ou cobrar novamente.
4. Com o acesso confirmado, orientar o comprador pelo canal de atendimento já
   autorizado a entrar pelo endereço público do aplicativo e usar **Esqueci minha
   senha** com seu e-mail da compra, se necessário. O Raptor já oferece esse fluxo.
   Ele próprio solicita a recuperação. Não copiar tokens ou links de Auth para
   logs, relatórios ou mensagens administrativas.
5. Registrar o atendimento e a confirmação de acesso no histórico operacional,
   distinguindo recuperação de login de e-mail de boas-vindas enviado. O registro
   `manual_review` não é falsificado como `sent`; qualquer encerramento de evento
   histórico exige reconciliação explícita. Este pacote não automatiza atendimento.

## Ordem da validação hospedada e publicação

Ainda é necessária a homologação destas alterações novas em infraestrutura de QA.
Os testes locais usam SQLite/PostgreSQL em memória e provedores simulados.

1. Validar os projetos/contas de QA e manter o preview protegido. Nenhuma chave de
   produção deve ser copiada para esta cópia de trabalho.
2. No banco **Raptor QA**, aplicar `supabase/raptor-order-access-safety.sql` após a
   migração 012 do Raptor. Confirmar que a RPC original preserva o contrato usado
   pela nova função; executar como service role e negar anon/authenticated.
3. No banco **checkout QA**, reaplicar `supabase/checkout-retry-safety.sql` e aplicar
   `supabase/checkout-paid-order-safety.sql`. São bancos diferentes. As novas
   migrações não corrigem retroativamente acessos ou pagamentos históricos.
4. Publicar apenas o candidato no preview isolado já fixado no código, da branch
   `codex/site-security-dependencies-2026-09-29`, depois de revisão e autorização.
   A branch local nova não está autorizada pelo bloqueio de ambiente; não afrouxar
   esse bloqueio nem inventar outra URL para contorná-lo. Ativar a flag nesse preview.
   Confirmar a chave de criptografia sem mostrar o valor; manter escopo de pedido,
   produto, destinatário e provedor de teste explicitamente limitado.
5. Com registros fictícios: pagamento, falha e reprocessamento, reembolso total,
   reembolso parcial, cancelamento, eventos repetidos, duas compras do mesmo
   programa, acesso direto, janela de e-mail vencida e recuperação de login.
   Conferir estado final nos dois bancos, não apenas o HTTP do webhook.
6. Confirmar que os endpoints Stripe estão inscritos em `charge.refunded`.
   Revisar o diff contra o main atualizado e o resultado de CI do candidato.
7. Somente depois da aprovação específica de publicação, planejar ativação com
   janela de drenagem dos workers antigos. A RPC legada não é protegida pelo novo
   registro; não misturar workers antigos e novos durante a ativação.

## Reversão

Preservar o patch de dependências. Não apagar tabelas, histórico de tentativas,
e-mails criptografados ou revogações terminais. Não voltar a um fluxo que ignore as
revogações registradas. Se houver falha, manter a liberação automática bloqueada e
reconciliar os pedidos afetados antes de retomar. Desligar a flag não é, por si só,
uma reversão segura depois da ativação; ela restaura caminhos legados.

Este escopo é o site e a integração de compra/acesso ao Raptor. Não constitui uma
nova auditoria integral do LoadPro, dos dados de treinadores ou da infraestrutura.
