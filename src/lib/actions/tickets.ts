'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface Ticket {
  id: string
  user_id: string
  category_id: string
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'closed'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
  user_email?: string
  user?: {
    email: string
  }
  category?: {
    id: string
    name: string
  }
  messages?: TicketMessage[]
}

export interface TicketMessage {
  id: string
  ticket_id: string
  user_id: string
  message: string
  is_admin_reply: boolean
  created_at: string
  user_email?: string
}

export interface TicketCategory {
  id: string
  name: string
  description?: string
  created_at: string
}

interface GetAllTicketsParams {
  status?: string
  category?: string
  search?: string
}

export async function getAllTickets(params: GetAllTicketsParams = {}) {
  try {
    const supabase = await createAdminClient()
    
    // Build the query
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        category:support_categories(id, name)
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (params.status && params.status !== 'all') {
      query = query.eq('status', params.status)
    }

    if (params.category && params.category !== 'all') {
      query = query.eq('category_id', params.category)
    }

    if (params.search) {
      query = query.or(`subject.ilike.%${params.search}%,message.ilike.%${params.search}%`)
    }

    const { data: tickets, error } = await query

    if (error) {
      console.error('Error fetching tickets:', error)
      throw new Error('Failed to fetch tickets')
    }

    // Get user emails for each ticket using admin client
    const ticketsWithEmails = await Promise.all(
      (tickets || []).map(async (ticket) => {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(ticket.user_id)
          return {
            ...ticket,
            user_email: userData.user?.email || 'Unknown',
            user: {
              email: userData.user?.email || 'Unknown'
            }
          }
        } catch (error) {
          console.error(`Error fetching user data for ticket ${ticket.id}:`, error)
          return {
            ...ticket,
            user_email: 'Unknown',
            user: {
              email: 'Unknown'
            }
          }
        }
      })
    )

    return ticketsWithEmails as Ticket[]
  } catch (error) {
    console.error('Error in getAllTickets:', error)
    return []
  }
}

export async function getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  try {
    const supabase = await createAdminClient()
    
    const { data: messages, error } = await supabase
      .from('support_ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching ticket messages:', error)
      throw new Error('Failed to fetch ticket messages')
    }

    // Get user emails for each message using admin client
    const messagesWithEmails = await Promise.all(
      (messages || []).map(async (message) => {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(message.user_id)
          return {
            ...message,
            user_email: userData.user?.email || 'Unknown'
          }
        } catch (error) {
          console.error(`Error fetching user data for message ${message.id}:`, error)
          return {
            ...message,
            user_email: 'Unknown'
          }
        }
      })
    )

    return messagesWithEmails as TicketMessage[]
  } catch (error) {
    console.error('Error in getTicketMessages:', error)
    return []
  }
}

export async function updateTicketStatus(ticketId: string, status: 'open' | 'in_progress' | 'closed') {
  try {
    const supabase = await createAdminClient()
    
    const { error } = await supabase
      .from('support_tickets')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)

    if (error) {
      console.error('Error updating ticket status:', error)
      throw new Error('Failed to update ticket status')
    }

    revalidatePath('/super-admin/support-tickets')
    return { success: true }
  } catch (error) {
    console.error('Error in updateTicketStatus:', error)
    return { success: false, error: 'Failed to update ticket status' }
  }
}

export async function closeTicket(ticketId: string) {
  return updateTicketStatus(ticketId, 'closed')
}

