'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, User, Building2, Truck, ArrowLeft, Clock, MapPin, Phone, Mail, Edit, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { use } from 'react';
import { showConfirmation, showSuccess, showError } from '@/lib/sweetalert';

export default function ColisDetailPage({ params }: { params: { id: string } }) {
  // Unwrap params using React.use
  const unwrappedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [colis, setColis] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [entreprise, setEntreprise] = useState<any>(null);
  const [livreur, setLivreur] = useState<any>(null);
  const [historique, setHistorique] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [bonDistribution, setBonDistribution] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<any[]>([]);

  // Load colis data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch the colis data
        const { data: colisData, error: colisError } = await supabase
          .from('colis')
          .select('*')
          .eq('id', unwrappedParams.id)
          .single();

        if (colisError) {
          console.error('Error fetching colis:', colisError);
          throw colisError;
        }

        if (!colisData) {
          throw new Error('Colis not found');
        }

        // Load statuses from the database
        const { data: statusesData, error: statusesError } = await supabase
          .from('statuts')
          .select('*')
          .eq('type', 'colis')
          .order('nom', { ascending: true });

        if (statusesError) {
          console.error('Error fetching statuses:', statusesError);
          // Continue anyway, we'll use default statuses
        } else {
          setStatuses(statusesData || []);
        }

        setColis(colisData);
        // Convert status to slug format for the select component
        setSelectedStatus(colisData.statut.toLowerCase().replace(/ /g, '-'));

        // Fetch related data
        if (colisData.client_id) {
          const { data: clientData } = await supabase
            .from('clients')
            .select('*')
            .eq('id', colisData.client_id)
            .single();

          setClient(clientData);
        }

        if (colisData.entreprise_id) {
          const { data: entrepriseData } = await supabase
            .from('entreprises')
            .select('*')
            .eq('id', colisData.entreprise_id)
            .single();

          setEntreprise(entrepriseData);
        }

        if (colisData.livreur_id) {
          const { data: livreurData } = await supabase
            .from('utilisateurs')
            .select('*')
            .eq('id', colisData.livreur_id)
            .eq('role', 'Livreur')
            .single();

          if (livreurData) {
            // Format the livreur data to match the expected structure
            setLivreur({
              id: livreurData.id,
              nom: `${livreurData.prenom} ${livreurData.nom}`,
              telephone: livreurData.telephone,
              email: livreurData.email,
              vehicule: livreurData.vehicule,
              zone: livreurData.zone,
              adresse: livreurData.adresse,
              ville: livreurData.ville,
            });
          }

          // Check if this livreur has any bons
          const { data: bonsData } = await supabase
            .from('bons')
            .select('id')
            .eq('livreur_id', colisData.livreur_id)
            .order('date_creation', { ascending: false })
            .limit(1);

          if (bonsData && bonsData.length > 0) {
            setBonDistribution(bonsData[0].id);
          }
        }

        // Fetch historique with user information
        const { data: historiqueData } = await supabase
          .from('historique_colis')
          .select('*')
          .eq('colis_id', unwrappedParams.id)
          .order('date', { ascending: false });

        // Get user information for each historique entry
        const historiqueWithUsers = await Promise.all((historiqueData || []).map(async (entry) => {
          if (entry.utilisateur) {
            // Fetch user information
            const { data: userData } = await supabase
              .from('utilisateurs')
              .select('prenom, nom')
              .eq('id', entry.utilisateur)
              .single();

            if (userData) {
              return {
                ...entry,
                utilisateur_nom: `${userData.prenom} ${userData.nom}`
              };
            }
          }
          return {
            ...entry,
            utilisateur_nom: 'Système'
          };
        }));

        setHistorique(historiqueWithUsers || []);
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
  }, [unwrappedParams.id]);

  // Handle status update
  const updateStatus = async () => {
    // Find the status from our statuses list or use the selected status directly
    let newStatus = '';

    // First try to find the status in our database statuses
    if (statuses.length > 0) {
      // Try to find a matching status by slug
      const matchingStatus = statuses.find(
        status => status.nom.toLowerCase().replace(/ /g, '-') === selectedStatus
      );

      if (matchingStatus) {
        newStatus = matchingStatus.nom;
      }
    }

    // If no matching status found in database, use the fallback map
    if (!newStatus) {
      const statusMap: Record<string, string> = {
        'en-attente': 'En attente',
        'pris-en-charge': 'Pris en charge',
        'en-cours-de-livraison': 'En cours de livraison',
        'livre': 'Livré',
        'retourne': 'Retourné'
      };

      newStatus = statusMap[selectedStatus];
    }

    if (!newStatus || newStatus === colis.statut) {
      return; // No change or invalid status
    }

    setUpdating(true);

    try {
      // Update the colis status
      const { error: updateError } = await supabase
        .from('colis')
        .update({
          statut: newStatus,
          date_mise_a_jour: new Date().toISOString()
        })
        .eq('id', unwrappedParams.id);

      if (updateError) {
        throw updateError;
      }

      // Get a default admin user for the historique entry
      const { data: adminUser, error: adminError } = await supabase
        .from('utilisateurs')
        .select('id')
        .eq('role', 'Admin')
        .limit(1)
        .single();

      // Add a new entry to historique_colis
      const historiqueData = {
        colis_id: unwrappedParams.id,
        date: new Date().toISOString(),
        statut: newStatus,
        utilisateur: adminUser?.id || null, // Use the admin user ID or null
      };

      const { error: historiqueError } = await supabase
        .from('historique_colis')
        .insert([historiqueData]);

      if (historiqueError) {
        console.error('Error creating historique entry:', historiqueError);
        // Continue anyway since the main update was successful
      }

      // Update local state
      setColis(prev => ({ ...prev, statut: newStatus }));

      // Add the new entry to the historique
      setHistorique(prev => [{
        colis_id: unwrappedParams.id,
        date: new Date().toISOString(),
        statut: newStatus,
        utilisateur: adminUser?.id || null,
        utilisateur_nom: adminUser ? 'Admin' : 'Système'
      }, ...prev]);

      toast({
        title: "Statut mis à jour",
        description: `Le statut du colis a été mis à jour vers "${newStatus}".`,
      });
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Erreur lors de la mise à jour",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    const confirmed = await showConfirmation(
      'Supprimer le colis ?',
      'Cette action est irréversible',
      'Oui',
      'Non',
      'warning'
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      // First delete historique entries
      const { error: historiqueError } = await supabase
        .from('historique_colis')
        .delete()
        .eq('colis_id', unwrappedParams.id);

      if (historiqueError) {
        console.error('Error deleting historique:', historiqueError);
        // Continue anyway to try to delete the colis
      }

      // Then delete the colis
      const { error: colisError } = await supabase
        .from('colis')
        .delete()
        .eq('id', unwrappedParams.id);

      if (colisError) {
        throw colisError;
      }

      showSuccess(
        'Supprimé !',
        `Colis ${unwrappedParams.id} supprimé`
      );

      router.push('/liste-colis');
    } catch (error: any) {
      console.error('Error deleting colis:', error);
      showError(
        'Erreur',
        error.message || "Impossible de supprimer le colis"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const rawDate = new Date(dateString).toLocaleDateString("fr-FR", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Capitalize first letter of day and month
      return rawDate.replace(
        /(^\w|\s\w)(\S*)/g,
        (_: string, m1: string, m2: string) => m1.toUpperCase() + m2
      );
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!colis) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/liste-colis">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>

          <h1 className="text-3xl font-bold">Colis non trouvé</h1>
        </div>

        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Le colis avec l'identifiant {unwrappedParams.id} n'a pas été trouvé.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/liste-colis">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{colis.id}</h1>
              <p className="text-muted-foreground">
                Créé le {formatDate(colis.date_creation)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <Button variant="outline" asChild className="mb-2 sm:mb-0">
                <Link href={`/colis/${unwrappedParams.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="mb-2 sm:mb-0">
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    Supprimer
                  </>
                )}
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Changer le statut" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.length > 0 ? (
                    statuses.map((status) => (
                      <SelectItem
                        key={status.id}
                        value={status.nom.toLowerCase().replace(/ /g, '-')}
                      >
                        {status.nom}
                      </SelectItem>
                    ))
                  ) : (
                    // Fallback options if no statuses are defined
                    <>
                      <SelectItem value="en-attente">En attente</SelectItem>
                      <SelectItem value="pris-en-charge">Pris en charge</SelectItem>
                      <SelectItem value="en-cours-de-livraison">En cours de livraison</SelectItem>
                      <SelectItem value="livre">Livré</SelectItem>
                      <SelectItem value="retourne">Retourné</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <Button onClick={updateStatus} disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Mettre à jour'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informations du colis</CardTitle>
            <CardDescription>Détails et statut actuel du colis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Statut actuel</p>
                    <p className="text-lg font-bold">{colis.statut}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Bon de distribution</p>
                  {bonDistribution ? (
                    <Link href={`/bons/${bonDistribution}`} className="text-primary hover:underline">
                      {bonDistribution}
                    </Link>
                  ) : (
                    <p className="text-muted-foreground">Aucun bon associé</p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Historique des statuts</h3>
                <div className="space-y-4">
                  {historique.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <p className="font-medium">{item.statut}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(item.date)} par {item.utilisateur_nom || 'Système'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {client ? (
                  <>
                    <p className="font-medium text-lg">{client.nom}</p>
                    <div className="space-y-1 text-sm">
                      {client.adresse && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{client.adresse}</span>
                        </div>
                      )}
                      {client.telephone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{client.telephone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{client.email}</span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                      <Link href={`/clients/${client.id}`}>Voir le profil</Link>
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">Aucun client associé</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Entreprise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entreprise ? (
                  <>
                    <p className="font-medium text-lg">{entreprise.nom}</p>
                    <div className="space-y-1 text-sm">
                      {entreprise.adresse && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{entreprise.adresse}</span>
                        </div>
                      )}
                      {entreprise.contact && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>Contact: {entreprise.contact}</span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                      <Link href={`/entreprises/${entreprise.id}`}>
                        Voir le profil
                      </Link>
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">Aucune entreprise associée</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Livreur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {livreur ? (
                  <>
                    <p className="font-medium text-lg">{livreur.nom}</p>
                    <div className="space-y-1 text-sm">
                      {livreur.telephone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{livreur.telephone}</span>
                        </div>
                      )}
                      {livreur.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{livreur.email}</span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                      <Link href={`/livreurs/${livreur.id}`}>Voir le profil</Link>
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">Aucun livreur associé</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
