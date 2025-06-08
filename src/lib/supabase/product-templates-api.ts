import { createClient } from '@/lib/supabase/client'
import type { ProductTemplate } from '@/types/content'

export interface CreateProductTemplateData {
  product_key: string
  name: string
  description: string
  short_description?: string
  price?: number
  currency?: string
  pricing_type: 'fixed' | 'flexible' | 'tiered'
  min_price?: number
  max_price?: number
  category: 'digital' | 'physical' | 'service' | 'subscription' | 'donation'
  tags?: string[]
  featured_image?: string
  gallery_images?: string[]
  content_blocks?: any[]
  features?: string[]
  specifications?: Record<string, any>
  seo_title?: string
  seo_description?: string
  is_active: boolean
  is_featured: boolean
}

export interface UpdateProductTemplateData extends Partial<CreateProductTemplateData> {}

export interface ProductTemplateFilters {
  category?: string
  is_active?: boolean
  is_featured?: boolean
  search?: string
}

class ProductTemplatesAPI {
  private supabase = createClient()

  async getAll(filters?: ProductTemplateFilters): Promise<ProductTemplate[]> {
    try {
      let query = this.supabase
        .from('product_templates')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters - map to actual column names
      if (filters?.category) {
        query = query.eq('category', filters.category)
      }
      
      if (filters?.is_active !== undefined) {
        query = query.eq('active', filters.is_active)
      }
      
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      
      // Map the response data to expected format
      const mappedData = (data || []).map(item => ({
        ...item,
        product_key: item.template_data?.product_key || '',
        short_description: item.template_data?.short_description,
        price: item.default_amount,
        featured_image: item.image_url,
        pricing_type: item.template_data?.pricing_type || 'fixed',
        min_price: item.template_data?.min_price,
        max_price: item.template_data?.max_price,
        tags: item.template_data?.tags,
        gallery_images: item.template_data?.gallery_images,
        content_blocks: item.template_data?.content_blocks || [],
        features: item.template_data?.features,
        specifications: item.template_data?.specifications || {},
        seo_title: item.template_data?.seo_title,
        seo_description: item.template_data?.seo_description,
        is_active: item.active,
        is_featured: item.template_data?.is_featured || false,
      }))
      
      return mappedData
    } catch (error) {
      console.error('Error fetching product templates:', error)
      throw error
    }
  }

