-- CreateEnum
CREATE TYPE "project_status" AS ENUM ('Beklemede', 'Devam Ediyor', 'Tamamlandı', 'İptal Edildi');

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_actions" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "tracking_code" VARCHAR(20) NOT NULL,
    "package_name" VARCHAR(255) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "status" "project_status" NOT NULL DEFAULT 'Beklemede',
    "start_date" DATE NOT NULL,
    "estimated_end_date" DATE,

    CONSTRAINT "project_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "project_action_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_method" VARCHAR(100),
    "transaction_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "project_actions_tracking_code_key" ON "project_actions"("tracking_code");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_id_key" ON "payments"("transaction_id");

-- AddForeignKey
ALTER TABLE "project_actions" ADD CONSTRAINT "project_actions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_project_action_id_fkey" FOREIGN KEY ("project_action_id") REFERENCES "project_actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
