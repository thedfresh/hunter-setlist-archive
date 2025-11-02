-- Populate musician default instruments based on most frequent usage
WITH musician_instruments AS (
  SELECT 
    musician_id,
    instrument_id,
    COUNT(*) as usage_count
  FROM performance_musicians
  WHERE instrument_id IS NOT NULL
  GROUP BY musician_id, instrument_id
  
  UNION ALL
  
  SELECT 
    musician_id,
    instrument_id,
    COUNT(*) as usage_count
  FROM event_musicians
  WHERE instrument_id IS NOT NULL
  GROUP BY musician_id, instrument_id
),
aggregated AS (
  SELECT 
    musician_id,
    instrument_id,
    SUM(usage_count) as total_count,
    ROW_NUMBER() OVER (PARTITION BY musician_id ORDER BY SUM(usage_count) DESC) as rank
  FROM musician_instruments
  GROUP BY musician_id, instrument_id
)
UPDATE musicians m
SET default_instrument_id = a.instrument_id
FROM aggregated a
WHERE m.id = a.musician_id 
  AND a.rank = 1
  AND m.default_instrument_id IS NULL;
