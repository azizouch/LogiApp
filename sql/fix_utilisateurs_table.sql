-- Step 1: Remove unnecessary fields from utilisateurs table
ALTER TABLE utilisateurs
DROP COLUMN IF EXISTS adresse,
DROP COLUMN IF EXISTS ville,
DROP COLUMN IF EXISTS code_postal,
DROP COLUMN IF EXISTS pays,
DROP COLUMN IF EXISTS notes,
DROP COLUMN IF EXISTS ancien_livreur_id;

-- Step 2: Import existing livreurs into the utilisateurs table
DO $$
DECLARE
  livreur_record RECORD;
  new_user_id UUID;
BEGIN
  -- Loop through all livreurs
  FOR livreur_record IN 
    SELECT id, nom, email, telephone, vehicule, zone, notes
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

-- Step 3: Add sample users if they don't exist
INSERT INTO utilisateurs (nom, prenom, email, telephone, role, mot_de_passe, statut)
VALUES 
  ('Dupont', 'Jean', 'jean.dupont@example.com', '+33 6 12 34 56 78', 'Admin', 'password123', 'Actif'),
  ('Martin', 'Marie', 'marie.martin@example.com', '+33 6 23 45 67 89', 'Gestionnaire', 'password123', 'Actif'),
  ('Laurent', 'Sophie', 'sophie.laurent@example.com', '+33 6 45 67 89 01', 'Gestionnaire', 'password123', 'Actif')
ON CONFLICT (email) DO NOTHING;
