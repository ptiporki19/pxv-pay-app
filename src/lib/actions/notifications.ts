'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type NotificationType = 'new_ticket' | 'ticket_reply' | 'ticket_status_change' | 'payment_verification'

export type Notification = {
  id: string
  user_id: string
  title: string
  description: string
  type: NotificationType
  read: boolean
  metadata?: Record<string, any>
  created_at: string
}

export async function createNotification(
  userId: string,
  title: string,
  description: string,
  type: NotificationType,
  metadata?: Record<string, any>
) {
  try {
    // Use the admin client to bypass RLS and insert for any user
    const supabaseAdmin = createAdminClient()
    
    const { error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        description,
        type,
        metadata: metadata || {},
        read: false
      })

    if (error) {
      console.error('Database error creating notification:', error.message)
      throw new Error(`Failed to create notification. Reason: ${error.message}`)
    }

    // Revalidate relevant paths
    revalidatePath('/(admin)/super-admin')
    
    return { success: true }
  } catch (error) {
    // Log the caught error and re-throw
    console.error('Exception in createNotification:', error)
    throw error
  }
}

export async function notifyAllSuperAdmins(
  title: string,
  description: string,
  type: NotificationType,
  metadata?: Record<string, any>
) {
  try {
    const supabase = await createAdminClient()
    
    // Get all users from Supabase Auth
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return { success: false, error: 'Could not fetch users.' }
    }

    // Filter for super admins based on their user metadata
    const superAdmins = users.filter(
      (user) => user.user_metadata?.role === 'super_admin'
    );

    if (!superAdmins.length) {
      console.error('Error: No super admins found to notify.')
      return { success: false, error: 'No super admins found' }
    }

    // Create notifications for all super admins
    const notifications = superAdmins.map((admin) => ({
      user_id: admin.id,
      title,
      description,
      type,
      metadata: metadata || {},
      read: false
    }))

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications)

    if (notificationError) {
      console.error('Error creating notifications for super admins:', notificationError)
      throw new Error('Failed to create notifications')
    }

    // Revalidate notification-related pages
    revalidatePath('/(admin)/super-admin')
    
    return { success: true }
  } catch (error) {
    console.error('Error in notifyAllSuperAdmins:', error)
    throw error
  }
}

export async function notifyUser(
  userId: string,
  title: string,
  description: string,
  type: NotificationType,
  metadata?: Record<string, any>
) {
  try {
    await createNotification(userId, title, description, type, metadata)
    return { success: true }
  } catch (error) {
    console.error('Error in notifyUser:', error)
    throw error
  }
}

export async function getUserNotifications(userId?: string): Promise<Notification[]> {
  try {
    const supabase = await createAdminClient()
    
    // Get current user if no userId provided
    if (!userId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('User not authenticated')
      }
      userId = user.id
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching notifications:', error)
      throw new Error('Failed to fetch notifications')
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserNotifications:', error)
    throw error
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = await createAdminClient()
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      throw new Error('Failed to mark notification as read')
    }

    // Revalidate notification-related pages
    revalidatePath('/dashboard')
    revalidatePath('/super-admin')
    
    return { success: true }
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error)
    throw error
  }
}

export async function markAllNotificationsAsRead(userId?: string) {
  try {
    const supabase = await createAdminClient()
    
    // Get current user if no userId provided
    if (!userId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('User not authenticated')
      }
      userId = user.id
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      throw new Error('Failed to mark notifications as read')
    }

    // Revalidate notification-related pages
    revalidatePath('/dashboard')
    revalidatePath('/super-admin')
    
    return { success: true }
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error)
    throw error
  }
} 
 
 
 
 