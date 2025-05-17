import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { FileText, Plus, Search, Download } from "lucide-react"

// Données fictives pour la démonstration
const bons = [
  {
    id: "BD-2025-0001",
    livreur: "Jean Lefebvre",
    dateCreation: "2025-04-15",
    nbColis: 5,
    statut: "En cours",
  },
  {
    id: "BD-2025-0002",
    livreur: "Martin Dupont",
    dateCreation: "2025-04-14",
    nbColis: 8,
    statut: "En cours",
  },
  {
    id: "BD-2025-0003",
    livreur: "Sophie Laurent",
    dateCreation: "2025-04-13",
    nbColis: 3,
    statut: "Complété",
  },
  {
    id: "BD-2025-0004",
    livreur: "Jean Lefebvre",
    dateCreation: "2025-04-12",
    nbColis: 6,
    statut: "Complété",
  },
  {
    id: "BD-2025-0005",
    livreur: "Martin Dupont",
    dateCreation: "2025-04-11",
    nbColis: 4,
    statut: "Annulé",
  },
]

export default function BonsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bons de Distribution</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nouveau Bon
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div>
            <div className="text-lg font-medium mb-1.5">Recherche</div>
            <div className="text-sm text-muted-foreground">
              Rechercher un bon de distribution par numéro, livreur ou statut
            </div>
          </div>
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un bon de distribution..."
              className="pl-8 w-full"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Liste des Bons de Distribution</CardTitle>
            <CardDescription className="mt-0">Total: {bons.length} bons trouvés</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Livreur</TableHead>
                <TableHead className="hidden md:table-cell">Date de création</TableHead>
                <TableHead className="hidden md:table-cell">Nombre de colis</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bons.map((bon) => (
                <TableRow key={bon.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      {bon.id}
                    </div>
                  </TableCell>
                  <TableCell>{bon.livreur}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {bon.dateCreation ?
                      new Date(bon.dateCreation)
                        .toLocaleDateString("fr-FR")
                        .replace(/(^\w|\s\w)(\S*)/g, (_, m1, m2) => m1.toUpperCase() + m2)
                      : ""}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{bon.nbColis}</TableCell>
                  <TableCell>
                    <BonStatusBadge status={bon.statut} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" title="Télécharger PDF">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/bons/${bon.id}`}>Détails</Link>
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

function BonStatusBadge({ status }: { status: string }) {
  let bgColor = ""

  switch (status) {
    case "En cours":
      bgColor = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      break
    case "Complété":
      bgColor = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      break
    case "Annulé":
      bgColor = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      break
    default:
      bgColor = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor}`}>
      {status}
    </span>
  )
}
