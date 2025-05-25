"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'
import { Package, Plus, UserPlus, Loader2, Search } from 'lucide-react'

interface AssignerModalProps {
  isOpen: boolean
  onClose: () => void
  livreurId: string
  livreurName: string
  onSuccess?: () => void
}

export function AssignerModal({
  isOpen,
  onClose,
  livreurId,
  livreurName,
  onSuccess
}: AssignerModalProps) {
  const [unassignedColis, setUnassignedColis] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Load unassigned colis
  useEffect(() => {
    if (isOpen) {
      loadUnassignedColis()
    }
  }, [isOpen])

  const loadUnassignedColis = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('colis')
        .select(`
          id,
          client:client_id(nom, telephone, adresse, ville),
          entreprise:entreprise_id(nom),
          prix,
          frais,
          statut,
          date_creation
        `)
        .is('livreur_id', null)
        .order('date_creation', { ascending: false })

      if (error) {
        throw error
      }

      setUnassignedColis(data || [])
    } catch (error: any) {
      console.error('Error loading unassigned colis:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les colis non assignés",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssignColis = async (colisId: string) => {
    setAssigning(colisId)
    try {
      const { error } = await supabase
        .from('colis')
        .update({ livreur_id: livreurId })
        .eq('id', colisId)

      if (error) {
        throw error
      }

      toast({
        title: "Succès",
        description: "Colis assigné avec succès",
      })

      // Remove the assigned colis from the list
      setUnassignedColis(prev => prev.filter(colis => colis.id !== colisId))
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error assigning colis:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'assigner le colis",
        variant: "destructive"
      })
    } finally {
      setAssigning(null)
    }
  }

  const filteredColis = unassignedColis.filter(colis =>
    colis.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colis.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colis.entreprise?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Assigner des colis à {livreurName}
            </DialogTitle>
            <DialogDescription>
              Sélectionnez les colis à assigner à ce livreur ou créez un nouveau colis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un colis..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau colis
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Chargement...</span>
              </div>
            ) : filteredColis.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucun colis disponible</h3>
                    <p className="text-muted-foreground mb-4">
                      Tous les colis sont déjà assignés ou aucun colis ne correspond à votre recherche.
                    </p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer un nouveau colis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Colis non assignés</CardTitle>
                  <CardDescription>
                    {filteredColis.length} colis disponibles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Entreprise</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredColis.map((colis) => (
                        <TableRow key={colis.id}>
                          <TableCell className="font-medium">{colis.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{colis.client?.nom || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">
                                {colis.client?.telephone || ''}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{colis.entreprise?.nom || 'N/A'}</TableCell>
                          <TableCell>{colis.prix || 0} €</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {colis.statut || 'En attente'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleAssignColis(colis.id)}
                              disabled={assigning === colis.id}
                            >
                              {assigning === colis.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Assignation...
                                </>
                              ) : (
                                <>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Assigner
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Colis Modal */}
      <CreateColisModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        livreurId={livreurId}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          loadUnassignedColis()
          if (onSuccess) {
            onSuccess()
          }
        }}
      />
    </>
  )
}

// Placeholder for CreateColisModal - you'll need to implement this
function CreateColisModal({ isOpen, onClose, livreurId, onSuccess }: {
  isOpen: boolean
  onClose: () => void
  livreurId: string
  onSuccess: () => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau colis</DialogTitle>
          <DialogDescription>
            Cette fonctionnalité sera implémentée prochainement.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
