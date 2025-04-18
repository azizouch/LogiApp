"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Package, Plus, Search, Loader2 } from "lucide-react"
import { fetchColis, fetchLivreurs, Colis } from "@/lib/api"

// Status badge component
function StatusBadge({ status }: { status: string }) {
  let bgColor = "";
  let textColor = "";

  switch (status) {
    case "En attente":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      break;
    case "Pris en charge":
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      break;
    case "En cours de livraison":
      bgColor = "bg-purple-100";
      textColor = "text-purple-800";
      break;
    case "Livré":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      break;
    case "Retourné":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      break;
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
}

export default function ColisPage() {
  const [colis, setColis] = useState<Colis[]>([]);
  const [livreurs, setLivreurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [livreurFilter, setLivreurFilter] = useState("tous");
  const [sortOption, setSortOption] = useState("recent");

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Fetch livreurs for the dropdown
        const livreursData = await fetchLivreurs();
        setLivreurs(livreursData);

        // Fetch colis with filters
        const colisData = await fetchColis({
          search: searchQuery || undefined,
          statut: statusFilter !== "tous" ? getStatusLabel(statusFilter) : undefined,
          livreur: livreurFilter !== "tous" ? livreurFilter : undefined,
          sort: sortOption
        });

        setColis(colisData);
        setError(null);
      } catch (err: any) {
        console.error("Error loading data:", err);
        setError(err.message || "Une erreur est survenue lors du chargement des données");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [searchQuery, statusFilter, livreurFilter, sortOption]);

  // Helper function to convert status value to label
  function getStatusLabel(status: string) {
    switch (status) {
      case "en-attente": return "En attente";
      case "pris-en-charge": return "Pris en charge";
      case "en-cours": return "En cours de livraison";
      case "livre": return "Livré";
      case "retourne": return "Retourné";
      default: return status;
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Colis</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nouveau Colis
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Filtrer la liste des colis par différents critères</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="en-attente">En attente</SelectItem>
                <SelectItem value="pris-en-charge">Pris en charge</SelectItem>
                <SelectItem value="en-cours">En cours de livraison</SelectItem>
                <SelectItem value="livre">Livré</SelectItem>
                <SelectItem value="retourne">Retourné</SelectItem>
              </SelectContent>
            </Select>
            <Select value={livreurFilter} onValueChange={setLivreurFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Livreur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les livreurs</SelectItem>
                {livreurs.map((livreur) => (
                  <SelectItem key={livreur.id} value={livreur.id}>
                    {livreur.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récent</SelectItem>
                <SelectItem value="ancien">Plus ancien</SelectItem>
                <SelectItem value="client">Client (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Liste des Colis</CardTitle>
          <CardDescription>
            {loading ? "Chargement..." : `Total: ${colis.length} colis trouvés`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 text-red-800 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des données...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Colis</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Entreprise</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden md:table-cell">Date de création</TableHead>
                  <TableHead className="hidden md:table-cell">Livreur</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colis.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun colis trouvé avec les filtres actuels
                    </TableCell>
                  </TableRow>
                ) : (
                  colis.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                          {item.id}
                        </div>
                      </TableCell>
                      <TableCell>{item.client}</TableCell>
                      <TableCell className="hidden md:table-cell">{item.entreprise}</TableCell>
                      <TableCell>
                        <StatusBadge status={item.statut} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(item.dateCreation).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{item.livreur}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/colis/${item.id}`}>Détails</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
