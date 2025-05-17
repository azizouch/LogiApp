'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReclamationDialog } from '@/components/reclamation-dialog'
import { toast } from '@/components/ui/use-toast'
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Package, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Truck, 
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react'

export default function LivreurColisDetailPage({ params }: { params: { id: string } }) {
  const unwrappedParams = use(params)
  const { id } = unwrappedParams
  const router = useRouter()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [colis, setColis] = useState<any>(null)
  const [client, setClient] = useState<any>(null)
  const [entreprise, setEntreprise] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        if (!user || !user.id) {
          throw new Error("Utilisateur non connecté")
        }

        // Fetch colis data
        const { data: colisData, error: colisError } = await supabase
          .from('colis')
          .select('*')
          .eq('id', id)
          .eq('livreur_id', user.id)
          .single()

        if (colisError) {
          if (colisError.code === 'PGRST116') {
            throw new Error("Colis non trouvé ou non assigné à ce livreur")
          }
          throw colisError
        }

        setColis(colisData)

        // Fetch client data
        if (colisData.client_id) {
          const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', colisData.client_id)
            .single()

          if (clientError) {
            console.error('Error fetching client:', clientError)
          } else {
            setClient(clientData)
          }
        }

        // Fetch entreprise data if available
        if (colisData.entreprise_id) {
          const { data: entrepriseData, error: entrepriseError } = await supabase
            .from('entreprises')
            .select('*')
            .eq('id', colisData.entreprise_id)
            .single()

          if (entrepriseError) {
            console.error('Error fetching entreprise:', entrepriseError)
          } else {
            setEntreprise(entrepriseData)
          }
        }

        setError(null)
      } catch (err: any) {
        console.error('Error loading data:', err)
        setError(err.message || "Une erreur est survenue lors du chargement des données")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, user])

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Handle status update
  const updateStatus = async (newStatus: string) => {
    if (!colis || !user) return

    try {
      setUpdating(true)

      // Update colis status
      const { error: updateError } = await supabase
        .from('colis')
        .update({ 
          statut: newStatus,
          date_mise_a_jour: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Add to historique
      const { error: historiqueError } = await supabase
        .from('historique_colis')
        .insert({
          colis_id: id,
          statut: newStatus,
          date: new Date().toISOString(),
          utilisateur: user.id
        })

      if (historiqueError) {
        console.error('Error adding to historique:', historiqueError)
        // Continue anyway
      }

      // Update local state
      setColis({
        ...colis,
        statut: newStatus
      })

      toast({
        title: "Statut mis à jour",
        description: `Le statut du colis a été mis à jour vers "${newStatus}"`,
      })
    } catch (err: any) {
      console.error('Error updating status:', err)
      toast({
        title: "Erreur",
        description: err.message || "Une erreur est survenue lors de la mise à jour du statut",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Chargement des données...</span>
        </div>
      </div>
    )
  }

  if (error || !colis) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/livreur/colis">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>

          <h1 className="text-3xl font-bold">Erreur</h1>
        </div>

        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">{error || "Le colis n'a pas été trouvé."}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/livreur/colis">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Colis {id}</h1>
            <p className="text-muted-foreground">Créé le {formatDate(colis.date_creation)}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`px-3 py-1 ${
              colis.statut === 'Livré' ? 'border-green-500 text-green-600' :
              colis.statut === 'Refusé' ? 'border-red-500 text-red-600' :
              colis.statut === 'Retourné' ? 'border-amber-500 text-amber-600' :
              colis.statut === 'En cours de livraison' ? 'border-blue-500 text-blue-600' :
              'border-gray-500 text-gray-600'
            }`}>
              {colis.statut}
            </Badge>
            
            <ReclamationDialog 
              colisId={id} 
              buttonVariant="outline"
              buttonSize="sm"
            />
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
                  <p className="text-sm font-medium">Prix</p>
                  <p className="text-lg font-bold">{colis.prix || 0} DH</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">ID Colis</p>
                  <p>{colis.id}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Date de création</p>
                  <p>{formatDate(colis.date_creation)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Frais de livraison</p>
                  <p>{colis.frais || 0} DH</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Total</p>
                  <p className="font-bold">{(colis.prix || 0) + (colis.frais || 0)} DH</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            {colis.statut !== 'Livré' && colis.statut !== 'Refusé' && colis.statut !== 'Retourné' && colis.statut !== 'Annulé' && (
              <>
                <Button 
                  onClick={() => updateStatus('Livré')} 
                  disabled={updating}
                  className="flex-1"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marquer comme livré
                </Button>
                <Button 
                  onClick={() => updateStatus('Refusé')} 
                  variant="outline" 
                  disabled={updating}
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Marquer comme refusé
                </Button>
              </>
            )}
            <ReclamationDialog 
              colisId={id} 
              buttonVariant="secondary"
              buttonText="Signaler un problème"
              className="w-full mt-2"
            />
          </CardFooter>
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
              {client ? (
                <div className="space-y-3">
                  <p className="font-medium text-lg">{client.nom}</p>
                  <div className="space-y-1 text-sm">
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
                    {client.adresse && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{client.adresse}</span>
                      </div>
                    )}
                    {client.ville && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{client.ville}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Information client non disponible</p>
              )}
            </CardContent>
          </Card>

          {entreprise && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Entreprise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
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
                        <span>{entreprise.contact}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
