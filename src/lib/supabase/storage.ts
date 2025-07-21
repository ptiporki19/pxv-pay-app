import { createClient } from '@/lib/supabase/client'

export interface UploadResult {
  url: string
  path: string
}

class StorageService {
  private supabase = createClient()
  private bucketName = 'product-images'

  async uploadPaymentMethodImage(file: File, userId: string): Promise<UploadResult> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // Upload file to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from('payment-method-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        console.error('Upload error:', error)
        throw new Error(`Failed to upload image: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('payment-method-images')
        .getPublicUrl(fileName)

      return {
        url: urlData.publicUrl,
        path: fileName,
      }
    } catch (error) {
      console.error('Storage service error:', error)
      throw error
    }
  }

  async uploadProductImage(file: File, userId: string): Promise<UploadResult> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // Upload file to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        console.error('Upload error:', error)
        throw new Error(`Failed to upload image: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName)

      return {
        url: urlData.publicUrl,
        path: fileName,
      }
    } catch (error) {
      console.error('Storage service error:', error)
      throw error
    }
  }

  async deleteProductImage(path: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([path])

      if (error) {
        console.error('Delete error:', error)
        throw new Error(`Failed to delete image: ${error.message}`)
      }
    } catch (error) {
      console.error('Storage service error:', error)
      throw error
    }
  }

  getImageUrl(path: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path)
    
    return data.publicUrl
  }
}

export const storageService = new StorageService() 