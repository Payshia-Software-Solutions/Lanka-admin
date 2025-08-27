-- This script is for reference and to guide the database setup.
-- It assumes you have existing tables: `accommodation_types`, `activities`, and a way to define transport methods.

-- ---------------------------------
-- 1. Accommodation Costing Table
-- ---------------------------------
-- Stores the cost per night for different accommodation types.
-- This links to your existing `accommodation_types` table.

CREATE TABLE `accommodation_costs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `accommodation_type_id` INT NOT NULL,
  `cost_per_night` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'LKR',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`accommodation_type_id`) REFERENCES `accommodation_types`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Example Insert:
-- INSERT INTO `accommodation_costs` (accommodation_type_id, cost_per_night) VALUES (1, 8000.00);


-- -----------------------------
-- 2. Activity Costing Table
-- -----------------------------
-- Stores the cost per person for each activity.
-- This links to your existing `activities` table.

CREATE TABLE `activity_costs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `activity_id` INT NOT NULL,
  `cost_per_person` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'LKR',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Example Insert:
-- INSERT INTO `activity_costs` (activity_id, cost_per_person) VALUES (1, 2500.00);


-- ------------------------------------
-- 3. Transportation Costing Table
-- ------------------------------------
-- A more generic table to hold costs for different transport methods.
-- Since there isn't a dedicated transport_options table, this uses a unique name for each method.

CREATE TABLE `transportation_costs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `transport_method_name` VARCHAR(255) NOT NULL UNIQUE,
  `cost_per_day` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'LKR',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Example Insert:
-- INSERT INTO `transportation_costs` (company_id, transport_method_name, cost_per_day) VALUES (1, 'Rental Car', 6000.00);
-- INSERT INTO `transportation_costs` (company_id, transport_method_name, cost_per_day) VALUES (1, 'Rental Van', 9000.00);

