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
const managedPlans = [
  ["BASIC", "basic", 49000, 50, 500, 1024, 30],
  ["STANDARD", "standard", 99000, 300, 5000, 10240, 30],
  ["PREMIUM", "premium", 199000, 1000, 20000, 51200, 30],
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
       ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = CURRENT_TIMESTAMP`,
      [`feature_${key}`, name, key, description],
    );
  }
  for (const [code, name, maxPhotos, maxStorageBytes, maxActiveDays, tier] of plans) {
    const planId = `plan_${code.toLowerCase()}`;
    const slug = code.toLowerCase().replaceAll("_", "-");
    await client.query(
      `INSERT INTO plans (id, code, name, slug, is_active, updated_at)
       VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, is_active = true, updated_at = CURRENT_TIMESTAMP`,
      [planId, code, name, slug],
    );
    const { rows: [{ id }] } = await client.query("SELECT id FROM plans WHERE code = $1", [code]);
    for (const [key] of features) {
      const assigned = key === "guest_upload" || tier === "premium" || (tier === "standard" && standardFeatures.has(key));
      if (assigned) await client.query(
        `INSERT INTO plan_features (id, plan_id, feature_id) SELECT $1, $2, id FROM features WHERE key = $3 ON CONFLICT (plan_id, feature_id) DO NOTHING`,
        [`plan_feature_${code.toLowerCase()}_${key}`, id, key],
      );
    }
    await client.query(
      `INSERT INTO plan_limits (id, plan_id, max_photos, max_storage_bytes, max_active_days)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (plan_id) DO UPDATE SET max_photos = EXCLUDED.max_photos, max_storage_bytes = EXCLUDED.max_storage_bytes, max_active_days = EXCLUDED.max_active_days`,
      [`limit_${code.toLowerCase()}`, id, maxPhotos, maxStorageBytes.toString(), maxActiveDays],
    );
  }
  for (const [code, slug, price, maxGuests, maxPhotos, storageLimitMb, durationDays] of managedPlans) {
    await client.query(
      `UPDATE plans SET slug = $2, price = $3, max_guests = $4, max_photos = $5, storage_limit_mb = $6, duration_days = $7, is_active = true, updated_at = CURRENT_TIMESTAMP WHERE code = $1`,
      [code, slug, price, maxGuests, maxPhotos, storageLimitMb, durationDays],
    );
    await client.query(
      `UPDATE plan_limits SET max_photos = $2, max_storage_bytes = $3, max_active_days = $4 WHERE plan_id = (SELECT id FROM plans WHERE code = $1)`,
      [code, maxPhotos, (BigInt(storageLimitMb) * BigInt(1024 * 1024)).toString(), durationDays],
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
