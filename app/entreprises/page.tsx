'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Search, MapPin, Package, Loader2 } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { DataTablePagination } from "@/components/ui/data-table-pagination";

export default function EntreprisesPage() {
  const [entreprises, setEntreprises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // First get the total count
        let countQuery = supabase
          .from('entreprises')
          .select('*', { count: 'exact', head: true });

        // Add search filter if query exists
        if (searchQuery) {
          countQuery = countQuery.or(`nom.ilike.%${searchQuery}%,contact.ilike.%${searchQuery}%`);
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          throw countError;
        }

        setTotalCount(count || 0);

        // Then get the paginated data
        let query = supabase
          .from('entreprises')
          .select('*');

        // Add search filter if query exists
        if (searchQuery) {
          query = query.or(`nom.ilike.%${searchQuery}%,contact.ilike.%${searchQuery}%`);
        }

        // Apply pagination
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await query
          .order('nom')
          .range(from, to);

        if (error) {
          throw error;
        }

        // For each enterprise, get the count of colis
        const entreprisesWithStats = await Promise.all(
          (data || []).map(async (entreprise) => {
            const { count: colisCount } = await supabase
              .from('colis')
              .select('*', { count: 'exact', head: true })
              .eq('entreprise_id', entreprise.id);

            return {
              ...entreprise,
              nbColis: colisCount || 0,
              // Client count will be implemented when client-enterprise relationship is added
              nbClients: 0,
            };
          })
        );

        setEntreprises(entreprisesWithStats);
        setError(null);
      } catch (err: any) {
        console.error('Error loading enterprises:', err);
        setError(err.message || 'Une erreur est survenue lors du chargement des entreprises');
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Reset to first page when search query changes
    if (searchQuery && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery, currentPage, pageSize]);
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Entreprises</h1>
        <Button asChild>
          <Link href="/entreprises/nouveau">
            <Plus className="mr-2 h-4 w-4" /> Nouvelle Entreprise
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
              placeholder="Rechercher une entreprise par nom ou contact"
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
            <CardTitle>Liste des Entreprises</CardTitle>
            <CardDescription className="mt-0">
              {loading ? "Chargement..." : `Total: ${totalCount} entreprises enregistrées`}
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
                    <TableHead className="hidden md:table-cell">Adresse</TableHead>
                    <TableHead>Contact Principal</TableHead>
                    <TableHead className="hidden md:table-cell">Colis</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entreprises.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Aucune entreprise trouvée avec les filtres actuels
                      </TableCell>
                    </TableRow>
                  ) : (
                    entreprises.map((entreprise) => (
                      <TableRow key={entreprise.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                            {entreprise.nom}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {entreprise.adresse ? (
                            <div className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                              {entreprise.adresse}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Non spécifiée</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {entreprise.contact || <span className="text-muted-foreground">Non spécifié</span>}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <Package className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span>{entreprise.nbColis}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/entreprises/${entreprise.id}`}>Détails</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {entreprises.length > 0 && (
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
