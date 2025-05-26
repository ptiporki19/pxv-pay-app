import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createPublicClient()
    const { slug } = params

    // Get checkout link with active countries
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

    // Get country details for active country codes
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('*')
      .in('code', checkoutLink.active_country_codes)
      .eq('status', 'active')
      .order('name', { ascending: true })

    if (countriesError) {
      console.error('Countries fetch error:', countriesError)
      return NextResponse.json(
        { error: 'Failed to fetch countries' },
        { status: 500 }
      )
    }

    return NextResponse.json({ countries: countries || [] })

  } catch (error) {
    console.error('Checkout countries error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 