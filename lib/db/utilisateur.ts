import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the Utilisateur type
export type Utilisateur = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: 'Admin' | 'Gestionnaire' | 'Livreur';
  mot_de_passe?: string;
  statut: 'Actif' | 'Inactif';
  derniere_connexion?: string;
  date_creation: string;
  date_modification: string;
};

// Get all utilisateurs
export async function getAllUtilisateurs() {
  const { data, error } = await supabase
    .from('utilisateurs')
    .select('*')
    .order('nom');

  if (error) {
    console.error('Error fetching utilisateurs:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

// Get utilisateur by ID
export async function getUtilisateurById(id: string) {
  const { data, error } = await supabase
    .from('utilisateurs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching utilisateur:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

// Create a new utilisateur
export async function createUtilisateur(utilisateur: Omit<Utilisateur, 'id' | 'date_creation' | 'date_modification'>) {
  const { data, error } = await supabase
    .from('utilisateurs')
    .insert([utilisateur])
    .select();

  if (error) {
    console.error('Error creating utilisateur:', error);
    return { success: false, error };
  }

  return { success: true, data: data[0] };
}

// Update an existing utilisateur
export async function updateUtilisateur(id: string, utilisateur: Partial<Omit<Utilisateur, 'id' | 'date_creation' | 'date_modification'>>) {
  const { data, error } = await supabase
    .from('utilisateurs')
    .update(utilisateur)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating utilisateur:', error);
    return { success: false, error };
  }

  return { success: true, data: data[0] };
}

// Delete an utilisateur
export async function deleteUtilisateur(id: string) {
  const { error } = await supabase
    .from('utilisateurs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting utilisateur:', error);
    return { success: false, error };
  }

  return { success: true };
}
