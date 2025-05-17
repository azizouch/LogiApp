-- Create utilisateur table
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
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add some sample users (password is 'password' for all users)
INSERT INTO utilisateurs (nom, prenom, email, telephone, role, mot_de_passe, statut)
VALUES 
  ('Dupont', 'Jean', 'jean.dupont@example.com', '+33 6 12 34 56 78', 'Admin', '$2a$10$rRN.1gWBvCVh.t4H4Pcz8.MxXBqysRKCK8C5j0VdxzGqD.9B5eKha', 'Actif'),
  ('Martin', 'Marie', 'marie.martin@example.com', '+33 6 23 45 67 89', 'Gestionnaire', '$2a$10$rRN.1gWBvCVh.t4H4Pcz8.MxXBqysRKCK8C5j0VdxzGqD.9B5eKha', 'Actif'),
  ('Durand', 'Pierre', 'pierre.durand@example.com', '+33 6 34 56 78 90', 'Livreur', '$2a$10$rRN.1gWBvCVh.t4H4Pcz8.MxXBqysRKCK8C5j0VdxzGqD.9B5eKha', 'Inactif'),
  ('Laurent', 'Sophie', 'sophie.laurent@example.com', '+33 6 45 67 89 01', 'Gestionnaire', '$2a$10$rRN.1gWBvCVh.t4H4Pcz8.MxXBqysRKCK8C5j0VdxzGqD.9B5eKha', 'Actif'),
  ('Bernard', 'Thomas', 'thomas.bernard@example.com', '+33 6 56 78 90 12', 'Livreur', '$2a$10$rRN.1gWBvCVh.t4H4Pcz8.MxXBqysRKCK8C5j0VdxzGqD.9B5eKha', 'Actif');

-- Create a function to update the date_modification timestamp
CREATE OR REPLACE FUNCTION update_date_modification()
RETURNS TRIGGER AS $$
BEGIN
  NEW.date_modification = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the date_modification timestamp
CREATE TRIGGER update_utilisateurs_date_modification
BEFORE UPDATE ON utilisateurs
FOR EACH ROW
EXECUTE FUNCTION update_date_modification();
