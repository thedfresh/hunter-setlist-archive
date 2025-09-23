-- Hunter Archive Database Reset Script
-- Drops all existing tables and creates v2.0 schema

-- Drop all existing tables (cascade to handle foreign keys)
DROP TABLE IF EXISTS performance_notes CASCADE;
DROP TABLE IF EXISTS performance_guests CASCADE;
DROP TABLE IF EXISTS set_guests CASCADE;
DROP TABLE IF EXISTS show_contributors CASCADE;
DROP TABLE IF EXISTS contributors CASCADE;
DROP TABLE IF EXISTS show_bands CASCADE;
DROP TABLE IF EXISTS show_artists CASCADE;
DROP TABLE IF EXISTS recordings CASCADE;
DROP TABLE IF EXISTS recording_types CASCADE;
DROP TABLE IF EXISTS performances CASCADE;
DROP TABLE IF EXISTS sets CASCADE;
DROP TABLE IF EXISTS set_types CASCADE;
DROP TABLE IF EXISTS shows CASCADE;
DROP TABLE IF EXISTS performance_types CASCADE;
DROP TABLE IF EXISTS content_types CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS artists CASCADE;
DROP TABLE IF EXISTS bands CASCADE;
DROP TABLE IF EXISTS venues CASCADE;

-- Drop v2.0 tables if they exist
DROP TABLE IF EXISTS show_dialog CASCADE;
DROP TABLE IF EXISTS note_links CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS event_contributors CASCADE;
DROP TABLE IF EXISTS recordings CASCADE;
DROP TABLE IF EXISTS recording_types CASCADE;
DROP TABLE IF EXISTS contributors CASCADE;
DROP TABLE IF EXISTS performance_musicians CASCADE;
DROP TABLE IF EXISTS event_musicians CASCADE;
DROP TABLE IF EXISTS performances CASCADE;
DROP TABLE IF EXISTS sets CASCADE;
DROP TABLE IF EXISTS set_types CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS event_types CASCADE;
DROP TABLE IF EXISTS content_types CASCADE;
DROP TABLE IF EXISTS song_tags CASCADE;
DROP TABLE IF EXISTS song_albums CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS albums CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS instruments CASCADE;
DROP TABLE IF EXISTS musicians CASCADE;
DROP TABLE IF EXISTS bands CASCADE;
DROP TABLE IF EXISTS venues CASCADE;

-- Create v2.0 Schema

-- Core Entity Tables

