'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Plus, Search, Phone, Mail, FileText, Loader2, Filter, X, UserPlus } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { AssignerModal } from "@/components/assigner-modal";

export default function LivreursPage() {
  const [loading, setLoading] = useState(true);
  const [livreurs, setLivreurs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState("all");
  const [vehiculeFilter, setVehiculeFilter] = useState("all");
  const [colisCountFilter, setColisCountFilter] = useState("all");
  const [filteredLivreurs, setFilteredLivreurs] = useState<any[]>([]);
  const [isAssignerModalOpen, setIsAssignerModalOpen] = useState(false);
  const [selectedLivreur, setSelectedLivreur] = useState<any>(null);

  // Available filter options
  const [availableZones, setAvailableZones] = useState<string[]>([]);
  const [availableVehicules, setAvailableVehicules] = useState<string[]>([]);

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

        // Extract unique values for filters
        const zones = Array.from(new Set(livreursWithCounts.map(livreur => livreur.zone).filter(Boolean)));
        const vehicules = Array.from(new Set(livreursWithCounts.map(livreur => livreur.vehicule).filter(Boolean)));

        setAvailableZones(zones);
        setAvailableVehicules(vehicules);
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

  // Handle search and filters
  useEffect(() => {
    let filtered = [...livreurs];

    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(livreur =>
        livreur.nom.toLowerCase().includes(term) ||
        (livreur.telephone && livreur.telephone.toLowerCase().includes(term)) ||
        (livreur.email && livreur.email.toLowerCase().includes(term))
      );
    }

    // Apply zone filter
    if (zoneFilter && zoneFilter !== "all") {
      filtered = filtered.filter(livreur => livreur.zone === zoneFilter);
    }

    // Apply vehicule filter
    if (vehiculeFilter && vehiculeFilter !== "all") {
      filtered = filtered.filter(livreur => livreur.vehicule === vehiculeFilter);
    }

    // Apply colis count filter
    if (colisCountFilter && colisCountFilter !== "all") {
      switch (colisCountFilter) {
        case "none":
          filtered = filtered.filter(livreur => livreur.nbColis === 0);
          break;
        case "low":
          filtered = filtered.filter(livreur => livreur.nbColis > 0 && livreur.nbColis <= 5);
          break;
        case "medium":
          filtered = filtered.filter(livreur => livreur.nbColis > 5 && livreur.nbColis <= 20);
          break;
        case "high":
          filtered = filtered.filter(livreur => livreur.nbColis > 20);
          break;
      }
    }

    setFilteredLivreurs(filtered);

    // Reset to first page when filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, zoneFilter, vehiculeFilter, colisCountFilter, livreurs]);

  // Update total count and apply pagination
  useEffect(() => {
    setTotalCount(filteredLivreurs.length);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setPaginatedLivreurs(filteredLivreurs.slice(startIndex, endIndex));
  }, [filteredLivreurs, currentPage, pageSize]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setZoneFilter('all');
    setVehiculeFilter('all');
    setColisCountFilter('all');
  };

  // Handle assigner click
  const handleAssignerClick = (livreur: any) => {
    setSelectedLivreur(livreur);
    setIsAssignerModalOpen(true);
  };

  // Function to shorten UUID for display
  const shortenId = (id: string) => {
    if (!id) return 'N/A';
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold sm:text-2xl">Gestion des Livreurs</h1>
        <Button asChild>
          <Link href="/livreurs/nouveau">
            <Plus className="mr-2 h-4 w-4" /> Nouveau Livreur
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-medium flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtres
          </div>
          {(searchTerm || zoneFilter !== "all" || vehiculeFilter !== "all" || colisCountFilter !== "all") && (
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
            <Select value={zoneFilter} onValueChange={setZoneFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les zones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les zones</SelectItem>
                {availableZones.map(zone => (
                  <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:flex-1">
            <Select value={vehiculeFilter} onValueChange={setVehiculeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les véhicules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les véhicules</SelectItem>
                {availableVehicules.map(vehicule => (
                  <SelectItem key={vehicule} value={vehicule}>{vehicule}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:flex-1">
            <Select value={colisCountFilter} onValueChange={setColisCountFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Nombre de colis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les nombres</SelectItem>
                <SelectItem value="none">Aucun colis (0)</SelectItem>
                <SelectItem value="low">Peu de colis (1-5)</SelectItem>
                <SelectItem value="medium">Moyen (6-20)</SelectItem>
                <SelectItem value="high">Beaucoup (20+)</SelectItem>
              </SelectContent>
            </Select>
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
                    <TableHead>ID</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="hidden md:table-cell">Activité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLivreurs.map((livreur) => (
                  <TableRow key={livreur.id}>
                    <TableCell className="font-medium text-sm text-muted-foreground">
                      <span title={livreur.id}>{shortenId(livreur.id)}</span>
                    </TableCell>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignerClick(livreur)}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
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

      {/* Assigner Modal */}
      {selectedLivreur && (
        <AssignerModal
          isOpen={isAssignerModalOpen}
          onClose={() => {
            setIsAssignerModalOpen(false);
            setSelectedLivreur(null);
          }}
          livreurId={selectedLivreur.id}
          livreurName={selectedLivreur.nom}
          onSuccess={() => {
            // Refresh the data when a colis is assigned
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
