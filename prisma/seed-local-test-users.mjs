import "dotenv/config";
import pg from "pg";
import { hashPassword, verifyPassword } from "../app/lib/password.ts";
import { ROLES } from "../app/lib/roles.ts";

if (process.env.NODE_ENV === "production") {
  throw new Error("Local test users cannot be seeded in production.");
}

const users = [
  {
    id: "local_test_super_admin",
    name: "SUPER_ADMIN",
    email: "admin@local.test",
    password: "admin",
    role: ROLES.SUPER_ADMIN,
  },
  {
    id: "local_test_admin",
    name: "ADMIN",
    email: "admin1@local.test",
    password: "admin1",
    role: ROLES.ADMIN,
  },
  {
    id: "local_test_user",
    name: "USER",
    email: "user@local.test",
    password: "user",
    role: ROLES.USER,
  },
];

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

await client.connect();
try {
  await client.query("BEGIN");

  for (const user of users) {
    const passwordHash = await hashPassword(user.password);
    await client.query(
      `INSERT INTO users (id, name, email, password_hash, role, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role,
         updated_at = CURRENT_TIMESTAMP`,
      [user.id, user.name, user.email, passwordHash, user.role],
    );
  }

  await client.query("COMMIT");
  const result = await client.query(
    `SELECT name, email, password_hash AS "passwordHash", role
     FROM users
     WHERE email = ANY($1::text[])`,
    [users.map(({ email }) => email)],
  );

  for (const expected of users) {
    const actual = result.rows.find(({ email }) => email === expected.email);
    if (
      !actual ||
      actual.name !== expected.name ||
      actual.role !== expected.role ||
      actual.passwordHash === expected.password ||
      !(await verifyPassword(expected.password, actual.passwordHash))
    ) {
      throw new Error(`Local test user verification failed for ${expected.email}.`);
    }
  }

  console.log(
    users.map(({ email, role }) => `${email}: ${role}`).join("\n"),
  );
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
