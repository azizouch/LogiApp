'use client'

import { useState, useEffect } from "react"
import { useNotifications } from "@/contexts/notification-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DataTablePagination } from "@/components/data-table-pagination"
import { 
  Bell, 
  Search, 
  Filter, 
  X, 
  Loader2, 
  CheckCheck, 
  Trash2, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle,
  Calendar
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { fr } from "date-fns/locale"
import { NotificationType } from "@/lib/types/notification"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications()

  // State for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [readFilter, setReadFilter] = useState<string>("all")
  const [sortOption, setSortOption] = useState<string>("newest")
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  // Fetch notifications on mount and when filters change
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Handle clicking on a notification
  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(id)
    }
  }

  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  // Filter and sort notifications
  const filteredNotifications = notifications.filter(notification => {
    // Filter by search query
    const matchesSearch = searchQuery === "" || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filter by type
    const matchesType = typeFilter === "all" || notification.type === typeFilter
    
    // Filter by read status
    const matchesReadStatus = 
      readFilter === "all" || 
      (readFilter === "read" && notification.isRead) || 
      (readFilter === "unread" && !notification.isRead)
    
    return matchesSearch && matchesType && matchesReadStatus
  })

  // Sort notifications
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (sortOption === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (sortOption === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    } else if (sortOption === "unread") {
      return (a.isRead === b.isRead) ? 0 : a.isRead ? 1 : -1
    }
    return 0
  })

  // Calculate total count and paginate
  const totalFilteredCount = sortedNotifications.length
  const paginatedNotifications = sortedNotifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Update total count for pagination
  useEffect(() => {
    setTotalCount(totalFilteredCount)
    
    // Reset to first page when filters change
    if (currentPage > 1 && totalFilteredCount <= pageSize) {
      setCurrentPage(1)
    }
  }, [totalFilteredCount, pageSize])

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("")
    setTypeFilter("all")
    setReadFilter("all")
    setSortOption("newest")
  }

  // Delete all read notifications
  const deleteAllRead = async () => {
    const readNotifications = notifications.filter(n => n.isRead)
    if (readNotifications.length === 0) return
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${readNotifications.length} notifications lues ?`)) {
      for (const notification of readNotifications) {
        await deleteNotification(notification.id)
      }
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-2">
              Gérez toutes vos notifications
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Tout marquer comme lu
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={deleteAllRead}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer les lues
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-medium flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtres
          </div>
          <Button variant="outline" onClick={resetFilters} size="sm">
            <X className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="info">Information</SelectItem>
              <SelectItem value="success">Succès</SelectItem>
              <SelectItem value="warning">Avertissement</SelectItem>
              <SelectItem value="error">Erreur</SelectItem>
            </SelectContent>
          </Select>
          <Select value={readFilter} onValueChange={setReadFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="read">Lues</SelectItem>
              <SelectItem value="unread">Non lues</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger>
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récentes</SelectItem>
              <SelectItem value="oldest">Plus anciennes</SelectItem>
              <SelectItem value="unread">Non lues d'abord</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Toutes les notifications
            <Badge variant="secondary" className="ml-2">
              {totalFilteredCount}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des notifications...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <p>Erreur lors du chargement des notifications</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => fetchNotifications()}
              >
                Réessayer
              </Button>
            </div>
          ) : paginatedNotifications.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p>Aucune notification trouvée</p>
            </div>
          ) : (
            <div className="space-y-1">
              {paginatedNotifications.map((notification) => {
                const NotificationWrapper = notification.link 
                  ? Link 
                  : 'div';
                
                const wrapperProps = notification.link 
                  ? { href: notification.link } 
                  : {};
                  
                return (
                  <NotificationWrapper
                    key={notification.id}
                    {...wrapperProps}
                    className={cn(
                      "flex items-start gap-4 p-4 hover:bg-muted/50 rounded-md transition-colors relative",
                      !notification.isRead && "bg-muted/30"
                    )}
                    onClick={() => handleNotificationClick(
                      notification.id, 
                      notification.isRead
                    )}
                  >
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={cn(
                          "text-base",
                          !notification.isRead && "font-medium"
                        )}>
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm')}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Supprimer</span>
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </NotificationWrapper>
                );
              })}
            </div>
          )}
          
          {/* Pagination */}
          {totalCount > 0 && (
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
        </CardContent>
      </Card>
    </div>
  )
}
