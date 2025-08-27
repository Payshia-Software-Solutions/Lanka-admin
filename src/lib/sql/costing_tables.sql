-- This SQL script creates a single table to hold all cost settings for a company.
-- Using JSON columns provides flexibility to store different types of costing data
-- without needing multiple tables.

-- Drop the table if it already exists to ensure a clean setup.
DROP TABLE IF EXISTS `cost_settings`;

-- Create the cost_settings table.
-- One row per company will hold all the costing configuration.
CREATE TABLE `cost_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL UNIQUE,
  `budget_range_costs` JSON,
  `amenity_costs` JSON,
  `activity_costs` JSON,
  `transportation_costs` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_company_id` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample INSERT statement (for testing purposes):
-- INSERT INTO `cost_settings` (company_id, budget_range_costs, amenity_costs)
-- VALUES
-- (1,
--  '{"Less than LKR 3000": 3000, "LKR 3000-5000": 5000}',
--  '{"Free WiFi": 0, "Pool": 500}');
