ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(24);

-- Enforce uniqueness even when email casing/spacing or phone formatting differs.
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email_normalized
    ON users (LOWER(BTRIM(email)));

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_phone_normalized
    ON users (REGEXP_REPLACE(phone_number, '[^0-9]', '', 'g'))
    WHERE phone_number IS NOT NULL;
