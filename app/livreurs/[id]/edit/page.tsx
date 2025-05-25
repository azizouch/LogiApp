'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';
import { showSuccess, showError } from '@/lib/sweetalert';
import { use } from 'react';

export default function EditLivreurPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // Unwrap params using React.use
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    nom: '',
    telephone: '',
    email: '',
    vehicule: '',
    zone: '',
    notes: '',
  });

  // Load livreur data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch the livreur data from utilisateurs table
        const { data: livreurData, error: livreurError } = await supabase
          .from('utilisateurs')
          .select('*')
          .eq('id', id)
          .eq('role', 'Livreur')
          .single();

        if (livreurError) {
          console.error('Error fetching livreur:', livreurError);
          if (livreurError.code === 'PGRST116') {
            setNotFound(true);
          }
          throw livreurError;
        }

        if (!livreurData) {
          setNotFound(true);
          throw new Error('Livreur not found');
        }

        // Set form data
        setFormData({
          id: livreurData.id,
          nom: `${livreurData.prenom} ${livreurData.nom}`, // Combine prenom and nom
          telephone: livreurData.telephone || '',
          email: livreurData.email || '',
          vehicule: livreurData.vehicule || '',
          zone: livreurData.zone || '',
          notes: '', // No notes field in the new structure
        });
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Erreur lors du chargement des données",
          description: "Impossible de charger les données du livreur",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  // Handle form input changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validate form
  const validateForm = async () => {
    if (!formData.nom.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom du livreur est requis",
        variant: "destructive",
      });
      return false;
    }

    // Check for duplicate email (if email is provided and changed)
    if (formData.email && formData.email.trim() !== '') {
      const { data: existingEmail, error: emailError } = await supabase
        .from('utilisateurs')
        .select('id')
        .eq('email', formData.email)
        .neq('id', id)
        .maybeSingle();

      if (emailError) {
        console.error('Error checking email:', emailError);
      }

      if (existingEmail) {
        toast({
          title: "Erreur de validation",
          description: "Un utilisateur avec cet email existe déjà",
          variant: "destructive",
        });
        return false;
      }
    }

    // Check for duplicate phone number (if phone is provided and changed)
    if (formData.telephone && formData.telephone.trim() !== '') {
      const { data: existingPhone, error: phoneError } = await supabase
        .from('utilisateurs')
        .select('id')
        .eq('telephone', formData.telephone)
        .neq('id', id)
        .maybeSingle();

      if (phoneError) {
        console.error('Error checking phone:', phoneError);
      }

      if (existingPhone) {
        toast({
          title: "Erreur de validation",
          description: "Un utilisateur avec ce numéro de téléphone existe déjà",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(await validateForm())) {
      return;
    }

    setSubmitting(true);

    try {
      // Split the nom into prenom and nom
      const nomParts = formData.nom.trim().split(' ');
      const prenom = nomParts[0] || '';
      const nom = nomParts.slice(1).join(' ') || prenom; // Use prenom as nom if no last name

      // Prepare data for submission
      const livreurData = {
        prenom: prenom,
        nom: nom,
        telephone: formData.telephone || null,
        email: formData.email || null,
        vehicule: formData.vehicule || null,
        zone: formData.zone || null,
      };

      // Update in Supabase
      const { data, error } = await supabase
        .from('utilisateurs')
        .update(livreurData)
        .eq('id', id)
        .eq('role', 'Livreur')
        .select();

      if (error) {
        throw error;
      }

      // Show success message
      showSuccess(
        'Succès !',
        `Le livreur ${formData.nom} a été mis à jour`
      );

      // Redirect to livreur details with a timestamp to force refresh
      router.push(`/livreurs/${id}?refresh=${Date.now()}`);
      // Force a hard refresh to ensure the data is reloaded
      router.refresh();
    } catch (error: any) {
      console.error('Error updating livreur:', error);
      showError(
        'Erreur',
        error.message || "Une erreur est survenue lors de la mise à jour du livreur"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (notFound) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/livreurs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Livreur non trouvé</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">
                Le livreur avec l'identifiant {id} n'a pas été trouvé.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/livreurs">Retour à la liste des livreurs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href={`/livreurs/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux détails
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Modifier le Livreur</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations du livreur</CardTitle>
            <CardDescription>
              Modifiez les informations du livreur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Chargement des données...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ID Livreur */}
                  <div className="space-y-2">
                    <Label htmlFor="id">ID Livreur</Label>
                    <Input
                      id="id"
                      value={formData.id}
                      onChange={(e) => handleChange('id', e.target.value)}
                      placeholder="ID du livreur"
                    />
                  </div>

                  {/* Nom */}
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom <span className="text-red-500">*</span></Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => handleChange('nom', e.target.value)}
                      placeholder="Nom du livreur"
                      required
                    />
                  </div>

                  {/* Téléphone */}
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => handleChange('telephone', e.target.value)}
                      placeholder="Numéro de téléphone"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="Adresse email"
                    />
                  </div>

                  {/* Véhicule */}
                  <div className="space-y-2">
                    <Label htmlFor="vehicule">Véhicule</Label>
                    <Input
                      id="vehicule"
                      value={formData.vehicule}
                      onChange={(e) => handleChange('vehicule', e.target.value)}
                      placeholder="Type de véhicule"
                    />
                  </div>

                  {/* Zone */}
                  <div className="space-y-2">
                    <Label htmlFor="zone">Zone de livraison</Label>
                    <Input
                      id="zone"
                      value={formData.zone}
                      onChange={(e) => handleChange('zone', e.target.value)}
                      placeholder="Zone géographique"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Informations supplémentaires"
                    rows={3}
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href={`/livreurs/${id}`}>Annuler</Link>
            </Button>
            <Button type="submit" disabled={submitting || loading}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
