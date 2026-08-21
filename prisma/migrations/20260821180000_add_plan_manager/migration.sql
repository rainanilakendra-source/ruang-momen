ALTER TABLE "plans"
ADD COLUMN "duration_days" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "max_guests" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "max_photos" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "slug" TEXT,
ADD COLUMN "storage_limit_mb" INTEGER NOT NULL DEFAULT 0;

-- Existing Plan Engine rows receive stable, human-readable slugs.
UPDATE "plans"
SET "slug" = lower(replace("code", '_', '-'))
WHERE "slug" IS NULL;

ALTER TABLE "plans" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "plans_slug_key" ON "plans"("slug");
