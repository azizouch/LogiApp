-- Add prix and frais columns to colis table
ALTER TABLE colis 
ADD COLUMN IF NOT EXISTS prix DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS frais DECIMAL(10, 2) DEFAULT 0;

-- Update existing records with default values
UPDATE colis SET prix = 0, frais = 0 WHERE prix IS NULL OR frais IS NULL;

-- Add comment to explain the columns
COMMENT ON COLUMN colis.prix IS 'Prix du colis (montant à payer par le client)';
COMMENT ON COLUMN colis.frais IS 'Frais de livraison';
