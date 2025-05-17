"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Search, Plus, Edit, Trash } from "lucide-react"

export default function BonsPaiementPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Dummy data for demonstration
  const bonsPaiement = [
    { id: "BP-2025-001", date: "15/04/2025", client: "Tech Solutions", montant: "1250.00", statut: "Payé" },
    { id: "BP-2025-002", date: "16/04/2025", client: "Entreprise ABC", montant: "980.50", statut: "En attente" },
    { id: "BP-2025-003", date: "17/04/2025", client: "Société XYZ", montant: "1750.75", statut: "Payé" },
    { id: "BP-2025-004", date: "18/04/2025", client: "Compagnie 123", montant: "2300.00", statut: "En attente" },
    { id: "BP-2025-005", date: "19/04/2025", client: "Entreprise DEF", montant: "1100.25", statut: "Payé" },
  ]

  const filteredBons = bonsPaiement.filter(bon =>
    bon.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.statut.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bons de paiement</h1>
          <p className="text-muted-foreground mt-1">
            Gérez tous les bons de paiement de vos clients
          </p>
        </div>
        <Button className="mt-4 md:mt-0" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau bon de paiement
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div>
            <div className="text-lg font-medium mb-1.5">Recherche</div>
          </div>
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Recherchez des bons de paiement par ID, client ou statut"
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Liste des bons de paiement</CardTitle>
            <CardDescription className="mt-0">
              Total: {filteredBons.length} bons trouvés
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Montant (€)</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBons.map((bon) => (
                <TableRow key={bon.id}>
                  <TableCell className="font-medium">{bon.id}</TableCell>
                  <TableCell>{bon.date}</TableCell>
                  <TableCell>{bon.client}</TableCell>
                  <TableCell>{bon.montant}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bon.statut === "Payé"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                    }`}>
                      {bon.statut}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">Voir</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
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
