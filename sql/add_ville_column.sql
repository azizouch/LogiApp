-- Add ville column to clients table
ALTER TABLE clients ADD COLUMN ville VARCHAR(100);

-- Update existing clients with a default city value
UPDATE clients SET ville = 'Casablanca' WHERE ville IS NULL;

-- You can also add an adresse column if it doesn't exist
-- Uncomment the following line if needed:
-- ALTER TABLE clients ADD COLUMN adresse VARCHAR(255);