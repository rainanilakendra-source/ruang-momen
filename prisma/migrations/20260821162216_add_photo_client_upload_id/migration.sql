-- AlterTable
ALTER TABLE "photos" ADD COLUMN     "client_upload_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "photos_client_upload_id_key" ON "photos"("client_upload_id");
