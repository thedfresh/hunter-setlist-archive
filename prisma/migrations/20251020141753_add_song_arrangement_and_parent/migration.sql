-- AlterTable
ALTER TABLE "public"."songs" ADD COLUMN     "arrangement" TEXT,
ADD COLUMN     "parent_song_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."songs" ADD CONSTRAINT "songs_parent_song_id_fkey" FOREIGN KEY ("parent_song_id") REFERENCES "public"."songs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
