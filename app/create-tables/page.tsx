'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// SQL statements to create tables
const createTablesSQL = `
-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR PRIMARY KEY,
  nom VARCHAR NOT NULL,
  telephone VARCHAR,
  email VARCHAR,
  adresse TEXT,
  entreprise VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Entreprises table
CREATE TABLE IF NOT EXISTS entreprises (
  id VARCHAR PRIMARY KEY,
  nom VARCHAR NOT NULL,
  adresse TEXT,
  contact VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Livreurs table
CREATE TABLE IF NOT EXISTS livreurs (
  id VARCHAR PRIMARY KEY,
  nom VARCHAR NOT NULL,
  telephone VARCHAR,
  email VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Colis table
CREATE TABLE IF NOT EXISTS colis (
  id VARCHAR PRIMARY KEY,
  client_id VARCHAR REFERENCES clients(id),
  entreprise_id VARCHAR REFERENCES entreprises(id),
  livreur_id VARCHAR REFERENCES livreurs(id),
  statut VARCHAR NOT NULL,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  date_mise_a_jour TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bons de distribution table
CREATE TABLE IF NOT EXISTS bons (
  id VARCHAR PRIMARY KEY,
  livreur_id VARCHAR REFERENCES livreurs(id),
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  nb_colis INTEGER DEFAULT 0,
  statut VARCHAR NOT NULL
);

-- Historique des colis
CREATE TABLE IF NOT EXISTS historique_colis (
  id SERIAL PRIMARY KEY,
  colis_id VARCHAR REFERENCES colis(id),
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  statut VARCHAR NOT NULL,
  utilisateur VARCHAR
);
`;

// SQL to insert sample data
const insertSampleDataSQL = `
-- Insert sample data for clients
INSERT INTO clients (id, nom, telephone, email, adresse, entreprise)
VALUES
  ('CLI-001', 'Marie Dubois', '06 12 34 56 78', 'marie.dubois@example.com', '15 Rue de Paris, 75001 Paris', 'Tech Solutions'),
  ('CLI-002', 'Thomas Martin', '07 23 45 67 89', 'thomas.martin@example.com', '8 Avenue Victor Hugo, 69002 Lyon', NULL),
  ('CLI-003', 'Sophie Laurent', '06 34 56 78 90', 'sophie.laurent@example.com', '22 Boulevard de la Liberté, 59800 Lille', 'Boutique Mode'),
  ('CLI-004', 'Pierre Moreau', '07 45 67 89 01', 'pierre.moreau@example.com', '5 Rue Nationale, 44000 Nantes', NULL),
  ('CLI-005', 'Julie Petit', '06 56 78 90 12', 'julie.petit@example.com', '17 Rue des Fleurs, 33000 Bordeaux', 'Café Central')
ON CONFLICT (id) DO NOTHING;

-- Insert sample data for entreprises
INSERT INTO entreprises (id, nom, adresse, contact)
VALUES
  ('ENT-001', 'Tech Solutions', '15 Rue de Paris, 75001 Paris', 'Marie Dubois'),
  ('ENT-002', 'Boutique Mode', '22 Boulevard de la Liberté, 59800 Lille', 'Sophie Laurent'),
  ('ENT-003', 'Café Central', '17 Rue des Fleurs, 33000 Bordeaux', 'Julie Petit'),
  ('ENT-004', 'Librairie Papier', '8 Avenue Victor Hugo, 69002 Lyon', 'Thomas Martin'),
  ('ENT-005', 'Électro Plus', '5 Rue Nationale, 44000 Nantes', 'Pierre Moreau')
ON CONFLICT (id) DO NOTHING;

-- Insert sample data for livreurs
INSERT INTO livreurs (id, nom, telephone, email)
VALUES
  ('LIV-001', 'Jean Lefebvre', '06 11 22 33 44', 'jean.lefebvre@example.com'),
  ('LIV-002', 'Martin Dupont', '07 22 33 44 55', 'martin.dupont@example.com'),
  ('LIV-003', 'Sophie Laurent', '06 33 44 55 66', 'sophie.laurent@example.com'),
  ('LIV-004', 'Pierre Durand', '07 44 55 66 77', 'pierre.durand@example.com'),
  ('LIV-005', 'Marie Leroy', '06 55 66 77 88', 'marie.leroy@example.com')
ON CONFLICT (id) DO NOTHING;

-- Insert sample data for colis
INSERT INTO colis (id, client_id, entreprise_id, livreur_id, statut, date_creation)
VALUES
  ('COL-2025-0001', 'CLI-001', 'ENT-001', NULL, 'En attente', '2025-04-15'),
  ('COL-2025-0002', 'CLI-002', NULL, 'LIV-001', 'Pris en charge', '2025-04-14'),
  ('COL-2025-0003', 'CLI-003', 'ENT-002', 'LIV-002', 'En cours de livraison', '2025-04-14'),
  ('COL-2025-0004', 'CLI-004', NULL, 'LIV-003', 'Livré', '2025-04-13'),
  ('COL-2025-0005', 'CLI-005', 'ENT-003', 'LIV-001', 'Retourné', '2025-04-12')
ON CONFLICT (id) DO NOTHING;

-- Insert sample data for bons
INSERT INTO bons (id, livreur_id, date_creation, nb_colis, statut)
VALUES
  ('BD-2025-0001', 'LIV-001', '2025-04-15', 5, 'En cours'),
  ('BD-2025-0002', 'LIV-002', '2025-04-14', 8, 'En cours'),
  ('BD-2025-0003', 'LIV-003', '2025-04-13', 3, 'Complété'),
  ('BD-2025-0004', 'LIV-001', '2025-04-12', 6, 'Complété'),
  ('BD-2025-0005', 'LIV-002', '2025-04-11', 4, 'Annulé')
ON CONFLICT (id) DO NOTHING;

-- Insert sample data for historique_colis
INSERT INTO historique_colis (colis_id, date, statut, utilisateur)
VALUES
  ('COL-2025-0003', '2025-04-14 09:15', 'En attente', 'Marie Dubois'),
  ('COL-2025-0003', '2025-04-15 10:30', 'Pris en charge', 'Jean Lefebvre'),
  ('COL-2025-0003', '2025-04-16 08:45', 'En cours de livraison', 'Martin Dupont');
`;

