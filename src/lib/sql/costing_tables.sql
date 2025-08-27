-- This script creates tables to manage the costs for various trip components.
-- These costs are company-specific and will be used for trip plan estimations.

-- Table to store costs for different accommodation budget ranges.
CREATE TABLE IF NOT EXISTS accommodation_budget_costs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    budget_range VARCHAR(255) NOT NULL,
    cost_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY (company_id, budget_range)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table to store costs for specific activities.
-- This links to your existing 'activities' table.
CREATE TABLE IF NOT EXISTS activity_costs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    activity_id INT NOT NULL,
    cost_per_person DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    UNIQUE KEY (company_id, activity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table to store costs for different transportation types.
CREATE TABLE IF NOT EXISTS transportation_costs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    transport_type VARCHAR(255) NOT NULL,
    cost_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY (company_id, transport_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table to store costs for accommodation amenities.
CREATE TABLE IF NOT EXISTS amenity_costs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    amenity_name VARCHAR(255) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    cost_type ENUM('per_day', 'one_time') NOT NULL DEFAULT 'one_time',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY (company_id, amenity_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

