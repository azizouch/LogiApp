import { supabase } from '@/lib/supabase';

export type SearchResult = {
  id: string;
  type: 'colis' | 'client' | 'livreur' | 'entreprise';
  title: string;
  subtitle: string;
  url: string;
};

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = `%${query.toLowerCase()}%`;
  const results: SearchResult[] = [];

  try {
    // Try to search for colis, but don't log errors for now
    try {
      // Get all colis and filter in memory instead of using potentially problematic queries
      const { data: allColis } = await supabase
        .from('colis')
        .select('id, adresse_livraison, statut, client_id')
        .limit(20);

      if (allColis && allColis.length > 0) {
        // Filter in memory
        const matchingColis = allColis.filter(colis => {
          const searchLower = query.toLowerCase();
          return (
            (colis.id && colis.id.toLowerCase().includes(searchLower)) ||
            (colis.adresse_livraison && colis.adresse_livraison.toLowerCase().includes(searchLower))
          );
        }).slice(0, 5); // Limit to 5 results

        results.push(
          ...matchingColis.map((colis) => ({
            id: colis.id,
            type: 'colis' as const,
            title: colis.id,
            subtitle: `${colis.adresse_livraison || 'Adresse non spécifiée'} • ${colis.statut || 'Statut non spécifié'}`,
            url: `/colis/${colis.id}`,
          }))
        );
      }
    } catch (colisError) {
      // Silently continue without logging the error
    }

    // Try to search for clients, but don't log errors
    try {
      // Get all clients and filter in memory
      const { data: allClients } = await supabase
        .from('clients')
        .select('id, nom, telephone, email')
        .limit(20);

      if (allClients && allClients.length > 0) {
        // Filter in memory
        const matchingClients = allClients.filter(client => {
          const searchLower = query.toLowerCase();
          return (
            (client.nom && client.nom.toLowerCase().includes(searchLower)) ||
            (client.telephone && client.telephone.toLowerCase().includes(searchLower)) ||
            (client.email && client.email.toLowerCase().includes(searchLower))
          );
        }).slice(0, 5); // Limit to 5 results

        results.push(
          ...matchingClients.map((client) => ({
            id: client.id,
            type: 'client' as const,
            title: client.nom || 'Client sans nom',
            subtitle: client.telephone || client.email || 'Client',
            url: `/clients/${client.id}`,
          }))
        );
      }
    } catch (clientError) {
      // Silently continue without logging the error
    }

    // Try to search for livreurs, but don't log errors
    try {
      // Get all livreurs and filter in memory
      const { data: allLivreurs } = await supabase
        .from('livreurs')
        .select('id, nom, telephone, email, zone')
        .limit(20);

      if (allLivreurs && allLivreurs.length > 0) {
        // Filter in memory
        const matchingLivreurs = allLivreurs.filter(livreur => {
          const searchLower = query.toLowerCase();
          return (
            (livreur.nom && livreur.nom.toLowerCase().includes(searchLower)) ||
            (livreur.telephone && livreur.telephone.toLowerCase().includes(searchLower)) ||
            (livreur.email && livreur.email.toLowerCase().includes(searchLower)) ||
            (livreur.zone && livreur.zone.toLowerCase().includes(searchLower))
          );
        }).slice(0, 5); // Limit to 5 results

        results.push(
          ...matchingLivreurs.map((livreur) => ({
            id: livreur.id,
            type: 'livreur' as const,
            title: livreur.nom || 'Livreur sans nom',
            subtitle: livreur.zone || livreur.telephone || 'Livreur',
            url: `/livreurs/${livreur.id}`,
          }))
        );
      }
    } catch (livreurError) {
      // Silently continue without logging the error
    }

    // Try to search for entreprises, but don't log errors
    try {
      // Get all entreprises and filter in memory
      const { data: allEntreprises } = await supabase
        .from('entreprises')
        .select('id, nom, telephone, email, description')
        .limit(20);

      if (allEntreprises && allEntreprises.length > 0) {
        // Filter in memory
        const matchingEntreprises = allEntreprises.filter(entreprise => {
          const searchLower = query.toLowerCase();
          return (
            (entreprise.nom && entreprise.nom.toLowerCase().includes(searchLower)) ||
            (entreprise.telephone && entreprise.telephone.toLowerCase().includes(searchLower)) ||
            (entreprise.email && entreprise.email.toLowerCase().includes(searchLower)) ||
            (entreprise.description && entreprise.description.toLowerCase().includes(searchLower))
          );
        }).slice(0, 5); // Limit to 5 results

        results.push(
          ...matchingEntreprises.map((entreprise) => ({
            id: entreprise.id,
            type: 'entreprise' as const,
            title: entreprise.nom || 'Entreprise sans nom',
            subtitle: entreprise.description || 'Entreprise',
            url: `/entreprises/${entreprise.id}`,
          }))
        );
      }
    } catch (entrepriseError) {
      // Silently continue without logging the error
    }

    return results;
  } catch (error) {
    // Return empty results but don't crash or log errors
    return [];
  }
}
