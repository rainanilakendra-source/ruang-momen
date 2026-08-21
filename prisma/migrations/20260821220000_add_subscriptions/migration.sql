CREATE TABLE "subscriptions" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "plan_id" TEXT NOT NULL,
  "order_id" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "started_at" TIMESTAMP(3) NOT NULL,
  "expired_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subscriptions_order_id_key" ON "subscriptions"("order_id");
CREATE INDEX "subscriptions_user_id_status_expired_at_idx" ON "subscriptions"("user_id", "status", "expired_at");
CREATE INDEX "subscriptions_plan_id_idx" ON "subscriptions"("plan_id");

ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
