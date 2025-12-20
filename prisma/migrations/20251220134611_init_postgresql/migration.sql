-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "otp_expires_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "previous_otp_expires_at" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "contact_messages" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "payment_date" SET DATA TYPE TIMESTAMPTZ;
