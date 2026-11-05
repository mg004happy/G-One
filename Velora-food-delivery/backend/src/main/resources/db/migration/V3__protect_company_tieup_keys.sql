-- Keep one tie-up row per restaurant/company even if historical records differ
-- only by letter case or surrounding whitespace.
DO $$
BEGIN
    IF to_regclass('public.restaurant_company_tieups') IS NOT NULL THEN
        DELETE FROM restaurant_company_tieups older
        USING restaurant_company_tieups newer
        WHERE older.ctid < newer.ctid
          AND older.restaurant_id = newer.restaurant_id
          AND LOWER(BTRIM(older.company_name)) = LOWER(BTRIM(newer.company_name));

        UPDATE restaurant_company_tieups SET company_name = BTRIM(company_name);

        IF to_regclass('public.restaurants') IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'fk_restaurant_company_tieups_restaurant'
              AND conrelid = 'public.restaurant_company_tieups'::regclass
        ) THEN
            ALTER TABLE restaurant_company_tieups
                ADD CONSTRAINT fk_restaurant_company_tieups_restaurant
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;
        END IF;

        CREATE UNIQUE INDEX IF NOT EXISTS uq_restaurant_tieup_company_ci
            ON restaurant_company_tieups (restaurant_id, LOWER(company_name));
    END IF;
END $$;
