import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = await params
  console.log('🚀 Payment submission started for slug:', slug);
  
  try {
    const supabase = await createClient()

    console.log('📝 Parsing form data...');
    let formData;
    try {
      formData = await request.formData();
      console.log('✅ FormData parsed successfully');
    } catch (formError) {
      console.error('❌ FormData parsing error:', formError);
      return NextResponse.json(
        { error: 'Failed to parse form data' },
        { status: 400 }
      );
    }

    let proofFile, customerName, customerEmail, amount, country, paymentMethodId, checkoutLinkId;
    try {
      proofFile = formData.get('proof') as File;
      customerName = formData.get('customer_name') as string;
      customerEmail = formData.get('customer_email') as string;
      amount = parseFloat(formData.get('amount') as string);
      country = formData.get('country') as string;
      paymentMethodId = formData.get('payment_method_id') as string;
      checkoutLinkId = formData.get('checkout_link_id') as string;
      console.log('✅ Form fields extracted successfully');
    } catch (extractError) {
      console.error('❌ Field extraction error:', extractError);
      return NextResponse.json(
        { error: 'Failed to extract form fields' },
        { status: 400 }
      );
    }

    console.log('📊 Form data received:', {
      customerName,
      customerEmail,
      amount,
      country,
      paymentMethodId,
      checkoutLinkId,
      hasProofFile: !!proofFile,
      proofFileType: proofFile?.type,
      proofFileName: proofFile?.name,
      proofFileSize: proofFile?.size
    });

    // Validate required fields
    if (!proofFile || !customerName || !customerEmail || !amount || !country || !paymentMethodId || !checkoutLinkId) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('🔍 Validating checkout link...');
    // Validate checkout link
    const { data: checkoutLink, error: linkError } = await supabase
      .from('checkout_links')
      .select('*, merchant_id')
      .eq('slug', slug)
      .eq('id', checkoutLinkId)
      .eq('status', 'active')
      .single()

    if (linkError || !checkoutLink) {
      console.log('❌ Checkout link validation failed:', linkError);
      return NextResponse.json(
        { error: 'Invalid checkout link' },
        { status: 404 }
      )
    }
    console.log('✅ Checkout link validated:', checkoutLink.id);

    console.log('�� Validating country and currency...');
    // Get country data with currency_code
    const { data: countryData, error: countryError } = await supabase
      .from('countries')
      .select('id, name, code, currency_code')
      .eq('code', country)
      .single()

    if (countryError || !countryData) {
      console.log('❌ Country validation failed:', countryError);
      return NextResponse.json(
        { error: 'Invalid country' },
        { status: 400 }
      )
    }

    // Fetch currency details using the currency_code
    let currencyData = null;
    if (countryData.currency_code) {
      const { data: currency, error: currencyError } = await supabase
        .from('currencies')
        .select('id, name, code, symbol')
        .eq('code', countryData.currency_code)
        .eq('active', true)
        .single()

      if (!currencyError && currency) {
        currencyData = currency;
      }
    }

    const finalCurrency = currencyData?.code || 'USD';
    console.log('✅ Country validated:', countryData.name, 'Currency:', finalCurrency);

    console.log('💳 Validating payment method...');
    // Validate payment method
    const { data: paymentMethod, error: methodError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', paymentMethodId)
      .eq('status', 'active')
      .single()

    if (methodError || !paymentMethod) {
      console.log('❌ Payment method validation failed:', methodError);
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }
    console.log('✅ Payment method validated:', paymentMethod.name);

    console.log('🗄️ Creating service client for file upload...');
    // Create service role client for file upload
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    )

    console.log('📤 Uploading proof file...');
    // Upload proof file to Supabase Storage
    const fileExtension = proofFile.name.split('.').pop()
    const fileName = `${randomUUID()}.${fileExtension}`
    const filePath = `${checkoutLink.merchant_id}/${fileName}`

    console.log('📋 Upload details:', {
      fileName,
      filePath,
      fileSize: proofFile.size,
      fileType: proofFile.type
    });

    let fileBuffer;
    try {
      fileBuffer = await proofFile.arrayBuffer();
      console.log('✅ File buffer created, size:', fileBuffer.byteLength);
    } catch (bufferError) {
      console.error('❌ File buffer error:', bufferError);
      return NextResponse.json(
        { error: 'Failed to process file' },
        { status: 500 }
      );
    }

    const { error: uploadError } = await serviceSupabase.storage
      .from('payment-proofs')
      .upload(filePath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: proofFile.type || 'application/octet-stream'
      })

    if (uploadError) {
      console.error('❌ File upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload proof file' },
        { status: 500 }
      )
    }
    console.log('✅ File uploaded to:', filePath);

    // Get public URL for the uploaded file
    const { data: urlData } = serviceSupabase.storage
      .from('payment-proofs')
      .getPublicUrl(filePath)

    console.log('💾 Creating payment record...');
    // Create payment record with better error handling
    const paymentId = randomUUID()
    const paymentData = {
        id: paymentId,
        merchant_id: checkoutLink.merchant_id,
        checkout_link_id: checkoutLinkId,
        customer_name: customerName,
        customer_email: customerEmail,
        amount: amount,
        currency: finalCurrency,
        country: country,
        payment_method: paymentMethod.name,
        payment_proof_url: urlData.publicUrl,
        status: 'pending_verification',
        created_at: new Date().toISOString()
    };

    console.log('📋 Payment data to insert:', paymentData);

    const { error: paymentError } = await serviceSupabase
      .from('payments')
      .insert(paymentData)

    if (paymentError) {
      console.error('❌ Payment creation error:', paymentError)
      
      // Clean up uploaded file if payment creation fails
      await serviceSupabase.storage
        .from('payment-proofs')
        .remove([filePath])

      // Provide more specific error messages
      if (paymentError.code === '23503') {
        return NextResponse.json(
          { error: 'Invalid merchant or checkout link reference' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      )
    }

    console.log('✅ Payment created successfully:', paymentId);

    // 🔔 Send real-time notifications
    console.log('🔔 Sending real-time notifications...');
    
    try {
      // 1. Notification to the merchant
      await serviceSupabase
        .from('notifications')
        .insert({
          user_id: checkoutLink.merchant_id,
          title: 'New Payment Received',
          message: `Payment of ${amount} ${finalCurrency} from ${customerName} requires verification`,
          type: 'success',
          data: {
            payment_id: paymentId,
            customer_name: customerName,
            amount: amount,
            currency: finalCurrency,
            checkout_link_id: checkoutLinkId
          }
        });

      // 2. Get super admins and send notifications to them too
      const { data: superAdmins } = await serviceSupabase
        .from('users')
        .select('id')
        .eq('role', 'super_admin');

      if (superAdmins && superAdmins.length > 0) {
        const superAdminNotifications = superAdmins.map(admin => ({
          user_id: admin.id,
          title: 'New Payment Submitted',
          message: `Payment verification needed: ${amount} ${finalCurrency} from ${customerName}`,
          type: 'info',
          data: {
            payment_id: paymentId,
            merchant_id: checkoutLink.merchant_id,
            customer_name: customerName,
            amount: amount,
            currency: finalCurrency
          }
        }));

        await serviceSupabase
          .from('notifications')
          .insert(superAdminNotifications);
      }

      console.log('✅ Real-time notifications sent successfully');
    } catch (notificationError) {
      console.error('⚠️ Notification sending failed (payment still created):', notificationError);
      // Don't fail the payment creation if notifications fail
    }

    return NextResponse.json({
      success: true,
      payment_id: paymentId,
      message: 'Payment submitted successfully'
    })

  } catch (error) {
    console.error('💥 Payment submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 