export default function CreateTablesPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('Click the button to create tables in Supabase');
  const [log, setLog] = useState<string[]>([]);

  async function createTables() {
    try {
      setStatus('loading');
      setMessage('Creating tables in Supabase...');
      setLog(['Starting table creation process...']);

      // Execute create tables SQL
      setLog(prev => [...prev, 'Creating tables...']);
      const { error: createError } = await supabase.rpc('pgclient_exec', { query: createTablesSQL });
      
      if (createError) {
        throw new Error(`Error creating tables: ${createError.message}`);
      }
      
      setLog(prev => [...prev, 'Tables created successfully!']);
      
      // Execute insert sample data SQL
      setLog(prev => [...prev, 'Inserting sample data...']);
      const { error: insertError } = await supabase.rpc('pgclient_exec', { query: insertSampleDataSQL });
      
      if (insertError) {
        throw new Error(`Error inserting sample data: ${insertError.message}`);
      }
      
      setLog(prev => [...prev, 'Sample data inserted successfully!']);
      
      setStatus('success');
      setMessage('Tables created and sample data inserted successfully!');
    } catch (error: any) {
      console.error('Error creating tables:', error);
      setStatus('error');
      setMessage(`Error: ${error.message || error}`);
      setLog(prev => [...prev, `ERROR: ${error.message || error}`]);
    }
  }

  // Alternative approach using REST API if RPC is not available
  async function createTablesAlternative() {
    try {
      setStatus('loading');
      setMessage('Creating tables in Supabase (alternative method)...');
      setLog(['Starting table creation process (alternative method)...']);

      // Split SQL into individual statements
      const statements = createTablesSQL.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        setLog(prev => [...prev, `Executing statement ${i+1}/${statements.length}...`]);
        
        // Execute each statement
        const { error } = await supabase.from('_sql').select('*').eq('query', stmt + ';');
        
        if (error) {
          throw new Error(`Error executing statement ${i+1}: ${error.message}`);
        }
      }
      
      setLog(prev => [...prev, 'Tables created successfully!']);
      
      // Insert sample data
      const dataStatements = insertSampleDataSQL.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (let i = 0; i < dataStatements.length; i++) {
        const stmt = dataStatements[i];
        setLog(prev => [...prev, `Inserting data ${i+1}/${dataStatements.length}...`]);
        
        // Execute each statement
        const { error } = await supabase.from('_sql').select('*').eq('query', stmt + ';');
        
        if (error) {
          throw new Error(`Error inserting data ${i+1}: ${error.message}`);
        }
      }
      
      setLog(prev => [...prev, 'Sample data inserted successfully!']);
      
      setStatus('success');
      setMessage('Tables created and sample data inserted successfully!');
    } catch (error: any) {
      console.error('Error creating tables:', error);
      setStatus('error');
      setMessage(`Error: ${error.message || error}`);
      setLog(prev => [...prev, `ERROR: ${error.message || error}`]);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Database Tables</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Database Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-4 mb-4 rounded-md ${
            status === 'idle' ? 'bg-gray-50 text-gray-700' :
            status === 'loading' ? 'bg-blue-50 text-blue-700' :
            status === 'success' ? 'bg-green-50 text-green-700' :
            'bg-red-50 text-red-700'
          }`}>
            <p>{message}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Instructions:</h3>
            <p className="mb-2">This utility will create the necessary tables in your Supabase database and populate them with sample data.</p>
            <p className="mb-2">Make sure you have the correct Supabase URL and API key in your .env file.</p>
            <p className="mb-2">If you encounter an error with the first method, try the alternative method.</p>
          </div>
          
          <div className="flex space-x-4 mb-6">
            <Button 
              onClick={createTables} 
              disabled={status === 'loading'}
              className="flex items-center"
            >
              {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Tables (Method 1)
            </Button>
            
            <Button 
              onClick={createTablesAlternative} 
              disabled={status === 'loading'}
              variant="outline"
              className="flex items-center"
            >
              {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Tables (Method 2)
            </Button>
          </div>
          
          <div className="border rounded-md p-4 bg-gray-50 max-h-80 overflow-y-auto">
            <h3 className="text-lg font-medium mb-2">Log:</h3>
            {log.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click one of the buttons above to start.</p>
            ) : (
              <ul className="space-y-1">
                {log.map((entry, index) => (
                  <li key={index} className={entry.startsWith('ERROR') ? 'text-red-600' : ''}>
                    {entry}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
