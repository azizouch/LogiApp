-- STEP 1: Remove unnecessary fields from utilisateurs table
ALTER TABLE utilisateurs
DROP COLUMN IF EXISTS adresse,
DROP COLUMN IF EXISTS ville,
DROP COLUMN IF EXISTS code_postal,
DROP COLUMN IF EXISTS pays,
DROP COLUMN IF EXISTS notes,
DROP COLUMN IF EXISTS ancien_livreur_id;

-- STEP 2: Temporarily disable foreign key constraints
SET session_replication_role = replica;

-- STEP 3: Import existing livreurs into the utilisateurs table
DO $$
DECLARE
  livreur_record RECORD;
  new_user_id UUID;
BEGIN
  -- Loop through all livreurs
  FOR livreur_record IN 
    SELECT id, nom, email, telephone, vehicule, zone
    FROM livreurs
  LOOP
    -- Extract first name and last name from nom
    DECLARE
      nom_parts TEXT[];
      prenom TEXT;
      nom_famille TEXT;
    BEGIN
      -- Split the nom into parts
      nom_parts := string_to_array(livreur_record.nom, ' ');
      
      -- If there's only one part, use it as both first and last name
      IF array_length(nom_parts, 1) = 1 THEN
        prenom := nom_parts[1];
        nom_famille := nom_parts[1];
      ELSE
        -- First part is the first name, the rest is the last name
        prenom := nom_parts[1];
        nom_famille := array_to_string(nom_parts[2:array_length(nom_parts, 1)], ' ');
      END IF;
      
      -- Check if a user with this email already exists
      SELECT id INTO new_user_id
      FROM utilisateurs
      WHERE email = COALESCE(livreur_record.email, 'livreur_' || livreur_record.id || '@example.com');
      
      -- If user doesn't exist, create a new one
      IF new_user_id IS NULL THEN
        -- Insert the livreur as a user
        INSERT INTO utilisateurs (
          nom, 
          prenom, 
          email, 
          telephone, 
          role, 
          mot_de_passe, 
          statut,
          vehicule,
          zone
        )
        VALUES (
          nom_famille,
          prenom,
          COALESCE(livreur_record.email, 'livreur_' || livreur_record.id || '@example.com'),
          livreur_record.telephone,
          'Livreur',
          'password123',
          'Actif',
          livreur_record.vehicule,
          livreur_record.zone
        )
        RETURNING id INTO new_user_id;
      ELSE
        -- Update the existing user to ensure they have the Livreur role
        UPDATE utilisateurs
        SET role = 'Livreur',
            vehicule = COALESCE(utilisateurs.vehicule, livreur_record.vehicule),
            zone = COALESCE(utilisateurs.zone, livreur_record.zone)
        WHERE id = new_user_id;
      END IF;
      
      -- Update colis table to reference the new user
      UPDATE colis
      SET livreur_id = new_user_id::text
      WHERE livreur_id = livreur_record.id;
      
      -- Update bons table to reference the new user
      UPDATE bons
      SET livreur_id = new_user_id::text
      WHERE livreur_id = livreur_record.id;
      
      -- Update historique_colis table to reference the new user
      UPDATE historique_colis
      SET utilisateur = new_user_id::text
      WHERE utilisateur = livreur_record.id;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- STEP 4: Add sample users if they don't exist
INSERT INTO utilisateurs (nom, prenom, email, telephone, role, mot_de_passe, statut)
VALUES 
  ('Dupont', 'Jean', 'jean.dupont@example.com', '+33 6 12 34 56 78', 'Admin', 'password123', 'Actif'),
  ('Martin', 'Marie', 'marie.martin@example.com', '+33 6 23 45 67 89', 'Gestionnaire', 'password123', 'Actif'),
  ('Laurent', 'Sophie', 'sophie.laurent@example.com', '+33 6 45 67 89 01', 'Gestionnaire', 'password123', 'Actif')
ON CONFLICT (email) DO NOTHING;

-- STEP 5: Re-enable foreign key constraints
SET session_replication_role = DEFAULT;

