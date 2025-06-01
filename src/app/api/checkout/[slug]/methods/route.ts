import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createPublicClient()
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('country')

    if (!countryCode) {
      return NextResponse.json(
        { error: 'Country parameter is required' },
        { status: 400 }
      )
    }

    // First validate the checkout link exists and is active
    const { data: checkoutLink, error: linkError } = await supabase
      .from('checkout_links')
      .select('active_country_codes, merchant_id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (linkError || !checkoutLink) {
      return NextResponse.json(
        { error: 'Checkout link not found or inactive' },
        { status: 404 }
      )
    }

    // Validate that the country is allowed for this checkout link
    if (!checkoutLink.active_country_codes.includes(countryCode)) {
      return NextResponse.json(
        { error: 'Country not supported for this checkout link' },
        { status: 400 }
      )
    }

    // Get the country and its currency
    const { data: country, error: countryError } = await supabase
      .from('countries')
      .select('id, currency_id')
      .eq('code', countryCode)
      .eq('status', 'active')
      .single()

    if (countryError || !country) {
      return NextResponse.json(
        { error: 'Invalid country' },
        { status: 400 }
      )
    }

    // Get payment methods that support this country - include URL and country-specific details
    const { data: paymentMethods, error: methodsError } = await supabase
      .from('payment_methods')
      .select(`
        id,
        name,
        type,
        description,
        instructions_for_checkout,
        icon,
        url,
        display_order,
        countries
      `)
      .eq('user_id', checkoutLink.merchant_id)
      .eq('status', 'active')
      .contains('countries', [countryCode])
      .order('display_order')

    if (methodsError) {
      console.error('Payment methods fetch error:', methodsError)
      return NextResponse.json(
        { error: 'Failed to fetch payment methods' },
        { status: 500 }
      )
    }

    // Format the payment methods with country-specific details
    const formattedMethods = (paymentMethods || []).map((method: any) => {
      // Normalize URL - ensure it has proper protocol
      let effectiveUrl = method.url
      if (effectiveUrl && effectiveUrl.trim().length > 0) {
        effectiveUrl = effectiveUrl.trim()
        if (!effectiveUrl.startsWith('http://') && !effectiveUrl.startsWith('https://')) {
          effectiveUrl = 'https://' + effectiveUrl
        }
      }
      
      // If there's a URL, treat as payment-link
      const effectiveType = (effectiveUrl && effectiveUrl.trim().length > 0) ? 'payment-link' : method.type
      
      return {
        id: method.id,
        name: method.name,
        type: effectiveType,
        description: method.description,
        instructions_for_checkout: method.instructions_for_checkout,
        url: effectiveUrl,
        icon_url: method.icon,
        display_order: method.display_order || 0
      }
    })

    return NextResponse.json({
      payment_methods: formattedMethods
    })

  } catch (error) {
    console.error('Payment methods API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 