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
import { fetchEntreprises } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { use } from 'react';

export default function EditClientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // Unwrap params using React.use
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [entreprises, setEntreprises] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    entreprise_id: 'none',
  });

  // Load client data and entreprises
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch the client data
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .single();

        if (clientError) {
          console.error('Error fetching client:', clientError);
          if (clientError.code === 'PGRST116') {
            setNotFound(true);
          }
          throw clientError;
        }

        if (!clientData) {
          setNotFound(true);
          throw new Error('Client not found');
        }

        // Fetch entreprises
        const entreprisesData = await fetchEntreprises();
        setEntreprises(entreprisesData);

        // Set form data
        setFormData({
          id: clientData.id,
          nom: clientData.nom || '',
          telephone: clientData.telephone || '',
          email: clientData.email || '',
          adresse: clientData.adresse || '',
          entreprise_id: clientData.entreprise_id || 'none',
        });
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Erreur lors du chargement des données",
          description: "Impossible de charger les données du client",
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
        description: "Le nom du client est requis",
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
      const clientData = {
        nom: formData.nom,
        telephone: formData.telephone || null,
        email: formData.email || null,
        adresse: formData.adresse || null,
        // Note: 'entreprise_id' field is removed as it doesn't exist in the database schema
      };

      // Update in Supabase
      const { data, error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      // Show success message
      toast({
        title: "Client mis à jour avec succès",
        description: `Le client ${formData.nom} a été mis à jour.`,
      });

      // Redirect to client details with a timestamp to force refresh
      router.push(`/clients/${id}?refresh=${Date.now()}`);
      // Force a hard refresh to ensure the data is reloaded
      router.refresh();
    } catch (error: any) {
      console.error('Error updating client:', error);
      toast({
        title: "Erreur lors de la mise à jour du client",
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
            <Link href="/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Client non trouvé</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">
                Le client avec l'identifiant {id} n'a pas été trouvé.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/clients">Retour à la liste des clients</Link>
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
          <Link href={`/clients/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux détails
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Modifier le Client</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations du client</CardTitle>
            <CardDescription>
              Modifiez les informations du client
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
                  {/* ID Client */}
                  <div className="space-y-2">
                    <Label htmlFor="id">ID Client</Label>
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
                      placeholder="Nom du client"
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

                  {/* Entreprise - Currently not saved to database (for future use) */}
                  <div className="space-y-2">
                    <Label htmlFor="entreprise">Entreprise (fonctionnalité future)</Label>
                    <Select
                      value={formData.entreprise_id}
                      onValueChange={(value) => handleChange('entreprise_id', value)}
                    >
                      <SelectTrigger id="entreprise">
                        <SelectValue placeholder="Sélectionner une entreprise" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        {entreprises.map((entreprise) => (
                          <SelectItem key={entreprise.id} value={entreprise.id}>
                            {entreprise.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Note: Cette fonctionnalité sera disponible dans une future mise à jour.
                    </p>
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
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href={`/clients/${id}`}>Annuler</Link>
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
