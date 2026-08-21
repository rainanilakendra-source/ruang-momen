CREATE TABLE "plans" ("id" TEXT NOT NULL, "code" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "is_active" BOOLEAN NOT NULL DEFAULT true, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL, CONSTRAINT "plans_pkey" PRIMARY KEY ("id"));
CREATE TABLE "plan_features" ("id" TEXT NOT NULL, "plan_id" TEXT NOT NULL, "key" TEXT NOT NULL, "enabled" BOOLEAN NOT NULL DEFAULT false, CONSTRAINT "plan_features_pkey" PRIMARY KEY ("id"));
CREATE TABLE "plan_limits" ("id" TEXT NOT NULL, "plan_id" TEXT NOT NULL, "max_photos" INTEGER NOT NULL, "max_storage_bytes" BIGINT NOT NULL, "max_active_days" INTEGER NOT NULL, CONSTRAINT "plan_limits_pkey" PRIMARY KEY ("id"));

-- Create BASIC before safely backfilling every existing event.
INSERT INTO "plans" ("id", "code", "name", "description", "is_active", "updated_at") VALUES ('plan_basic', 'BASIC', 'Basic', 'Default Ruang Momen plan', true, CURRENT_TIMESTAMP);
ALTER TABLE "events" ADD COLUMN "plan_id" TEXT;
UPDATE "events" SET "plan_id" = 'plan_basic' WHERE "plan_id" IS NULL;
ALTER TABLE "events" ALTER COLUMN "plan_id" SET NOT NULL;

CREATE UNIQUE INDEX "plans_code_key" ON "plans"("code");
CREATE UNIQUE INDEX "plan_features_plan_id_key_key" ON "plan_features"("plan_id", "key");
CREATE UNIQUE INDEX "plan_limits_plan_id_key" ON "plan_limits"("plan_id");
CREATE INDEX "events_plan_id_idx" ON "events"("plan_id");
ALTER TABLE "events" ADD CONSTRAINT "events_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "plan_limits" ADD CONSTRAINT "plan_limits_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
