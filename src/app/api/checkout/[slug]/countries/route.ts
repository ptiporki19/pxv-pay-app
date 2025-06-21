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
      .eq('status', 'active')
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
        currency_code
      `)
      .in('code', checkoutLink.active_country_codes)
      .eq('active', true)
      .order('name')

    if (countriesError) {
      console.error('Countries fetch error:', countriesError)
      return NextResponse.json(
        { error: 'Failed to fetch countries' },
        { status: 500 }
      )
    }

    // Get all unique currency codes from the countries
    const currencyCodes = [...new Set(countries?.map(c => c.currency_code).filter(Boolean))]
    
    // Fetch currency details for all currency codes
    const { data: currencies, error: currencyError } = await supabase
      .from('currencies')
      .select('id, name, code, symbol')
      .in('code', currencyCodes)
      .eq('active', true)

    if (currencyError) {
      console.error('Currency fetch error:', currencyError)
      // Continue without currency data rather than failing completely
    }

    // Create a map of currencies by code for quick lookup
    const currencyMap = new Map(currencies?.map(c => [c.code, c]) || [])

    // Attach currency data to countries
    const countriesWithCurrency = countries?.map(country => ({
      id: country.id,
      name: country.name,
      code: country.code,
      currency_code: country.currency_code,
      currency: country.currency_code ? currencyMap.get(country.currency_code) || null : null
    })) || []

    return NextResponse.json({
      countries: countriesWithCurrency
    })

  } catch (error) {
    console.error('Countries API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 