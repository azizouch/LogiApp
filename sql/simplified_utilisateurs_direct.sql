-- Create a simplified utilisateur table
CREATE TABLE IF NOT EXISTS utilisateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telephone VARCHAR(20),
  role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Gestionnaire', 'Livreur')),
  mot_de_passe VARCHAR(255) NOT NULL,
  statut VARCHAR(20) DEFAULT 'Actif' CHECK (statut IN ('Actif', 'Inactif')),
  derniere_connexion TIMESTAMP,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Only essential livreur-specific fields
  vehicule VARCHAR(100),
  zone VARCHAR(100)
);

-- Add sample users including admin, gestionnaire, and livreur users
INSERT INTO utilisateurs (nom, prenom, email, telephone, role, mot_de_passe, statut, vehicule, zone)
VALUES 
  ('Dupont', 'Jean', 'jean.dupont@example.com', '+33 6 12 34 56 78', 'Admin', 'password123', 'Actif', NULL, NULL),
  ('Martin', 'Marie', 'marie.martin@example.com', '+33 6 23 45 67 89', 'Gestionnaire', 'password123', 'Actif', NULL, NULL),
  ('Laurent', 'Sophie', 'sophie.laurent@example.com', '+33 6 45 67 89 01', 'Gestionnaire', 'password123', 'Actif', NULL, NULL),
  ('Durand', 'Pierre', 'pierre.durand@example.com', '+33 6 34 56 78 90', 'Livreur', 'password123', 'Actif', 'Camionnette', 'Nord'),
  ('Bernard', 'Thomas', 'thomas.bernard@example.com', '+33 6 56 78 90 12', 'Livreur', 'password123', 'Actif', 'Scooter', 'Centre')
ON CONFLICT (email) DO NOTHING;

-- Import existing livreurs into the utilisateurs table if the livreurs table exists
DO $$
DECLARE
  livreur_record RECORD;
BEGIN
  -- Check if the livreurs table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'livreurs') THEN
    -- Loop through all livreurs
    FOR livreur_record IN 
      SELECT id, nom, email, telephone, created_at
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
        
        -- Insert the livreur as a user if they don't already exist
        INSERT INTO utilisateurs (
          nom, 
          prenom, 
          email, 
          telephone, 
          role, 
          mot_de_passe, 
          statut,
          date_creation
        )
        VALUES (
          nom_famille,
          prenom,
          COALESCE(livreur_record.email, 'livreur_' || livreur_record.id || '@example.com'),
          livreur_record.telephone,
          'Livreur',
          'password123',
          'Actif',
          livreur_record.created_at
        )
        ON CONFLICT (email) DO NOTHING;
      END;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update colis table to reference utilisateurs instead of livreurs
DO $$
BEGIN
  -- Check if the colis table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'colis') THEN
    -- Check if the livreur_id column exists
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'colis' AND column_name = 'livreur_id') THEN
      -- Check if the livreur_id column references livreurs
      IF EXISTS (
        SELECT FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'colis' AND ccu.table_name = 'livreurs'
      ) THEN
        -- Drop the foreign key constraint
        EXECUTE (
          SELECT 'ALTER TABLE colis DROP CONSTRAINT ' || tc.constraint_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'colis' AND ccu.table_name = 'livreurs'
          LIMIT 1
        );
        
        -- Add a new foreign key constraint to utilisateurs
        ALTER TABLE colis
        ADD CONSTRAINT colis_livreur_id_fkey FOREIGN KEY (livreur_id) REFERENCES utilisateurs(id);
      END IF;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update bons_distribution table to reference utilisateurs instead of livreurs
DO $$
BEGIN
  -- Check if the bons_distribution table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bons_distribution') THEN
    -- Check if the livreur_id column exists
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bons_distribution' AND column_name = 'livreur_id') THEN
      -- Check if the livreur_id column references livreurs
      IF EXISTS (
        SELECT FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'bons_distribution' AND ccu.table_name = 'livreurs'
      ) THEN
        -- Drop the foreign key constraint
        EXECUTE (
          SELECT 'ALTER TABLE bons_distribution DROP CONSTRAINT ' || tc.constraint_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'bons_distribution' AND ccu.table_name = 'livreurs'
          LIMIT 1
        );
        
        -- Add a new foreign key constraint to utilisateurs
        ALTER TABLE bons_distribution
        ADD CONSTRAINT bons_distribution_livreur_id_fkey FOREIGN KEY (livreur_id) REFERENCES utilisateurs(id);
      END IF;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update bons_retour table to reference utilisateurs instead of livreurs
DO $$
BEGIN
  -- Check if the bons_retour table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bons_retour') THEN
    -- Check if the livreur_id column exists
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bons_retour' AND column_name = 'livreur_id') THEN
      -- Check if the livreur_id column references livreurs
      IF EXISTS (
        SELECT FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'bons_retour' AND ccu.table_name = 'livreurs'
      ) THEN
        -- Drop the foreign key constraint
        EXECUTE (
          SELECT 'ALTER TABLE bons_retour DROP CONSTRAINT ' || tc.constraint_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'bons_retour' AND ccu.table_name = 'livreurs'
          LIMIT 1
        );
        
        -- Add a new foreign key constraint to utilisateurs
        ALTER TABLE bons_retour
        ADD CONSTRAINT bons_retour_livreur_id_fkey FOREIGN KEY (livreur_id) REFERENCES utilisateurs(id);
      END IF;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;
