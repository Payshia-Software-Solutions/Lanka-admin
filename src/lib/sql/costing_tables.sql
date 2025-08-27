-- Drop existing tables if they exist to avoid conflicts.
DROP TABLE IF EXISTS accommodation_budget_costs;
DROP TABLE IF EXISTS activity_costs;
DROP TABLE IF EXISTS transportation_costs;
DROP TABLE IF EXISTS amenity_costs;
DROP TABLE IF EXISTS cost_settings;

-- A single table to hold all types of cost settings for a company.
-- The 'costs' column will store a JSON object mapping item names to their price.
-- e.g., for activities: {"Whale Watching": 5000, "Safari": 7500}
-- e.g., for budget ranges: {"Less than LKR 3000": 2500, "LKR 3000-5000": 4500}
CREATE TABLE cost_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    cost_type VARCHAR(50) NOT NULL COMMENT 'e.g., budgetRanges, activities, transportation, amenities',
    costs JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (company_id, cost_type),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Example of how you might insert data for a specific company (e.g., company_id = 1)
-- You would run these from your backend API when the admin saves the costing form.
/*
INSERT INTO cost_settings (company_id, cost_type, costs)
VALUES
(1, 'budgetRanges', '{
    "Less than LKR 3000": 2000,
    "LKR 3000-5000": 4000,
    "LKR 5000-8000": 6500,
    "LKR 8000-10,000": 9000,
    "LKR 10,000 to Above": 12000
}'),
(1, 'activities', '{
    "Whale Watching": 7500,
    "Surfing Lesson": 2500
}'),
(1, 'transportation', '{
    "Rental Car": 6000,
    "Rental Van": 8000
}'),
(1, 'amenities', '{
    "Free WiFi": 0,
    "Pool": 1000,
    "Breakfast": 1500
}')
ON DUPLICATE KEY UPDATE costs = VALUES(costs);
*/
