

-- STEP 2: Drop foreign key constraints that reference the livreurs table
ALTER TABLE colis DROP CONSTRAINT IF EXISTS colis_livreur_id_fkey;
ALTER TABLE bons DROP CONSTRAINT IF EXISTS bons_livreur_id_fkey;

-- STEP 3: Update colis and bons tables to use NULL for livreur_id
-- This removes the references to the livreurs table
UPDATE colis SET livreur_id = NULL;
UPDATE bons SET livreur_id = NULL;

-- STEP 4: Add UUID columns to colis and bons tables
ALTER TABLE colis ADD COLUMN utilisateur_id UUID REFERENCES utilisateurs(id);
ALTER TABLE bons ADD COLUMN utilisateur_id UUID REFERENCES utilisateurs(id);

-- STEP 5: Drop the livreurs table
DROP TABLE IF EXISTS livreurs;

-- STEP 6: Output success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'The livreurs table has been dropped and utilisateur_id columns have been added to colis and bons tables.';
END;
$$ LANGUAGE plpgsql;
