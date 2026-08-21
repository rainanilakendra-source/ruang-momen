-- AlterTable
ALTER TABLE "events" ADD COLUMN     "cover_storage_key" TEXT,
ADD COLUMN     "guest_gallery_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "guest_upload_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "upload_ends_at" TIMESTAMP(3),
ADD COLUMN     "upload_starts_at" TIMESTAMP(3);
