'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, ArrowLeft, Save, Plus, X, User, Phone, Mail, MapPin, Building, Search, CheckCircle, ChevronDown, Check } from 'lucide-react';
import { fetchClients, fetchEntreprises, fetchLivreurs } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';
import { createNotification } from '@/lib/notification-utils';

export default function NouveauColisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [entreprises, setEntreprises] = useState<any[]>([]);
  const [livreurs, setLivreurs] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);

  // Client search state
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: `COL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    client_id: '',
    entreprise_id: 'none',
    livreur_id: 'none',
    statut: '',
    prix: 0,
    frais: 0,
    notes: '',
  });

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

  // Load reference data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Load clients, entreprises, and livreurs
        const [clientsResponse, entreprisesData, livreursData] = await Promise.all([
          fetchClients(),
          fetchEntreprises(),
          fetchLivreurs(),
        ]);

        // Extract clients data from the response object
        const clientsData = clientsResponse.data || [];

        setClients(clientsData);
        setEntreprises(entreprisesData);
        setLivreurs(livreursData);

        // Load statuses from the database
        const { data: statusesData, error: statusesError } = await supabase
          .from('statuts')
          .select('*')
          .eq('type', 'colis')
          .order('ordre', { ascending: true });

        if (statusesError) throw statusesError;

        setStatuses(statusesData || []);

        // Set default status if available
        if (statusesData && statusesData.length > 0) {
          setFormData(prev => ({ ...prev, statut: statusesData[0].nom }));
        } else {
          // Fallback to default status if no statuses are defined
          setFormData(prev => ({ ...prev, statut: 'En attente' }));
        }
      } catch (error) {
        console.error('Error loading reference data:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les données de référence",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter clients based on search query
  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    (client.telephone && client.telephone.includes(clientSearchQuery)) ||
    (client.email && client.email.toLowerCase().includes(clientSearchQuery.toLowerCase()))
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.client-dropdown') && dropdownOpen) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

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

      // Update clients list with the new client
      const updatedClients = [...clients, newClient];
      setClients(updatedClients);

      // Select the new client in the form, clear search query, and close dropdown
      setFormData(prev => ({ ...prev, client_id: newClient.id }));
      setClientSearchQuery(''); // Clear search query to show all clients
      setDropdownOpen(false); // Close the dropdown

      // Show success message with client info
      toast({
        title: "Client sélectionné",
        description: `Le client "${newClient.nom}" a été créé et sélectionné pour ce colis.`,
        variant: "default"
      });

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

    // Validate form fields
    const errors = [];

    if (!formData.id.trim()) {
      errors.push("La référence du colis est requise");
    }

    if (!formData.client_id) {
      errors.push("Veuillez sélectionner un client");
    }

    if (!formData.statut) {
      errors.push("Veuillez sélectionner un statut");
    }

    if (errors.length > 0) {
      // Display validation errors
      toast({
        title: "Erreur de validation",
        description: (
          <ul className="list-disc pl-4">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Prepare data for submission
      const colisData = {
        id: formData.id,
        client_id: formData.client_id,
        entreprise_id: formData.entreprise_id === 'none' ? null : formData.entreprise_id,
        livreur_id: formData.livreur_id === 'none' ? null : formData.livreur_id,
        statut: formData.statut,
        prix: formData.prix,
        frais: formData.frais,
        date_creation: new Date().toISOString(),
        date_mise_a_jour: new Date().toISOString(),
        // Note: 'notes' field is removed as it doesn't exist in the database schema
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('colis')
        .insert([colisData])
        .select();

      if (error) {
        throw error;
      }

      // Get client name for notifications
      const client = clients.find(c => c.id === formData.client_id);
      const clientName = client ? client.nom : 'Client inconnu';

      // Get livreur name for notifications if assigned
      let livreurName = 'Aucun livreur';
      if (formData.livreur_id !== 'none') {
        const livreur = livreurs.find(l => l.id === formData.livreur_id);
        livreurName = livreur ? livreur.nom : 'Livreur inconnu';
      }

      // Get current user role
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserRole = currentUser?.role || 'Gestionnaire';
      const currentUserName = currentUser ? `${currentUser.prenom} ${currentUser.nom}` : 'Utilisateur';

      // Get a default admin user for the historique entry and notifications
      const { data: adminUsers } = await supabase
        .from('utilisateurs')
        .select('id, email')
        .eq('role', 'Admin');

      // Create an entry in historique_colis
      const historiqueData = {
        colis_id: formData.id,
        date: new Date().toISOString(),
        statut: formData.statut,
        utilisateur: currentUser?.id || null,
      };

      await supabase
        .from('historique_colis')
        .insert([historiqueData]);

      // Create notifications

      // 1. Notify admins about the new colis
      if (adminUsers && adminUsers.length > 0) {
        for (const admin of adminUsers) {
          // Skip if the current user is an admin (don't notify themselves)
          if (currentUser?.id === admin.id) continue;

          await createNotification({
            userId: admin.id,
            title: "Nouveau colis créé",
            message: `Un nouveau colis (${formData.id}) a été créé par ${currentUserName} pour ${clientName}.`,
            type: "info",
            link: `/colis/${formData.id}`
          });
        }
      }

      // 2. Notify the assigned livreur if any
      if (formData.livreur_id !== 'none') {
        await createNotification({
          userId: formData.livreur_id,
          title: "Nouveau colis assigné",
          message: `Un colis (${formData.id}) pour ${clientName} vous a été assigné.`,
          type: "info",
          link: `/livreur/colis/${formData.id}`
        });
      }

      // 3. Notify the client if they have a user account
      if (client?.email) {
        const { data: clientUser } = await supabase
          .from('utilisateurs')
          .select('id')
          .eq('email', client.email)
          .maybeSingle();

        if (clientUser) {
          await createNotification({
            userId: clientUser.id,
            title: "Nouveau colis enregistré",
            message: `Un nouveau colis (${formData.id}) a été enregistré pour vous.`,
            type: "info",
            link: `/colis/${formData.id}`
          });
        }
      }

      // Show success message
      toast({
        title: "Colis créé avec succès",
        description: `Le colis ${formData.id} a été créé.`,
      });

      // Redirect to colis list
      router.push('/liste-colis');
    } catch (error: any) {
      console.error('Error creating colis:', error);

      // Determine the error message based on the error type
      let errorMessage = "Une erreur est survenue lors de la création du colis";

      if (error.code === '23503') {
        // Foreign key violation
        errorMessage = "Le client ou l'entreprise sélectionné n'existe pas dans la base de données";
      } else if (error.code === '23505') {
        // Unique constraint violation
        errorMessage = "Un colis avec cette référence existe déjà";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Erreur lors de la création du colis",
        description: errorMessage,
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
          <Link href="/liste-colis">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Nouveau Colis</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations du colis</CardTitle>
            <CardDescription>
              Remplissez les informations pour créer un nouveau colis
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
                  {/* Référence Colis */}
                  <div className="space-y-2">
                    <Label htmlFor="id">
                      Ref Colis <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="id"
                      value={formData.id}
                      onChange={(e) => handleChange('id', e.target.value)}
                      className={!formData.id.trim() ? "border-red-300 focus:border-red-500" : ""}
                    />
                    <p className="text-sm text-muted-foreground">
                      Référence générée automatiquement (modifiable)
                    </p>
                  </div>

                  {/* Statut */}
                  <div className="space-y-2">
                    <Label htmlFor="statut">
                      Statut <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.statut}
                      onValueChange={(value) => handleChange('statut', value)}
                      required
                    >
                      <SelectTrigger id="statut" className={!formData.statut ? "border-red-300" : ""}>
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

                    {/* Custom client search dropdown */}
                    <div className="relative client-dropdown">
                      {/* Search input that looks like a select */}
                      <div
                        className={`relative w-full h-10 rounded-md border ${dropdownOpen ? 'border-ring ring-2 ring-ring ring-offset-2' : !formData.client_id ? 'border-red-300' : 'border-input'} bg-background px-3 py-2 text-sm flex items-center justify-between cursor-pointer`}
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                      >
                        <div className="flex-1 flex items-center">
                          <Search className="h-4 w-4 text-muted-foreground mr-2" />
                          {formData.client_id && clients.find(c => c.id === formData.client_id) ? (
                            <span>{clients.find(c => c.id === formData.client_id)?.nom}</span>
                          ) : (
                            <input
                              className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0"
                              placeholder="Rechercher un client..."
                              value={clientSearchQuery}
                              onChange={(e) => {
                                e.stopPropagation();
                                setClientSearchQuery(e.target.value);
                                if (!dropdownOpen) setDropdownOpen(true);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </div>
                        <div className="flex items-center">
                          {clientSearchQuery && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 mr-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setClientSearchQuery('');
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                          <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {/* Dropdown results */}
                      {dropdownOpen && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-background border rounded-md shadow-md z-20 max-h-[300px] overflow-y-auto">
                          {formData.client_id && clients.find(c => c.id === formData.client_id) && (
                            <div className="p-2 sticky top-0 bg-background border-b">
                              <input
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                placeholder="Rechercher un client..."
                                value={clientSearchQuery}
                                onChange={(e) => setClientSearchQuery(e.target.value)}
                                autoFocus
                              />
                            </div>
                          )}

                          {filteredClients.length > 0 ? (
                            <div>
                              {filteredClients.map((client) => (
                                <div
                                  key={client.id}
                                  className={`p-2 hover:bg-muted cursor-pointer ${formData.client_id === client.id ? 'bg-primary/10' : ''}`}
                                  onClick={() => {
                                    handleChange('client_id', client.id);
                                    setDropdownOpen(false);
                                    setClientSearchQuery('');
                                  }}
                                >
                                  <div className="flex items-center">
                                    {formData.client_id === client.id && (
                                      <Check className="h-4 w-4 text-primary mr-2" />
                                    )}
                                    <div className="flex-1">
                                      <div className="font-medium">{client.nom}</div>
                                      {client.telephone && (
                                        <div className="text-xs text-muted-foreground">{client.telephone}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              {clientSearchQuery ? 'Aucun client trouvé' : 'Commencez à taper pour rechercher un client'}
                            </div>
                          )}

                          <div className="p-2 border-t">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowNewClientDialog(true);
                                setDropdownOpen(false);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter un nouveau client
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Hidden input for form validation */}
                      <input
                        type="hidden"
                        name="client_id"
                        value={formData.client_id}
                        required
                      />
                    </div>


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
              <Link href="/liste-colis">Annuler</Link>
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
