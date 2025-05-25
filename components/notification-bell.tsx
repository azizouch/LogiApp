"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/contexts/notification-context"
import { NotificationPanel } from "@/components/notification-panel"
import { cn } from "@/lib/utils"

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { unreadCount } = useNotifications()

  const togglePanel = () => {
    setIsOpen(!isOpen)
  }

  const closePanel = () => {
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className={cn("relative", className)}
        onClick={togglePanel}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop for closing the panel when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={closePanel}
            aria-hidden="true"
          />

          {/* Notification panel */}
          <div className="absolute right-0 z-50 mt-2 w-80 md:w-96">
            <NotificationPanel onClose={closePanel} />
          </div>
        </>
      )}
    </div>
  )
}
