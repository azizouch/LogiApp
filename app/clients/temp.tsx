'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { fetchClients, Client } from "@/lib/api";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const result = await fetchClients(searchQuery || undefined, currentPage, pageSize);
        setClients(result.data);
        setTotalCount(result.count || 0);
        setError(null);
      } catch (err: any) {
        console.error("Error loading clients:", err);
        setError(err.message || "Une erreur est survenue lors du chargement des clients");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [searchQuery, currentPage, pageSize]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Clients</h1>
        <Button asChild>
          <Link href="/clients/nouveau">
            <Plus className="mr-2 h-4 w-4" /> Nouveau Client
          </Link>
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
              placeholder="Rechercher un client par nom, téléphone ou email"
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Liste des Clients</CardTitle>
            <CardDescription className="mt-0">
              {loading ? "Chargement..." : `Total: ${totalCount} clients enregistrés`}
            </CardDescription>
          </div>
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
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className="hidden md:table-cell">Téléphone</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Adresse</TableHead>
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
                        <TableCell className="hidden md:table-cell">
                          {client.telephone ? (
                            <div className="flex items-center">
                              <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                              {client.telephone}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Non spécifié</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {client.email ? (
                            <div className="flex items-center">
                              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                              {client.email}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Non spécifié</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {client.adresse ? (
                            <div className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                              {client.adresse}
                              {client.ville ? `, ${client.ville}` : ''}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Non spécifiée</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/clients/${client.id}`}>
                              Détails
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {clients.length > 0 && (
                <div className="mt-4">
                  <DataTablePagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalCount / pageSize)}
                    pageSize={pageSize}
                    totalItems={totalCount}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
