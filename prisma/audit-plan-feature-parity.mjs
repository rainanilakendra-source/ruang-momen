import "dotenv/config";
import pg from "pg";

const pairs = [
  ["BASIC", "BASIC_PLUS"],
  ["STANDARD", "STANDARD_PLUS"],
  ["PREMIUM", "PREMIUM_PLUS"],
];

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

await client.connect();
try {
  const { rows } = await client.query(
    `SELECT p.code, p.price, p.max_guests, p.max_photos, p.storage_limit_mb, p.duration_days,
            pl.max_photos AS enforced_max_photos,
            pl.max_storage_bytes::text AS enforced_max_storage_bytes,
            pl.max_active_days AS enforced_max_active_days,
            COALESCE(array_agg(f.key ORDER BY f.key) FILTER (WHERE f.key IS NOT NULL), ARRAY[]::text[]) AS features
       FROM plans p
       LEFT JOIN plan_limits pl ON pl.plan_id = p.id
       LEFT JOIN plan_features pf ON pf.plan_id = p.id
       LEFT JOIN features f ON f.id = pf.feature_id AND f.active = true
      WHERE p.code = ANY($1::text[])
      GROUP BY p.id, p.code, pl.max_photos, pl.max_storage_bytes, pl.max_active_days`,
    [pairs.flat()],
  );

  const byCode = new Map(rows.map(({ code, features }) => [code, features]));
  console.log(`Plan configuration: ${JSON.stringify(rows.map(({ features: _features, ...plan }) => plan).sort((a, b) => a.code.localeCompare(b.code)))}`);
  let valid = true;
  for (const [base, plus] of pairs) {
    const baseFeatures = byCode.get(base);
    const plusFeatures = byCode.get(plus);
    const consistent = Boolean(baseFeatures && plusFeatures)
      && JSON.stringify(baseFeatures) === JSON.stringify(plusFeatures);
    valid &&= consistent;
    console.log(`${base} / ${plus}: ${consistent ? "PASS" : "FAIL"}`);
    if (!consistent) {
      console.log(`  ${base}: ${JSON.stringify(baseFeatures ?? "PLAN MISSING")}`);
      console.log(`  ${plus}: ${JSON.stringify(plusFeatures ?? "PLAN MISSING")}`);
    }
  }

  if (!valid) process.exitCode = 1;
} finally {
  await client.end();
}
