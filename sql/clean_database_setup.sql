-- Create tables for LogiApp with simplified structure

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
  -- Address fields
  adresse TEXT,
  ville VARCHAR(100),
  -- Only essential livreur-specific fields
  vehicule VARCHAR(100),
  zone VARCHAR(100)
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR PRIMARY KEY,
  nom VARCHAR NOT NULL,
  telephone VARCHAR,
  email VARCHAR,
  adresse TEXT,
  entreprise VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

-- Entreprises table
CREATE TABLE IF NOT EXISTS entreprises (
  id VARCHAR PRIMARY KEY,
  nom VARCHAR NOT NULL,
  adresse TEXT,
  contact VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  email TEXT,
  telephone TEXT
);

-- Colis table - now references utilisateurs instead of livreurs
CREATE TABLE IF NOT EXISTS colis (
  id VARCHAR PRIMARY KEY,
  client_id VARCHAR REFERENCES clients(id),
  entreprise_id VARCHAR REFERENCES entreprises(id),
  livreur_id UUID REFERENCES utilisateurs(id), -- Changed to UUID referencing utilisateurs
  statut VARCHAR NOT NULL,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  date_mise_a_jour TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Bons de distribution table - now references utilisateurs instead of livreurs
CREATE TABLE IF NOT EXISTS bons (
  id VARCHAR PRIMARY KEY,
  livreur_id UUID REFERENCES utilisateurs(id), -- Changed to UUID referencing utilisateurs
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  nb_colis INTEGER DEFAULT 0,
  statut VARCHAR NOT NULL
);

-- Historique des colis - now references utilisateurs for the user field
CREATE TABLE IF NOT EXISTS historique_colis (
  id SERIAL PRIMARY KEY,
  colis_id VARCHAR REFERENCES colis(id),
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  statut VARCHAR NOT NULL,
  utilisateur UUID REFERENCES utilisateurs(id) -- Changed to UUID referencing utilisateurs
);

-- Insert sample data

-- Insert sample users including admin, gestionnaire, and livreur users
INSERT INTO utilisateurs (nom, prenom, email, telephone, role, mot_de_passe, statut, vehicule, zone)
VALUES
  ('Dupont', 'Jean', 'jean.dupont@example.com', '+33 6 12 34 56 78', 'Admin', 'password123', 'Actif', NULL, NULL),
  ('Martin', 'Marie', 'marie.martin@example.com', '+33 6 23 45 67 89', 'Gestionnaire', 'password123', 'Actif', NULL, NULL),
  ('Laurent', 'Sophie', 'sophie.laurent@example.com', '+33 6 45 67 89 01', 'Gestionnaire', 'password123', 'Actif', NULL, NULL),
  ('Lefebvre', 'Jean', 'jean.lefebvre@example.com', '06 11 22 33 44', 'Livreur', 'password123', 'Actif', 'Camionnette', 'Nord'),
  ('Dupont', 'Martin', 'martin.dupont@example.com', '07 22 33 44 55', 'Livreur', 'password123', 'Actif', 'Scooter', 'Centre'),
  ('Laurent', 'Sophie', 'sophie.laurent2@example.com', '06 33 44 55 66', 'Livreur', 'password123', 'Actif', 'Voiture', 'Sud'),
  ('Durand', 'Pierre', 'pierre.durand@example.com', '07 44 55 66 77', 'Livreur', 'password123', 'Actif', 'Camionnette', 'Est'),
  ('Leroy', 'Marie', 'marie.leroy@example.com', '06 55 66 77 88', 'Livreur', 'password123', 'Actif', 'Scooter', 'Ouest')
ON CONFLICT (email) DO NOTHING;

-- Store the UUIDs of the livreur users for later reference
DO $$
DECLARE
  livreur1_id UUID;
  livreur2_id UUID;
  livreur3_id UUID;
  livreur4_id UUID;
  livreur5_id UUID;
BEGIN
  SELECT id INTO livreur1_id FROM utilisateurs WHERE email = 'jean.lefebvre@example.com';
  SELECT id INTO livreur2_id FROM utilisateurs WHERE email = 'martin.dupont@example.com';
  SELECT id INTO livreur3_id FROM utilisateurs WHERE email = 'sophie.laurent2@example.com';
  SELECT id INTO livreur4_id FROM utilisateurs WHERE email = 'pierre.durand@example.com';
  SELECT id INTO livreur5_id FROM utilisateurs WHERE email = 'marie.leroy@example.com';

  -- Insert clients
  INSERT INTO clients (id, nom, telephone, email, adresse, entreprise)
  VALUES
    ('CLI-001', 'Marie Dubois', '06 12 34 56 78', 'marie.dubois@example.com', '15 Rue de Paris, 75001 Paris', 'Tech Solutions'),
    ('CLI-002', 'Thomas Martin', '07 23 45 67 89', 'thomas.martin@example.com', '8 Avenue Victor Hugo, 69002 Lyon', NULL),
    ('CLI-003', 'Sophie Laurent', '06 34 56 78 90', 'sophie.laurent@example.com', '22 Boulevard de la Liberté, 59800 Lille', 'Boutique Mode'),
    ('CLI-004', 'Pierre Moreau', '07 45 67 89 01', 'pierre.moreau@example.com', '5 Rue Nationale, 44000 Nantes', NULL),
    ('CLI-005', 'Julie Petit', '06 56 78 90 12', 'julie.petit@example.com', '17 Rue des Fleurs, 33000 Bordeaux', 'Café Central')
  ON CONFLICT (id) DO NOTHING;

  -- Insert entreprises
  INSERT INTO entreprises (id, nom, adresse, contact)
  VALUES
    ('ENT-001', 'Tech Solutions', '15 Rue de Paris, 75001 Paris', 'Marie Dubois'),
    ('ENT-002', 'Boutique Mode', '22 Boulevard de la Liberté, 59800 Lille', 'Sophie Laurent'),
    ('ENT-003', 'Café Central', '17 Rue des Fleurs, 33000 Bordeaux', 'Julie Petit'),
    ('ENT-004', 'Librairie Papier', '8 Avenue Victor Hugo, 69002 Lyon', 'Thomas Martin'),
    ('ENT-005', 'Électro Plus', '5 Rue Nationale, 44000 Nantes', 'Pierre Moreau')
  ON CONFLICT (id) DO NOTHING;

  -- Insert colis with references to the new utilisateurs table
  INSERT INTO colis (id, client_id, entreprise_id, livreur_id, statut, date_creation)
  VALUES
    ('COL-2025-0001', 'CLI-001', 'ENT-001', NULL, 'En attente', '2025-04-15'),
    ('COL-2025-0002', 'CLI-002', NULL, livreur1_id, 'Pris en charge', '2025-04-14'),
    ('COL-2025-0003', 'CLI-003', 'ENT-002', livreur2_id, 'En cours de livraison', '2025-04-14'),
    ('COL-2025-0004', 'CLI-004', NULL, livreur3_id, 'Livré', '2025-04-13'),
    ('COL-2025-0005', 'CLI-005', 'ENT-003', livreur1_id, 'Retourné', '2025-04-12')
  ON CONFLICT (id) DO NOTHING;

  -- Insert bons with references to the new utilisateurs table
  INSERT INTO bons (id, livreur_id, date_creation, nb_colis, statut)
  VALUES
    ('BD-2025-0001', livreur1_id, '2025-04-15', 5, 'En cours'),
    ('BD-2025-0002', livreur2_id, '2025-04-14', 8, 'En cours'),
    ('BD-2025-0003', livreur3_id, '2025-04-13', 3, 'Complété'),
    ('BD-2025-0004', livreur1_id, '2025-04-12', 6, 'Complété'),
    ('BD-2025-0005', livreur2_id, '2025-04-11', 4, 'Annulé')
  ON CONFLICT (id) DO NOTHING;

  -- Get the admin user ID for historique_colis
  DECLARE
    admin_id UUID;
  BEGIN
    SELECT id INTO admin_id FROM utilisateurs WHERE email = 'jean.dupont@example.com';

    -- Insert historique_colis with references to the new utilisateurs table
    INSERT INTO historique_colis (colis_id, date, statut, utilisateur)
    VALUES
      ('COL-2025-0003', '2025-04-14 09:15', 'En attente', admin_id),
      ('COL-2025-0003', '2025-04-15 10:30', 'Pris en charge', livreur1_id),
      ('COL-2025-0003', '2025-04-16 08:45', 'En cours de livraison', livreur2_id);
  END;
END;
$$ LANGUAGE plpgsql;