-- STEP 6: Add CHECK constraints to ensure only livreurs can be assigned to deliveries
-- First, create a function to check if a user is a livreur
CREATE OR REPLACE FUNCTION is_livreur(user_id UUID) RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role FROM utilisateurs WHERE id = user_id;
  RETURN user_role = 'Livreur';
END;
$$ LANGUAGE plpgsql;

-- STEP 7: Modify the colis table to use UUID for livreur_id
-- First, add a new column
ALTER TABLE colis ADD COLUMN livreur_id_uuid UUID;

-- Update the new column with converted values
UPDATE colis SET livreur_id_uuid = livreur_id::UUID WHERE livreur_id IS NOT NULL;

-- STEP 7.1: Ensure all referenced users have the Livreur role
DO $$
DECLARE
  user_id UUID;
BEGIN
  FOR user_id IN 
    SELECT DISTINCT livreur_id_uuid 
    FROM colis 
    WHERE livreur_id_uuid IS NOT NULL
  LOOP
    UPDATE utilisateurs
    SET role = 'Livreur'
    WHERE id = user_id AND role != 'Livreur';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Drop the old column and rename the new one
ALTER TABLE colis DROP COLUMN livreur_id;
ALTER TABLE colis RENAME COLUMN livreur_id_uuid TO livreur_id;

-- Add foreign key constraint with check
ALTER TABLE colis 
ADD CONSTRAINT colis_livreur_id_fkey 
FOREIGN KEY (livreur_id) REFERENCES utilisateurs(id);

-- Add check constraint to ensure only livreurs can be assigned
ALTER TABLE colis 
ADD CONSTRAINT colis_livreur_role_check 
CHECK (livreur_id IS NULL OR is_livreur(livreur_id));

-- STEP 8: Modify the bons table to use UUID for livreur_id
-- First, add a new column
ALTER TABLE bons ADD COLUMN livreur_id_uuid UUID;

-- Update the new column with converted values
UPDATE bons SET livreur_id_uuid = livreur_id::UUID WHERE livreur_id IS NOT NULL;

-- STEP 8.1: Ensure all referenced users have the Livreur role
DO $$
DECLARE
  user_id UUID;
BEGIN
  FOR user_id IN 
    SELECT DISTINCT livreur_id_uuid 
    FROM bons 
    WHERE livreur_id_uuid IS NOT NULL
  LOOP
    UPDATE utilisateurs
    SET role = 'Livreur'
    WHERE id = user_id AND role != 'Livreur';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Drop the old column and rename the new one
ALTER TABLE bons DROP COLUMN livreur_id;
ALTER TABLE bons RENAME COLUMN livreur_id_uuid TO livreur_id;

-- Add foreign key constraint with check
ALTER TABLE bons 
ADD CONSTRAINT bons_livreur_id_fkey 
FOREIGN KEY (livreur_id) REFERENCES utilisateurs(id);

-- Add check constraint to ensure only livreurs can be assigned
ALTER TABLE bons 
ADD CONSTRAINT bons_livreur_role_check 
CHECK (livreur_id IS NULL OR is_livreur(livreur_id));

-- STEP 9: Modify the historique_colis table to use UUID for utilisateur
-- First, add a new column
ALTER TABLE historique_colis ADD COLUMN utilisateur_uuid UUID;

-- Update the new column with converted values
UPDATE historique_colis SET utilisateur_uuid = utilisateur::UUID WHERE utilisateur IS NOT NULL;

-- Drop the old column and rename the new one
ALTER TABLE historique_colis DROP COLUMN utilisateur;
ALTER TABLE historique_colis RENAME COLUMN utilisateur_uuid TO utilisateur;

-- Add foreign key constraint
ALTER TABLE historique_colis 
ADD CONSTRAINT historique_colis_utilisateur_fkey 
FOREIGN KEY (utilisateur) REFERENCES utilisateurs(id);

-- STEP 10: Drop the livreurs table (OPTIONAL - uncomment if you want to drop the table)
-- DROP TABLE IF EXISTS livreurs;

-- STEP 11: Output success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'The livreurs table has been kept for reference. Uncomment the DROP TABLE statement in Step 10 if you want to remove it.';
END;
$$ LANGUAGE plpgsql;
