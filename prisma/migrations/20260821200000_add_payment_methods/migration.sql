CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "description" TEXT,
    "bank_name" TEXT,
    "account_name" TEXT,
    "account_number" TEXT,
    "qr_image_url" TEXT,
    "provider" TEXT,
    "instructions" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "payment_methods_active_idx" ON "payment_methods"("active");
