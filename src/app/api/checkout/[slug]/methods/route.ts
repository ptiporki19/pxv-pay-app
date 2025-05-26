import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createPublicClient()
    const { slug } = params
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('country')

    if (!countryCode) {
      return NextResponse.json(
        { error: 'Country code is required' },
        { status: 400 }
      )
    }

    // Get checkout link to verify it exists and get merchant
    const { data: checkoutLink, error: linkError } = await supabase
      .from('checkout_links')
      .select('merchant_id, active_country_codes')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (linkError || !checkoutLink) {
      return NextResponse.json(
        { error: 'Checkout link not found or inactive' },
        { status: 404 }
      )
    }

    // Verify the country is active for this checkout link
    if (!checkoutLink.active_country_codes.includes(countryCode)) {
      return NextResponse.json(
        { error: 'Country not available for this checkout link' },
        { status: 400 }
      )
    }

    // Get payment methods for this merchant that support the selected country
    const { data: paymentMethods, error: methodsError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', checkoutLink.merchant_id)
      .eq('status', 'active')
      .contains('countries', [countryCode])
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (methodsError) {
      console.error('Payment methods fetch error:', methodsError)
      return NextResponse.json(
        { error: 'Failed to fetch payment methods' },
        { status: 500 }
      )
    }

    // Get currency for the country
    const { data: country, error: countryError } = await supabase
      .from('countries')
      .select('*, currencies(*)')
      .eq('code', countryCode)
      .eq('status', 'active')
      .single()

    if (countryError) {
      console.error('Country fetch error:', countryError)
      return NextResponse.json(
        { error: 'Failed to fetch country information' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      payment_methods: paymentMethods || [],
      country: country,
      currency: country?.currencies || null
    })

  } catch (error) {
    console.error('Checkout methods error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 