export async function replyToTicket(formData: FormData) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('You must be logged in to reply to tickets')
    }

    // Import email service for support notifications
    const { emailService } = await import('@/lib/email-service')

    // Extract data from FormData
    const ticket_id = formData.get('ticket_id') as string
    const message = formData.get('message') as string

    if (!ticket_id || !message) {
      throw new Error('Ticket ID and message are required')
    }

    console.log('💬 Replying to ticket for user:', {
      id: user.id,
      email: user.email
    })

    // Use admin client for database operations
    const adminSupabase = await createAdminClient()
    
    // Use the auth user ID directly since we removed foreign key constraints
    const actualUserId = user.id
    
    // Try to get user role from users table, but don't fail if not found
    let userRole = 'registered_user' // Default role
    try {
      const { data: userData } = await adminSupabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (userData?.role) {
        userRole = userData.role
      }
    } catch (roleError) {
      console.log('⚠️ Could not fetch user role, using default:', roleError)
    }
    
    console.log('💬 Using user ID:', actualUserId, 'with role:', userRole)
    
    // Get the ticket first to get user information and check permissions
    const { data: ticket, error: ticketError } = await adminSupabase
      .from('support_tickets')
      .select('user_id, subject')
      .eq('id', ticket_id)
      .single()

    if (ticketError || !ticket) {
      console.error('Error fetching ticket:', ticketError)
      throw new Error('Ticket not found')
    }

    // Check if user owns this ticket (for regular users) or is super admin
    const isOwner = ticket.user_id === actualUserId
    const isSuperAdmin = userRole === 'super_admin'

    console.log('💬 Permission check:', {
      ticketUserId: ticket.user_id,
      actualUserId: actualUserId,
      userRole: userRole,
      isOwner: isOwner,
      isSuperAdmin: isSuperAdmin
    })

    if (!isOwner && !isSuperAdmin) {
      console.error('❌ Permission denied:', {
        ticketUserId: ticket.user_id,
        actualUserId: actualUserId,
        userRole: userRole
      })
      throw new Error('You do not have permission to reply to this ticket')
    }

    console.log('✅ Permission granted for reply')

    // Add the reply message
    const { error: messageError } = await adminSupabase
      .from('support_ticket_messages')
      .insert({
        ticket_id: ticket_id,
        user_id: actualUserId, // Use the users table ID
        message,
        is_admin_reply: isSuperAdmin
      })

    if (messageError) {
      console.error('Error adding reply message:', messageError)
      throw new Error('Failed to add reply message')
    }

    // Update ticket status to in_progress if it was open and this is an admin reply
    if (isSuperAdmin) {
      const { data: currentTicket } = await adminSupabase
        .from('support_tickets')
        .select('status')
        .eq('id', ticket_id)
        .single()

      if (currentTicket?.status === 'open') {
        await adminSupabase
          .from('support_tickets')
          .update({ 
            status: 'in_progress',
            updated_at: new Date().toISOString()
          })
          .eq('id', ticket_id)
      }

      // 🔔 Send notification to ticket owner (user)
      console.log('🔔 Sending support ticket reply notifications...');
      
      try {
        await adminSupabase
          .from('notifications')
          .insert({
            user_id: ticket.user_id, // This is already the users table ID
            title: 'Support Reply Received',
            message: `You received a reply to your ticket: "${ticket.subject}"`,
            type: 'info',
            data: {
              ticket_id: ticket_id,
              subject: ticket.subject,
              reply_preview: message.substring(0, 100) + (message.length > 100 ? '...' : '')
            }
          });

        console.log('✅ User notification sent successfully');
      } catch (notificationError) {
        console.error('⚠️ Notification sending failed (reply still created):', notificationError);
        // Don't fail the reply creation if notifications fail
      }

      // 📧 Send email notification to user about admin reply
      try {
        // Get user email from auth
        const { data: userData } = await adminSupabase.auth.admin.getUserById(ticket.user_id)
        if (userData.user?.email) {
          const userName = userData.user.email.split('@')[0] || 'User'
          await emailService.sendSupportReplyNotificationEmail(
            userData.user.email,
            userName,
            {
              ticketId: ticket_id,
              subject: ticket.subject,
              replyPreview: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
              isAdminReply: true
            }
          )
          console.log('✅ Support reply email sent to user')
        }
      } catch (emailError) {
        console.error('⚠️ Failed to send reply email to user:', emailError)
        // Don't fail reply creation if email fails
      }
    } else {
      // If it's a user reply, notify super admins
      console.log('🔔 Sending user reply notifications to super admins...');
      
      try {
        const { data: superAdmins } = await adminSupabase
          .from('users')
          .select('id')
          .eq('role', 'super_admin');

        if (superAdmins && superAdmins.length > 0) {
          const superAdminNotifications = superAdmins.map((admin: any) => ({
            user_id: admin.id,
            title: 'New User Reply',
            message: `User replied to ticket: "${ticket.subject}"`,
            type: 'info',
            data: {
              ticket_id: ticket_id,
              subject: ticket.subject,
              reply_preview: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
              user_id: actualUserId
            }
          }));

          await adminSupabase
            .from('notifications')
            .insert(superAdminNotifications);

          console.log('✅ Super admin notifications sent successfully');
        }
      } catch (notificationError) {
        console.error('⚠️ Notification sending failed (reply still created):', notificationError);
      }
    }

    revalidatePath('/(admin)/super-admin/support-tickets')
    return { success: true }
  } catch (error) {
    console.error('Error in replyToTicket:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send reply' }
  }
}

