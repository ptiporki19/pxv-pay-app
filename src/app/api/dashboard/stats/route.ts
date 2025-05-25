import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS issues
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('📊 API: Fetching dashboard statistics...')

    // Fetch all statistics in parallel
    const [
      usersResult,
      paymentsResult,
      countriesResult,
      currenciesResult,
      paymentMethodsResult
    ] = await Promise.all([
      // Users stats
      supabase.from('users').select('id, active, created_at'),
      // Payments stats
      supabase.from('payments').select('id, status, created_at'),
      // Countries count
      supabase.from('countries').select('id', { count: 'exact', head: true }),
      // Currencies count
      supabase.from('currencies').select('id', { count: 'exact', head: true }),
      // Payment methods count
      supabase.from('payment_methods').select('id', { count: 'exact', head: true })
    ])

    // Process users data
    const users = usersResult.data || []
    const totalUsers = users.length
    const activeUsers = users.filter(user => user.active).length
    
    // Recent registrations (last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const recentRegistrations = users.filter(user => 
      new Date(user.created_at) > yesterday
    ).length

    // Process payments data
    const payments = paymentsResult.data || []
    const totalPayments = payments.length
    const pendingPayments = payments.filter(payment => 
      payment.status === 'pending'
    ).length

    // Get counts from other tables
    const totalCountries = countriesResult.count || 0
    const totalCurrencies = currenciesResult.count || 0
    const totalPaymentMethods = paymentMethodsResult.count || 0

    const stats = {
      totalUsers,
      activeUsers,
      totalPayments,
      pendingPayments,
      totalCountries,
      totalCurrencies,
      totalPaymentMethods,
      recentRegistrations
    }

    console.log('✅ API: Dashboard stats fetched successfully:', stats)

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('💥 API: Exception in dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 