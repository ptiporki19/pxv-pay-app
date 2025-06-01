import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if user is super admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const isSuperAdminEmail = session.user.email === 'admin@pxvpay.com' ||
                              session.user.email === 'dev-admin@pxvpay.com' ||
                              session.user.email === 'superadmin@pxvpay.com'
    const isSuperAdmin = userProfile?.role === 'super_admin' || isSuperAdminEmail

    // Fetch stats based on user role
    let stats = {
      totalUsers: 0,
      activeUsers: 0,
      totalPayments: 0,
      pendingPayments: 0,
      totalCountries: 0,
      totalCurrencies: 0,
      totalPaymentMethods: 0,
      recentRegistrations: 0
    }

    if (isSuperAdmin) {
      // Super admin sees all platform stats
      const [
        usersCount,
        activeUsersCount,
        paymentsCount,
        pendingPaymentsCount,
        countriesCount,
        currenciesCount,
        paymentMethodsCount,
        recentRegistrationsCount
      ] = await Promise.all([
        // Total users
        supabase.from('users').select('*', { count: 'exact', head: true }),
        // Active users (simplified - users who have logged in recently)
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user'),
        // Total payments across platform
        supabase.from('payments').select('*', { count: 'exact', head: true }),
        // Pending verification payments across platform
        supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending_verification'),
        // Countries (global + user-specific for super admin)
        supabase.from('countries').select('*', { count: 'exact', head: true }),
        // Currencies (global + user-specific for super admin)
        supabase.from('currencies').select('*', { count: 'exact', head: true }),
        // Payment methods (global + user-specific for super admin)
        supabase.from('payment_methods').select('*', { count: 'exact', head: true }),
        // Recent registrations (last 24 hours)
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ])

      stats = {
        totalUsers: usersCount.count || 0,
        activeUsers: activeUsersCount.count || 0,
        totalPayments: paymentsCount.count || 0,
        pendingPayments: pendingPaymentsCount.count || 0,
        totalCountries: countriesCount.count || 0,
        totalCurrencies: currenciesCount.count || 0,
        totalPaymentMethods: paymentMethodsCount.count || 0,
        recentRegistrations: recentRegistrationsCount.count || 0
      }
    } else {
      // Merchant sees only their own stats
      const [
        paymentsCount,
        pendingPaymentsCount,
        paymentMethodsCount
      ] = await Promise.all([
        // Total payments for this merchant
        supabase.from('payments').select('*', { count: 'exact', head: true }).eq('merchant_id', session.user.id),
        // Pending verification payments for this merchant  
        supabase.from('payments').select('*', { count: 'exact', head: true }).eq('merchant_id', session.user.id).eq('status', 'pending_verification'),
        // Payment methods for this user
        supabase.from('payment_methods').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id)
      ])

      stats = {
        totalUsers: 0, // Not applicable for merchants
        activeUsers: 0, // Not applicable for merchants
        totalPayments: paymentsCount.count || 0,
        pendingPayments: pendingPaymentsCount.count || 0,
        totalCountries: 0, // Simplified for merchants
        totalCurrencies: 0, // Simplified for merchants
        totalPaymentMethods: paymentMethodsCount.count || 0,
        recentRegistrations: 0 // Not applicable for merchants
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      userRole: isSuperAdmin ? 'super_admin' : 'merchant'
    })

  } catch (error) {
    console.error('Dashboard stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 