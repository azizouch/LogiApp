"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Search, Download, Filter, X } from "lucide-react"
import { useState } from "react"

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
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [livreurFilter, setLivreurFilter] = useState("all")

  // Get unique livreurs for filter
  const uniqueLivreurs = [...new Set(bons.map(bon => bon.livreur))]

  // Filter bons based on current filters
  const filteredBons = bons.filter(bon => {
    const matchesSearch = searchTerm === "" ||
      bon.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bon.livreur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bon.statut.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || bon.statut === statusFilter
    const matchesLivreur = livreurFilter === "all" || bon.livreur === livreurFilter

    return matchesSearch && matchesStatus && matchesLivreur
  })

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setLivreurFilter("all")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold sm:text-2xl">Bons de Distribution</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nouveau Bon
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-medium flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtres
          </div>
          {(searchTerm || statusFilter !== "all" || livreurFilter !== "all") && (
            <Button variant="outline" onClick={resetFilters} size="sm">
              <X className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:flex md:flex-wrap gap-4 items-end">
          <div className="w-full md:flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full md:flex-1">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="En cours">En cours</SelectItem>
                <SelectItem value="Complété">Complété</SelectItem>
                <SelectItem value="Annulé">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:flex-1">
            <Select value={livreurFilter} onValueChange={setLivreurFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Livreur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les livreurs</SelectItem>
                {uniqueLivreurs.map(livreur => (
                  <SelectItem key={livreur} value={livreur}>{livreur}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Liste des Bons de Distribution</CardTitle>
            <CardDescription className="mt-0">Total: {filteredBons.length} bons trouvés</CardDescription>
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
              {filteredBons.map((bon) => (
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
