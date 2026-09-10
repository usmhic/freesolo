-- Removes the Stripe/billing schema created by the V1 baseline.
--
-- Billing was cut from the product after V1 had already been applied to real
-- databases. V1 itself must stay byte-for-byte as it was applied — Flyway
-- validates its checksum on every startup — so the removal lands here instead.
-- Databases created from V1 leave behind the billing schema plus Stripe
-- columns that no entity maps any more; several are NOT NULL, which would fail
-- every insert into fs_users and fs_bookings.
--
-- Every statement is idempotent, so re-running against an already-clean
-- database is a no-op.

ALTER TABLE IF EXISTS identity.fs_users
    DROP COLUMN IF EXISTS travel_credits,
    DROP COLUMN IF EXISTS stripe_customer_id;

ALTER TABLE IF EXISTS partners.fs_businesses
    DROP COLUMN IF EXISTS stripe_account_id;

-- Dropping stripe_payment_intent_id takes uq_bookings_stripe_payment_intent_id
-- with it.
ALTER TABLE IF EXISTS bookings.fs_bookings
    DROP COLUMN IF EXISTS amount_total,
    DROP COLUMN IF EXISTS amount_venue,
    DROP COLUMN IF EXISTS amount_host_credit,
    DROP COLUMN IF EXISTS amount_platform,
    DROP COLUMN IF EXISTS currency,
    DROP COLUMN IF EXISTS stripe_payment_intent_id,
    DROP COLUMN IF EXISTS stripe_charge_id,
    DROP COLUMN IF EXISTS stripe_paid_at;

DROP TABLE IF EXISTS billing.fs_payouts;
DROP TABLE IF EXISTS billing.fs_payment_methods;

DROP SCHEMA IF EXISTS billing CASCADE;
