import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Truck, Plus, Search, Phone, Mail, FileText } from "lucide-react"

// Données fictives pour la démonstration
const livreurs = [
  {
    id: "LIV-001",
    nom: "Jean Lefebvre",
    telephone: "06 11 22 33 44",
    email: "jean.lefebvre@example.com",
    nbColis: 15,
    nbBons: 3,
  },
  {
    id: "LIV-002",
    nom: "Martin Dupont",
    telephone: "07 22 33 44 55",
    email: "martin.dupont@example.com",
    nbColis: 18,
    nbBons: 4,
  },
  {
    id: "LIV-003",
    nom: "Sophie Laurent",
    telephone: "06 33 44 55 66",
    email: "sophie.laurent@example.com",
    nbColis: 12,
    nbBons: 2,
  },
  {
    id: "LIV-004",
    nom: "Pierre Durand",
    telephone: "07 44 55 66 77",
    email: "pierre.durand@example.com",
    nbColis: 9,
    nbBons: 2,
  },
  {
    id: "LIV-005",
    nom: "Marie Leroy",
    telephone: "06 55 66 77 88",
    email: "marie.leroy@example.com",
    nbColis: 7,
    nbBons: 1,
  },
]

export default function LivreursPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Livreurs</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nouveau Livreur
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Recherche</CardTitle>
          <CardDescription>Rechercher un livreur par nom ou numéro de téléphone</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Rechercher un livreur..." className="pl-8 w-full md:w-1/2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Liste des Livreurs</CardTitle>
          <CardDescription>Total: {livreurs.length} livreurs enregistrés</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="hidden md:table-cell">Activité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {livreurs.map((livreur) => (
                <TableRow key={livreur.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                      {livreur.nom}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                        {livreur.telephone}
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                        {livreur.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <Truck className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>{livreur.nbColis} colis</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>{livreur.nbBons} bons</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Assigner
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/livreurs/${livreur.id}`}>Détails</Link>
                      </Button>
                    </div>
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
