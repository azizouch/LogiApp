-- Create statuts table
CREATE TABLE IF NOT EXISTS statuts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('colis', 'bon')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on type for faster queries
CREATE INDEX IF NOT EXISTS idx_statuts_type ON statuts(type);

-- Insert default statuses for colis
INSERT INTO statuts (nom, type) VALUES
  ('En attente', 'colis'),
  ('Pris en charge', 'colis'),
  ('En cours de livraison', 'colis'),
  ('Livré', 'colis'),
  ('Retourné', 'colis')
ON CONFLICT (id) DO NOTHING;

-- Insert default statuses for bons
INSERT INTO statuts (nom, type) VALUES
  ('En cours', 'bon'),
  ('Complété', 'bon'),
  ('Annulé', 'bon')
ON CONFLICT (id) DO NOTHING;
