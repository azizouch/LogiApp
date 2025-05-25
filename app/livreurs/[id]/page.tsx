'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, Edit, Trash, User, Phone, Mail, MapPin, Package, Truck, RefreshCw, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { use } from 'react';
import { showConfirmation, showSuccess, showError } from '@/lib/sweetalert';
import { AssignerModal } from '@/components/assigner-modal';

export default function LivreurDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshParam = searchParams.get('refresh');

  // Unwrap params using React.use
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [livreur, setLivreur] = useState<any>(null);
  const [colis, setColis] = useState<any[]>([]);
  const [bons, setBons] = useState<any[]>([]);
  const [isAssignerModalOpen, setIsAssignerModalOpen] = useState(false);

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
          throw livreurError;
        }

        if (!livreurData) {
          throw new Error('Livreur not found');
        }

        // Format the livreur data to match the expected structure
        const formattedLivreur = {
          id: livreurData.id,
          nom: `${livreurData.prenom} ${livreurData.nom}`,
          telephone: livreurData.telephone,
          email: livreurData.email,
          vehicule: livreurData.vehicule,
          zone: livreurData.zone,
          adresse: livreurData.adresse,
          ville: livreurData.ville,
          created_at: livreurData.date_creation,
          notes: '' // No notes field in the new structure
        };

        setLivreur(formattedLivreur);

        // Fetch related colis
        const { data: colisData, error: colisError } = await supabase
          .from('colis')
          .select('*')
          .eq('livreur_id', id)
          .order('date_creation', { ascending: false });

        if (colisError) {
          console.error('Error fetching colis:', colisError);
          // Continue anyway
        } else {
          setColis(colisData || []);
        }

        // Fetch related bons
        const { data: bonsData, error: bonsError } = await supabase
          .from('bons')
          .select('*')
          .eq('livreur_id', id)
          .order('date_creation', { ascending: false });

        if (bonsError) {
          console.error('Error fetching bons:', bonsError);
          // Continue anyway
        } else {
          setBons(bonsData || []);
        }
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
  }, [id, refreshParam]); // Add refreshParam to dependencies to force refresh when it changes

  // Handle delete
  const handleDelete = async () => {
    const confirmed = await showConfirmation(
      'Supprimer le livreur ?',
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
      // Check if livreur has colis
      if (colis.length > 0) {
        throw new Error('Ce livreur a des colis associés. Veuillez d\'abord supprimer ou réassigner ces colis.');
      }

      // Check if livreur has bons
      if (bons.length > 0) {
        throw new Error('Ce livreur a des bons de distribution associés. Veuillez d\'abord supprimer ou réassigner ces bons.');
      }

      // Delete the livreur from utilisateurs table
      const { error: livreurError } = await supabase
        .from('utilisateurs')
        .delete()
        .eq('id', id)
        .eq('role', 'Livreur');

      if (livreurError) {
        throw livreurError;
      }

      showSuccess(
        'Supprimé !',
        `Livreur ${livreur.nom} supprimé`
      );

      router.push('/livreurs');
    } catch (error: any) {
      console.error('Error deleting livreur:', error);
      showError(
        'Erreur',
        error.message || "Impossible de supprimer le livreur"
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

  if (!livreur) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/livreurs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>

          <h1 className="text-3xl font-bold">Livreur non trouvé</h1>
        </div>

        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Le livreur avec l'identifiant {id} n'a pas été trouvé.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/livreurs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/livreurs/${id}?refresh=${Date.now()}`)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{livreur.nom}</h1>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="default" onClick={() => setIsAssignerModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Assigner
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/livreurs/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informations du livreur</CardTitle>
            <CardDescription>Détails et coordonnées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {livreur.telephone && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Téléphone</h3>
                    <p className="text-lg font-medium flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      {livreur.telephone}
                    </p>
                  </div>
                )}

                {livreur.email && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p className="text-lg font-medium flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      {livreur.email}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {livreur.vehicule ? (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Véhicule</h3>
                    <p className="text-lg font-medium flex items-center">
                      <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                      {livreur.vehicule}
                    </p>
                  </div>
                ) : (
                  <div className="bg-muted p-3 rounded-md mb-4">
                    <h3 className="text-sm font-medium">Véhicule</h3>
                    <p className="text-sm text-muted-foreground">
                      Aucun véhicule spécifié
                    </p>
                  </div>
                )}

                {livreur.zone ? (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Zone de livraison</h3>
                    <p className="text-lg font-medium flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      {livreur.zone}
                    </p>
                  </div>
                ) : (
                  <div className="bg-muted p-3 rounded-md mb-4">
                    <h3 className="text-sm font-medium">Zone de livraison</h3>
                    <p className="text-sm text-muted-foreground">
                      Aucune zone spécifiée
                    </p>
                  </div>
                )}
              </div>

              <Separator />
              {livreur.notes ? (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <p className="text-lg font-medium">
                    {livreur.notes}
                  </p>
                </div>
              ) : (
                <div className="bg-muted p-3 rounded-md mb-4">
                  <h3 className="text-sm font-medium">Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    Aucune note spécifiée
                  </p>
                </div>
              )}

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Date de création</h3>
                <p className="text-lg font-medium">
                  {formatDate(livreur.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Colis associés
              </CardTitle>
            </CardHeader>
            <CardContent>
              {colis.length > 0 ? (
                <div className="space-y-4">
                  {colis.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <Link href={`/colis/${item.id}`} className="font-medium hover:underline">
                          {item.id}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {item.statut}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(item.date_creation).split(' à ')[0]}
                      </div>
                    </div>
                  ))}
                  {colis.length > 5 && (
                    <Button variant="link" className="px-0" asChild>
                      <Link href={`/colis?livreur=${id}`}>
                        Voir tous les colis ({colis.length})
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun colis associé</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Bons de distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bons.length > 0 ? (
                <div className="space-y-4">
                  {bons.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <Link href={`/bons/${item.id}`} className="font-medium hover:underline">
                          {item.id}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {item.statut}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(item.date_creation).split(' à ')[0]}
                      </div>
                    </div>
                  ))}
                  {bons.length > 5 && (
                    <Button variant="link" className="px-0" asChild>
                      <Link href={`/bons?livreur=${id}`}>
                        Voir tous les bons ({bons.length})
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun bon de distribution associé</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assigner Modal */}
      <AssignerModal
        isOpen={isAssignerModalOpen}
        onClose={() => setIsAssignerModalOpen(false)}
        livreurId={id}
        livreurName={livreur.nom}
        onSuccess={() => {
          // Refresh the page data when a colis is assigned
          router.push(`/livreurs/${id}?refresh=${Date.now()}`)
        }}
      />
    </div>
  );
}
