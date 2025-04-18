import { supabase, tableExists } from './supabase';

// Types
export interface Client {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
  entreprise: string;
}

export interface Entreprise {
  id: string;
  nom: string;
  adresse: string;
  contact: string;
  nbClients?: number;
  nbColis?: number;
}

export interface Livreur {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  nbColis?: number;
  nbBons?: number;
}

export interface Colis {
  id: string;
  client: string;
  client_id: string;
  entreprise: string;
  entreprise_id: string | null;
  statut: string;
  dateCreation: string;
  livreur: string;
  livreur_id: string | null;
}

export interface Bon {
  id: string;
  livreur: string;
  livreur_id: string;
  dateCreation: string;
  nbColis: number;
  statut: string;
}

// Fetch functions
export async function fetchColis(filters: {
  search?: string;
  statut?: string;
  livreur?: string;
  sort?: string;
}) {
  try {
    // Check if tables exist
    const colisTableExists = await tableExists('colis');
    if (!colisTableExists) {
      console.warn('Colis table does not exist yet. Returning mock data.');
      return getMockColis();
    }

    // Start with the base query
    let query = supabase
      .from('colis')
      .select(`
        id,
        statut,
        date_creation,
        clients!inner(id, nom),
        entreprises(id, nom),
        livreurs(id, nom)
      `);

    // Apply filters
    if (filters.search) {
      query = query.or(`clients.nom.ilike.%${filters.search}%,id.ilike.%${filters.search}%`);
    }

    if (filters.statut && filters.statut !== 'tous') {
      query = query.eq('statut', filters.statut);
    }

    if (filters.livreur && filters.livreur !== 'tous') {
      query = query.eq('livreur_id', filters.livreur);
    }

    // Apply sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'recent':
          query = query.order('date_creation', { ascending: false });
          break;
        case 'ancien':
          query = query.order('date_creation', { ascending: true });
          break;
        case 'client':
          query = query.order('clients.nom', { ascending: true });
          break;
        default:
          query = query.order('date_creation', { ascending: false });
      }
    } else {
      query = query.order('date_creation', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error in Supabase query:', error);
      // If there's an error with the query, return mock data
      return getMockColis();
    }

    // Transform the data to match our frontend structure
    return data.map((item: any) => ({
      id: item.id,
      client: item.clients.nom,
      client_id: item.clients.id,
      entreprise: item.entreprises?.nom || '-',
      entreprise_id: item.entreprises?.id || null,
      statut: item.statut,
      dateCreation: item.date_creation,
      livreur: item.livreurs?.nom || '-',
      livreur_id: item.livreurs?.id || null,
    }));
  } catch (error) {
    console.error('Error fetching colis:', error);
    // Return mock data in case of error
    return getMockColis();
  }
}

// Mock data function for colis
function getMockColis(): Colis[] {
  return [
    {
      id: "COL-2025-0001",
      client: "Marie Dubois",
      client_id: "CLI-001",
      entreprise: "Tech Solutions",
      entreprise_id: "ENT-001",
      statut: "En attente",
      dateCreation: "2025-04-15",
      livreur: "-",
      livreur_id: null,
    },
    {
      id: "COL-2025-0002",
      client: "Thomas Martin",
      client_id: "CLI-002",
      entreprise: "-",
      entreprise_id: null,
      statut: "Pris en charge",
      dateCreation: "2025-04-14",
      livreur: "Jean Lefebvre",
      livreur_id: "LIV-001",
    },
    {
      id: "COL-2025-0003",
      client: "Sophie Laurent",
      client_id: "CLI-003",
      entreprise: "Boutique Mode",
      entreprise_id: "ENT-002",
      statut: "En cours de livraison",
      dateCreation: "2025-04-14",
      livreur: "Martin Dupont",
      livreur_id: "LIV-002",
    },
    {
      id: "COL-2025-0004",
      client: "Pierre Moreau",
      client_id: "CLI-004",
      entreprise: "-",
      entreprise_id: null,
      statut: "Livré",
      dateCreation: "2025-04-13",
      livreur: "Sophie Laurent",
      livreur_id: "LIV-003",
    },
    {
      id: "COL-2025-0005",
      client: "Julie Petit",
      client_id: "CLI-005",
      entreprise: "Café Central",
      entreprise_id: "ENT-003",
      statut: "Retourné",
      dateCreation: "2025-04-12",
      livreur: "Jean Lefebvre",
      livreur_id: "LIV-001",
    },
  ];
}

