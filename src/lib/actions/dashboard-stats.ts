'use server'

import { createClient } from '@/lib/supabase/server'

export async function getUserCount() {
  try {
    console.log('🔄 Server: Fetching user count...')
    
    const supabase = await createClient()
    
    // Get current session to verify admin access
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.log('❌ Server: No session found')
      return { success: false, error: 'Not authenticated', count: 0 }
    }

    console.log('👤 Server: User authenticated:', { 
      id: session.user.id, 
      email: session.user.email
    })

    // Check if user has admin privileges by email and database role
    const isSuperAdminEmail = session.user.email === 'admin@pxvpay.com' ||
                              session.user.email === 'dev-admin@pxvpay.com' ||
                              session.user.email === 'superadmin@pxvpay.com'

    // Also check database role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('email', session.user.email)
      .single()

    const isSuperAdminRole = userProfile?.role === 'super_admin'
    const isSuperAdmin = isSuperAdminEmail || isSuperAdminRole

    if (!isSuperAdmin) {
      console.log('❌ Server: Not authorized as super admin')
      return { success: false, error: 'Not authorized', count: 0 }
    }

    console.log('🔑 Server: User verified as super admin')

    // Query the actual user count from the database
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Server: User count query failed:', error)
      return { success: false, error: error.message, count: 0 }
    }

    console.log('✅ Server: Real user count from database:', count)
    
    return { 
      success: true, 
      error: null, 
      count: count || 0 
    }

  } catch (error) {
    console.error('💥 Server: Exception in getUserCount:', error)
    return { 
      success: false, 
      error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
      count: 0 
    }
  }
}

export async function getPendingVerificationCount() {
  try {
    console.log('🔄 Server: Fetching pending verification count...')
    
    const supabase = await createClient()
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated', count: 0 }
    }

    // Check if user is super admin to see all pending verifications
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('email', session.user.email)
      .single()

    const isSuperAdminEmail = session.user.email === 'admin@pxvpay.com' ||
                              session.user.email === 'dev-admin@pxvpay.com' ||
                              session.user.email === 'superadmin@pxvpay.com'
    const isSuperAdmin = userProfile?.role === 'super_admin' || isSuperAdminEmail

    let query = supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_verification')

    // Super admins see all pending verifications, merchants see only their own
    if (!isSuperAdmin) {
      // Get the user's database ID for merchant filtering
      const { data: dbUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', session.user.email)
        .single()
      
      if (dbUser) {
        query = query.eq('merchant_id', dbUser.id)
      }
    }

    const { count, error } = await query

    if (error) {
      console.error('❌ Server: Pending verification query failed:', error)
      return { success: false, error: error.message, count: 0 }
    }

    console.log('✅ Server: Pending verification count:', count, 'for user:', session.user.email)
    return { success: true, error: null, count: count || 0 }

  } catch (error) {
    console.error('💥 Server: Exception in getPendingVerificationCount:', error)
    return { success: false, error: 'Server error', count: 0 }
  }
}

export async function getPaymentMethodsCount() {
  try {
    console.log('🔄 Server: Fetching payment methods count...')
    
    const supabase = await createClient()
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated', count: 0 }
    }

    // Get user's database ID for filtering
    const { data: dbUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!dbUser) {
      return { success: false, error: 'User not found', count: 0 }
    }

    // Filter by current user's payment methods only
    const { count, error } = await supabase
      .from('payment_methods')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', dbUser.id)

    if (error) {
      console.error('❌ Server: Payment methods query failed:', error)
      return { success: false, error: error.message, count: 0 }
    }

    console.log('✅ Server: Payment methods count (user-specific):', count)
    return { success: true, error: null, count: count || 0 }

  } catch (error) {
    console.error('💥 Server: Exception in getPaymentMethodsCount:', error)
    return { success: false, error: 'Server error', count: 0 }
  }
}

export async function getCurrenciesCount() {
  try {
    console.log('🔄 Server: Fetching currencies count...')
    
    const supabase = await createClient()
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated', count: 0 }
    }

    // Get user's database ID for filtering
    const { data: dbUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!dbUser) {
      return { success: false, error: 'User not found', count: 0 }
    }

    // Filter by current user's currencies only
    const { count, error } = await supabase
      .from('currencies')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', dbUser.id)

    if (error) {
      console.error('❌ Server: Currencies query failed:', error)
      return { success: false, error: error.message, count: 0 }
    }

    console.log('✅ Server: Currencies count (user-specific):', count)
    return { success: true, error: null, count: count || 0 }

  } catch (error) {
    console.error('💥 Server: Exception in getCurrenciesCount:', error)
    return { success: false, error: 'Server error', count: 0 }
  }
}

