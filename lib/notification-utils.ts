import { supabase } from '@/lib/supabase'
import { NotificationType } from '@/lib/types/notification'

/**
 * Create a notification for a specific user
 */
export async function createNotification({
  userId,
  title,
  message,
  type,
  link
}: {
  userId: string
  title: string
  message: string
  type: NotificationType
  link?: string
}) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        link,
        is_read: false
      })
      .select()

    if (error) {
      console.error('Error creating notification:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (err) {
    console.error('Error creating notification:', err)
    return { success: false, error: err }
  }
}

/**
 * Create notifications for multiple users
 */
export async function createNotificationForUsers({
  userIds,
  title,
  message,
  type,
  link
}: {
  userIds: string[]
  title: string
  message: string
  type: NotificationType
  link?: string
}) {
  try {
    // Remove duplicate user IDs if any
    const uniqueUserIds = [...new Set(userIds)];

    // Check for existing similar notifications in the last minute to prevent duplicates
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

    // Get recent notifications for these users with similar content
    const { data: recentNotifications } = await supabase
      .from('notifications')
      .select('user_id, title, message')
      .in('user_id', uniqueUserIds)
      .gt('created_at', oneMinuteAgo)
      .order('created_at', { ascending: false });

    // Filter out users who already have a similar notification
    const usersToNotify = uniqueUserIds.filter(userId => {
      if (!recentNotifications) return true;

      // Check if this user already has a similar notification
      return !recentNotifications.some(n =>
        n.user_id === userId &&
        n.title === title &&
        n.message === message
      );
    });

    // If no users to notify after filtering, return success
    if (usersToNotify.length === 0) {
      console.log('No new notifications to create - similar ones exist');
      return { success: true, message: 'No new notifications needed' };
    }

    // Create notifications for each remaining user
    const notifications = usersToNotify.map(userId => ({
      user_id: userId,
      title,
      message,
      type,
      link,
      is_read: false
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {
      console.error('Error creating notifications for users:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Error creating notifications for users:', err);
    return { success: false, error: err };
  }
}

/**
 * Create a notification for all users with a specific role
 */
export async function createNotificationForRole({
  role,
  title,
  message,
  type,
  link
}: {
  role: string
  title: string
  message: string
  type: NotificationType
  link?: string
}) {
  try {
    // First, get all users with the specified role
    const { data: users, error: usersError } = await supabase
      .from('utilisateurs')
      .select('id')
      .eq('role', role)

    if (usersError) {
      console.error('Error fetching users by role:', usersError)
      return { success: false, error: usersError }
    }

    if (!users || users.length === 0) {
      return { success: true, message: 'No users found with this role' }
    }

    // Create notifications for each user
    const userIds = users.map(user => user.id)
    return await createNotificationForUsers({
      userIds,
      title,
      message,
      type,
      link
    })
  } catch (err) {
    console.error('Error creating notifications for role:', err)
    return { success: false, error: err }
  }
}

/**
 * Create a reclamation notification
 * This function creates notifications for a reclamation about a colis
 */
export async function createReclamationNotification({
  colisId,
  livreurId,
  message,
  type = 'warning'
}: {
  colisId: string
  livreurId: string
  message: string
  type?: NotificationType
}) {
  try {
    // Check for recent similar notifications to prevent duplicates
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data: recentNotifications, error: recentError } = await supabase
      .from('notifications')
      .select('id, message')
      .eq('user_id', livreurId)
      .gt('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: false })

    if (!recentError && recentNotifications && recentNotifications.length > 0) {
      // Check if there's a very similar message recently submitted
      const similarNotification = recentNotifications.find(n =>
        n.message.includes(colisId) &&
        n.message.includes(message.substring(0, 10))
      )

      if (similarNotification) {
        console.log('Preventing duplicate reclamation notification')
        return { success: true, message: 'Duplicate notification prevented' }
      }
    }

    // Get the livreur details
    const { data: livreur, error: livreurError } = await supabase
      .from('utilisateurs')
      .select('id, nom, prenom')
      .eq('id', livreurId)
      .single()

    if (livreurError) {
      console.error('Error fetching livreur details:', livreurError)
      return { success: false, error: livreurError }
    }

    const livreurName = `${livreur.prenom} ${livreur.nom}`

    // Get the colis details
    const { data: colis, error: colisError } = await supabase
      .from('colis')
      .select('id, client_id')
      .eq('id', colisId)
      .single()

    if (colisError) {
      console.error('Error fetching colis details:', colisError)
      return { success: false, error: colisError }
    }

    // Get all admins and gestionnaires
    const { data: admins, error: adminsError } = await supabase
      .from('utilisateurs')
      .select('id')
      .in('role', ['Admin', 'Gestionnaire'])

    if (adminsError) {
      console.error('Error fetching admins and gestionnaires:', adminsError)
      return { success: false, error: adminsError }
    }

    if (!admins || admins.length === 0) {
      return { success: true, message: 'No admins or gestionnaires found' }
    }

    // Create notifications for each admin and gestionnaire
    const title = `Réclamation pour colis ${colisId}`
    const notificationMessage = `${livreurName} a signalé un problème: ${message}`

    const userIds = admins.map(admin => admin.id)
    return await createNotificationForUsers({
      userIds,
      title,
      message: notificationMessage,
      type,
      link: `/colis/${colisId}`
    })
  } catch (err) {
    console.error('Error creating reclamation notification:', err)
    return { success: false, error: err }
  }
}
