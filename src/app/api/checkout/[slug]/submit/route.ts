import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient()
    const { slug } = params

    // Parse form data
    const formData = await request.formData()
    const proofFile = formData.get('proof') as File
    const customerName = formData.get('customer_name') as string
    const customerEmail = formData.get('customer_email') as string
    const amount = parseFloat(formData.get('amount') as string)
    const country = formData.get('country') as string
    const paymentMethodId = formData.get('payment_method_id') as string
    const checkoutLinkId = formData.get('checkout_link_id') as string

    // Validate required fields
    if (!proofFile || !customerName || !customerEmail || !amount || !country || !paymentMethodId || !checkoutLinkId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate checkout link
    const { data: checkoutLink, error: linkError } = await supabase
      .from('checkout_links')
      .select('*, merchant_id')
      .eq('slug', slug)
      .eq('id', checkoutLinkId)
      .eq('is_active', true)
      .single()

    if (linkError || !checkoutLink) {
      return NextResponse.json(
        { error: 'Invalid checkout link' },
        { status: 404 }
      )
    }

    // Get country and currency info
    const { data: countryData, error: countryError } = await supabase
      .from('countries')
      .select('*, currency:currencies(*)')
      .eq('code', country)
      .single()

    if (countryError || !countryData) {
      return NextResponse.json(
        { error: 'Invalid country' },
        { status: 400 }
      )
    }

    // Validate payment method
    const { data: paymentMethod, error: methodError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', paymentMethodId)
      .eq('status', 'active')
      .single()

    if (methodError || !paymentMethod) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }

    // Create service role client for file upload
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Upload proof file to Supabase Storage
    const fileExtension = proofFile.name.split('.').pop()
    const fileName = `${randomUUID()}.${fileExtension}`
    const filePath = `${checkoutLink.merchant_id}/${fileName}`

    const { error: uploadError } = await serviceSupabase.storage
      .from('payment-proofs')
      .upload(filePath, proofFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('File upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload proof file' },
        { status: 500 }
      )
    }

    // Get public URL for the uploaded file
    const { data: urlData } = serviceSupabase.storage
      .from('payment-proofs')
      .getPublicUrl(filePath)

    // Create payment record
    const paymentId = randomUUID()
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        id: paymentId,
        merchant_id: checkoutLink.merchant_id,
        checkout_link_id: checkoutLinkId,
        customer_name: customerName,
        customer_email: customerEmail,
        amount: amount,
        currency: countryData.currency.code,
        country: country,
        payment_method_id: paymentMethodId,
        payment_proof_url: urlData.publicUrl,
        status: 'pending_verification',
        created_at: new Date().toISOString()
      })

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      
      // Clean up uploaded file if payment creation fails
      await serviceSupabase.storage
        .from('payment-proofs')
        .remove([filePath])

      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      )
    }

    // TODO: Send real-time notification to merchant
    // This would typically be done via Supabase Realtime or webhooks
    
    // TODO: Send email notification to customer
    // This would be implemented using Supabase Edge Functions or similar

    return NextResponse.json({
      success: true,
      payment_id: paymentId,
      message: 'Payment submitted successfully'
    })

  } catch (error) {
    console.error('Payment submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 