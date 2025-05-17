'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, Edit, Trash, User, Building2, Phone, Mail, MapPin, Package, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { use } from 'react';
import { showConfirmation, showSuccess, showError } from '@/lib/sweetalert';

export default function ClientDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Unwrap params using React.use
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  // Get refresh parameter from URL to force refresh when needed
  const refreshParam = searchParams.get('refresh');

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [entreprise, setEntreprise] = useState<any>(null);
  const [colis, setColis] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);

  // Load client data
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

        setClient(clientData);

        // Note: entreprise_id field doesn't exist in the clients table
        // This code is kept for future use when the relationship is implemented
        // For now, we'll just set entreprise to null
        setEntreprise(null);

        // Fetch colis for this client
        const { data: colisData } = await supabase
          .from('colis')
          .select('*')
          .eq('client_id', id)
          .order('date_creation', { ascending: false });

        setColis(colisData || []);
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
  }, [id, refreshParam]); // Add refreshParam to dependencies to force refresh when it changes

  // Handle delete
  const handleDelete = async () => {
    const confirmed = await showConfirmation(
      'Supprimer le client ?',
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
      // Check if client has colis
      if (colis.length > 0) {
        throw new Error('Ce client a des colis associés. Veuillez d\'abord supprimer ou réassigner ces colis.');
      }

      // Delete the client
      const { error: clientError } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (clientError) {
        throw clientError;
      }

      showSuccess(
        'Supprimé !',
        `Client ${client.nom} supprimé`
      );

      router.push('/clients');
    } catch (error: any) {
      console.error('Error deleting client:', error);
      showError(
        'Erreur',
        error.message || "Impossible de supprimer le client"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const rawDate = new Date(dateString).toLocaleDateString("fr-FR", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Capitalize first letter of day and month
      return rawDate.replace(
        /(^\w|\s\w)(\S*)/g,
        (_: string, m1: string, m2: string) => m1.toUpperCase() + m2
      );
    } catch (error) {
      return dateString;
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
          <Link href="/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold">Détails du Client</h1>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => {
                setLoading(true);
                router.refresh();
                // Reload the page data
                async function reloadData() {
                  try {
                    const { data: clientData } = await supabase
                      .from('clients')
                      .select('*')
                      .eq('id', id)
                      .single();

                    if (clientData) {
                      setClient(clientData);
                    }

                    const { data: colisData } = await supabase
                      .from('colis')
                      .select('*')
                      .eq('client_id', id)
                      .order('date_creation', { ascending: false });

                    setColis(colisData || []);
                  } catch (error) {
                    console.error('Error reloading data:', error);
                  } finally {
                    setLoading(false);
                  }
                }
                reloadData();
              }}
              title="Rafraîchir les données"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/clients/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash className="mr-2 h-4 w-4" />
              )}
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Chargement des données...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations du client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{client.nom}</h2>
                    <p className="text-sm text-muted-foreground">ID: {client.id}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {client.telephone && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Téléphone</h3>
                      <p className="text-lg font-medium flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        {client.telephone}
                      </p>
                    </div>
                  )}

                  {client.email && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                      <p className="text-lg font-medium flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        {client.email}
                      </p>
                    </div>
                  )}
                </div>

                {client.adresse && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Adresse</h3>
                    <p className="text-lg font-medium flex items-start">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground mt-1" />
                      {client.adresse}
                    </p>
                  </div>
                )}

                {/* Entreprise section - Hidden until the feature is implemented */}
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    La fonctionnalité d'association d'entreprise sera disponible dans une future mise à jour.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date de création</h3>
                  <p className="text-lg font-medium">
                    {formatDate(client.created_at)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Colis</CardTitle>
                <CardDescription>
                  Liste des colis associés à ce client
                </CardDescription>
              </CardHeader>
              <CardContent>
                {colis.length > 0 ? (
                  <div className="space-y-4">
                    {colis.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Package className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{item.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(item.date_creation)} - {item.statut}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/colis/${item.id}`}>
                            Voir
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucun colis associé à ce client</p>
                )}

                <div className="mt-4">
                  <Button asChild>
                    <Link href={`/colis/nouveau?client=${id}`}>
                      Créer un nouveau colis
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-medium">Nombre de colis</h3>
                    <p className="text-3xl font-bold">{colis.length}</p>
                  </div>

                  {colis.length > 0 && (
                    <div className="bg-muted p-4 rounded-md">
                      <h3 className="font-medium">Statuts des colis</h3>
                      <div className="mt-2 space-y-2">
                        {Object.entries(
                          colis.reduce((acc: any, colis) => {
                            acc[colis.statut] = (acc[colis.statut] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([statut, count]: [string, any]) => (
                          <div key={statut} className="flex justify-between">
                            <span>{statut}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
