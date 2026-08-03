# LoadPro Stripe launch checklist

Use the production endpoint:

`https://rumoaopro.com/api/webhooks/stripe`

## Required webhook events

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `invoice.paid`
- `invoice.payment_failed`
- `invoice.payment_action_required`
- `invoice.finalization_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

The webhook route verifies the Stripe signature and processes events idempotently.
The LoadPro billing record is the source of truth for access, trial dates, renewal,
payment failures, and scheduled cancellation.

## Customer Portal

Enable the Stripe Customer Portal in production with:

- Payment-method updates enabled.
- Subscription cancellation enabled.
- Cancellation scheduled for the end of the current billing period.
- A return URL under `https://loadpro.rumoaopro.com.br/`.

## Release smoke tests

1. Start a seven-day trial with a test customer and confirm that LoadPro shows
   `Day 1 of 7`, the next charge date, BRL price, and plan limits.
2. Open the Customer Portal from LoadPro and return to Account & Security.
3. Schedule cancellation and confirm LoadPro shows access through the period end.
4. Send a Stripe `invoice.payment_failed` test event and confirm access becomes
   payment-pending after the billing status sync runs.
5. Send `invoice.paid` and confirm active access is restored.
6. Send `customer.subscription.deleted` and confirm access is no longer active
   after the paid period ends.
7. Confirm existing lifetime coaches remain unchanged.
