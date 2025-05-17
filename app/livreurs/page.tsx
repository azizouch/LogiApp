'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Truck, Plus, Search, Phone, Mail, FileText, Loader2 } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { DataTablePagination } from "@/components/ui/data-table-pagination";

export default function LivreursPage() {
  const [loading, setLoading] = useState(true);
  const [livreurs, setLivreurs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLivreurs, setFilteredLivreurs] = useState<any[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [paginatedLivreurs, setPaginatedLivreurs] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Load livreurs data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch livreurs from utilisateurs table where role is 'Livreur'
        const { data: livreursData, error: livreursError } = await supabase
          .from('utilisateurs')
          .select('*')
          .eq('role', 'Livreur')
          .order('nom');

        if (livreursError) {
          throw livreursError;
        }

        // Get colis counts for each livreur
        const livreursWithCounts = await Promise.all((livreursData || []).map(async (livreur) => {
          // Count colis
          const { count: colisCount, error: colisError } = await supabase
            .from('colis')
            .select('id', { count: 'exact', head: true })
            .eq('livreur_id', livreur.id);

          // Count bons
          const { count: bonsCount, error: bonsError } = await supabase
            .from('bons')
            .select('id', { count: 'exact', head: true })
            .eq('livreur_id', livreur.id);

          // Format the livreur data to match the expected structure
          return {
            id: livreur.id,
            nom: `${livreur.prenom} ${livreur.nom}`,
            telephone: livreur.telephone,
            email: livreur.email,
            vehicule: livreur.vehicule,
            zone: livreur.zone,
            adresse: livreur.adresse,
            ville: livreur.ville,
            nbColis: colisError ? 0 : colisCount || 0,
            nbBons: bonsError ? 0 : bonsCount || 0,
          };
        }));

        setLivreurs(livreursWithCounts);
        setFilteredLivreurs(livreursWithCounts);
      } catch (error: any) {
        console.error('Error loading livreurs:', error);
        toast({
          title: "Erreur lors du chargement des données",
          description: error.message || "Impossible de charger la liste des livreurs",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLivreurs(livreurs);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = livreurs.filter(livreur =>
        livreur.nom.toLowerCase().includes(term) ||
        (livreur.telephone && livreur.telephone.toLowerCase().includes(term)) ||
        (livreur.email && livreur.email.toLowerCase().includes(term))
      );
      setFilteredLivreurs(filtered);
    }

    // Reset to first page when search changes
    if (searchTerm && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, livreurs, currentPage]);

  // Update total count and apply pagination
  useEffect(() => {
    setTotalCount(filteredLivreurs.length);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setPaginatedLivreurs(filteredLivreurs.slice(startIndex, endIndex));
  }, [filteredLivreurs, currentPage, pageSize]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Livreurs</h1>
        <Button asChild>
          <Link href="/livreurs/nouveau">
            <Plus className="mr-2 h-4 w-4" /> Nouveau Livreur
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
              placeholder="Rechercher un livreur par nom ou numéro de téléphone"
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Liste des Livreurs</CardTitle>
            <CardDescription className="mt-0">
              {loading
                ? "Chargement des données..."
                : `Total: ${totalCount} livreur${totalCount > 1 ? 's' : ''} enregistré${totalCount > 1 ? 's' : ''}`
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des données...</span>
            </div>
          ) : filteredLivreurs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm.trim() !== ''
                ? "Aucun livreur ne correspond à votre recherche"
                : "Aucun livreur enregistré"
              }
            </div>
          ) : (
            <>
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
                  {paginatedLivreurs.map((livreur) => (
                  <TableRow key={livreur.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                        {livreur.nom}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        {livreur.telephone && (
                          <div className="flex items-center text-sm">
                            <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                            {livreur.telephone}
                          </div>
                        )}
                        {livreur.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                            {livreur.email}
                          </div>
                        )}
                        {!livreur.telephone && !livreur.email && (
                          <div className="text-sm text-muted-foreground">
                            Aucune information de contact
                          </div>
                        )}
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
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/colis/nouveau?livreur=${livreur.id}`}>
                            Assigner
                          </Link>
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

              {/* Pagination */}
              {filteredLivreurs.length > 0 && (
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
