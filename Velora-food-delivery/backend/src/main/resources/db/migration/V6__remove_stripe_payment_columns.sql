ALTER TABLE payments DROP COLUMN IF EXISTS stripe_session_id;
ALTER TABLE payments DROP COLUMN IF EXISTS stripe_payment_intent_id;
ALTER TABLE payments DROP COLUMN IF EXISTS stripe_customer_id;