export async function fetchLivreurs() {
  try {
    // Check if table exists
    const livreursTableExists = await tableExists('livreurs');
    if (!livreursTableExists) {
      console.warn('Livreurs table does not exist yet. Returning mock data.');
      return getMockLivreurs();
    }

    const { data, error } = await supabase.from('livreurs').select('*');

    if (error) {
      console.error('Error in Supabase query:', error);
      return getMockLivreurs();
    }

    return data;
  } catch (error) {
    console.error('Error fetching livreurs:', error);
    return getMockLivreurs();
  }
}

// Mock data function for livreurs
function getMockLivreurs(): Livreur[] {
  return [
    {
      id: "LIV-001",
      nom: "Jean Lefebvre",
      telephone: "06 11 22 33 44",
      email: "jean.lefebvre@example.com",
      nbColis: 15,
      nbBons: 3,
    },
    {
      id: "LIV-002",
      nom: "Martin Dupont",
      telephone: "07 22 33 44 55",
      email: "martin.dupont@example.com",
      nbColis: 18,
      nbBons: 4,
    },
    {
      id: "LIV-003",
      nom: "Sophie Laurent",
      telephone: "06 33 44 55 66",
      email: "sophie.laurent@example.com",
      nbColis: 12,
      nbBons: 2,
    },
    {
      id: "LIV-004",
      nom: "Pierre Durand",
      telephone: "07 44 55 66 77",
      email: "pierre.durand@example.com",
      nbColis: 9,
      nbBons: 2,
    },
    {
      id: "LIV-005",
      nom: "Marie Leroy",
      telephone: "06 55 66 77 88",
      email: "marie.leroy@example.com",
      nbColis: 7,
      nbBons: 1,
    },
  ];
}

