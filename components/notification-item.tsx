"use client"

import { Notification } from "@/lib/types/notification"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Info, AlertCircle, CheckCircle, AlertTriangle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationItem({ notification, onRead, onDelete }: NotificationItemProps) {
  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
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

  // Handle clicking on a notification
  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id)
    }
  }

  // Format the date
  const formattedDate = formatDistanceToNow(new Date(notification.createdAt), { 
    addSuffix: true,
    locale: fr
  })

  // Determine the component to use (Link or div)
  const Component = notification.link ? Link : 'div'
  const componentProps = notification.link ? { href: notification.link } : {}

  return (
    <Component
      {...componentProps}
      className={cn(
        "block px-4 py-3 hover:bg-muted/50 rounded-md transition-colors relative",
        !notification.isRead && "bg-muted/30"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {getIcon()}
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
                e.stopPropagation()
                e.preventDefault()
                onDelete(notification.id)
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
            {formattedDate}
          </p>
        </div>
      </div>
      {!notification.isRead && (
        <span className="absolute right-4 top-3 h-2 w-2 rounded-full bg-primary" />
      )}
    </Component>
  )
}
