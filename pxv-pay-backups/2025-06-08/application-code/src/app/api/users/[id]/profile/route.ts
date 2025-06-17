import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS for super admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📋 API: Fetching user profile for:', params.id)

    // Get the requesting user's session
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Verify the session and get current user
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !currentUser) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Check if current user is super admin
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (profileError || currentUserProfile?.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Super admin access required' },
        { status: 403 }
      )
    }

    // Fetch user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', params.id)
      .single()

    if (userError) {
      console.error('❌ API: Failed to fetch user:', userError)
      return NextResponse.json(
        { error: 'User not found', details: userError.message },
        { status: 404 }
      )
    }

    // Fetch payments for this user
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', params.id)
      .order('created_at', { ascending: false })

    if (paymentsError) {
      console.error('❌ API: Failed to fetch payments:', paymentsError)
    }

    // Fetch payment methods for this user
    const { data: paymentMethodsData, error: paymentMethodsError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', params.id)
      .order('created_at', { ascending: false })

    if (paymentMethodsError) {
      console.error('❌ API: Failed to fetch payment methods:', paymentMethodsError)
    }

    // Fetch countries for this user
    const { data: countriesData, error: countriesError } = await supabase
      .from('countries')
      .select('*')
      .eq('user_id', params.id)
      .order('name', { ascending: true })

    if (countriesError) {
      console.error('❌ API: Failed to fetch countries:', countriesError)
    }

    // Fetch currencies for this user
    const { data: currenciesData, error: currenciesError } = await supabase
      .from('currencies')
      .select('*')
      .eq('user_id', params.id)
      .order('name', { ascending: true })

    if (currenciesError) {
      console.error('❌ API: Failed to fetch currencies:', currenciesError)
    }

    // Calculate stats
    const payments = paymentsData || []
    const paymentMethods = paymentMethodsData || []
    const countries = countriesData || []
    const currencies = currenciesData || []

    const stats = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
      successfulPayments: payments.filter(p => p.status === 'completed').length,
      pendingPayments: payments.filter(p => p.status === 'pending').length,
      failedPayments: payments.filter(p => p.status === 'failed').length,
      uniqueCurrencies: new Set(payments.map(p => p.currency)).size,
      activePaymentMethods: paymentMethods.filter(pm => pm.status === 'active').length,
      activeCountries: countries.filter(c => c.status === 'active').length,
      accountAge: Math.floor((new Date().getTime() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24))
    }

    console.log(`✅ API: Successfully fetched profile for user ${params.id}`)

    return NextResponse.json({
      success: true,
      user: userData,
      payments,
      paymentMethods,
      countries,
      currencies,
      stats
    })

  } catch (error) {
    console.error('💥 API: Exception in user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 