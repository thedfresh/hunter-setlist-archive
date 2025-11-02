-- AlterTable
ALTER TABLE "public"."musicians" ADD COLUMN     "default_instrument_id" INTEGER;

-- AlterTable
ALTER TABLE "public"."performance_musicians" ADD COLUMN     "includes_vocals" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "public"."musicians" ADD CONSTRAINT "musicians_default_instrument_id_fkey" FOREIGN KEY ("default_instrument_id") REFERENCES "public"."instruments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
