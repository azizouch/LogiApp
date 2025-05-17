import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Check if the table exists
    let tableExists = true;

    try {
      const { error } = await supabase
        .from('utilisateurs')
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') {
        // Table doesn't exist
        tableExists = false;
      } else if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error checking if table exists:', error);
      throw error;
    }

    // If table doesn't exist, we'll just continue and let Supabase create it
    // when we try to insert data. Supabase will automatically create tables
    // with the correct structure based on the data we insert.

    // No need to create the table manually, just try to insert data
    const { error: createError } = tableExists ? { error: null } : await supabase
      .from('utilisateurs')
      .insert([
        {
          id: '00000000-0000-0000-0000-000000000000', // Default admin user
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@example.com',
          telephone: '+33 6 12 34 56 78',
          role: 'Admin',
          mot_de_passe: 'password123',
          statut: 'Actif',
          date_creation: new Date().toISOString()
        }
      ]);

    if (createError) {
      console.error('Error creating table:', createError);
      return NextResponse.json({ success: false, error: createError.message }, { status: 500 });
    }

    // Only check for users if the table exists
    if (tableExists) {
      // Check if we have any users
      const { data: users, error: countError } = await supabase
        .from('utilisateurs')
        .select('id');

      if (countError) {
        console.error('Error counting users:', countError);
        return NextResponse.json({ success: false, error: countError.message }, { status: 500 });
      }

      // If no users, add sample users
      if (!users || users.length === 0) {
        const { error: insertError } = await supabase
          .from('utilisateurs')
          .insert([
            {
              nom: 'Dupont',
              prenom: 'Jean',
              email: 'jean.dupont@example.com',
              telephone: '+33 6 12 34 56 78',
              role: 'Admin',
              mot_de_passe: 'password123',
              statut: 'Actif',
              date_creation: new Date().toISOString()
            },
            {
              nom: 'Martin',
              prenom: 'Marie',
              email: 'marie.martin@example.com',
              telephone: '+33 6 23 45 67 89',
              role: 'Gestionnaire',
              mot_de_passe: 'password123',
              statut: 'Actif',
              date_creation: new Date().toISOString()
            },
            {
              nom: 'Durand',
              prenom: 'Pierre',
              email: 'pierre.durand@example.com',
              telephone: '+33 6 34 56 78 90',
              role: 'Livreur',
              mot_de_passe: 'password123',
              statut: 'Inactif',
              date_creation: new Date().toISOString()
            }
          ]);

        if (insertError) {
          console.error('Error inserting sample users:', insertError);
          return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Utilisateur table created successfully' });
  } catch (error) {
    console.error('Error creating utilisateur table:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
