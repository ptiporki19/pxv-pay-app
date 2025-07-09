'use server'

import { createClient as createServerContextClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { emailService } from '@/lib/email-service'

export async function signUpAction(formData: {
  email: string
  password: string
  fullName: string
}) {
  const supabaseUserContext = await createServerContextClient()
  
  try {
    console.log('Starting signup process for:', formData.email)
    
    // First, try the normal signup approach
    const { data, error } = await supabaseUserContext.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          role: 'registered_user',
        },
      },
    })

    if (!error && data.user?.id) {
      console.log('✅ Normal signup successful:', data.user.id)
      
      // Create user profile manually
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      try {
        console.log('Creating user profile manually...')
        const { error: profileError } = await supabaseAdmin
          .from('users')
          .insert({
            id: data.user.id,
            email: formData.email,
            role: 'registered_user',
            active: true,
            created_at: new Date().toISOString()
    })

        if (profileError) {
          console.warn('Profile creation failed, but auth user exists:', profileError.message)
        } else {
          console.log('User profile created successfully')
          
          // 📧 Send welcome email to new user
          try {
            await emailService.sendWelcomeEmail(
              formData.email,
              formData.fullName || formData.email.split('@')[0]
            )
            console.log('✅ Welcome email sent to new user')
          } catch (emailError) {
            console.warn('⚠️ Welcome email failed:', emailError)
          }

          // 📧 Send new user notification to super admins
          try {
            const { data: superAdmins } = await supabaseAdmin
              .from('users')
              .select('email')
              .eq('role', 'super_admin')

            if (superAdmins && superAdmins.length > 0) {
              for (const admin of superAdmins) {
                if (admin.email) {
                  await emailService.sendNewUserSignupNotificationEmail(
                    admin.email,
                    {
                      email: formData.email,
                      name: formData.fullName,
                      role: 'registered_user',
                      signupDate: new Date().toISOString()
                    }
                  )
                }
              }
              console.log('✅ Admin notification emails sent for new user signup')
            }
          } catch (adminEmailError) {
            console.warn('⚠️ Admin notification emails failed:', adminEmailError)
          }
        }
      } catch (profileError) {
        console.warn('Profile creation error:', profileError)
      }

      return {
        success: true,
        message: data.user?.email_confirmed_at ? 
          'Account created successfully! You can now sign in.' :
          'Account created successfully! Please check your email to verify your account.'
      }
    }

    // If normal signup fails, try admin approach
    console.warn('Normal signup failed, trying admin approach:', error?.message)
    
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if user already exists
    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingAuthUsers.users.find(u => u.email === formData.email)
    
    if (existingUser) {
      return {
        success: false,
        message: 'A user with this email already exists.'
      }
    }

    // Manual user creation using admin API
    console.log('Attempting admin user creation...')
        const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
      email_confirm: true,
          user_metadata: {
        full_name: formData.fullName
          }
        })

        if (adminError) {
      console.error('Admin user creation also failed:', adminError.message)
      
      return {
        success: false,
        message: 'We are experiencing technical difficulties with user registration. Please try again in a few minutes, or contact support at admin@pxvpay.com if the issue persists.'
      }
        }

        console.log('Admin user creation successful:', adminData.user.id)

    // Create user profile for admin-created user
    try {
      const { error: profileError } = await supabaseAdmin
        .from('users')
        .insert({
          id: adminData.user.id,
          email: formData.email,
          role: 'registered_user',
          active: true,
          created_at: new Date().toISOString()
        })

        if (profileError) {
        console.warn('Profile creation failed, but auth user exists:', profileError.message)
      } else {
        console.log('User profile created successfully via admin route')
      }
    } catch (profileError) {
      console.warn('Profile creation error in admin route:', profileError)
    }

    return {
      success: true,
      message: 'Account created successfully! You can now sign in with your credentials.'
    }

  } catch (error: any) {
    console.error('Signup error:', error)
    return { 
      success: false, 
      message: 'Failed to create account. Please try again or contact support at admin@pxvpay.com'
    }
  }
}

// Helper function to ensure user profile exists (can be called from other parts of the app)
export async function ensureUserProfile(userId: string, email: string) {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (checkError && checkError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      console.log('Creating missing user profile for:', email)
      
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email: email,
          role: 'registered_user',
          active: true,
          created_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Failed to create missing profile:', insertError)
        return false
      }
      
      console.log('Missing profile created successfully')
      return true
    } else if (checkError) {
      console.error('Error checking user profile:', checkError)
      return false
    } else {
      console.log('User profile already exists')
      return true
    }
  } catch (error) {
    console.error('Error ensuring user profile:', error)
    return false
  }
} 