-- AlterTable
ALTER TABLE "public"."performances" ADD COLUMN     "is_aborted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lyrical_variation" TEXT,
ADD COLUMN     "public_notes_expanded" TEXT;

-- AlterTable
ALTER TABLE "public"."songs" ADD COLUMN     "lead_vocals_id" INTEGER,
ADD COLUMN     "song_by" TEXT;

-- AddForeignKey
ALTER TABLE "public"."songs" ADD CONSTRAINT "songs_lead_vocals_id_fkey" FOREIGN KEY ("lead_vocals_id") REFERENCES "public"."musicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;
