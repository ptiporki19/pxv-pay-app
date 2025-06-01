import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'
import type { CheckoutValidationResult } from '@/types/checkout'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createPublicClient()
    const { slug } = await params

    // Validate checkout link exists and is active
    const { data: checkoutLink, error: linkError } = await supabase
      .from('checkout_links')
      .select(`
        *,
        product_template:product_templates(
          id,
          name,
          description,
          short_description,
          featured_image,
          category,
          features,
          specifications
        )
      `)
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

    // If this is a product checkout with a product template, populate the product fields
    if (checkoutLink.checkout_type === 'product' && checkoutLink.product_template) {
      const productTemplate = checkoutLink.product_template
      
      // Populate product fields from template if they're not already set
      if (!checkoutLink.product_name && productTemplate.name) {
        checkoutLink.product_name = productTemplate.name
      }
      
      if (!checkoutLink.product_description && productTemplate.description) {
        checkoutLink.product_description = productTemplate.description
      }
      
      if (!checkoutLink.product_image_url && productTemplate.featured_image) {
        checkoutLink.product_image_url = productTemplate.featured_image
      }
      
      // For product checkouts, use custom_price as the amount if set
      if (checkoutLink.custom_price !== null && checkoutLink.custom_price !== undefined) {
        checkoutLink.amount = checkoutLink.custom_price
        checkoutLink.amount_type = 'fixed'
      }
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