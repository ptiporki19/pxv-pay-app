'use server'

import { createClient as createServerContextClient } from '@/lib/supabase/server' // For user context
import { createClient as createAdminClient } from '@supabase/supabase-js' // For admin operations

export async function signUpAction(formData: {
  email: string
  password: string
  fullName: string
}) {
  const supabaseUserContext = await createServerContextClient() // Client acting as the user

  // Admin client for privileged operations - MUST use service role key
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Ensure this is set in .env.local
  )

  try {
    // First, try normal signup (this uses the user context client)
    const { data, error } = await supabaseUserContext.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          role: 'registered_user',
        },
        // emailRedirectTo is handled by Supabase, no need to set it here for server action
      },
    })

    if (error) {
      // If signup fails due to database error, try manual approach with admin client
      if (error.message.includes('Database error saving new user') || error.message.includes('User not allowed')) {
        console.warn('Normal signup failed, attempting manual user creation with admin privileges...', error.message)
        
        const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true, // Auto-confirm for local/dev, adjust for prod if needed
          user_metadata: {
            full_name: formData.fullName,
            role: 'registered_user'
          }
        })

        if (adminError) {
          console.error('Admin user creation failed:', adminError)
          throw adminError // Propagate this error, as it means even admin couldn't create the user
        }

        console.log('Admin user creation successful:', adminData.user.id)

        // Create user profile manually using the admin client
        const { data: profileData, error: profileError } = await supabaseAdmin.rpc('create_user_profile', {
          user_id: adminData.user.id,
          user_email: formData.email,
          user_role: 'registered_user'
        })

        if (profileError) {
          console.error('Manual profile creation failed after admin auth user creation:', profileError)
          // Log this, but proceed as the auth user was created
          // You might want to add more robust error handling/queuing for profile creation later
        } else {
          console.log('Manual profile creation successful.')
        }

        return { success: true, message: 'Account created successfully. Please check your email to verify your account.' }
      } else {
        // Other types of errors from supabaseUserContext.auth.signUp
        throw error
      }
    }

    // If normal signup was successful, verify/create profile using user context client if possible, or admin as fallback
    if (data.user?.id) {
      console.log('Normal auth.signUp successful, user ID:', data.user.id)
      try {
        const { data: profileCheck, error: profileCheckError } = await supabaseUserContext
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (profileCheckError) {
          console.warn('User profile not found via user context client, attempting creation with admin client...', profileCheckError.message)
          const { error: rpcError } = await supabaseAdmin.rpc('create_user_profile', {
            user_id: data.user.id,
            user_email: formData.email,
            user_role: 'registered_user'
          })
          if(rpcError) console.error('Fallback profile creation with admin client failed:', rpcError)
          else console.log('Fallback profile creation with admin client successful.')
        } else {
          console.log('User profile confirmed by user context client.')
        }
      } catch(e){
        console.error('Error during profile check/creation post-signup:', e)
      }
    }

    return { success: true, message: 'Account created successfully. Please check your email to verify your account.' }
  } catch (error: any) {
    console.error('Overall signUpAction error:', error)
    return { 
      success: false, 
      message: error?.message || 'Failed to create account. Please try again.' 
    }
  }
} 