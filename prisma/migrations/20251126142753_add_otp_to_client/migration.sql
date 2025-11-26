-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "otp_code" TEXT,
ADD COLUMN     "otp_expires_at" TIMESTAMP(3);
