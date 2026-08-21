import "dotenv/config";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
const featureKeys = ["guest_upload", "guest_gallery", "guest_download", "qr_source", "reaction", "custom_theme", "remove_branding", "zip_export", "analytics", "advanced_qr"];
const standardFeatures = new Set(["guest_upload", "guest_gallery", "guest_download", "qr_source", "reaction", "custom_theme"]);
const plans = [
  ["BASIC", "Basic", 300, 2147483648n, 3, "basic"],
  ["BASIC_PLUS", "Basic Plus", 750, 5368709120n, 7, "basic"],
  ["STANDARD", "Standard", 1500, 10737418240n, 14, "standard"],
  ["STANDARD_PLUS", "Standard Plus", 3000, 21474836480n, 30, "standard"],
  ["PREMIUM", "Premium", 6000, 53687091200n, 60, "premium"],
  ["PREMIUM_PLUS", "Premium Plus", 12000, 107374182400n, 90, "premium"],
];

await client.connect();
try {
  await client.query("BEGIN");
  for (const [code, name, maxPhotos, maxStorageBytes, maxActiveDays, tier] of plans) {
    const planId = `plan_${code.toLowerCase()}`;
    await client.query(
      `INSERT INTO plans (id, code, name, is_active, updated_at)
       VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, is_active = true, updated_at = CURRENT_TIMESTAMP`,
      [planId, code, name],
    );
    const { rows: [{ id }] } = await client.query("SELECT id FROM plans WHERE code = $1", [code]);
    for (const key of featureKeys) {
      const enabled = key === "guest_upload" || tier === "premium" || (tier === "standard" && standardFeatures.has(key));
      await client.query(
        `INSERT INTO plan_features (id, plan_id, key, enabled) VALUES ($1, $2, $3, $4)
         ON CONFLICT (plan_id, key) DO UPDATE SET enabled = EXCLUDED.enabled`,
        [`feature_${code.toLowerCase()}_${key}`, id, key, enabled],
      );
    }
    await client.query(
      `INSERT INTO plan_limits (id, plan_id, max_photos, max_storage_bytes, max_active_days)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (plan_id) DO UPDATE SET max_photos = EXCLUDED.max_photos, max_storage_bytes = EXCLUDED.max_storage_bytes, max_active_days = EXCLUDED.max_active_days`,
      [`limit_${code.toLowerCase()}`, id, maxPhotos, maxStorageBytes.toString(), maxActiveDays],
    );
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
