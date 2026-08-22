-- CreateTable
CREATE TABLE "photo_reactions" (
    "id" TEXT NOT NULL,
    "photo_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "guest_identifier" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "photo_reactions_event_id_idx" ON "photo_reactions"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "photo_reactions_photo_id_guest_identifier_key" ON "photo_reactions"("photo_id", "guest_identifier");

-- AddForeignKey
ALTER TABLE "photo_reactions" ADD CONSTRAINT "photo_reactions_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_reactions" ADD CONSTRAINT "photo_reactions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
