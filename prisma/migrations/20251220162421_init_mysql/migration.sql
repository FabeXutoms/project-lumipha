-- CreateTable
CREATE TABLE `clients` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `otp_code` VARCHAR(10) NULL,
    `otp_expires_at` DATETIME(0) NULL,
    `previous_otp_code` VARCHAR(10) NULL,
    `previous_otp_expires_at` DATETIME(0) NULL,
    `phone` VARCHAR(50) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `clients_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_actions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NOT NULL,
    `tracking_code` VARCHAR(20) NOT NULL,
    `package_name` VARCHAR(255) NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('Onay Bekliyor', 'Beklemede', 'Devam Ediyor', 'Tamamlandı', 'Iptal Edildi') NOT NULL DEFAULT 'Beklemede',
    `start_date` DATE NOT NULL,
    `estimated_end_date` DATE NULL,
    `company_name` TEXT NULL,
    `business_type` TEXT NULL,
    `business_scale` TEXT NULL,
    `project_link` TEXT NULL,

    UNIQUE INDEX `project_actions_tracking_code_key`(`tracking_code`),
    INDEX `project_actions_client_id_idx`(`client_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_action_id` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `payment_method` VARCHAR(100) NULL,
    `transaction_id` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `payments_transaction_id_key`(`transaction_id`),
    INDEX `payments_project_action_id_idx`(`project_action_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `message` TEXT NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_read` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `project_actions` ADD CONSTRAINT `project_actions_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_project_action_id_fkey` FOREIGN KEY (`project_action_id`) REFERENCES `project_actions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