export async function fetchClients(search?: string) {
  try {
    // Check if table exists
    const clientsTableExists = await tableExists('clients');
    if (!clientsTableExists) {
      console.warn('Clients table does not exist yet. Returning mock data.');
      return getMockClients(search);
    }

    let query = supabase.from('clients').select('*');

    if (search) {
      query = query.or(`nom.ilike.%${search}%,telephone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error in Supabase query:', error);
      return getMockClients(search);
    }

    return data;
  } catch (error) {
    console.error('Error fetching clients:', error);
    return getMockClients(search);
  }
}

// Mock data function for clients with optional search filter
function getMockClients(search?: string): Client[] {
  const clients = [
    {
      id: "CLI-001",
      nom: "Marie Dubois",
      telephone: "06 12 34 56 78",
      email: "marie.dubois@example.com",
      adresse: "15 Rue de Paris, 75001 Paris",
      entreprise: "Tech Solutions",
    },
    {
      id: "CLI-002",
      nom: "Thomas Martin",
      telephone: "07 23 45 67 89",
      email: "thomas.martin@example.com",
      adresse: "8 Avenue Victor Hugo, 69002 Lyon",
      entreprise: "",
    },
    {
      id: "CLI-003",
      nom: "Sophie Laurent",
      telephone: "06 34 56 78 90",
      email: "sophie.laurent@example.com",
      adresse: "22 Boulevard de la Liberté, 59800 Lille",
      entreprise: "Boutique Mode",
    },
    {
      id: "CLI-004",
      nom: "Pierre Moreau",
      telephone: "07 45 67 89 01",
      email: "pierre.moreau@example.com",
      adresse: "5 Rue Nationale, 44000 Nantes",
      entreprise: "",
    },
    {
      id: "CLI-005",
      nom: "Julie Petit",
      telephone: "06 56 78 90 12",
      email: "julie.petit@example.com",
      adresse: "17 Rue des Fleurs, 33000 Bordeaux",
      entreprise: "Café Central",
    },
  ];

  if (!search) {
    return clients;
  }

  const searchLower = search.toLowerCase();
  return clients.filter(client =>
    client.nom.toLowerCase().includes(searchLower) ||
    client.telephone.includes(search) ||
    client.email.toLowerCase().includes(searchLower)
  );
}

export async function fetchEntreprises(search?: string) {
  try {
    // Check if table exists
    const entreprisesTableExists = await tableExists('entreprises');
    if (!entreprisesTableExists) {
      console.warn('Entreprises table does not exist yet. Returning mock data.');
      return getMockEntreprises(search);
    }

    let query = supabase.from('entreprises').select('*');

    if (search) {
      query = query.or(`nom.ilike.%${search}%,contact.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error in Supabase query:', error);
      return getMockEntreprises(search);
    }

    return data;
  } catch (error) {
    console.error('Error fetching entreprises:', error);
    return getMockEntreprises(search);
  }
}

// Mock data function for entreprises with optional search filter
function getMockEntreprises(search?: string): Entreprise[] {
  const entreprises = [
    {
      id: "ENT-001",
      nom: "Tech Solutions",
      adresse: "15 Rue de Paris, 75001 Paris",
      contact: "Marie Dubois",
      nbClients: 8,
      nbColis: 24,
    },
    {
      id: "ENT-002",
      nom: "Boutique Mode",
      adresse: "22 Boulevard de la Liberté, 59800 Lille",
      contact: "Sophie Laurent",
      nbClients: 5,
      nbColis: 18,
    },
    {
      id: "ENT-003",
      nom: "Café Central",
      adresse: "17 Rue des Fleurs, 33000 Bordeaux",
      contact: "Julie Petit",
      nbClients: 3,
      nbColis: 12,
    },
    {
      id: "ENT-004",
      nom: "Librairie Papier",
      adresse: "8 Avenue Victor Hugo, 69002 Lyon",
      contact: "Thomas Martin",
      nbClients: 6,
      nbColis: 15,
    },
    {
      id: "ENT-005",
      nom: "Électro Plus",
      adresse: "5 Rue Nationale, 44000 Nantes",
      contact: "Pierre Moreau",
      nbClients: 4,
      nbColis: 9,
    },
  ];

  if (!search) {
    return entreprises;
  }

  const searchLower = search.toLowerCase();
  return entreprises.filter(entreprise =>
    entreprise.nom.toLowerCase().includes(searchLower) ||
    entreprise.contact.toLowerCase().includes(searchLower)
  );
}

export async function fetchBons(search?: string) {
  try {
    // Check if table exists
    const bonsTableExists = await tableExists('bons');
    if (!bonsTableExists) {
      console.warn('Bons table does not exist yet. Returning mock data.');
      return getMockBons(search);
    }

    let query = supabase
      .from('bons')
      .select(`
        id,
        date_creation,
        nb_colis,
        statut,
        livreurs!inner(id, nom)
      `);

    if (search) {
      query = query.or(`id.ilike.%${search}%,livreurs.nom.ilike.%${search}%,statut.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error in Supabase query:', error);
      return getMockBons(search);
    }

    // Transform the data to match our frontend structure
    return data.map((item: any) => ({
      id: item.id,
      livreur: item.livreurs.nom,
      livreur_id: item.livreurs.id,
      dateCreation: item.date_creation,
      nbColis: item.nb_colis,
      statut: item.statut,
    }));
  } catch (error) {
    console.error('Error fetching bons:', error);
    return getMockBons(search);
  }
}

// Mock data function for bons with optional search filter
function getMockBons(search?: string): Bon[] {
  const bons = [
    {
      id: "BD-2025-0001",
      livreur: "Jean Lefebvre",
      livreur_id: "LIV-001",
      dateCreation: "2025-04-15",
      nbColis: 5,
      statut: "En cours",
    },
    {
      id: "BD-2025-0002",
      livreur: "Martin Dupont",
      livreur_id: "LIV-002",
      dateCreation: "2025-04-14",
      nbColis: 8,
      statut: "En cours",
    },
    {
      id: "BD-2025-0003",
      livreur: "Sophie Laurent",
      livreur_id: "LIV-003",
      dateCreation: "2025-04-13",
      nbColis: 3,
      statut: "Complété",
    },
    {
      id: "BD-2025-0004",
      livreur: "Jean Lefebvre",
      livreur_id: "LIV-001",
      dateCreation: "2025-04-12",
      nbColis: 6,
      statut: "Complété",
    },
    {
      id: "BD-2025-0005",
      livreur: "Martin Dupont",
      livreur_id: "LIV-002",
      dateCreation: "2025-04-11",
      nbColis: 4,
      statut: "Annulé",
    },
  ];

  if (!search) {
    return bons;
  }

  const searchLower = search.toLowerCase();
  return bons.filter(bon =>
    bon.id.toLowerCase().includes(searchLower) ||
    bon.livreur.toLowerCase().includes(searchLower) ||
    bon.statut.toLowerCase().includes(searchLower)
  );
}
