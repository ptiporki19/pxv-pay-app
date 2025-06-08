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
      .eq('status', 'active')
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
      .select('id, currency_code')
      .eq('code', countryCode)
      .eq('active', true)
      .single()

    if (countryError || !country) {
      return NextResponse.json(
        { error: 'Invalid country' },
        { status: 400 }
      )
    }

    // Get payment methods that support this country
    const { data: paymentMethods, error: methodsError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', checkoutLink.merchant_id)
      .eq('status', 'active')

    if (methodsError) {
      console.error('Payment methods fetch error:', methodsError)
      return NextResponse.json(
        { error: 'Failed to fetch payment methods' },
        { status: 500 }
      )
    }

    // Filter methods that support the country in JavaScript instead of SQL
    const filteredMethods = (paymentMethods || []).filter((method: any) => 
      method.countries && Array.isArray(method.countries) && method.countries.includes(countryCode)
    )

    // Format the payment methods with proper data extraction
    const formattedMethods = (filteredMethods || []).map((method: any) => {
      // Parse account_details if they're stored as JSON string
      let accountDetails = method.account_details || []
      if (typeof accountDetails === 'string') {
        try {
          accountDetails = JSON.parse(accountDetails)
        } catch {
          accountDetails = []
        }
      }
      
      // For payment_link type, ensure URL is properly extracted
      let finalUrl = method.url || ''
      if (method.type === 'payment_link' && !finalUrl && Array.isArray(accountDetails)) {
        const urlField = accountDetails.find((field: any) => field.id === 'payment_url' || field.type === 'url')
        finalUrl = urlField?.value || ''
      }
      
      return {
        id: method.id,
        name: method.name,
        type: method.type,
        description: method.description,
        instructions_for_checkout: method.instructions || '',
        url: finalUrl,
        icon_url: method.icon_url,
        display_order: method.sort_order || 0,
        account_details: Array.isArray(accountDetails) ? accountDetails : [],
        additional_info: ''
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