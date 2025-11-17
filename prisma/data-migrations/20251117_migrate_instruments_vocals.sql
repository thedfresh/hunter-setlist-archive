

INSERT INTO event_musician_instruments (event_musician_id, instrument_id, created_at)
SELECT em.id, em.instrument_id, em.created_at
FROM event_musicians em
WHERE em.instrument_id IS NOT NULL;

INSERT INTO event_musician_instruments (event_musician_id, instrument_id, created_at)
SELECT em.id, i.id, em.created_at
FROM event_musicians em
CROSS JOIN instruments i
WHERE em.includes_vocals = true AND i.name = 'vocals'
ON CONFLICT DO NOTHING;

INSERT INTO set_musician_instruments (set_musician_id, instrument_id, created_at)
SELECT sm.id, sm.instrument_id, sm.created_at
FROM set_musicians sm
WHERE sm.instrument_id IS NOT NULL;

INSERT INTO set_musician_instruments (set_musician_id, instrument_id, created_at)
SELECT sm.id, i.id, sm.created_at
FROM set_musicians sm
CROSS JOIN instruments i
WHERE sm.includes_vocals = true AND i.name = 'vocals'
ON CONFLICT DO NOTHING;

INSERT INTO performance_musician_instruments (performance_musician_id, instrument_id, created_at)
SELECT pm.id, pm.instrument_id, pm.created_at
FROM performance_musicians pm
WHERE pm.instrument_id IS NOT NULL;

INSERT INTO performance_musician_instruments (performance_musician_id, instrument_id, created_at)
SELECT pm.id, i.id, pm.created_at
FROM performance_musicians pm
CROSS JOIN instruments i
WHERE pm.includes_vocals = true AND i.name = 'vocals'
ON CONFLICT DO NOTHING;

INSERT INTO performance_vocalists (performance_id, musician_id, vocal_role, created_at)
SELECT id, lead_vocals_id, 'lead', created_at
FROM performances
WHERE lead_vocals_id IS NOT NULL;

INSERT INTO song_vocalists (song_id, musician_id, vocal_role, created_at)
SELECT id, lead_vocals_id, 'default', created_at
FROM songs
WHERE lead_vocals_id IS NOT NULL;