export async function getTotalPaymentsCount() {
  try {
    console.log('🔄 Server: Fetching total payments count...')
    
    const supabase = await createClient()
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated', count: 0 }
    }

    // Check if user is super admin to see all payments
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, id')
      .eq('email', session.user.email)
      .single()

    const isSuperAdminEmail = session.user.email === 'admin@pxvpay.com' ||
                              session.user.email === 'dev-admin@pxvpay.com' ||
                              session.user.email === 'superadmin@pxvpay.com'
    const isSuperAdmin = userProfile?.role === 'super_admin' || isSuperAdminEmail

    let query = supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })

    // Super admins see all payments, merchants see only their own
    if (!isSuperAdmin && userProfile?.id) {
      query = query.eq('merchant_id', userProfile.id)
    }

    const { count, error } = await query

    if (error) {
      console.error('❌ Server: Total payments query failed:', error)
      return { success: false, error: error.message, count: 0 }
    }

    console.log('✅ Server: Total payments count:', count, 'for user:', session.user.email)
    return { success: true, error: null, count: count || 0 }

  } catch (error) {
    console.error('💥 Server: Exception in getTotalPaymentsCount:', error)
    return { success: false, error: 'Server error', count: 0 }
  }
}

export async function getProductsCount() {
  try {
    console.log('🔄 Server: Fetching products count...')
    
    const supabase = await createClient()
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated', count: 0 }
    }

    // Get user profile to check role and ID
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, id')
      .eq('email', session.user.email)
      .single()

    if (!userProfile) {
      return { success: false, error: 'User not found', count: 0 }
    }

    const isSuperAdminEmail = session.user.email === 'admin@pxvpay.com' ||
                              session.user.email === 'dev-admin@pxvpay.com' ||
                              session.user.email === 'superadmin@pxvpay.com'
    const isSuperAdmin = userProfile.role === 'super_admin' || isSuperAdminEmail

    let query = supabase
      .from('product_templates')
      .select('*', { count: 'exact', head: true })

    // Super admins see all products, merchants see only their own
    if (!isSuperAdmin) {
      query = query.eq('user_id', userProfile.id)
    }

    const { count, error } = await query

    if (error) {
      console.error('❌ Server: Products query failed:', error)
      return { success: false, error: error.message, count: 0 }
    }

    console.log('✅ Server: Products count (user-specific):', count)
    return { success: true, error: null, count: count || 0 }

  } catch (error) {
    console.error('💥 Server: Exception in getProductsCount:', error)
    return { success: false, error: 'Server error', count: 0 }
  }
} 

export async function getCheckoutLinksCount() {
  try {
    console.log('🔄 Server: Fetching checkout links count...')
    
    const supabase = await createClient()
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated', count: 0 }
    }

    // Get user profile to check role and ID
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, id')
      .eq('email', session.user.email)
      .single()

    if (!userProfile) {
      return { success: false, error: 'User not found', count: 0 }
    }

    const isSuperAdminEmail = session.user.email === 'admin@pxvpay.com' ||
                              session.user.email === 'dev-admin@pxvpay.com' ||
                              session.user.email === 'superadmin@pxvpay.com'
    const isSuperAdmin = userProfile.role === 'super_admin' || isSuperAdminEmail

    let query = supabase
      .from('checkout_links')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Super admins see all checkout links, merchants see only their own
    if (!isSuperAdmin) {
      query = query.eq('merchant_id', userProfile.id)
    }

    const { count, error } = await query

    if (error) {
      console.error('❌ Server: Checkout links query failed:', error)
      return { success: false, error: error.message, count: 0 }
    }

    console.log('✅ Server: Checkout links count:', count, 'for user:', session.user.email)
    return { success: true, error: null, count: count || 0 }

  } catch (error) {
    console.error('💥 Server: Exception in getCheckoutLinksCount:', error)
    return { success: false, error: 'Server error', count: 0 }
  }
} 