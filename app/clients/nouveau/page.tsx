'use client';

import { useState } from 'react';
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

export default function NouveauClientPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entreprises, setEntreprises] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    id: `CLI-${String(Math.floor(Math.random() * 900) + 100)}`,
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    entreprise_id: 'none',
  });

  // Load entreprises for the dropdown
  useState(async () => {
    setLoading(true);
    try {
      const entreprisesData = await fetchEntreprises();
      setEntreprises(entreprisesData);
    } catch (error) {
      console.error('Error loading entreprises:', error);
    } finally {
      setLoading(false);
    }
  });

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
        id: formData.id,
        nom: formData.nom,
        telephone: formData.telephone || null,
        email: formData.email || null,
        adresse: formData.adresse || null,
        // Note: 'entreprise_id' field is removed as it doesn't exist in the database schema
        created_at: new Date().toISOString(),
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select();

      if (error) {
        throw error;
      }

      // Show success message
      toast({
        title: "Client créé avec succès",
        description: `Le client ${formData.nom} a été créé.`,
      });

      // Redirect to clients list
      router.push('/clients');
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast({
        title: "Erreur lors de la création du client",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Nouveau Client</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations du client</CardTitle>
            <CardDescription>
              Remplissez les informations pour créer un nouveau client
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ID Client */}
              <div className="space-y-2">
                <Label htmlFor="id">ID Client</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => handleChange('id', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  ID généré automatiquement (vous pouvez le modifier)
                </p>
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/clients">Annuler</Link>
            </Button>
            <Button type="submit" disabled={submitting}>
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
