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
import { showSuccess, showError } from '@/lib/sweetalert';

export default function NouveauLivreurPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: `LIV-${String(Math.floor(Math.random() * 900) + 100)}`,
    nom: '',
    telephone: '',
    email: '',
    vehicule: '',
    zone: '',
    notes: '',
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
        description: "Le nom du livreur est requis",
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
      // Split the nom into prenom and nom
      const nomParts = formData.nom.trim().split(' ');
      const prenom = nomParts[0] || '';
      const nom = nomParts.slice(1).join(' ') || prenom; // Use prenom as nom if no last name

      // Prepare data for submission
      const livreurData = {
        prenom: prenom,
        nom: nom,
        email: formData.email || null,
        telephone: formData.telephone || null,
        role: 'Livreur',
        mot_de_passe: 'password123', // Default password
        statut: 'Actif',
        vehicule: formData.vehicule || null,
        zone: formData.zone || null,
        date_creation: new Date().toISOString(),
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('utilisateurs')
        .insert([livreurData])
        .select();

      if (error) {
        throw error;
      }

      // Show success message
      showSuccess(
        'Succès !',
        `Le livreur ${formData.nom} a été créé`
      );

      // Redirect to livreurs list
      router.push('/livreurs');
    } catch (error: any) {
      console.error('Error creating livreur:', error);
      showError(
        'Erreur',
        error.message || "Une erreur est survenue lors de la création du livreur"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/livreurs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Nouveau Livreur</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations du livreur</CardTitle>
            <CardDescription>
              Remplissez les informations pour créer un nouveau livreur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ID Livreur */}
              <div className="space-y-2">
                <Label htmlFor="id">ID Livreur</Label>
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/livreurs">Annuler</Link>
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
