CREATE TABLE "features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "features_key_key" ON "features"("key");

-- Preserve enabled Plan Engine assignments and normalize equivalent legacy keys.
INSERT INTO "features" ("id", "name", "key", "active", "updated_at")
SELECT DISTINCT
  'feature_' || CASE "key" WHEN 'guest_gallery' THEN 'gallery' WHEN 'guest_download' THEN 'download_original' WHEN 'custom_theme' THEN 'custom_branding' ELSE "key" END,
  initcap(replace(CASE "key" WHEN 'guest_gallery' THEN 'gallery' WHEN 'guest_download' THEN 'download_original' WHEN 'custom_theme' THEN 'custom_branding' ELSE "key" END, '_', ' ')),
  CASE "key" WHEN 'guest_gallery' THEN 'gallery' WHEN 'guest_download' THEN 'download_original' WHEN 'custom_theme' THEN 'custom_branding' ELSE "key" END,
  true,
  CURRENT_TIMESTAMP
FROM "plan_features";

ALTER TABLE "plan_features" ADD COLUMN "feature_id" TEXT;
UPDATE "plan_features" SET "feature_id" = 'feature_' || CASE "key" WHEN 'guest_gallery' THEN 'gallery' WHEN 'guest_download' THEN 'download_original' WHEN 'custom_theme' THEN 'custom_branding' ELSE "key" END;
DELETE FROM "plan_features" WHERE "enabled" = false;
DROP INDEX "plan_features_plan_id_key_key";
ALTER TABLE "plan_features" DROP COLUMN "enabled", DROP COLUMN "key", ALTER COLUMN "feature_id" SET NOT NULL;

CREATE INDEX "plan_features_feature_id_idx" ON "plan_features"("feature_id");
CREATE UNIQUE INDEX "plan_features_plan_id_feature_id_key" ON "plan_features"("plan_id", "feature_id");
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;
