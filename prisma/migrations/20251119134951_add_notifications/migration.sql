-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "project_action_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_project_action_id_fkey" FOREIGN KEY ("project_action_id") REFERENCES "project_actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
