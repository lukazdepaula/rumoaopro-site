# Club 150 private pilot

Companion app branch: `loadpro-rpe/codex/club-150-private-pilot`.

- Generic private product `loadpro_club_150`: 1 existing club, 5 teams, 150 active players total.
- Catalogue entry is inactive: accepted for provider reconciliation but excluded from public checkout and active products. Annual conversion remains unsupported.
- BRL 129.90 is an internal reference only. Reconciliation must receive the actual monthly price from the verified Stripe subscription; the private pilot uses BRL 99.90. Missing price/currency/interval, unbound club or a different subscription ID fails closed.
- Update the existing subscription item, not the order's original historical amount. Preserve trial, billing anchor and `order_id`; set subscription `metadata.plan_code=loadpro_club_150`. No new checkout or trial, immediate charge or proration.
- Access and failed-payment communications identify the current package. Existing order history remains unchanged.
- Preserve the pilot guarantee metadata on reconciliation; use a recurring price rather than an expiring coupon that silently increases the charge.

## Deployment prerequisite

Run reviewed app migration `supabase-loadpro-club-150.sql` first. It adds nullable `total_player_limit` to both billing tables. Then deploy backend and app before migrating a live subscription. Verify portal configuration permits only payment-method management/cancellation for the pilot.

## Verification

`node --test scripts/tests/loadpro-*.test.mjs`: 130 passed.
`node node_modules/typescript/bin/tsc --noEmit`: passed.
`node node_modules/next/dist/bin/next build`: passed with Next 15.5.21 (Google Fonts network required).

The bundled pnpm wrapper uses a different major version and attempts dependency reinstallation; direct package entrypoints above execute the same check/build scripts without changing the committed lockfile. PGlite 0.3.15 was resolved from an existing local installation for test execution.

No customer identifiers, credentials, private operational SQL or production records belong in this document or the PR.