export async function createTicket(formData: FormData) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('You must be logged in to create a ticket')
    }

    // Extract data from FormData
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string
    const category_id = formData.get('category_id') as string

    if (!subject || !message || !category_id) {
      throw new Error('All fields are required')
    }

    console.log('🎫 Creating ticket for user:', {
      id: user.id,
      email: user.email
    })

    // Use the admin client for database operations and notifications
    const adminSupabase = await createAdminClient()
    
    // Import email service for support notifications
    const { emailService } = await import('@/lib/email-service')
    
    // Use the auth user ID directly since we removed foreign key constraints
    const actualUserId = user.id
    
    console.log('🎫 Using user ID:', actualUserId)
    
    const { data: ticket, error } = await adminSupabase
      .from('support_tickets')
      .insert({
        user_id: actualUserId, // Use the users table ID
        subject,
        message,
        category_id,
        status: 'open',
        priority: 'medium'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating ticket:', error)
      throw new Error('Failed to create ticket')
    }

    // 🔔 Send real-time notifications and emails
    console.log('🔔 Sending new support ticket notifications...');
    
    // 📧 Send email confirmation to user
    try {
      const userName = user.email?.split('@')[0] || 'User'
      await emailService.sendSupportTicketConfirmationEmail(
        user.email!,
        userName,
        {
          ticketId: ticket.id,
          subject: ticket.subject,
          category: category_id, // We'll improve this to get actual category name
          priority: ticket.priority
        }
      )
      console.log('✅ Support ticket confirmation email sent to user')
    } catch (emailError) {
      console.error('⚠️ Failed to send confirmation email to user:', emailError)
      // Don't fail ticket creation if email fails
    }
    
    try {
      // Get super admins and send notifications to them
      const { data: superAdmins } = await adminSupabase
        .from('users')
        .select('id')
        .eq('role', 'super_admin');

      if (superAdmins && superAdmins.length > 0) {
        const superAdminNotifications = superAdmins.map((admin: any) => ({
          user_id: admin.id,
          title: 'New Support Ticket',
          message: `New support ticket created: "${subject}"`,
          type: 'info',
          data: {
            ticket_id: ticket.id,
            subject: subject,
            message_preview: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
            user_id: actualUserId
          }
        }));

        await adminSupabase
          .from('notifications')
          .insert(superAdminNotifications);

        console.log('✅ Super admin notifications sent successfully');
      }
    } catch (notificationError) {
      console.error('⚠️ Notification sending failed (ticket still created):', notificationError);
      // Don't fail the ticket creation if notifications fail
    }

    revalidatePath('/(admin)/super-admin/support-tickets')
    return { success: true, ticket }
  } catch (error) {
    console.error('Error in createTicket:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create ticket' }
  }
}

export async function getUserTickets() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('You must be logged in to view tickets')
    }

    console.log('🎫 Fetching tickets for user:', {
      id: user.id,
      email: user.email
    })

    // Use the auth user ID directly since we removed foreign key constraints
    const actualUserId = user.id
    
    console.log('🎫 Querying tickets for user_id:', actualUserId)

    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        category:support_categories(id, name)
      `)
      .eq('user_id', actualUserId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching user tickets:', error)
      throw new Error('Failed to fetch tickets')
    }

    console.log('✅ Tickets fetched:', tickets.length, 'tickets found')
    console.log('🎫 Tickets data:', tickets)

    return tickets as Ticket[]
  } catch (error) {
    console.error('❌ Error in getUserTickets:', error)
    return []
  }
}

export async function getTicketCategories() {
  try {
    const supabase = await createClient()
    
    const { data: categories, error } = await supabase
      .from('support_categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching ticket categories:', error)
      throw new Error('Failed to fetch categories')
    }

    return categories as TicketCategory[]
  } catch (error) {
    console.error('Error in getTicketCategories:', error)
    return []
  }
} 