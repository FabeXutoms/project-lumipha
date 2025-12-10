-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "previous_otp_code" TEXT,
ADD COLUMN     "previous_otp_expires_at" TIMESTAMP(3);
