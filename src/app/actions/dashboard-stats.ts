'use server'

import { createClient } from '@/lib/supabase/server'

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalPayments: number
  pendingPayments: number
  countries: number
  currencies: number
  paymentMethods: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('No authenticated session')
  }

  try {
    console.log('🔄 Server: Fetching dashboard stats for user:', session.user.email)

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    console.log('👥 Server: Users query result:', { count: totalUsers, error: usersError })

    // Get active users count
    const { count: activeUsers, error: activeError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)

    console.log('✅ Server: Active users result:', { count: activeUsers, error: activeError })

    // Get payments count
    const { count: totalPayments, error: paymentsError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })

    // Get pending payments count
    const { count: pendingPayments, error: pendingError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Get countries count
    const { count: countries, error: countriesError } = await supabase
      .from('countries')
      .select('*', { count: 'exact', head: true })

    // Get currencies count
    const { count: currencies, error: currenciesError } = await supabase
      .from('currencies')
      .select('*', { count: 'exact', head: true })

    // Get payment methods count
    const { count: paymentMethods, error: methodsError } = await supabase
      .from('payment_methods')
      .select('*', { count: 'exact', head: true })

    // Log any errors
    if (usersError) console.error('❌ Server Users error:', usersError)
    if (activeError) console.error('❌ Server Active users error:', activeError)
    if (paymentsError) console.error('❌ Server Payments error:', paymentsError)

    const stats: DashboardStats = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalPayments: totalPayments || 0,
      pendingPayments: pendingPayments || 0,
      countries: countries || 0,
      currencies: currencies || 0,
      paymentMethods: paymentMethods || 0
    }

    console.log('📈 Server: Final stats:', stats)
    return stats

  } catch (error) {
    console.error('💥 Server: Error in getDashboardStats:', error)
    
    // Return zero values if there's an error
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalPayments: 0,
      pendingPayments: 0,
      countries: 0,
      currencies: 0,
      paymentMethods: 0
    }
  }
} 