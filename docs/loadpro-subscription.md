# LoadPro subscription launch

The LoadPro founding plan uses the central RumoAoPro checkout and order admin.
It is a monthly subscription for two teams and up to 25 active players per team.

## Safe deployment order

1. Review and run `supabase-loadpro-billing-access.sql` in the **LoadPro** Supabase project.
   The transaction is additive, preserves current data and records current coaches as
   unrestricted `legacy_lifetime` accounts.
2. In the RumoAoPro Vercel project, configure the server-only LoadPro bridge:
   `LOADPRO_SUPABASE_URL`, `LOADPRO_SUPABASE_SERVICE_ROLE_KEY` and
   `LOADPRO_APP_URL`.
3. Keep the LoadPro service-role key only in Vercel. Never expose it as a
   `NEXT_PUBLIC_` variable or add it to Git.
4. Configure payment provider credentials and webhook secrets in Vercel.
5. Register the production webhooks:
   - Stripe: `https://rumoaopro.com/api/webhooks/stripe`
   - Mercado Pago: `https://rumoaopro.com/api/webhooks/mercado-pago`
6. Deploy the RumoAoPro checkout and verify a test subscription before publishing
   the LoadPro sales CTA.

The live checkout performs a provisioning preflight before creating an order or
redirecting to a gateway. If the LoadPro migration or credentials are missing, it
returns a temporary-unavailable response and **does not charge the customer**.

## Stripe events

Subscribe the endpoint to at least:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Mercado Pago events

Enable payment and subscription/preapproval notifications. The handler reconciles
approved renewals, payment failures, pauses and cancellations.

## Provisioning and operations

- A successful first payment creates or updates `billing_access` by normalized
  coach email and sends a Supabase invitation. No password is handled by the
  checkout or sent to administrators.
- Existing LoadPro users are updated by email without creating a duplicate account.
- Current coaches marked as `legacy_lifetime` are never downgraded by a payment
  event.
- Orders and subscription status remain visible in `/admin/orders` on RumoAoPro.
- Internal order notifications continue to use `INTERNAL_SALES_EMAIL` (falling
  back to the configured admin/contact email).
- If provisioning fails after a confirmed payment, the paid order is preserved,
  delivery becomes `manual_required`, and the error is recorded in the order log.

## Required production checks

1. Complete one low-risk test subscription with a new email.
2. Confirm the order, CPF, WhatsApp and subscription ID in `/admin/orders`.
3. Confirm the coach receives an invitation and can create a password.
4. Confirm the first club receives the two-team and 25-player-per-team limits.
5. Confirm a legacy coach still has unrestricted lifetime access.
6. Simulate a failed renewal and cancellation in the provider test environment.
7. Confirm no credentials or service-role keys appear in browser source or logs.

