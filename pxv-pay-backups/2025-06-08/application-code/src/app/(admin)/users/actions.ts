'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function toggleUserStatus(userId: string, newStatus: boolean) {
  try {
    // Create admin client inside the function
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
    
    // Update the user status directly with admin client
    const { error } = await supabaseAdmin
      .from('users')
      .update({ active: newStatus })
      .eq('id', userId)
    
    if (error) {
      throw error
    }
    
    // Revalidate the users page to reflect changes
    revalidatePath('/users')
    
    return { success: true }
  } catch (error) {
    console.error('Error toggling user status:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    // Create admin client inside the function
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
    
    // Update the user role directly with admin client
    const { error } = await supabaseAdmin
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
    
    if (error) {
      throw error
    }
    
    // Revalidate the users page to reflect changes
    revalidatePath('/users')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating user role:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
} 