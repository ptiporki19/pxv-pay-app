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
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (linkError || !checkoutLink) {
      console.error('Checkout link error:', linkError)
      const result: CheckoutValidationResult = {
        valid: false,
        error: 'Checkout link not found or inactive'
      }
      return NextResponse.json(result, { status: 404 })
    }

    // For product checkouts, fetch product template data if product_template_id exists
    if (checkoutLink.checkout_type === 'product' && checkoutLink.product_template_id) {
      const { data: productTemplate, error: productError } = await supabase
        .from('product_templates')
        .select('*')
        .eq('id', checkoutLink.product_template_id)
        .single()

      if (!productError && productTemplate) {
        // Merge product data into checkout link
        checkoutLink.product_name = productTemplate.name
        checkoutLink.product_description = productTemplate.description
        checkoutLink.product_image_url = productTemplate.image_url
        checkoutLink.amount = checkoutLink.amount || productTemplate.default_amount
        console.log('Merged product data:', {
          name: checkoutLink.product_name,
          description: checkoutLink.product_description?.substring(0, 100),
          image_url: checkoutLink.product_image_url,
          amount: checkoutLink.amount
        })
      } else if (productError) {
        console.error('Error fetching product template:', productError)
      }
    }

    // Get merchant checkout settings if they exist
    const { data: merchantSettings } = await supabase
      .from('merchant_checkout_settings')
      .select('*')
      .eq('merchant_id', checkoutLink.merchant_id)
      .single()

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