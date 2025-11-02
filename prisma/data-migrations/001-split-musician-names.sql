-- Populate firstName/lastName from name field
UPDATE musicians
SET 
  first_name = CASE 
    WHEN name ~ '\s' THEN split_part(name, ' ', 1)
    ELSE NULL
  END,
  last_name = CASE
    WHEN name ~ '\s' THEN substring(name FROM position(' ' IN name) + 1)
    ELSE name
  END
WHERE first_name IS NULL AND last_name IS NULL;
