import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'
import type { CheckoutValidationResult } from '@/types/checkout'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createPublicClient()
    const { slug } = params

    // Validate checkout link exists and is active
    const { data: checkoutLink, error: linkError } = await supabase
      .from('checkout_links')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (linkError || !checkoutLink) {
      const result: CheckoutValidationResult = {
        valid: false,
        error: 'Checkout link not found or inactive'
      }
      return NextResponse.json(result, { status: 404 })
    }

    // Get merchant checkout settings
    const { data: merchantSettings, error: settingsError } = await supabase
      .from('merchant_checkout_settings')
      .select('*')
      .eq('merchant_id', checkoutLink.merchant_id)
      .single()

    // If no settings exist, we'll create default ones in Phase 2
    // For now, just return what we have

    const result: CheckoutValidationResult = {
      valid: true,
      checkout_link: checkoutLink,
      merchant_settings: merchantSettings || undefined
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Checkout validation error:', error)
    const result: CheckoutValidationResult = {
      valid: false,
      error: 'Internal server error'
    }
    return NextResponse.json(result, { status: 500 })
  }
} 