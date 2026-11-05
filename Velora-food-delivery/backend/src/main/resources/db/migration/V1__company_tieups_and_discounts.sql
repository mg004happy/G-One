-- Adds storage for customer employer affiliation, restaurant company tie-ups,
-- and the discount snapshot recorded on each order.
-- IF EXISTS / IF NOT EXISTS makes this safe for both existing installations
-- and fresh databases, where Hibernate creates the base entity tables later.

ALTER TABLE IF EXISTS users
    ADD COLUMN IF NOT EXISTS company_affiliated BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS affiliated_company VARCHAR(120),
    ADD COLUMN IF NOT EXISTS employee_id VARCHAR(80);

ALTER TABLE IF EXISTS orders
    ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS discount_company VARCHAR(120);

DO $$
BEGIN
    IF to_regclass('public.restaurants') IS NOT NULL THEN
        CREATE TABLE IF NOT EXISTS restaurant_company_tieups (
            restaurant_id BIGINT NOT NULL,
            company_name VARCHAR(120) NOT NULL,
            CONSTRAINT pk_restaurant_company_tieups
                PRIMARY KEY (restaurant_id, company_name),
            CONSTRAINT fk_restaurant_company_tieups_restaurant
                FOREIGN KEY (restaurant_id)
                REFERENCES restaurants (id)
                ON DELETE CASCADE
        );
    END IF;
END $$;
