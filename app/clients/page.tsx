"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Users, Plus, Search, Phone, Mail, MapPin, Loader2 } from "lucide-react"
import { fetchClients, Client } from "@/lib/api"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await fetchClients(searchQuery || undefined)
        setClients(data)
        setError(null)
      } catch (err: any) {
        console.error("Error loading clients:", err)
        setError(err.message || "Une erreur est survenue lors du chargement des clients")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [searchQuery])

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Clients</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nouveau Client
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Recherche</CardTitle>
          <CardDescription>Rechercher un client par nom, téléphone ou entreprise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un client..."
              className="pl-8 w-full md:w-1/2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Liste des Clients</CardTitle>
          <CardDescription>
            {loading ? "Chargement..." : `Total: ${clients.length} clients enregistrés`}
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
                  <TableHead>Nom</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Adresse</TableHead>
                  <TableHead className="hidden md:table-cell">Entreprise</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Aucun client trouvé avec les filtres actuels
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                          {client.nom}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-sm">
                            <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                            {client.telephone}
                          </div>
                          <div className="flex items-center text-sm">
                            <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                            {client.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          {client.adresse}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{client.entreprise || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/clients/${client.id}`}>Détails</Link>
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
