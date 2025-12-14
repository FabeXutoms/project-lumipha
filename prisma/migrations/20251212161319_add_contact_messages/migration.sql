/*
  Warnings:

  - You are about to drop the column `amount_to_pay` on the `project_actions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "project_actions" DROP COLUMN "amount_to_pay";

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);
