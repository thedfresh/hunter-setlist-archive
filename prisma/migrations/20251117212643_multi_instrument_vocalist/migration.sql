-- AlterTable
ALTER TABLE "public"."performances" ADD COLUMN     "is_instrumental" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."songs" ADD COLUMN     "is_instrumental" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."band_musician_instruments" (
    "id" SERIAL NOT NULL,
    "band_musician_id" INTEGER NOT NULL,
    "instrument_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "band_musician_instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_musician_instruments" (
    "id" SERIAL NOT NULL,
    "event_musician_id" INTEGER NOT NULL,
    "instrument_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_musician_instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."set_musician_instruments" (
    "id" SERIAL NOT NULL,
    "set_musician_id" INTEGER NOT NULL,
    "instrument_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "set_musician_instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_musician_instruments" (
    "id" SERIAL NOT NULL,
    "performance_musician_id" INTEGER NOT NULL,
    "instrument_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_musician_instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_vocalists" (
    "id" SERIAL NOT NULL,
    "performance_id" INTEGER NOT NULL,
    "musician_id" INTEGER,
    "vocal_role" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_vocalists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."song_vocalists" (
    "id" SERIAL NOT NULL,
    "song_id" INTEGER NOT NULL,
    "musician_id" INTEGER,
    "vocal_role" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "song_vocalists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "band_musician_instruments_band_musician_id_instrument_id_key" ON "public"."band_musician_instruments"("band_musician_id", "instrument_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_musician_instruments_event_musician_id_instrument_id_key" ON "public"."event_musician_instruments"("event_musician_id", "instrument_id");

-- CreateIndex
CREATE UNIQUE INDEX "set_musician_instruments_set_musician_id_instrument_id_key" ON "public"."set_musician_instruments"("set_musician_id", "instrument_id");

-- CreateIndex
CREATE UNIQUE INDEX "performance_musician_instruments_performance_musician_id_in_key" ON "public"."performance_musician_instruments"("performance_musician_id", "instrument_id");

-- CreateIndex
CREATE UNIQUE INDEX "performance_vocalists_performance_id_musician_id_key" ON "public"."performance_vocalists"("performance_id", "musician_id");

-- CreateIndex
CREATE UNIQUE INDEX "song_vocalists_song_id_musician_id_key" ON "public"."song_vocalists"("song_id", "musician_id");

-- AddForeignKey
ALTER TABLE "public"."band_musician_instruments" ADD CONSTRAINT "band_musician_instruments_band_musician_id_fkey" FOREIGN KEY ("band_musician_id") REFERENCES "public"."band_musicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."band_musician_instruments" ADD CONSTRAINT "band_musician_instruments_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_musician_instruments" ADD CONSTRAINT "event_musician_instruments_event_musician_id_fkey" FOREIGN KEY ("event_musician_id") REFERENCES "public"."event_musicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_musician_instruments" ADD CONSTRAINT "event_musician_instruments_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."set_musician_instruments" ADD CONSTRAINT "set_musician_instruments_set_musician_id_fkey" FOREIGN KEY ("set_musician_id") REFERENCES "public"."set_musicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."set_musician_instruments" ADD CONSTRAINT "set_musician_instruments_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_musician_instruments" ADD CONSTRAINT "performance_musician_instruments_performance_musician_id_fkey" FOREIGN KEY ("performance_musician_id") REFERENCES "public"."performance_musicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_musician_instruments" ADD CONSTRAINT "performance_musician_instruments_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_vocalists" ADD CONSTRAINT "performance_vocalists_performance_id_fkey" FOREIGN KEY ("performance_id") REFERENCES "public"."performances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_vocalists" ADD CONSTRAINT "performance_vocalists_musician_id_fkey" FOREIGN KEY ("musician_id") REFERENCES "public"."musicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."song_vocalists" ADD CONSTRAINT "song_vocalists_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."song_vocalists" ADD CONSTRAINT "song_vocalists_musician_id_fkey" FOREIGN KEY ("musician_id") REFERENCES "public"."musicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;
