# LoadPro subscription launch

The LoadPro founding plans use the central RumoAoPro checkout and order admin:

- `loadpro_founders`: R$49.90/month, two teams, 30 active players per team.
- `loadpro_founders_50`: R$69.90/month, two teams, 50 active players per team.

Both keep a seven-day trial and lock the contracted founding price while active.
International USD plans cost US$9.90 and US$13.90 respectively (configurable catalog prices).

## Safe upgrades and duplicate prevention (September 2026)

- Apply `supabase/loadpro-checkout-reservations.sql` to the **LoadPro** database
  before deploying this release. RLS remains enabled and only service_role may
  reserve a checkout. No coach/player tables are modified.
- Live checkout checks the normalized email before creating an order or a Stripe
  session. An existing subscription or simultaneous checkout is blocked and the
  customer is directed to sign in. The reservation serializes concurrent requests
  and outlives the Stripe session (40 versus 35 minutes).
- Returning canceled subscribers may subscribe again, but receive no repeat trial.
- GET `/api/loadpro/billing/change-plan` provides an authenticated, read-only
  quote. POST confirms the quoted currency/amount and updates the **same** monthly
  subscription with no proration, no new trial and an unchanged billing date.
- BRL and USD are supported. Unknown currencies fail closed for manual support.
- Webhooks reconcile with Stripe's current subscription, including item-level
  period dates. A different subscription cannot overwrite the selected access;
  replacement is allowed only for a newer order after the previous one ended.
- Duplicate-subscription cancellation/payment-failure notices must not block or
  notify the owner of an unrelated active subscription. Ignored events are logged.

Run `node --test scripts/tests/loadpro-billing.test.mjs`, `pnpm check` and `pnpm build`.
Official API references: [subscription updates](https://docs.stripe.com/api/subscriptions/update),
[checkout sessions](https://docs.stripe.com/api/checkout/sessions/create).

### Repairing a pre-existing duplicate

Verify customer email, both subscriptions, currency, renewal date, successful
payments and the current billing_access binding. Never cancel a subscription on
the basis of its display name alone. With customer/operator authorization, retain
the original paid subscription, apply the upgrade without proration or a new
trial, reconcile billing_access to that subscription, and only then cancel the
duplicate trial without generating an invoice. Verify the original renewal amount,
the canceled duplicate, the access binding and unchanged player/history counts.
Do not move, recreate, delete or merge clubs/players as part of a billing repair.

## Safe deployment order

1. Review and run `supabase-loadpro-billing-access.sql` in the **LoadPro** Supabase project.
   The transaction is additive, preserves current data and records current coaches as
   unrestricted `legacy_lifetime` accounts.
2. In the RumoAoPro Vercel project, configure the server-only LoadPro bridge:
   `LOADPRO_SUPABASE_URL`, `LOADPRO_SUPABASE_SERVICE_ROLE_KEY` and
   `LOADPRO_APP_URL`.
   `LOADPRO_SUPABASE_SERVICE_ROLE_KEY` accepts the recommended Supabase
   `sb_secret_...` key as well as the legacy JWT-based `service_role` key.
3. Keep the LoadPro service-role key only in Vercel. Never expose it as a
   `NEXT_PUBLIC_` variable or add it to Git.
4. Create the two recurring Stripe products/prices and configure
   `STRIPE_LOADPRO_FOUNDERS_PRICE_ID` and
   `STRIPE_LOADPRO_FOUNDERS_50_PRICE_ID` in Vercel.
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
- The 31st player is blocked on Fundadores 30. The user must explicitly confirm
  Fundadores 50; adding a player never changes the price automatically.
- The authenticated plan-change endpoint updates the existing Stripe subscription
  with `proration_behavior=none`. During a trial it preserves the trial end; for an
  active subscription it releases the new limit now and applies R$69.90 at renewal.
- Internal order notifications continue to use `INTERNAL_SALES_EMAIL` (falling
  back to the configured admin/contact email).
- If provisioning fails after a confirmed payment, the paid order is preserved,
  delivery becomes `manual_required`, and the error is recorded in the order log.

## Required production checks

1. Complete one low-risk test subscription with a new email.
2. Confirm the order, CPF, WhatsApp and subscription ID in `/admin/orders`.
3. Confirm the coach receives an invitation and can create a password.
4. Confirm Fundadores 30 receives the two-team and 30-player-per-team limits.
5. Confirm Fundadores 50 receives the two-team and 50-player-per-team limits.
6. Confirm a legacy coach still has unrestricted lifetime access.
7. Simulate a failed renewal and cancellation in the provider test environment.
8. Confirm no credentials or service-role keys appear in browser source or logs.

## Safe Stripe sandbox renewal test

Use a Vercel Preview deployment and never replace the live Stripe keys or the
production webhook secret.

1. Set Preview-only `CHECKOUT_GATEWAY_MODE=sandbox`.
2. Set Preview-only `STRIPE_SECRET_KEY` to a Stripe sandbox/test secret key.
3. Register the Preview `/api/webhooks/stripe` URL as a Stripe sandbox event
   destination and set its signing secret as the Preview-only
   `STRIPE_WEBHOOK_SECRET`.
4. Do not add production LoadPro credentials to perform the test. Even if they
   are inherited by Preview, sandbox orders are explicitly blocked from
   provisioning, invitations, delivery emails and internal sale notices.
5. Complete checkout with a disposable test email and a Stripe test card. Use a
   simulation/test clock plus Stripe's failing renewal card to generate
   `invoice.payment_failed`.
6. Confirm the sandbox order moves to `past_due` in the order metadata and that
   no `billing_access` row, coach invitation or production delivery is created.

The webhook rejects mismatches between the Stripe key environment, the event
`livemode` flag and the order's checkout environment.
