import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Test 1: Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return NextResponse.json({
        success: false,
        error: 'Session error',
        details: sessionError.message
      })
    }

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'No active session',
        message: 'User not authenticated'
      })
    }

    // Test 2: Check user profile
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', session.user.email)
      .single()

    if (userError) {
      return NextResponse.json({
        success: false,
        error: 'User profile error',
        details: userError.message,
        session: {
          user_id: session.user.id,
          email: session.user.email
        }
      })
    }

    // Test 3: Check database tables
    const [
      usersCount,
      paymentsCount,
      paymentMethodsCount
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('*', { count: 'exact', head: true }),
      supabase.from('payment_methods').select('*', { count: 'exact', head: true })
    ])

    return NextResponse.json({
      success: true,
      session: {
        user_id: session.user.id,
        email: session.user.email,
        authenticated: true
      },
      user_profile: userProfile,
      database_counts: {
        users: usersCount.count,
        payments: paymentsCount.count,
        payment_methods: paymentMethodsCount.count
      },
      errors: {
        users: usersCount.error?.message,
        payments: paymentsCount.error?.message,
        payment_methods: paymentMethodsCount.error?.message
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 