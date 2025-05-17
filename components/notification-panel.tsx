"use client"

import { useEffect } from "react"
import { useNotifications } from "@/contexts/notification-context"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCheck, Trash2, Info, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { NotificationType } from "@/lib/types/notification"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NotificationPanelProps {
  onClose: () => void
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
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

  // Fetch notifications when the panel opens
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Handle clicking on a notification
  const handleNotificationClick = async (id: string, isRead: boolean, link?: string) => {
    if (!isRead) {
      await markAsRead(id)
    }
    
    if (link) {
      onClose()
    }
  }

  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <Card className="shadow-lg border-border animate-in fade-in zoom-in-95 duration-200">
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Notifications
          </CardTitle>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => markAllAsRead()}
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="px-2 py-0 max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <AlertCircle className="h-5 w-5 mx-auto mb-2 text-destructive" />
            <p>Erreur lors du chargement des notifications</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2"
              onClick={() => fetchNotifications()}
            >
              Réessayer
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <p>Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => {
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
                    "block px-4 py-3 hover:bg-muted/50 rounded-md transition-colors relative",
                    !notification.isRead && "bg-muted/30"
                  )}
                  onClick={() => handleNotificationClick(
                    notification.id, 
                    notification.isRead, 
                    notification.link
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={cn(
                          "text-sm",
                          !notification.isRead && "font-medium"
                        )}>
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground -mr-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { 
                          addSuffix: true,
                          locale: fr
                        })}
                      </p>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <span className="absolute right-4 top-3 h-2 w-2 rounded-full bg-primary" />
                  )}
                </NotificationWrapper>
              );
            })}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-3 border-t flex justify-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs w-full"
          onClick={onClose}
        >
          Fermer
        </Button>
      </CardFooter>
    </Card>
  )
}
