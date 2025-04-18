import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Building2, Plus, Search, MapPin, Users, Package } from "lucide-react"

// Données fictives pour la démonstration
const entreprises = [
  {
    id: "ENT-001",
    nom: "Tech Solutions",
    adresse: "15 Rue de Paris, 75001 Paris",
    contact: "Marie Dubois",
    nbClients: 8,
    nbColis: 24,
  },
  {
    id: "ENT-002",
    nom: "Boutique Mode",
    adresse: "22 Boulevard de la Liberté, 59800 Lille",
    contact: "Sophie Laurent",
    nbClients: 5,
    nbColis: 18,
  },
  {
    id: "ENT-003",
    nom: "Café Central",
    adresse: "17 Rue des Fleurs, 33000 Bordeaux",
    contact: "Julie Petit",
    nbClients: 3,
    nbColis: 12,
  },
  {
    id: "ENT-004",
    nom: "Librairie Papier",
    adresse: "8 Avenue Victor Hugo, 69002 Lyon",
    contact: "Thomas Martin",
    nbClients: 6,
    nbColis: 15,
  },
  {
    id: "ENT-005",
    nom: "Électro Plus",
    adresse: "5 Rue Nationale, 44000 Nantes",
    contact: "Pierre Moreau",
    nbClients: 4,
    nbColis: 9,
  },
]

export default function EntreprisesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Entreprises</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nouvelle Entreprise
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Recherche</CardTitle>
          <CardDescription>Rechercher une entreprise par nom ou contact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Rechercher une entreprise..." className="pl-8 w-full md:w-1/2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Liste des Entreprises</CardTitle>
          <CardDescription>Total: {entreprises.length} entreprises enregistrées</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead className="hidden md:table-cell">Adresse</TableHead>
                <TableHead>Contact Principal</TableHead>
                <TableHead className="hidden md:table-cell">Statistiques</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entreprises.map((entreprise) => (
                <TableRow key={entreprise.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      {entreprise.nom}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      {entreprise.adresse}
                    </div>
                  </TableCell>
                  <TableCell>{entreprise.contact}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>{entreprise.nbClients}</span>
                      </div>
                      <div className="flex items-center">
                        <Package className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>{entreprise.nbColis}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/entreprises/${entreprise.id}`}>Détails</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
