import "dotenv/config";
import pg from "pg";
import { seedSuperAdmin } from "./seed-super-admin.mjs";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
const features = [
  ["guest_upload", "Guest Upload", "Allow guests to upload moments."],
  ["camera_mode", "Camera Mode", "Capture moments directly from the camera."],
  ["gallery", "Gallery", "Allow access to the guest gallery."],
  ["download_original", "Download Original", "Allow original-file downloads."],
  ["zip_export", "ZIP Export", "Export multiple moments as a ZIP archive."],
  ["watermark", "Watermark", "Apply a watermark to shared moments."],
  ["analytics", "Analytics", "Show event and gallery analytics."],
  ["custom_branding", "Custom Branding", "Customize the event branding."],
  ["reaction", "Reaction", "Allow guest reactions on shared moments."],
  ["guestbook", "Guestbook", "Allow guests to leave event messages."],
  ["advanced_qr", "Advanced QR", "Use advanced QR Studio tools."],
];
const standardFeatures = new Set(["guest_upload", "camera_mode", "gallery", "download_original", "reaction", "guestbook"]);
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
  const paymentMethodCount = await client.query("SELECT COUNT(*)::int AS count FROM payment_methods");
  if (paymentMethodCount.rows[0].count === 0) {
    await client.query(
      `INSERT INTO payment_methods (id, name, type, mode, active, updated_at) VALUES
       ('payment_method_bank_transfer', 'Transfer Bank', 'BANK_TRANSFER', 'STATIC', true, CURRENT_TIMESTAMP),
       ('payment_method_qris', 'QRIS', 'QRIS', 'STATIC', true, CURRENT_TIMESTAMP)`,
    );
  }
  for (const [key, name, description] of features) {
    await client.query(
      `INSERT INTO features (id, name, key, description, active, updated_at) VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO NOTHING`,
      [`feature_${key}`, name, key, description],
    );
  }
  for (const [code, name, maxPhotos, maxStorageBytes, maxActiveDays, tier] of plans) {
    const planId = `plan_${code.toLowerCase()}`;
    const slug = code.toLowerCase().replaceAll("_", "-");
    const insertedPlan = await client.query(
      `INSERT INTO plans (id, code, name, slug, is_active, updated_at)
       VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP)
       ON CONFLICT (code) DO NOTHING
       RETURNING id`,
      [planId, code, name, slug],
    );
    const { rows: [{ id }] } = await client.query("SELECT id FROM plans WHERE code = $1", [code]);
    if (insertedPlan.rowCount === 1) {
      for (const [key] of features) {
        const assigned = key === "guest_upload" || tier === "premium" || (tier === "standard" && standardFeatures.has(key));
        if (assigned) await client.query(
          `INSERT INTO plan_features (id, plan_id, feature_id) SELECT $1, $2, id FROM features WHERE key = $3 ON CONFLICT (plan_id, feature_id) DO NOTHING`,
          [`plan_feature_${code.toLowerCase()}_${key}`, id, key],
        );
      }
    }
    await client.query(
      `INSERT INTO plan_limits (id, plan_id, max_photos, max_storage_bytes, max_active_days)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (plan_id) DO NOTHING`,
      [`limit_${code.toLowerCase()}`, id, maxPhotos, maxStorageBytes.toString(), maxActiveDays],
    );
  }
  await seedSuperAdmin(client);
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
