-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."event_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "include_in_stats" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bands" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "public_notes" TEXT,
    "private_notes" TEXT,
    "slug" TEXT,
    "display_name" TEXT,
    "is_hunter_band" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "bands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."band_musicians" (
    "id" SERIAL NOT NULL,
    "band_id" INTEGER NOT NULL,
    "musician_id" INTEGER NOT NULL,
    "joined_date" TIMESTAMP(3),
    "left_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "public_notes" TEXT,
    "private_notes" TEXT,

    CONSTRAINT "band_musicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."venues" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "state_province" TEXT,
    "country" TEXT,
    "is_uncertain" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "public_notes" TEXT,
    "context" TEXT,
    "private_notes" TEXT,
    "slug" TEXT,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."musicians" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_uncertain" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "private_notes" TEXT,
    "public_notes" TEXT,
    "slug" TEXT,

    CONSTRAINT "musicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."instruments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" SERIAL NOT NULL,
    "year" INTEGER,
    "month" INTEGER,
    "day" INTEGER,
    "display_date" TEXT,
    "date_uncertain" BOOLEAN NOT NULL DEFAULT false,
    "venue_id" INTEGER,
    "venue_uncertain" BOOLEAN NOT NULL DEFAULT false,
    "event_type_id" INTEGER,
    "content_type_id" INTEGER,
    "primary_band_id" INTEGER,
    "hunter_participation_uncertain" BOOLEAN NOT NULL DEFAULT false,
    "billing" TEXT,
    "public_notes" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_uncertain" BOOLEAN NOT NULL DEFAULT false,
    "show_timing" TEXT,
    "raw_data" TEXT,
    "private_notes" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "raw_data_gdsets" TEXT,
    "etree_show_id" TEXT,
    "slug" TEXT,
    "sort_date" TIMESTAMP(3),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_musicians" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "musician_id" INTEGER NOT NULL,
    "instrument_id" INTEGER,
    "public_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "private_notes" TEXT,

    CONSTRAINT "event_musicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."set_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "include_in_stats" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "set_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sets" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "set_type_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "public_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_uncertain" BOOLEAN NOT NULL DEFAULT false,
    "private_notes" TEXT,
    "band_id" INTEGER,

    CONSTRAINT "sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."set_musicians" (
    "id" SERIAL NOT NULL,
    "set_id" INTEGER NOT NULL,
    "musician_id" INTEGER NOT NULL,
    "instrument_id" INTEGER,
    "public_notes" TEXT,
    "private_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "set_musicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."albums" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "release_year" INTEGER,
    "is_official" BOOLEAN NOT NULL DEFAULT true,
    "public_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "private_notes" TEXT,
    "slug" TEXT,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."songs" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "original_artist" TEXT,
    "lyrics_by" TEXT,
    "music_by" TEXT,
    "is_uncertain" BOOLEAN NOT NULL DEFAULT false,
    "public_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "in_box_of_rain" BOOLEAN NOT NULL DEFAULT false,
    "alternate_title" TEXT,
    "private_notes" TEXT,
    "slug" TEXT,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."song_albums" (
    "id" SERIAL NOT NULL,
    "song_id" INTEGER NOT NULL,
    "album_id" INTEGER NOT NULL,
    "track_number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "song_albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."song_tags" (
    "id" SERIAL NOT NULL,
    "song_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "song_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performances" (
    "id" SERIAL NOT NULL,
    "set_id" INTEGER NOT NULL,
    "song_id" INTEGER NOT NULL,
    "performance_order" INTEGER NOT NULL,
    "segues_into" BOOLEAN NOT NULL DEFAULT false,
    "is_truncated_start" BOOLEAN NOT NULL DEFAULT false,
    "is_truncated_end" BOOLEAN NOT NULL DEFAULT false,
    "has_cuts" BOOLEAN NOT NULL DEFAULT false,
    "is_partial" BOOLEAN NOT NULL DEFAULT false,
    "public_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_uncertain" BOOLEAN NOT NULL DEFAULT false,
    "lead_vocals_id" INTEGER,
    "is_lyrical_fragment" BOOLEAN NOT NULL DEFAULT false,
    "is_medley" BOOLEAN NOT NULL DEFAULT false,
    "is_musical_fragment" BOOLEAN NOT NULL DEFAULT false,
    "is_solo_hunter" BOOLEAN NOT NULL DEFAULT false,
    "private_notes" TEXT,

    CONSTRAINT "performances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_musicians" (
    "id" SERIAL NOT NULL,
    "performance_id" INTEGER NOT NULL,
    "musician_id" INTEGER NOT NULL,
    "instrument_id" INTEGER,
    "public_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "private_notes" TEXT,

    CONSTRAINT "performance_musicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contributors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "public_notes" TEXT,
    "private_notes" TEXT,
    "slug" TEXT,

    CONSTRAINT "contributors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."recordings" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "recording_type_id" INTEGER,
    "description" TEXT,
    "url" TEXT,
    "shn_id" TEXT,
    "taper" TEXT,
    "contributor_id" INTEGER,
    "length_minutes" INTEGER,
    "public_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "private_notes" TEXT,
    "lma_identifier" TEXT,
    "lossless_legs_id" TEXT,
    "youtube_video_id" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featured_text" TEXT,

    CONSTRAINT "recordings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."recording_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recording_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_contributors" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "contributor_id" INTEGER,
    "description" TEXT,
    "public_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "private_notes" TEXT,

    CONSTRAINT "event_contributors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."show_banter" (
    "id" SERIAL NOT NULL,
    "banter_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_before_song" BOOLEAN NOT NULL DEFAULT false,
    "is_verbatim" BOOLEAN NOT NULL DEFAULT false,
    "performance_id" INTEGER NOT NULL,
    "private_notes" TEXT,
    "public_notes" TEXT,

    CONSTRAINT "show_banter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."musician_default_instruments" (
    "id" SERIAL NOT NULL,
    "musician_id" INTEGER NOT NULL,
    "instrument_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "musician_default_instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."links" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "date_fetched" TIMESTAMP(3),
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_id" INTEGER,
    "song_id" INTEGER,
    "venue_id" INTEGER,
    "recording_id" INTEGER,
    "link_type_id" INTEGER,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."link_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "link_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bands_slug_key" ON "public"."bands"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "band_musicians_band_id_musician_id_key" ON "public"."band_musicians"("band_id", "musician_id");

-- CreateIndex
CREATE UNIQUE INDEX "venues_slug_key" ON "public"."venues"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "musicians_slug_key" ON "public"."musicians"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "public"."events"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "albums_slug_key" ON "public"."albums"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "public"."tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "songs_slug_key" ON "public"."songs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "song_tags_song_id_tag_id_key" ON "public"."song_tags"("song_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "contributors_slug_key" ON "public"."contributors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "musician_default_instruments_musician_id_instrument_id_key" ON "public"."musician_default_instruments"("musician_id", "instrument_id");

-- AddForeignKey
ALTER TABLE "public"."band_musicians" ADD CONSTRAINT "band_musicians_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "public"."bands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."band_musicians" ADD CONSTRAINT "band_musicians_musician_id_fkey" FOREIGN KEY ("musician_id") REFERENCES "public"."musicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_content_type_id_fkey" FOREIGN KEY ("content_type_id") REFERENCES "public"."content_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_event_type_id_fkey" FOREIGN KEY ("event_type_id") REFERENCES "public"."event_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_primary_band_id_fkey" FOREIGN KEY ("primary_band_id") REFERENCES "public"."bands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_musicians" ADD CONSTRAINT "event_musicians_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_musicians" ADD CONSTRAINT "event_musicians_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_musicians" ADD CONSTRAINT "event_musicians_musician_id_fkey" FOREIGN KEY ("musician_id") REFERENCES "public"."musicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sets" ADD CONSTRAINT "sets_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "public"."bands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sets" ADD CONSTRAINT "sets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sets" ADD CONSTRAINT "sets_set_type_id_fkey" FOREIGN KEY ("set_type_id") REFERENCES "public"."set_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."set_musicians" ADD CONSTRAINT "set_musicians_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."set_musicians" ADD CONSTRAINT "set_musicians_musician_id_fkey" FOREIGN KEY ("musician_id") REFERENCES "public"."musicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."set_musicians" ADD CONSTRAINT "set_musicians_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "public"."sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."song_albums" ADD CONSTRAINT "song_albums_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."song_albums" ADD CONSTRAINT "song_albums_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."song_tags" ADD CONSTRAINT "song_tags_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."song_tags" ADD CONSTRAINT "song_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performances" ADD CONSTRAINT "performances_lead_vocals_id_fkey" FOREIGN KEY ("lead_vocals_id") REFERENCES "public"."musicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performances" ADD CONSTRAINT "performances_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "public"."sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performances" ADD CONSTRAINT "performances_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_musicians" ADD CONSTRAINT "performance_musicians_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_musicians" ADD CONSTRAINT "performance_musicians_musician_id_fkey" FOREIGN KEY ("musician_id") REFERENCES "public"."musicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_musicians" ADD CONSTRAINT "performance_musicians_performance_id_fkey" FOREIGN KEY ("performance_id") REFERENCES "public"."performances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recordings" ADD CONSTRAINT "recordings_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "public"."contributors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recordings" ADD CONSTRAINT "recordings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recordings" ADD CONSTRAINT "recordings_recording_type_id_fkey" FOREIGN KEY ("recording_type_id") REFERENCES "public"."recording_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_contributors" ADD CONSTRAINT "event_contributors_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "public"."contributors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_contributors" ADD CONSTRAINT "event_contributors_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."show_banter" ADD CONSTRAINT "show_banter_performance_id_fkey" FOREIGN KEY ("performance_id") REFERENCES "public"."performances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."musician_default_instruments" ADD CONSTRAINT "musician_default_instruments_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."musician_default_instruments" ADD CONSTRAINT "musician_default_instruments_musician_id_fkey" FOREIGN KEY ("musician_id") REFERENCES "public"."musicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."links" ADD CONSTRAINT "links_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."links" ADD CONSTRAINT "links_link_type_id_fkey" FOREIGN KEY ("link_type_id") REFERENCES "public"."link_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."links" ADD CONSTRAINT "links_recording_id_fkey" FOREIGN KEY ("recording_id") REFERENCES "public"."recordings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."links" ADD CONSTRAINT "links_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."links" ADD CONSTRAINT "links_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

