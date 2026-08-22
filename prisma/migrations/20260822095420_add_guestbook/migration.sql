-- CreateTable
CREATE TABLE "guestbook_entries" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "guest_identifier" VARCHAR(64) NOT NULL,
    "guest_name" VARCHAR(80) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guestbook_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "guestbook_entries_event_id_created_at_idx" ON "guestbook_entries"("event_id", "created_at");

-- CreateIndex
CREATE INDEX "guestbook_entries_event_id_guest_identifier_created_at_idx" ON "guestbook_entries"("event_id", "guest_identifier", "created_at");

-- AddForeignKey
ALTER TABLE "guestbook_entries" ADD CONSTRAINT "guestbook_entries_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
