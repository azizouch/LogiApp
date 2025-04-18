-- Create tables for LogiApp

-- Clients table
CREATE TABLE clients (
  id VARCHAR PRIMARY KEY,
  nom VARCHAR NOT NULL,
  telephone VARCHAR,
  email VARCHAR,
  adresse TEXT,
  entreprise VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Entreprises table
CREATE TABLE entreprises (
  id VARCHAR PRIMARY KEY,
  nom VARCHAR NOT NULL,
  adresse TEXT,
  contact VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Livreurs table
CREATE TABLE livreurs (
  id VARCHAR PRIMARY KEY,
  nom VARCHAR NOT NULL,
  telephone VARCHAR,
  email VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Colis table
CREATE TABLE colis (
  id VARCHAR PRIMARY KEY,
  client_id VARCHAR REFERENCES clients(id),
  entreprise_id VARCHAR REFERENCES entreprises(id),
  livreur_id VARCHAR REFERENCES livreurs(id),
  statut VARCHAR NOT NULL,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  date_mise_a_jour TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bons de distribution table
CREATE TABLE bons (
  id VARCHAR PRIMARY KEY,
  livreur_id VARCHAR REFERENCES livreurs(id),
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  nb_colis INTEGER DEFAULT 0,
  statut VARCHAR NOT NULL
);

-- Historique des colis
CREATE TABLE historique_colis (
  id SERIAL PRIMARY KEY,
  colis_id VARCHAR REFERENCES colis(id),
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  statut VARCHAR NOT NULL,
  utilisateur VARCHAR
);

-- Insert sample data
INSERT INTO clients (id, nom, telephone, email, adresse, entreprise) VALUES
('CLI-001', 'Marie Dubois', '06 12 34 56 78', 'marie.dubois@example.com', '15 Rue de Paris, 75001 Paris', 'Tech Solutions'),
('CLI-002', 'Thomas Martin', '07 23 45 67 89', 'thomas.martin@example.com', '8 Avenue Victor Hugo, 69002 Lyon', NULL),
('CLI-003', 'Sophie Laurent', '06 34 56 78 90', 'sophie.laurent@example.com', '22 Boulevard de la Liberté, 59800 Lille', 'Boutique Mode'),
('CLI-004', 'Pierre Moreau', '07 45 67 89 01', 'pierre.moreau@example.com', '5 Rue Nationale, 44000 Nantes', NULL),
('CLI-005', 'Julie Petit', '06 56 78 90 12', 'julie.petit@example.com', '17 Rue des Fleurs, 33000 Bordeaux', 'Café Central');

INSERT INTO entreprises (id, nom, adresse, contact) VALUES
('ENT-001', 'Tech Solutions', '15 Rue de Paris, 75001 Paris', 'Marie Dubois'),
('ENT-002', 'Boutique Mode', '22 Boulevard de la Liberté, 59800 Lille', 'Sophie Laurent'),
('ENT-003', 'Café Central', '17 Rue des Fleurs, 33000 Bordeaux', 'Julie Petit'),
('ENT-004', 'Librairie Papier', '8 Avenue Victor Hugo, 69002 Lyon', 'Thomas Martin'),
('ENT-005', 'Électro Plus', '5 Rue Nationale, 44000 Nantes', 'Pierre Moreau');

INSERT INTO livreurs (id, nom, telephone, email) VALUES
('LIV-001', 'Jean Lefebvre', '06 11 22 33 44', 'jean.lefebvre@example.com'),
('LIV-002', 'Martin Dupont', '07 22 33 44 55', 'martin.dupont@example.com'),
('LIV-003', 'Sophie Laurent', '06 33 44 55 66', 'sophie.laurent@example.com'),
('LIV-004', 'Pierre Durand', '07 44 55 66 77', 'pierre.durand@example.com'),
('LIV-005', 'Marie Leroy', '06 55 66 77 88', 'marie.leroy@example.com');

INSERT INTO colis (id, client_id, entreprise_id, livreur_id, statut, date_creation) VALUES
('COL-2025-0001', 'CLI-001', 'ENT-001', NULL, 'En attente', '2025-04-15'),
('COL-2025-0002', 'CLI-002', NULL, 'LIV-001', 'Pris en charge', '2025-04-14'),
('COL-2025-0003', 'CLI-003', 'ENT-002', 'LIV-002', 'En cours de livraison', '2025-04-14'),
('COL-2025-0004', 'CLI-004', NULL, 'LIV-003', 'Livré', '2025-04-13'),
('COL-2025-0005', 'CLI-005', 'ENT-003', 'LIV-001', 'Retourné', '2025-04-12');

INSERT INTO bons (id, livreur_id, date_creation, nb_colis, statut) VALUES
('BD-2025-0001', 'LIV-001', '2025-04-15', 5, 'En cours'),
('BD-2025-0002', 'LIV-002', '2025-04-14', 8, 'En cours'),
('BD-2025-0003', 'LIV-003', '2025-04-13', 3, 'Complété'),
('BD-2025-0004', 'LIV-001', '2025-04-12', 6, 'Complété'),
('BD-2025-0005', 'LIV-002', '2025-04-11', 4, 'Annulé');

INSERT INTO historique_colis (colis_id, date, statut, utilisateur) VALUES
('COL-2025-0003', '2025-04-14 09:15', 'En attente', 'Marie Dubois'),
('COL-2025-0003', '2025-04-15 10:30', 'Pris en charge', 'Jean Lefebvre'),
('COL-2025-0003', '2025-04-16 08:45', 'En cours de livraison', 'Martin Dupont');
