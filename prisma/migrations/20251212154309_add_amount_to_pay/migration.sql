/*
  Warnings:

  - The values [Sipariş Alındı] on the enum `project_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "project_status_new" AS ENUM ('Onay Bekliyor', 'Beklemede', 'Devam Ediyor', 'Tamamlandı', 'İptal Edildi');
ALTER TABLE "public"."project_actions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "project_actions" ALTER COLUMN "status" TYPE "project_status_new" USING ("status"::text::"project_status_new");
ALTER TYPE "project_status" RENAME TO "project_status_old";
ALTER TYPE "project_status_new" RENAME TO "project_status";
DROP TYPE "public"."project_status_old";
ALTER TABLE "project_actions" ALTER COLUMN "status" SET DEFAULT 'Beklemede';
COMMIT;

-- AlterTable
ALTER TABLE "project_actions" ADD COLUMN     "amount_to_pay" DECIMAL(10,2);
