-- CreateTable
CREATE TABLE "data_migrations" (
    "id" SERIAL NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "applied_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "data_migrations_filename_key" ON "data_migrations"("filename");

-- AlterTable
ALTER TABLE "event_musicians" ADD COLUMN "includes_vocals" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "set_musicians" ADD COLUMN "includes_vocals" BOOLEAN NOT NULL DEFAULT false;