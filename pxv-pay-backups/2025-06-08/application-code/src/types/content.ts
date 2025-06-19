// Base content template (existing functionality)
export interface ContentTemplate {
  id: string
  user_id: string
  template_key: string
  title: string
  content: string
  content_type: 'text' | 'html' | 'markdown' | 'json'
  category: string
  language: string
  variables: Record<string, any>
  metadata: Record<string, any>
  is_active: boolean
  version: number
  created_at: string
  updated_at: string
}

// New product template (enhanced content)
export interface ProductTemplate {
  id: string
  user_id: string
  product_key: string // Unique identifier
  name: string // Product name
  description: string // Rich description
  short_description?: string // Brief summary
  price?: number // Default price (can be overridden in checkout)
  currency?: string // Default currency
  category: 'digital' | 'physical' | 'service' | 'subscription' | 'donation'
  
  // Media
  featured_image?: string // Main product image
  gallery_images?: string[] // Additional images
  
  // Rich content
  content_blocks: ProductContentBlock[]
  
  // Pricing
  pricing_type: 'fixed' | 'flexible' | 'tiered'
  min_price?: number
  max_price?: number
  
  // Features and specifications
  features?: string[]
  specifications?: Record<string, string>
  
  // SEO and metadata
  seo_title?: string
  seo_description?: string
  tags?: string[]
  
  // Status
  is_active: boolean
  is_featured: boolean
  
  // Timestamps
  created_at: string
  updated_at: string
}

// Content blocks for rich product descriptions
export interface ProductContentBlock {
  id: string
  type: 'text' | 'image' | 'video' | 'features_list' | 'specifications' | 'testimonial' | 'cta'
  content: any
  order: number
}

// Enhanced checkout link with product support
export interface EnhancedCheckoutLink {
  id: string
  merchant_id: string
  slug: string
  title: string
  link_name: string
  
  // Checkout type
  checkout_type: 'simple' | 'product'
  
  // Product reference (for product checkouts)
  product_template_id?: string
  product_template?: ProductTemplate
  
  // Pricing (can override product pricing)
  amount_type: 'fixed' | 'flexible'
  amount: number
  min_amount?: number
  max_amount?: number
  currency: string
  
  // Availability
  active_country_codes: string[]
  
  // Customization
  logo_url?: string
  checkout_page_heading?: string
  payment_review_message?: string
  
  // Status
  status: 'active' | 'inactive' | 'draft'
  is_active: boolean
  
  // Timestamps
  created_at: string
  updated_at: string
}

// Form data for creating checkout links
export interface CreateCheckoutLinkFormData {
  title: string
  link_name: string
  checkout_type: 'simple' | 'product'
  
  // For simple checkouts
  amount_type: 'fixed' | 'flexible'
  amount?: number
  min_amount?: number
  max_amount?: number
  
  // For product checkouts
  product_template_id?: string
  override_pricing?: boolean
  
  // Common fields
  active_country_codes: string[]
  status: 'active' | 'inactive' | 'draft'
} 