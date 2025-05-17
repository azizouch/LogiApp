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
import { use } from 'react';

export default function EditEntreprisePage({ params }: { params: { id: string } }) {
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
    adresse: '',
    contact: '',
    telephone: '',
    email: '',
    description: '',
  });

  // Load enterprise data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch the enterprise data
        const { data: entrepriseData, error: entrepriseError } = await supabase
          .from('entreprises')
          .select('*')
          .eq('id', id)
          .single();

        if (entrepriseError) {
          console.error('Error fetching enterprise:', entrepriseError);
          if (entrepriseError.code === 'PGRST116') {
            setNotFound(true);
          }
          throw entrepriseError;
        }

        if (!entrepriseData) {
          setNotFound(true);
          throw new Error('Enterprise not found');
        }

        // Set form data
        setFormData({
          id: entrepriseData.id,
          nom: entrepriseData.nom || '',
          adresse: entrepriseData.adresse || '',
          contact: entrepriseData.contact || '',
          telephone: entrepriseData.telephone || '',
          email: entrepriseData.email || '',
          description: entrepriseData.description || '',
        });
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Erreur lors du chargement des données",
          description: "Impossible de charger les données de l'entreprise",
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
  const validateForm = () => {
    if (!formData.nom.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom de l'entreprise est requis",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Prepare data for submission
      const entrepriseData = {
        nom: formData.nom,
        adresse: formData.adresse || null,
        contact: formData.contact || null,
        telephone: formData.telephone || null,
        email: formData.email || null,
        description: formData.description || null,
      };

      // Update in Supabase
      const { data, error } = await supabase
        .from('entreprises')
        .update(entrepriseData)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      // Show success message
      toast({
        title: "Entreprise mise à jour avec succès",
        description: `L'entreprise ${formData.nom} a été mise à jour.`,
      });

      // Redirect to enterprise details with a timestamp to force refresh
      router.push(`/entreprises/${id}?refresh=${Date.now()}`);
      // Force a hard refresh to ensure the data is reloaded
      router.refresh();
    } catch (error: any) {
      console.error('Error updating enterprise:', error);
      toast({
        title: "Erreur lors de la mise à jour de l'entreprise",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (notFound) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/entreprises">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Entreprise non trouvée</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">
                L'entreprise avec l'identifiant {id} n'a pas été trouvée.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/entreprises">Retour à la liste des entreprises</Link>
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
          <Link href={`/entreprises/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux détails
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Modifier l'Entreprise</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'entreprise</CardTitle>
            <CardDescription>
              Modifiez les informations de l'entreprise
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
                  {/* ID Entreprise */}
                  <div className="space-y-2">
                    <Label htmlFor="id">ID Entreprise</Label>
                    <Input
                      id="id"
                      value={formData.id}
                      disabled
                    />
                  </div>

                  {/* Nom */}
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom <span className="text-red-500">*</span></Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => handleChange('nom', e.target.value)}
                      placeholder="Nom de l'entreprise"
                      required
                    />
                  </div>

                  {/* Contact */}
                  <div className="space-y-2">
                    <Label htmlFor="contact">Personne de contact</Label>
                    <Input
                      id="contact"
                      value={formData.contact}
                      onChange={(e) => handleChange('contact', e.target.value)}
                      placeholder="Nom du contact principal"
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
                </div>

                {/* Adresse */}
                <div className="space-y-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Textarea
                    id="adresse"
                    value={formData.adresse}
                    onChange={(e) => handleChange('adresse', e.target.value)}
                    placeholder="Adresse complète"
                    rows={3}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Description de l'entreprise"
                    rows={3}
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href={`/entreprises/${id}`}>Annuler</Link>
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
