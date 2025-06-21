// Checkout System Types - Phase 1 Foundation
// New types only, no modifications to existing types

export interface CheckoutLink {
  id: string
  merchant_id: string
  slug: string
  link_name: string
  title: string // Display title for the checkout link
  amount: number // Fixed amount for this checkout link
  currency: string // Currency code (USD, EUR, etc.)
  status: 'active' | 'inactive' | 'expired' | 'draft' // Link status
  active_country_codes: string[]
  is_active: boolean
  
  // Customization overrides
  logo_url?: string | null
  checkout_page_heading?: string | null
  payment_review_message?: string | null
  
  // Analytics and relationships
  payments?: { count: number }[] // For payment count aggregation
  
  created_at: string
  updated_at: string
}

export interface MerchantCheckoutSettings {
  id: string
  merchant_id: string
  
  // Default customization settings
  default_logo_url?: string | null
  default_checkout_page_heading: string
  default_manual_payment_instructions: string
  default_payment_review_message: string
  
  // Email templates
  payment_approved_email_subject: string
  payment_approved_email_body: string
  payment_rejected_email_subject: string
  payment_rejected_email_body: string
  
  created_at: string
  updated_at: string
}

// Form data types for creating/updating checkout links
export interface CreateCheckoutLinkData {
  link_name: string
  active_country_codes: string[]
  logo_url?: string | null
  checkout_page_heading?: string | null
  payment_review_message?: string | null
}

export interface UpdateCheckoutLinkData extends Partial<CreateCheckoutLinkData> {
  is_active?: boolean
}

// Form data types for checkout settings
export interface UpdateCheckoutSettingsData {
  default_logo_url?: string | null
  default_checkout_page_heading?: string
  default_manual_payment_instructions?: string
  default_payment_review_message?: string
  payment_approved_email_subject?: string
  payment_approved_email_body?: string
  payment_rejected_email_subject?: string
  payment_rejected_email_body?: string
}

// Public checkout flow types
export interface CheckoutSessionData {
  checkout_link_id: string
  customer_name: string
  customer_email: string
  amount: number
  country_code: string
  currency: string
  selected_payment_method_id?: string
}

export interface CheckoutValidationResult {
  valid: boolean
  checkout_link?: CheckoutLink
  merchant_settings?: MerchantCheckoutSettings
  error?: string
}

// Enhanced payment types for checkout (extending existing without modification)
export interface CheckoutPaymentData {
  customer_name: string
  customer_email: string
  amount: number
  currency: string
  country: string
  payment_method: string
  checkout_link_id: string
  merchant_id: string
  payment_proof_url?: string
  status: 'pending_verification' | 'approved' | 'rejected' | 'expired'
  status_update_notes?: string
  verification_date?: string
  verified_by?: string
} 