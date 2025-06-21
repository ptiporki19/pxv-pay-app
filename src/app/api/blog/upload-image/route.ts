import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import sharp from 'sharp'

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
    if (!['super_admin'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions - only super admins can upload blog images' },
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

    // Validate file size (10MB limit for original, will be resized)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size must be less than 10MB' },
        { status: 400 }
      )
    }

    console.log('📊 Original image file received:', {
      hasImageFile: !!imageFile,
      imageFileType: imageFile?.type,
      imageFileName: imageFile?.name,
      imageFileSize: imageFile?.size
    })

    // Get original file buffer
    let originalBuffer
    try {
      originalBuffer = await imageFile.arrayBuffer()
      console.log('✅ Original file buffer created, size:', originalBuffer.byteLength)
    } catch (bufferError) {
      console.error('❌ File buffer error:', bufferError)
      return NextResponse.json(
        { error: 'Failed to process file' },
        { status: 500 }
      )
    }

    // ✨ Resize image using Sharp for consistency across blog posts
    console.log('🔧 Resizing image for blog consistency...')
    let resizedBuffer
    try {
      resizedBuffer = await sharp(originalBuffer)
        .resize(1200, 675, {
          fit: 'cover', // Crop to fit exact dimensions
          position: 'center' // Center the crop
        })
        .jpeg({ 
          quality: 85, // Good quality while keeping file size reasonable
          progressive: true // Better loading experience
        })
        .toBuffer()
      
      console.log('✅ Image resized successfully:', {
        originalSize: originalBuffer.byteLength,
        resizedSize: resizedBuffer.byteLength,
        dimensions: '1200x675',
        quality: '85%',
        reduction: `${Math.round((1 - resizedBuffer.byteLength / originalBuffer.byteLength) * 100)}%`
      })
    } catch (resizeError) {
      console.error('❌ Image resize error:', resizeError)
      return NextResponse.json(
        { error: 'Failed to process image' },
        { status: 500 }
      )
    }

    console.log('🗄️ Using authenticated client for file upload...')
    // Use the authenticated client instead of service role
    // Since we already checked permissions above, this should work

    console.log('📤 Uploading resized blog image...')
    // Upload resized image file to Supabase Storage
    const fileName = `${randomUUID()}.jpg` // Always save as optimized JPEG
    const filePath = `blog-posts/${fileName}`

    console.log('📋 Upload details:', {
      fileName,
      filePath,
      originalSize: originalBuffer.byteLength,
      resizedSize: resizedBuffer.byteLength,
      dimensions: '1200x675px',
      format: 'JPEG'
    })

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, resizedBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg' // Always JPEG after processing
      })

    if (uploadError) {
      console.error('❌ File upload error:', {
        error: uploadError,
        message: uploadError.message,
        filePath,
        bucketName: 'blog-images'
      })
      return NextResponse.json(
        { error: `Failed to upload image file: ${uploadError.message}` },
        { status: 500 }
      )
    }
    console.log('✅ Resized image uploaded to:', filePath)

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath)

    console.log('✅ Blog image processed and uploaded successfully:', urlData.publicUrl)

    return NextResponse.json({
      success: true,
      imageUrl: urlData.publicUrl,
      filePath: filePath,
      processing: {
        originalSize: originalBuffer.byteLength,
        resizedSize: resizedBuffer.byteLength,
        dimensions: '1200x675',
        format: 'JPEG',
        quality: 85
      }
    })

  } catch (error) {
    console.error('💥 Blog image upload failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 