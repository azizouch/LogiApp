"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, UserCog, Eye, Ban } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

export default function TrackUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Dummy data for demonstration - this doesn't change
  const users = [
    {
      id: 1,
      name: "Jean Dupont",
      email: "jean.dupont@example.com",
      role: "Admin",
      lastActive: "Il y a 5 minutes",
      status: "En ligne"
    },
    {
      id: 2,
      name: "Marie Martin",
      email: "marie.martin@example.com",
      role: "Gestionnaire",
      lastActive: "Il y a 2 heures",
      status: "Hors ligne"
    },
    {
      id: 3,
      name: "Pierre Durand",
      email: "pierre.durand@example.com",
      role: "Livreur",
      lastActive: "Il y a 1 jour",
      status: "Hors ligne"
    },
    {
      id: 4,
      name: "Sophie Laurent",
      email: "sophie.laurent@example.com",
      role: "Gestionnaire",
      lastActive: "Il y a 30 minutes",
      status: "En ligne"
    },
    {
      id: 5,
      name: "Thomas Bernard",
      email: "thomas.bernard@example.com",
      role: "Livreur",
      lastActive: "Il y a 4 heures",
      status: "Hors ligne"
    },
  ]

  // Filter users based on search term - using useMemo to avoid recalculation on every render
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [users, searchTerm])

  // Calculate total count
  const totalCount = filteredUsers.length

  // Reset to first page when search changes
  useEffect(() => {
    if (searchTerm && currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [searchTerm, currentPage])

  // Apply pagination - using useMemo to avoid recalculation on every render
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredUsers.slice(startIndex, endIndex)
  }, [filteredUsers, currentPage, pageSize])

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suivi des utilisateurs</h1>
          <p className="text-muted-foreground mt-1">
            Suivez et gérez l'activité des utilisateurs de la plateforme
          </p>
        </div>
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
              placeholder="Recherchez des utilisateurs par nom, email ou rôle"
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
            <CardTitle>Liste des utilisateurs</CardTitle>
            <CardDescription className="mt-0">
              Total: {totalCount} utilisateurs trouvés
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {totalCount === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Aucun utilisateur ne correspond à votre recherche" : "Aucun utilisateur trouvé"}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Dernière activité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "Admin" ? "destructive" : user.role === "Gestionnaire" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.lastActive}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === "En ligne"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                        }`}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <UserCog className="h-4 w-4" />
                          <span className="sr-only">Gérer</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Ban className="h-4 w-4" />
                          <span className="sr-only">Bloquer</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalCount > 0 && (
                <div className="mt-4">
                  <DataTablePagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalCount / pageSize)}
                    pageSize={pageSize}
                    totalItems={totalCount}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