  async getById(id: string): Promise<ProductTemplate | null> {
    try {
      const { data, error } = await this.supabase
        .from('product_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) return null
      
      // Map the response data to expected format
      const mappedData = {
        ...data,
        product_key: data.template_data?.product_key || '',
        short_description: data.template_data?.short_description,
        price: data.default_amount,
        featured_image: data.image_url,
        pricing_type: data.template_data?.pricing_type || 'fixed',
        min_price: data.template_data?.min_price,
        max_price: data.template_data?.max_price,
        tags: data.template_data?.tags,
        gallery_images: data.template_data?.gallery_images,
        content_blocks: data.template_data?.content_blocks || [],
        features: data.template_data?.features,
        specifications: data.template_data?.specifications || {},
        seo_title: data.template_data?.seo_title,
        seo_description: data.template_data?.seo_description,
        is_active: data.active,
        is_featured: data.template_data?.is_featured || false,
      }
      
      return mappedData
    } catch (error) {
      console.error('Error fetching product template:', error)
      throw error
    }
  }

  async getByProductKey(productKey: string): Promise<ProductTemplate | null> {
    try {
      const { data, error } = await this.supabase
        .from('product_templates')
        .select('*')
        .eq('product_key', productKey)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching product template by key:', error)
      throw error
    }
  }

  async create(productData: CreateProductTemplateData): Promise<ProductTemplate> {
    try {
      // Get current user with better error handling
      const { data: authData, error: authError } = await this.supabase.auth.getUser()
      
      if (authError) {
        console.error('Authentication error:', authError)
        throw new Error(`Authentication failed: ${authError.message}`)
      }
      
      if (!authData?.user) {
        throw new Error('User not authenticated - please log in and try again')
      }

      const authUser = authData.user
      console.log('Creating product template for auth user:', authUser.id, authUser.email)

      // Get the database user ID using email lookup (like other APIs)
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', authUser.email)
        .single()

      if (userError) {
        console.error('Error fetching user data:', userError)
        throw new Error('Failed to get user information')
      }

      if (!userData) {
        throw new Error('User not found in database')
      }

      console.log('Using database user ID:', userData.id)

      // Map the input data to the actual database columns
      const mappedData = {
        user_id: userData.id,
        name: productData.name,
        description: productData.description,
        category: productData.category,
        default_amount: productData.price || null,
        currency: productData.currency || 'USD',
        image_url: productData.featured_image || null,
        template_data: {
          product_key: productData.product_key,
          short_description: productData.short_description,
          pricing_type: productData.pricing_type || 'fixed',
          min_price: productData.min_price,
          max_price: productData.max_price,
          tags: productData.tags,
          gallery_images: productData.gallery_images,
          content_blocks: productData.content_blocks,
          features: productData.features,
          specifications: productData.specifications,
          seo_title: productData.seo_title,
          seo_description: productData.seo_description,
        },
        active: productData.is_active !== false, // Default to true if not specified
      }

      console.log('Inserting product template data:', mappedData)

      const { data, error } = await this.supabase
        .from('product_templates')
        .insert(mappedData)
        .select()
        .single()

      if (error) {
        console.error('Database insert error:', error)
        
        // Provide specific error messages for common issues
        if (error.code === '42501') {
          throw new Error('Permission denied - you do not have access to create product templates')
        }
        
        if (error.code === '23505') {
          throw new Error('A product template with this name already exists')
        }
        
        if (error.message) {
          throw new Error(`Database error: ${error.message}`)
        }
        
        throw new Error('Failed to create product template - unknown database error')
      }

      if (!data) {
        throw new Error('Product template creation failed - no data returned')
      }
      
      console.log('Product template created successfully:', data.id)
      
      // Map the response back to the expected format
      const responseData = {
        ...data,
        product_key: data.template_data?.product_key || '',
        short_description: data.template_data?.short_description,
        price: data.default_amount,
        featured_image: data.image_url,
        pricing_type: data.template_data?.pricing_type || 'fixed',
        min_price: data.template_data?.min_price,
        max_price: data.template_data?.max_price,
        tags: data.template_data?.tags,
        gallery_images: data.template_data?.gallery_images,
        content_blocks: data.template_data?.content_blocks || [],
        features: data.template_data?.features,
        specifications: data.template_data?.specifications || {},
        seo_title: data.template_data?.seo_title,
        seo_description: data.template_data?.seo_description,
        is_active: data.active,
        is_featured: data.template_data?.is_featured || false,
      }
      
      return responseData
    } catch (error) {
      console.error('Error creating product template:', error)
      
      // Ensure we always throw an Error object with a message
      if (error instanceof Error) {
        throw error
      }
      
      // Handle cases where error might be empty object or weird format
      if (typeof error === 'object' && error !== null) {
        const errorMsg = (error as any).message || (error as any).error || JSON.stringify(error)
        throw new Error(`Product template creation failed: ${errorMsg}`)
      }
      
      throw new Error('Product template creation failed due to an unknown error')
    }
  }

  async update(id: string, productData: UpdateProductTemplateData): Promise<ProductTemplate> {
    try {
      // Map the input data to the actual database columns
      const mappedData: any = {}
      
      if (productData.name !== undefined) mappedData.name = productData.name
      if (productData.description !== undefined) mappedData.description = productData.description
      if (productData.category !== undefined) mappedData.category = productData.category
      if (productData.price !== undefined) mappedData.default_amount = productData.price
      if (productData.currency !== undefined) mappedData.currency = productData.currency
      if (productData.featured_image !== undefined) mappedData.image_url = productData.featured_image
      if (productData.is_active !== undefined) mappedData.active = productData.is_active
      
      // Handle template_data updates
      if (productData.product_key !== undefined || 
          productData.short_description !== undefined ||
          productData.pricing_type !== undefined ||
          productData.min_price !== undefined ||
          productData.max_price !== undefined ||
          productData.tags !== undefined ||
          productData.gallery_images !== undefined ||
          productData.content_blocks !== undefined ||
          productData.features !== undefined ||
          productData.specifications !== undefined ||
          productData.seo_title !== undefined ||
          productData.seo_description !== undefined) {
        
        // Get current template_data first
        const { data: current } = await this.supabase
          .from('product_templates')
          .select('template_data')
          .eq('id', id)
          .single()
        
        const currentTemplateData = current?.template_data || {}
        
        mappedData.template_data = {
          ...currentTemplateData,
          ...(productData.product_key !== undefined && { product_key: productData.product_key }),
          ...(productData.short_description !== undefined && { short_description: productData.short_description }),
          ...(productData.pricing_type !== undefined && { pricing_type: productData.pricing_type }),
          ...(productData.min_price !== undefined && { min_price: productData.min_price }),
          ...(productData.max_price !== undefined && { max_price: productData.max_price }),
          ...(productData.tags !== undefined && { tags: productData.tags }),
          ...(productData.gallery_images !== undefined && { gallery_images: productData.gallery_images }),
          ...(productData.content_blocks !== undefined && { content_blocks: productData.content_blocks }),
          ...(productData.features !== undefined && { features: productData.features }),
          ...(productData.specifications !== undefined && { specifications: productData.specifications }),
          ...(productData.seo_title !== undefined && { seo_title: productData.seo_title }),
          ...(productData.seo_description !== undefined && { seo_description: productData.seo_description }),
        }
      }

      const { data, error } = await this.supabase
        .from('product_templates')
        .update(mappedData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      // Map the response back to the expected format
      const responseData = {
        ...data,
        product_key: data.template_data?.product_key || '',
        short_description: data.template_data?.short_description,
        price: data.default_amount,
        featured_image: data.image_url,
        pricing_type: data.template_data?.pricing_type || 'fixed',
        min_price: data.template_data?.min_price,
        max_price: data.template_data?.max_price,
        tags: data.template_data?.tags,
        gallery_images: data.template_data?.gallery_images,
        content_blocks: data.template_data?.content_blocks || [],
        features: data.template_data?.features,
        specifications: data.template_data?.specifications || {},
        seo_title: data.template_data?.seo_title,
        seo_description: data.template_data?.seo_description,
        is_active: data.active,
        is_featured: data.template_data?.is_featured || false,
      }
      
      return responseData
    } catch (error) {
      console.error('Error updating product template:', error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Check if product is being used in any checkout links
      const { data: checkoutLinks, error: checkError } = await this.supabase
        .from('checkout_links')
        .select('id, title')
        .eq('product_template_id', id)
        .limit(1)

      if (checkError) throw checkError

      if (checkoutLinks && checkoutLinks.length > 0) {
        throw new Error('Cannot delete product template. It is being used in checkout links.')
      }

      const { error } = await this.supabase
        .from('product_templates')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting product template:', error)
      throw error
    }
  }

  async toggleActive(id: string, isActive: boolean): Promise<ProductTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('product_templates')
        .update({ active: isActive })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      // Map the response back to the expected format
      const responseData = {
        ...data,
        product_key: data.template_data?.product_key || '',
        short_description: data.template_data?.short_description,
        price: data.default_amount,
        featured_image: data.image_url,
        pricing_type: data.template_data?.pricing_type || 'fixed',
        min_price: data.template_data?.min_price,
        max_price: data.template_data?.max_price,
        tags: data.template_data?.tags,
        gallery_images: data.template_data?.gallery_images,
        content_blocks: data.template_data?.content_blocks || [],
        features: data.template_data?.features,
        specifications: data.template_data?.specifications || {},
        seo_title: data.template_data?.seo_title,
        seo_description: data.template_data?.seo_description,
        is_active: data.active,
        is_featured: data.template_data?.is_featured || false,
      }
      
      return responseData
    } catch (error) {
      console.error('Error toggling product template status:', error)
      throw error
    }
  }

  async toggleFeatured(id: string, isFeatured: boolean): Promise<ProductTemplate> {
    try {
      // Since is_featured column doesn't exist in current schema, we'll store it in template_data
      const { data: current } = await this.supabase
        .from('product_templates')
        .select('template_data')
        .eq('id', id)
        .single()
      
      const currentTemplateData = current?.template_data || {}
      
      const { data, error } = await this.supabase
        .from('product_templates')
        .update({ 
          template_data: {
            ...currentTemplateData,
            is_featured: isFeatured
          }
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      // Map the response back to the expected format
      const responseData = {
        ...data,
        product_key: data.template_data?.product_key || '',
        short_description: data.template_data?.short_description,
        price: data.default_amount,
        featured_image: data.image_url,
        pricing_type: data.template_data?.pricing_type || 'fixed',
        min_price: data.template_data?.min_price,
        max_price: data.template_data?.max_price,
        tags: data.template_data?.tags,
        gallery_images: data.template_data?.gallery_images,
        content_blocks: data.template_data?.content_blocks || [],
        features: data.template_data?.features,
        specifications: data.template_data?.specifications || {},
        seo_title: data.template_data?.seo_title,
        seo_description: data.template_data?.seo_description,
        is_active: data.active,
        is_featured: data.template_data?.is_featured || false,
      }
      
      return responseData
    } catch (error) {
      console.error('Error toggling product template featured status:', error)
      throw error
    }
  }

  async getUsageStats(id: string): Promise<{ checkoutLinksCount: number; totalPayments: number }> {
    try {
      // Get checkout links using this product
      const { data: checkoutLinks, error: linksError } = await this.supabase
        .from('checkout_links')
        .select('id')
        .eq('product_template_id', id)

      if (linksError) throw linksError

      const checkoutLinkIds = checkoutLinks?.map(link => link.id) || []
      let totalPayments = 0

      if (checkoutLinkIds.length > 0) {
        // Get payments for these checkout links
        const { count, error: paymentsError } = await this.supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .in('checkout_link_id', checkoutLinkIds)

        if (paymentsError) throw paymentsError
        totalPayments = count || 0
      }

      return {
        checkoutLinksCount: checkoutLinks?.length || 0,
        totalPayments
      }
    } catch (error) {
      console.error('Error fetching product template usage stats:', error)
      throw error
    }
  }

  async duplicate(id: string, newProductKey: string, newName: string): Promise<ProductTemplate> {
    try {
      // Get original product
      const original = await this.getById(id)
      if (!original) throw new Error('Product template not found')

      // Create duplicate with new key and name
      const duplicateData: CreateProductTemplateData = {
        product_key: newProductKey,
        name: newName,
        description: original.description,
        short_description: original.short_description,
        price: original.price,
        currency: original.currency,
        pricing_type: original.pricing_type,
        min_price: original.min_price,
        max_price: original.max_price,
        category: original.category,
        tags: original.tags,
        featured_image: original.featured_image,
        gallery_images: original.gallery_images,
        content_blocks: original.content_blocks,
        features: original.features,
        specifications: original.specifications,
        seo_title: original.seo_title,
        seo_description: original.seo_description,
        is_active: false, // New duplicates start as inactive
        is_featured: false,
      }

      return await this.create(duplicateData)
    } catch (error) {
      console.error('Error duplicating product template:', error)
      throw error
    }
  }
}

export const productTemplatesApi = new ProductTemplatesAPI()

// Update product template
export async function updateProductTemplate(id: string, data: Partial<CreateProductTemplateData>) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User must be authenticated')

  // Only include non-undefined values in the update
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const { data: updatedTemplate, error } = await supabase
    .from('product_templates')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  return updatedTemplate
} 