"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { Notification, NotificationType } from '@/lib/types/notification'
import { useAuth } from '@/contexts/auth-context'

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  createNotification: (
    title: string,
    message: string,
    type: NotificationType,
    link?: string
  ) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications()
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user])

  // Fetch notifications from the database
  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
        throw fetchError
      }

      // Transform data to match our interface
      const formattedNotifications = data.map((notification: any): Notification => ({
        id: notification.id,
        userId: notification.user_id,
        title: notification.title,
        message: notification.message,
        type: notification.type as NotificationType,
        link: notification.link,
        isRead: notification.is_read,
        createdAt: notification.created_at,
        readAt: notification.read_at
      }))

      setNotifications(formattedNotifications)
      
      // Calculate unread count
      const unread = formattedNotifications.filter(n => !n.isRead).length
      setUnreadCount(unread)
    } catch (err: any) {
      console.error('Error fetching notifications:', err)
      setError(err.message || 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    if (!user) return

    try {
      const now = new Date().toISOString()
      
      // Update in database
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: now
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) {
        throw updateError
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true, readAt: now } 
            : notification
        )
      )

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err: any) {
      console.error('Error marking notification as read:', err)
      setError(err.message || 'Failed to mark notification as read')
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return

    try {
      const now = new Date().toISOString()
      
      // Update in database
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: now
        })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (updateError) {
        throw updateError
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          isRead: true, 
          readAt: notification.isRead ? notification.readAt : now 
        }))
      )

      // Reset unread count
      setUnreadCount(0)
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err)
      setError(err.message || 'Failed to mark all notifications as read')
    }
  }

  // Delete a notification
  const deleteNotification = async (id: string) => {
    if (!user) return

    try {
      // Delete from database
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        throw deleteError
      }

      // Check if the deleted notification was unread
      const wasUnread = notifications.find(n => n.id === id && !n.isRead)
      
      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== id))
      
      // Update unread count if needed
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err: any) {
      console.error('Error deleting notification:', err)
      setError(err.message || 'Failed to delete notification')
    }
  }

  // Create a new notification
  const createNotification = async (
    title: string,
    message: string,
    type: NotificationType,
    link?: string
  ) => {
    if (!user) return

    try {
      const newNotification = {
        user_id: user.id,
        title,
        message,
        type,
        link,
        is_read: false
      }
      
      // Insert into database
      const { data, error: insertError } = await supabase
        .from('notifications')
        .insert(newNotification)
        .select()

      if (insertError) {
        throw insertError
      }

      // Transform the returned data
      const formattedNotification: Notification = {
        id: data[0].id,
        userId: data[0].user_id,
        title: data[0].title,
        message: data[0].message,
        type: data[0].type,
        link: data[0].link,
        isRead: data[0].is_read,
        createdAt: data[0].created_at,
        readAt: data[0].read_at
      }

      // Update local state
      setNotifications(prev => [formattedNotification, ...prev])
      
      // Update unread count
      setUnreadCount(prev => prev + 1)
    } catch (err: any) {
      console.error('Error creating notification:', err)
      setError(err.message || 'Failed to create notification')
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        createNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
