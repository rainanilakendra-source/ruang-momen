import { hashPassword } from "../app/lib/password.ts";
import { ROLES } from "../app/lib/roles.ts";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export async function seedSuperAdmin(client) {
  const emailValue = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!emailValue && !password) {
    console.log("Super admin seed skipped: SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are not set.");
    return;
  }

  const email = emailValue?.trim().toLowerCase();
  if (!email || !password) throw new Error("SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must both be set.");
  if (!EMAIL_PATTERN.test(email) || email.length > 254) throw new Error("SUPER_ADMIN_EMAIL is invalid.");
  if (Array.from(password).length < 10 || Array.from(password).length > 128) throw new Error("SUPER_ADMIN_PASSWORD must contain 10 to 128 characters.");

  const existing = await client.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rowCount) {
    await client.query("UPDATE users SET role = $2, updated_at = CURRENT_TIMESTAMP WHERE email = $1", [email, ROLES.SUPER_ADMIN]);
    return;
  }

  const passwordHash = await hashPassword(password);
  await client.query(
    `INSERT INTO users (id, name, email, password_hash, role, updated_at)
     VALUES ($1, 'Super Admin', $2, $3, $4, CURRENT_TIMESTAMP)`,
    [`super_admin_${Date.now()}`, email, passwordHash, ROLES.SUPER_ADMIN],
  );
}
