import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, User, Building2, Truck, ArrowLeft, Clock, MapPin, Phone, Mail } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function ColisDetailPage({ params }: { params: { id: string } }) {
  // Données fictives pour la démonstration
  const colis = {
    id: params.id,
    statut: "En cours de livraison",
    client: {
      nom: "Sophie Laurent",
      telephone: "06 34 56 78 90",
      email: "sophie.laurent@example.com",
      adresse: "22 Boulevard de la Liberté, 59800 Lille",
    },
    entreprise: {
      nom: "Boutique Mode",
      adresse: "18 Rue du Commerce, 59800 Lille",
    },
    livreur: {
      nom: "Martin Dupont",
      telephone: "07 22 33 44 55",
    },
    dateCreation: "2025-04-14",
    dateMiseAJour: "2025-04-16",
    historique: [
      {
        date: "2025-04-14 09:15",
        statut: "En attente",
        utilisateur: "Marie Dubois",
      },
      {
        date: "2025-04-15 10:30",
        statut: "Pris en charge",
        utilisateur: "Jean Lefebvre",
      },
      {
        date: "2025-04-16 08:45",
        statut: "En cours de livraison",
        utilisateur: "Martin Dupont",
      },
    ],
    bonDistribution: "BD-2025-0002",
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/colis">
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
                Créé le {new Date(colis.dateCreation).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select defaultValue={colis.statut.toLowerCase().replace(/ /g, "-")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Changer le statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-attente">En attente</SelectItem>
                <SelectItem value="pris-en-charge">Pris en charge</SelectItem>
                <SelectItem value="en-cours-de-livraison">En cours de livraison</SelectItem>
                <SelectItem value="livre">Livré</SelectItem>
                <SelectItem value="retourne">Retourné</SelectItem>
              </SelectContent>
            </Select>
            <Button>Mettre à jour</Button>
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
                  <Link href={`/bons/${colis.bonDistribution}`} className="text-primary hover:underline">
                    {colis.bonDistribution}
                  </Link>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Historique des statuts</h3>
                <div className="space-y-4">
                  {colis.historique.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <p className="font-medium">{item.statut}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.date} par {item.utilisateur}
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
                <p className="font-medium text-lg">{colis.client.nom}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{colis.client.adresse}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{colis.client.telephone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{colis.client.email}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/clients/${colis.client.nom.replace(/ /g, "-").toLowerCase()}`}>Voir le profil</Link>
                </Button>
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
                <p className="font-medium text-lg">{colis.entreprise.nom}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{colis.entreprise.adresse}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/entreprises/${colis.entreprise.nom.replace(/ /g, "-").toLowerCase()}`}>
                    Voir le profil
                  </Link>
                </Button>
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
                <p className="font-medium text-lg">{colis.livreur.nom}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{colis.livreur.telephone}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/livreurs/${colis.livreur.nom.replace(/ /g, "-").toLowerCase()}`}>Voir le profil</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
