-- Generate slugs for musicians that don't have one
-- Uses musicianFormatter logic: firstName lastName if available, otherwise name

UPDATE musicians
SET slug = LOWER(
    REGEXP_REPLACE(
        REGEXP_REPLACE(
            COALESCE(
                NULLIF(TRIM(first_name || ' ' || last_name), ''),
                name
            ),
            '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
    )
)
WHERE slug IS NULL OR slug = '';

-- Handle potential duplicates by appending the ID
UPDATE musicians m1
SET slug = m1.slug || '-' || m1.id
WHERE EXISTS (
    SELECT 1 FROM musicians m2
    WHERE m2.slug = m1.slug
    AND m2.id < m1.id
)
AND m1.slug NOT LIKE '%-' || m1.id;