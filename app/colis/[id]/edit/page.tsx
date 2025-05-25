'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, Save, Plus } from 'lucide-react';
import { fetchClients, fetchEntreprises, fetchLivreurs } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';
import { use } from 'react';
import { createNotification } from '@/lib/notification-utils';

export default function EditColisPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // Unwrap params using React.use
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [entreprises, setEntreprises] = useState<any[]>([]);
  const [livreurs, setLivreurs] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);

  // New client dialog state
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [newClientData, setNewClientData] = useState({
    id: `CLI-${String(Math.floor(Math.random() * 900) + 100)}`,
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    ville: '',
  });
  const [creatingClient, setCreatingClient] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    client_id: '',
    entreprise_id: 'none',
    livreur_id: 'none',
    statut: 'En attente',
    prix: 0,
    frais: 0,
    notes: '',
  });

  // Load colis data and reference data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch the colis data
        const { data: colisData, error: colisError } = await supabase
          .from('colis')
          .select('*')
          .eq('id', id)
          .single();

        if (colisError) {
          console.error('Error fetching colis:', colisError);
          if (colisError.code === 'PGRST116') {
            setNotFound(true);
          }
          throw colisError;
        }

        if (!colisData) {
          setNotFound(true);
          throw new Error('Colis not found');
        }

        // Fetch reference data
        const [clientsResponse, entreprisesData, livreursData] = await Promise.all([
          fetchClients(),
          fetchEntreprises(),
          fetchLivreurs(),
        ]);

        // Load statuses from the database
        const { data: statusesData, error: statusesError } = await supabase
          .from('statuts')
          .select('*')
          .eq('type', 'colis')
          .order('nom', { ascending: true });

        if (statusesError) throw statusesError;

        // Extract clients data from the response object
        const clientsData = clientsResponse.data || [];

        setClients(clientsData);
        setEntreprises(entreprisesData);
        setLivreurs(livreursData);
        setStatuses(statusesData || []);

        // Set form data
        setFormData({
          id: colisData.id,
          client_id: colisData.client_id || '',
          entreprise_id: colisData.entreprise_id || 'none',
          livreur_id: colisData.livreur_id || 'none',
          statut: colisData.statut || 'En attente',
          prix: colisData.prix || 0,
          frais: colisData.frais || 0,
          notes: '', // Notes field is not in the database yet
        });
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Erreur lors du chargement des données",
          description: "Impossible de charger les données du colis",
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

  // Handle new client input changes
  const handleNewClientChange = (field: string, value: string) => {
    setNewClientData(prev => ({ ...prev, [field]: value }));
  };

  // Handle creating a new client
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newClientData.nom.trim()) {
      toast({
        title: "Erreur de validation",
        description: "Le nom du client est requis",
        variant: "destructive",
      });
      return;
    }

    setCreatingClient(true);

    try {
      // Prepare data for submission
      const clientData = {
        id: newClientData.id,
        nom: newClientData.nom,
        telephone: newClientData.telephone || null,
        email: newClientData.email || null,
        adresse: newClientData.adresse || null,
        ville: newClientData.ville || null,
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
        description: `Le client ${newClientData.nom} a été créé.`,
      });

      // Add the new client to the clients list
      const newClient = data[0];
      const updatedClients = [...clients, newClient];
      setClients(updatedClients);

      // Select the new client in the form
      setFormData(prev => ({ ...prev, client_id: newClient.id }));

      // Reset new client form and close dialog
      setNewClientData({
        id: `CLI-${String(Math.floor(Math.random() * 900) + 100)}`,
        nom: '',
        telephone: '',
        email: '',
        adresse: '',
        ville: '',
      });
      setShowNewClientDialog(false);

    } catch (error: any) {
      console.error('Error creating client:', error);
      toast({
        title: "Erreur lors de la création du client",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setCreatingClient(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Get the original colis data to check what has changed
      const { data: originalColis, error: originalColisError } = await supabase
        .from('colis')
        .select('livreur_id, statut, client_id')
        .eq('id', id)
        .single();

      if (originalColisError) {
        throw originalColisError;
      }

      // Prepare data for submission
      const colisData = {
        id: formData.id, // Include the ID in case it was changed
        client_id: formData.client_id,
        entreprise_id: formData.entreprise_id === 'none' ? null : formData.entreprise_id,
        livreur_id: formData.livreur_id === 'none' ? null : formData.livreur_id,
        statut: formData.statut,
        prix: formData.prix,
        frais: formData.frais,
        date_mise_a_jour: new Date().toISOString(),
        // Note: 'notes' field is removed as it doesn't exist in the database schema
      };

      // Update in Supabase
      const { data, error } = await supabase
        .from('colis')
        .update(colisData)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      // Check if livreur has been assigned or changed
      const livreurAssigned =
        (originalColis.livreur_id === null || originalColis.livreur_id === 'none') &&
        formData.livreur_id !== 'none';

      const livreurChanged =
        originalColis.livreur_id !== null &&
        originalColis.livreur_id !== 'none' &&
        formData.livreur_id !== 'none' &&
        originalColis.livreur_id !== formData.livreur_id;

      // Get client name for notifications
      const client = clients.find(c => c.id === formData.client_id);
      const clientName = client ? client.nom : 'Client inconnu';

      // Get livreur name for notifications
      const livreur = livreurs.find(l => l.id === formData.livreur_id);
      const livreurName = livreur ? livreur.nom : 'Livreur inconnu';

      // Create notifications if needed
      if (livreurAssigned || livreurChanged) {
        // 1. Notify the assigned livreur
        if (formData.livreur_id !== 'none') {
          await createNotification({
            userId: formData.livreur_id,
            title: "Nouveau colis assigné",
            message: `Un colis (${id}) pour ${clientName} vous a été assigné.`,
            type: "info",
            link: `/livreur/colis/${id}`
          });
        }

        // 2. Notify admins about the assignment
        const { data: admins } = await supabase
          .from('utilisateurs')
          .select('id')
          .eq('role', 'Admin');

        if (admins && admins.length > 0) {
          for (const admin of admins) {
            await createNotification({
              userId: admin.id,
              title: "Colis assigné",
              message: `Le colis ${id} a été assigné à ${livreurName}.`,
              type: "info",
              link: `/colis/${id}`
            });
          }
        }
      }

      // Check if status has changed
      if (originalColis.statut !== formData.statut) {
        // Create an entry in historique_colis
        const { data: adminUser } = await supabase
          .from('utilisateurs')
          .select('id')
          .eq('role', 'Admin')
          .limit(1)
          .single();

        const historiqueData = {
          colis_id: id,
          date: new Date().toISOString(),
          statut: formData.statut,
          utilisateur: adminUser?.id || null,
        };

        await supabase
          .from('historique_colis')
          .insert([historiqueData]);

        // Notify client about status change if it's a significant status
        if (['Livré', 'En cours de livraison', 'Retourné', 'Annulé'].includes(formData.statut)) {
          // Get client's user ID if they have an account
          const { data: clientUser } = await supabase
            .from('utilisateurs')
            .select('id')
            .eq('email', client?.email)
            .maybeSingle();

          if (clientUser) {
            let notificationType = "info";
            if (formData.statut === "Livré") notificationType = "success";
            if (formData.statut === "Retourné" || formData.statut === "Annulé") notificationType = "warning";

            await createNotification({
              userId: clientUser.id,
              title: `Statut du colis mis à jour`,
              message: `Votre colis (${id}) est maintenant "${formData.statut}".`,
              type: notificationType as any,
              link: `/colis/${id}`
            });
          }
        }
      }

      // Show success message
      toast({
        title: "Colis mis à jour avec succès",
        description: `Le colis ${id} a été mis à jour.`,
      });

      // Redirect to colis details
      router.push(`/colis/${id}`);
    } catch (error: any) {
      console.error('Error updating colis:', error);
      toast({
        title: "Erreur lors de la mise à jour du colis",
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
            <Link href="/liste-colis">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Colis non trouvé</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">
                Le colis avec l'identifiant {id} n'a pas été trouvé.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/liste-colis">Retour à la liste des colis</Link>
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
          <Link href={`/colis/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux détails
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Modifier le Colis</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations du colis</CardTitle>
            <CardDescription>
              Modifiez les informations du colis
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
                  {/* ID Colis */}
                  <div className="space-y-2">
                    <Label htmlFor="id">ID Colis</Label>
                    <Input
                      id="id"
                      value={formData.id}
                      onChange={(e) => handleChange('id', e.target.value)}
                      placeholder="ID du colis"
                    />
                  </div>

                  {/* Statut */}
                  <div className="space-y-2">
                    <Label htmlFor="statut">Statut</Label>
                    <Select
                      value={formData.statut}
                      onValueChange={(value) => handleChange('statut', value)}
                    >
                      <SelectTrigger id="statut">
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.length > 0 ? (
                          statuses.map((status) => (
                            <SelectItem key={status.id} value={status.nom}>
                              {status.nom}
                            </SelectItem>
                          ))
                        ) : (
                          // Fallback options if no statuses are defined
                          <>
                            <SelectItem value="En attente">En attente</SelectItem>
                            <SelectItem value="Pris en charge">Pris en charge</SelectItem>
                            <SelectItem value="En cours de livraison">En cours de livraison</SelectItem>
                            <SelectItem value="Livré">Livré</SelectItem>
                            <SelectItem value="Retourné">Retourné</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    {statuses.length === 0 && (
                      <p className="text-sm text-amber-600">
                        Aucun statut personnalisé défini. Utilisez la page Paramètres pour en ajouter.
                      </p>
                    )}
                  </div>

                  {/* Prix */}
                  <div className="space-y-2">
                    <Label htmlFor="prix">Prix (DH)</Label>
                    <Input
                      id="prix"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.prix}
                      onChange={(e) => handleChange('prix', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Montant à payer par le client
                    </p>
                  </div>

                  {/* Frais */}
                  <div className="space-y-2">
                    <Label htmlFor="frais">Frais de livraison (DH)</Label>
                    <Input
                      id="frais"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.frais}
                      onChange={(e) => handleChange('frais', e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Frais supplémentaires de livraison
                    </p>
                  </div>

                  {/* Client */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="client">
                        Client <span className="text-red-500">*</span>
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewClientDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Nouveau Client
                      </Button>
                    </div>
                    <Select
                      value={formData.client_id}
                      onValueChange={(value) => handleChange('client_id', value)}
                      required
                    >
                      <SelectTrigger id="client">
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Entreprise */}
                  <div className="space-y-2">
                    <Label htmlFor="entreprise">Entreprise (optionnel)</Label>
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
                  </div>

                  {/* Livreur */}
                  <div className="space-y-2">
                    <Label htmlFor="livreur">Livreur (optionnel)</Label>
                    <Select
                      value={formData.livreur_id}
                      onValueChange={(value) => handleChange('livreur_id', value)}
                    >
                      <SelectTrigger id="livreur">
                        <SelectValue placeholder="Sélectionner un livreur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun</SelectItem>
                        {livreurs.map((livreur) => (
                          <SelectItem key={livreur.id} value={livreur.id}>
                            {livreur.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes - Currently not saved to database (for future use) */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optionnel - fonctionnalité future)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Informations supplémentaires sur le colis..."
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    Note: Cette fonctionnalité sera disponible dans une future mise à jour.
                  </p>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href={`/colis/${id}`}>Annuler</Link>
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

      {/* Dialog for creating a new client */}
      <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau client</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour créer un nouveau client.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateClient} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              {/* ID Client */}
              <div className="space-y-2">
                <Label htmlFor="client-id">ID Client</Label>
                <Input
                  id="client-id"
                  value={newClientData.id}
                  onChange={(e) => handleNewClientChange('id', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  ID généré automatiquement (modifiable)
                </p>
              </div>

              {/* Nom Client */}
              <div className="space-y-2">
                <Label htmlFor="client-nom">Nom <span className="text-red-500">*</span></Label>
                <Input
                  id="client-nom"
                  value={newClientData.nom}
                  onChange={(e) => handleNewClientChange('nom', e.target.value)}
                  required
                />
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="client-telephone">Téléphone</Label>
                <Input
                  id="client-telephone"
                  value={newClientData.telephone}
                  onChange={(e) => handleNewClientChange('telephone', e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="client-email">Email</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={newClientData.email}
                  onChange={(e) => handleNewClientChange('email', e.target.value)}
                />
              </div>

              {/* Adresse */}
              <div className="space-y-2">
                <Label htmlFor="client-adresse">Adresse</Label>
                <Input
                  id="client-adresse"
                  value={newClientData.adresse}
                  onChange={(e) => handleNewClientChange('adresse', e.target.value)}
                />
              </div>

              {/* Ville */}
              <div className="space-y-2">
                <Label htmlFor="client-ville">Ville</Label>
                <Input
                  id="client-ville"
                  value={newClientData.ville}
                  onChange={(e) => handleNewClientChange('ville', e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewClientDialog(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={creatingClient}>
                {creatingClient ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer Client
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