CREATE TABLE event_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    include_in_stats BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE content_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bands (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE venues (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT,
    state_province TEXT,
    country TEXT,
    is_uncertain BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE musicians (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    is_uncertain BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE instruments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Event Structure

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    year INTEGER,
    month INTEGER,
    day INTEGER,
    display_date TEXT,
    date_uncertain BOOLEAN DEFAULT FALSE,
    venue_id INTEGER REFERENCES venues(id),
    venue_uncertain BOOLEAN DEFAULT FALSE,
    event_type_id INTEGER REFERENCES event_types(id),
    content_type_id INTEGER REFERENCES content_types(id),
    primary_band_id INTEGER REFERENCES bands(id),
    hunter_participation_uncertain BOOLEAN DEFAULT FALSE,
    billing TEXT,
    is_spurious BOOLEAN DEFAULT FALSE,
    notes TEXT,
    include_in_stats BOOLEAN DEFAULT TRUE,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE event_musicians (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    musician_id INTEGER NOT NULL REFERENCES musicians(id),
    instrument_id INTEGER REFERENCES instruments(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Set and Performance Structure

CREATE TABLE set_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    include_in_stats BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sets (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    set_type_id INTEGER NOT NULL REFERENCES set_types(id),
    position INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Song and Album Structure

CREATE TABLE albums (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT,
    release_year INTEGER,
    is_official BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    original_artist TEXT,
    lyrics_by TEXT,
    music_by TEXT,
    lead_vocals_id INTEGER REFERENCES musicians(id),
    is_uncertain BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE song_albums (
    id SERIAL PRIMARY KEY,
    song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    album_id INTEGER NOT NULL REFERENCES albums(id),
    track_number INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE song_tags (
    id SERIAL PRIMARY KEY,
    song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(song_id, tag_id)
);

-- Performance Tracking

CREATE TABLE performances (
    id SERIAL PRIMARY KEY,
    set_id INTEGER NOT NULL REFERENCES sets(id) ON DELETE CASCADE,
    song_id INTEGER NOT NULL REFERENCES songs(id),
    performance_order INTEGER NOT NULL,
    segues_into BOOLEAN DEFAULT FALSE,
    is_truncated_start BOOLEAN DEFAULT FALSE,
    is_truncated_end BOOLEAN DEFAULT FALSE,
    has_cuts BOOLEAN DEFAULT FALSE,
    is_partial BOOLEAN DEFAULT FALSE,
    hunter_vocal BOOLEAN,
    hunter_guitar BOOLEAN,
    hunter_harmonica BOOLEAN,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE performance_musicians (
    id SERIAL PRIMARY KEY,
    performance_id INTEGER NOT NULL REFERENCES performances(id) ON DELETE CASCADE,
    musician_id INTEGER NOT NULL REFERENCES musicians(id),
    instrument_id INTEGER REFERENCES instruments(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Recording and Source Tracking

CREATE TABLE recording_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contributors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recordings (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    recording_type_id INTEGER REFERENCES recording_types(id),
    source_info TEXT,
    url TEXT,
    archive_identifier TEXT,
    shn_id TEXT,
    taper TEXT,
    contributor_id INTEGER REFERENCES contributors(id),
    length_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE event_contributors (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    contributor_id INTEGER REFERENCES contributors(id),
    description TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notes and Dialog System

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE note_links (
    id SERIAL PRIMARY KEY,
    note_id INTEGER NOT NULL REFERENCES notes(id),
    event_id INTEGER REFERENCES events(id),
    set_id INTEGER REFERENCES sets(id), 
    performance_id INTEGER REFERENCES performances(id),
    created_at TIMESTAMP DEFAULT NOW(),
    CHECK (
        (event_id IS NOT NULL)::int + 
        (set_id IS NOT NULL)::int + 
        (performance_id IS NOT NULL)::int = 1
    )
);

CREATE TABLE show_dialog (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    set_id INTEGER REFERENCES sets(id),
    after_song_order INTEGER,
    dialog_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert Reference Data

INSERT INTO event_types (name, include_in_stats) VALUES
    ('Public Show', true),
    ('Studio', false),
    ('Spurious', false);

INSERT INTO content_types (name) VALUES
    ('Musical'),
    ('Interview'),
    ('Poetry Reading');

INSERT INTO set_types (name, display_name, include_in_stats) VALUES
    ('Set 1', 'Set 1', true),
    ('Set 2', 'Set 2', true),
    ('Set 3', 'Set 3', true),
    ('Encore', 'Encore', true),
    ('Encore 1', 'Encore 1', true),
    ('Encore 2', 'Encore 2', true),
    ('Soundcheck', 'Soundcheck', false),
    ('Early Show', 'Early Show', true),
    ('Late Show', 'Late Show', true),
    ('Complete Set', 'Complete Set', true),
    ('Partial Set', 'Partial Set', true);

INSERT INTO bands (name) VALUES
    ('Dinosaurs'),
    ('Comfort'),
    ('Roadhog'),
    ('The Nazgul'),
    ('The Mystery Band');

INSERT INTO instruments (name, display_name) VALUES
    ('vocals', 'Vocals'),
    ('guitar', 'Guitar'),
    ('bass', 'Bass'),
    ('harmonica', 'Harmonica'),
    ('keyboards', 'Keyboards'),
    ('drums', 'Drums'),
    ('percussion', 'Percussion');

INSERT INTO recording_types (name, description) VALUES
    ('SBD', 'Soundboard recording'),
    ('Audience', 'Audience recording'),
    ('FM', 'FM radio broadcast'),
    ('Matrix', 'Matrix mix of soundboard and audience'),
    ('Video', 'Video recording');

INSERT INTO tags (name, description) VALUES
    ('dylan', 'Dylan-influenced or related songs'),
    ('garcia-hunter', 'Hunter-Garcia collaborations'),
    ('beatles', 'Beatles-influenced songs'),
    ('terrapin-suite', 'Part of Terrapin Suite'),
    ('eagle-mall-suite', 'Part of Eagle Mall Suite'),
    ('amagamalin-suite', 'Part of Amagamalin Suite');

-- Create Performance Indexes

CREATE INDEX idx_events_date ON events(year, month, day);
CREATE INDEX idx_events_venue ON events(venue_id);
CREATE INDEX idx_events_band ON events(primary_band_id);
CREATE INDEX idx_sets_event ON sets(event_id);
CREATE INDEX idx_sets_type ON sets(set_type_id);
CREATE INDEX idx_performances_set ON performances(set_id);
CREATE INDEX idx_performances_song ON performances(song_id);
CREATE INDEX idx_performances_order ON performances(performance_order);
CREATE INDEX idx_songs_title ON songs(title);
CREATE INDEX idx_songs_lead_vocals ON songs(lead_vocals_id);
CREATE INDEX idx_song_albums_song ON song_albums(song_id);
CREATE INDEX idx_song_albums_album ON song_albums(album_id);
CREATE INDEX idx_song_tags_song ON song_tags(song_id);
CREATE INDEX idx_song_tags_tag ON song_tags(tag_id);
CREATE INDEX idx_event_musicians_event ON event_musicians(event_id);
CREATE INDEX idx_performance_musicians_performance ON performance_musicians(performance_id);
CREATE INDEX idx_note_links_note ON note_links(note_id);
CREATE INDEX idx_note_links_event ON note_links(event_id);
CREATE INDEX idx_note_links_set ON note_links(set_id);
CREATE INDEX idx_note_links_performance ON note_links(performance_id);
CREATE INDEX idx_show_dialog_event ON show_dialog(event_id);
CREATE INDEX idx_show_dialog_set ON show_dialog(set_id);
CREATE INDEX idx_recordings_event ON recordings(event_id);
CREATE INDEX idx_recordings_type ON recordings(recording_type_id);
CREATE INDEX idx_recordings_contributor ON recordings(contributor_id);
CREATE INDEX idx_event_contributors_event ON event_contributors(event_id);
CREATE INDEX idx_event_contributors_contributor ON event_contributors(contributor_id);

-- Success message
SELECT 'Hunter Archive v2.0 schema created successfully!' as status;