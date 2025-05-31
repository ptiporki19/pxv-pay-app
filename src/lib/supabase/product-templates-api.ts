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

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category)
      }
      
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }
      
      if (filters?.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured)
      }
      
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,product_key.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
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
      return data
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
      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Check if product key already exists for this user
      const { data: existing } = await this.supabase
        .from('product_templates')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_key', productData.product_key)
        .single()

      if (existing) {
        throw new Error('A product with this key already exists')
      }

      const { data, error } = await this.supabase
        .from('product_templates')
        .insert({
          ...productData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating product template:', error)
      throw error
    }
  }

  async update(id: string, productData: UpdateProductTemplateData): Promise<ProductTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('product_templates')
        .update(productData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
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
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error toggling product template status:', error)
      throw error
    }
  }

  async toggleFeatured(id: string, isFeatured: boolean): Promise<ProductTemplate> {
    try {
      const { data, error } = await this.supabase
        .from('product_templates')
        .update({ is_featured: isFeatured })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
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