-- Create statuses table if it doesn't exist
CREATE TABLE IF NOT EXISTS statuses (
    id VARCHAR(50) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    couleur VARCHAR(50),
    ordre INT,
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default statuses if they don't exist
INSERT INTO statuses (id, nom, couleur, ordre, actif)
VALUES
    ('en-attente', 'En attente', 'blue', 1, TRUE),
    ('pris-en-charge', 'Pris en charge', 'orange', 2, TRUE),
    ('en-cours-livraison', 'En cours de livraison', 'yellow', 3, TRUE),
    ('livre', 'Livré', 'green', 4, TRUE),
    ('refuse', 'Refusé', 'red', 5, TRUE),
    ('annule', 'Annulé', 'gray', 6, TRUE)
ON CONFLICT (id) DO NOTHING;

-- If you want to add a new status, you can use:
-- INSERT INTO statuses (id, nom, couleur, ordre, actif)
-- VALUES ('your-status-id', 'Your Status Name', 'color-name', order_number, TRUE);
