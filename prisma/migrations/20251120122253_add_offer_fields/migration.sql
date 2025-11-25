/*
  Warnings:

  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."notifications" DROP CONSTRAINT "notifications_project_action_id_fkey";

-- AlterTable
ALTER TABLE "project_actions" ADD COLUMN     "business_scale" TEXT,
ADD COLUMN     "business_type" TEXT,
ADD COLUMN     "company_name" TEXT;

-- DropTable
DROP TABLE "public"."notifications";
