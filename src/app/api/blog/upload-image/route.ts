import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  console.log('🚀 Blog image upload started');
  
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and authorized (super admin or content author)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to upload blog images
    if (!['super_admin', 'content_author'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    console.log('📝 Parsing form data...');
    let formData
    try {
      formData = await request.formData()
      console.log('✅ FormData parsed successfully')
    } catch (formError) {
      console.error('❌ FormData parsing error:', formError)
      return NextResponse.json(
        { error: 'Failed to parse form data' },
        { status: 400 }
      )
    }

    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Please select a valid image file' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size must be less than 5MB' },
        { status: 400 }
      )
    }

    console.log('📊 Image file received:', {
      hasImageFile: !!imageFile,
      imageFileType: imageFile?.type,
      imageFileName: imageFile?.name,
      imageFileSize: imageFile?.size
    })

    console.log('🗄️ Creating service client for file upload...')
    // Create service role client for file upload (same as payment proofs)
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    )

    console.log('📤 Uploading blog image...')
    // Upload image file to Supabase Storage (same pattern as payment proofs)
    const fileExtension = imageFile.name.split('.').pop()
    const fileName = `${randomUUID()}.${fileExtension}`
    const filePath = `blog-posts/${fileName}`

    console.log('📋 Upload details:', {
      fileName,
      filePath,
      fileSize: imageFile.size,
      fileType: imageFile.type
    })

    let fileBuffer
    try {
      fileBuffer = await imageFile.arrayBuffer()
      console.log('✅ File buffer created, size:', fileBuffer.byteLength)
    } catch (bufferError) {
      console.error('❌ File buffer error:', bufferError)
      return NextResponse.json(
        { error: 'Failed to process file' },
        { status: 500 }
      )
    }

    const { error: uploadError } = await serviceSupabase.storage
      .from('blog-images')
      .upload(filePath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: imageFile.type || 'application/octet-stream'
      })

    if (uploadError) {
      console.error('❌ File upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload image file' },
        { status: 500 }
      )
    }
    console.log('✅ File uploaded to:', filePath)

    // Get public URL for the uploaded file
    const { data: urlData } = serviceSupabase.storage
      .from('blog-images')
      .getPublicUrl(filePath)

    console.log('✅ Blog image uploaded successfully:', urlData.publicUrl)

    return NextResponse.json({
      success: true,
      imageUrl: urlData.publicUrl,
      filePath: filePath
    })

  } catch (error) {
    console.error('💥 Blog image upload failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 