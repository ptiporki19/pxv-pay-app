import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createPublicClient()
    const { slug } = await params

    // First validate the checkout link exists and is active
    const { data: checkoutLink, error: linkError } = await supabase
      .from('checkout_links')
      .select('active_country_codes')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (linkError || !checkoutLink) {
      return NextResponse.json(
        { error: 'Checkout link not found or inactive' },
        { status: 404 }
      )
    }

    // Get countries that are active for this checkout link
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select(`
        id,
        name,
        code,
        currency_id,
        currency:currencies(
          id,
          name,
          code,
          symbol
        )
      `)
      .in('code', checkoutLink.active_country_codes)
      .eq('status', 'active')
      .order('name')

    if (countriesError) {
      console.error('Countries fetch error:', countriesError)
      return NextResponse.json(
        { error: 'Failed to fetch countries' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      countries: countries || []
    })

  } catch (error) {
    console.error('Countries API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 