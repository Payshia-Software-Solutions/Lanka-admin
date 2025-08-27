-- This table stores various cost settings for different companies.
-- Each company can have multiple cost types (e.g., 'activities', 'transportation').
-- The actual key-value prices are stored in a flexible JSON column.

CREATE TABLE cost_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    cost_type VARCHAR(50) NOT NULL COMMENT 'e.g., accommodation_budgets, activities, transportation, amenities',
    costs JSON NOT NULL COMMENT 'A JSON object storing key-value pairs for prices',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (company_id, cost_type),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Example Usage:
-- An INSERT for activity costs for company with ID 1 might look like:
-- INSERT INTO cost_settings (company_id, cost_type, costs)
-- VALUES (1, 'activities', '{"Whale Watching": 50, "Safari": 75}');

-- An INSERT for transportation costs for the same company:
-- INSERT INTO cost_settings (company_id, cost_type, costs)
-- VALUES (1, 'transportation', '{"Rental Car": 60, "Tuk-tuk": 10}');
