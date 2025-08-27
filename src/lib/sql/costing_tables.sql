
CREATE TABLE cost_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g., 'budgetRanges', 'activities', 'transportation', 'amenities'
    costs JSON NOT NULL, -- Store prices as a JSON object: e.g., {'Luxury Hotel': 10000, 'Boutique Villa': 8000}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY company_category_unique (company_id, category),
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

