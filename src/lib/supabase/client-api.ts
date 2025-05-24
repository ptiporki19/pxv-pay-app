import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'

const supabase = createClient()

// Helper function to get current user - returns null if not authenticated
async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Auth error:', error)
      return null
    }
    return user
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}

// Define interfaces
export interface Country {
  id?: string
  name: string
  code: string
  status: 'active' | 'pending' | 'inactive'
  user_id?: string
  created_at?: string
  updated_at?: string
}

export interface Currency {
  id?: string
  name: string
  code: string
  symbol: string
  status: 'active' | 'pending' | 'inactive'
  user_id?: string
  created_at?: string
  updated_at?: string
}

export interface CustomField {
  id: string
  label: string
  type: 'text' | 'number' | 'email' | 'tel' | 'textarea'
  placeholder?: string
  required: boolean
  value?: string
}

export interface PaymentMethod {
  id?: string
  name: string
  type: 'bank' | 'mobile' | 'crypto' | 'payment-link' | 'manual'
  countries: string[]
  status: 'active' | 'pending' | 'inactive'
  icon?: string | null
  instructions?: string | null
  url?: string | null // For payment-link type
  description?: string | null // For detailed descriptions
  custom_fields?: CustomField[] | null // For manual payment methods
  user_id?: string
  created_at?: string
  updated_at?: string
}

export interface Payment {
  id?: string
  user_id?: string
  merchant_id?: string | null
  amount: number
  currency: string
  payment_method: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  country?: string | null
  description?: string | null
  metadata?: any
  created_at?: string
  updated_at?: string
}

// Countries API
export const countriesApi = {
  getAll: async (): Promise<Country[]> => {
    const user = await getCurrentUser()
    if (!user) {
      // Return empty array if user not authenticated, let auth flow handle it
      console.log('User not authenticated, returning empty countries list')
      return []
    }
    
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching countries:', error)
      throw new Error(error.message)
    }
    
    return data || []
  },
  
  getById: async (id: string): Promise<Country> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      console.error('Error fetching country:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  create: async (country: Country): Promise<Country> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Explicitly set user_id for the country
    const countryWithUser = { ...country, user_id: user.id }
    
    const { data, error } = await supabase
      .from('countries')
      .insert([countryWithUser])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating country:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  update: async (id: string, country: Partial<Country>): Promise<Country> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Remove user_id from the update object to prevent conflicts
    const { user_id, ...updateData } = country
    
    const { data, error } = await supabase
      .from('countries')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating country:', error)
      
      // Provide more specific error messages
      if (error.code === '23505') {
        if (error.message.includes('countries_user_code_unique')) {
          throw new Error(`Country code '${updateData.code}' already exists in your account`)
        }
        if (error.message.includes('countries_user_name_unique')) {
          throw new Error(`Country name '${updateData.name}' already exists in your account`)
        }
        throw new Error('A country with this code or name already exists in your account')
      }
      
      if (error.code === '42501') {
        throw new Error('You do not have permission to update this country')
      }
      
      throw new Error(error.message || 'Failed to update country')
    }
    
    if (!data) {
      throw new Error('Country not found or you do not have permission to update it')
    }
    
    return data
  },
  
  delete: async (id: string): Promise<void> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { error } = await supabase
      .from('countries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error deleting country:', error)
      throw new Error(error.message)
    }
  },
  
  search: async (query: string): Promise<Country[]> => {
    const user = await getCurrentUser()
    if (!user) {
      return []
    }
    
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('user_id', user.id)
      .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error searching countries:', error)
      throw new Error(error.message)
    }
    
    return data || []
  }
}

// Currencies API
export const currenciesApi = {
  getAll: async (): Promise<Currency[]> => {
    const user = await getCurrentUser()
    if (!user) {
      console.log('User not authenticated, returning empty currencies list')
      return []
    }
    
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching currencies:', error)
      throw new Error(error.message)
    }
    
    return data || []
  },
  
  getById: async (id: string): Promise<Currency> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      console.error('Error fetching currency:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  create: async (currency: Currency): Promise<Currency> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const currencyWithUser = { ...currency, user_id: user.id }
    
    const { data, error } = await supabase
      .from('currencies')
      .insert([currencyWithUser])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating currency:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  update: async (id: string, currency: Partial<Currency>): Promise<Currency> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Remove user_id from the update object to prevent conflicts
    const { user_id, ...updateData } = currency
    
    const { data, error } = await supabase
      .from('currencies')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating currency:', error)
      
      // Provide more specific error messages
      if (error.code === '23505') {
        if (error.message.includes('currencies_user_code_unique')) {
          throw new Error(`Currency code '${updateData.code}' already exists in your account`)
        }
        if (error.message.includes('currencies_user_name_unique')) {
          throw new Error(`Currency name '${updateData.name}' already exists in your account`)
        }
        throw new Error('A currency with this code or name already exists in your account')
      }
      
      if (error.code === '42501') {
        throw new Error('You do not have permission to update this currency')
      }
      
      throw new Error(error.message || 'Failed to update currency')
    }
    
    if (!data) {
      throw new Error('Currency not found or you do not have permission to update it')
    }
    
    return data
  },
  
  delete: async (id: string): Promise<void> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { error } = await supabase
      .from('currencies')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error deleting currency:', error)
      throw new Error(error.message)
    }
  },
  
  search: async (query: string): Promise<Currency[]> => {
    const user = await getCurrentUser()
    if (!user) {
      return []
    }
    
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .eq('user_id', user.id)
      .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error searching currencies:', error)
      throw new Error(error.message)
    }
    
    return data || []
  }
}

// Payment Methods API
export const paymentMethodsApi = {
  getAll: async (): Promise<PaymentMethod[]> => {
    const user = await getCurrentUser()
    if (!user) {
      console.log('User not authenticated, returning empty payment methods list')
      return []
    }
    
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching payment methods:', error)
      throw new Error(error.message)
    }
    
    return data || []
  },
  
  getById: async (id: string): Promise<PaymentMethod> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      console.error('Error fetching payment method:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  create: async (method: PaymentMethod): Promise<PaymentMethod> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Handle icon upload if provided
    if (method.icon && method.icon.startsWith('data:')) {
      const iconPath = await uploadIcon(method.icon, method.name)
      method.icon = iconPath
    }
    
    const methodWithUser = { ...method, user_id: user.id }
    
    const { data, error } = await supabase
      .from('payment_methods')
      .insert([methodWithUser])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating payment method:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  update: async (id: string, method: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Handle icon upload if provided
    if (method.icon && method.icon.startsWith('data:')) {
      const iconPath = await uploadIcon(method.icon, id)
      method.icon = iconPath
    }
    
    // Remove user_id from the update object to prevent conflicts
    const { user_id, ...updateData } = method
    
    const { data, error } = await supabase
      .from('payment_methods')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating payment method:', error)
      
      // Provide more specific error messages
      if (error.code === '23505') {
        if (error.message.includes('payment_methods_user_name_unique')) {
          throw new Error(`Payment method name '${updateData.name}' already exists in your account`)
        }
        throw new Error('A payment method with this name already exists in your account')
      }
      
      if (error.code === '42501') {
        throw new Error('You do not have permission to update this payment method')
      }
      
      throw new Error(error.message || 'Failed to update payment method')
    }
    
    if (!data) {
      throw new Error('Payment method not found or you do not have permission to update it')
    }
    
    return data
  },
  
  delete: async (id: string): Promise<void> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error deleting payment method:', error)
      throw new Error(error.message)
    }
  },
  
  search: async (query: string): Promise<PaymentMethod[]> => {
    const user = await getCurrentUser()
    if (!user) {
      return []
    }
    
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .or(`name.ilike.%${query}%,type.ilike.%${query}%`)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error searching payment methods:', error)
      throw new Error(error.message)
    }
    
    return data || []
  }
}

// Helper function to upload icons
async function uploadIcon(base64Image: string, name: string): Promise<string> {
  try {
    // Extract file data and type from base64 string
    const parts = base64Image.split(';')
    const contentType = parts[0].split(':')[1]
    const extension = contentType.split('/')[1]
    const base64Data = parts[1].split(',')[1]
    
    // Convert base64 to Blob
    const byteCharacters = atob(base64Data)
    const byteArrays = []
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i))
    }
    const byteArray = new Uint8Array(byteArrays)
    const blob = new Blob([byteArray], { type: contentType })
    
    // Create file with unique name
    const fileName = `${Date.now()}-${name.toLowerCase().replace(/\s+/g, '-')}.${extension}`
    const file = new File([blob], fileName, { type: contentType })
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('icons')
      .upload(fileName, file)
    
    if (error) {
      console.error('Error uploading icon:', error)
      throw new Error(error.message)
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('icons')
      .getPublicUrl(fileName)
    
    return publicUrl
  } catch (error) {
    console.error('Error in icon upload:', error)
    throw error
  }
}

// Payments API
export const paymentsApi = {
  getAll: async (): Promise<Payment[]> => {
    const user = await getCurrentUser()
    if (!user) {
      console.log('User not authenticated, returning empty payments list')
      return []
    }
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching payments:', error)
      throw new Error(error.message)
    }
    
    return data || []
  },
  
  getById: async (id: string): Promise<Payment> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      console.error('Error fetching payment:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  getPendingVerifications: async (): Promise<Payment[]> => {
    const user = await getCurrentUser()
    if (!user) {
      console.log('User not authenticated, returning empty pending payments list')
      return []
    }
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching pending payments:', error)
      throw new Error(error.message)
    }
    
    return data || []
  },
  
  getByStatus: async (status: 'pending' | 'completed' | 'failed' | 'refunded'): Promise<Payment[]> => {
    const user = await getCurrentUser()
    if (!user) {
      console.log('User not authenticated, returning empty payments list')
      return []
    }
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching payments by status:', error)
      throw new Error(error.message)
    }
    
    return data || []
  },
  
  create: async (payment: Payment): Promise<Payment> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const paymentWithUser = { ...payment, user_id: user.id }
    
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentWithUser])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating payment:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  updateStatus: async (id: string, status: 'pending' | 'completed' | 'failed' | 'refunded'): Promise<Payment> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating payment status:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  search: async (query: string): Promise<Payment[]> => {
    const user = await getCurrentUser()
    if (!user) {
      return []
    }
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .or(`description.ilike.%${query}%,payment_method.ilike.%${query}%,country.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error searching payments:', error)
      throw new Error(error.message)
    }
    
    return data || []
  }
}

// Theme and Content Management Interfaces
export interface Theme {
  id?: string
  user_id?: string
  name: string
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  border_color: string
  success_color: string
  warning_color: string
  error_color: string
  font_family: string
  border_radius: string
  logo_url?: string | null
  favicon_url?: string | null
  custom_css?: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface ContentTemplate {
  id?: string
  user_id?: string
  template_key: string
  title: string
  content: string
  content_type: string
  category: string
  language: string
  variables?: any
  metadata?: any
  is_active: boolean
  version: number
  created_at?: string
  updated_at?: string
}

export interface ThemeSetting {
  id?: string
  user_id?: string
  theme_id?: string
  setting_key: string
  setting_value: string
  setting_type: string
  description?: string
  is_advanced: boolean
  created_at?: string
  updated_at?: string
}

// Themes API
export const themesApi = {
  getAll: async (): Promise<Theme[]> => {
    const user = await getCurrentUser()
    if (!user) {
      console.log('User not authenticated, returning empty themes list')
      return []
    }
    
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching themes:', error)
      throw new Error(error.message)
    }
    
    return data || []
  },
  
  getById: async (id: string): Promise<Theme> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      console.error('Error fetching theme:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  getActive: async (): Promise<Theme | null> => {
    const user = await getCurrentUser()
    if (!user) {
      console.log('User not authenticated, returning null active theme')
      return null
    }
    
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No active theme found
        return null
      }
      console.error('Error fetching active theme:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  create: async (theme: Theme): Promise<Theme> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Remove user_id from theme object since trigger will set it automatically
    const { user_id, ...themeData } = theme
    
    const { data, error } = await supabase
      .from('themes')
      .insert([themeData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating theme:', error)
      
      // Provide more specific error messages
      if (error.code === '23505') {
        if (error.message.includes('themes_user_name_unique')) {
          throw new Error(`Theme name '${themeData.name}' already exists in your account`)
        }
        throw new Error('A theme with this name already exists in your account')
      }
      
      if (error.code === '42501') {
        throw new Error('You do not have permission to create themes')
      }
      
      throw new Error(error.message || 'Failed to create theme')
    }
    
    return data
  },
  
  update: async (id: string, theme: Partial<Theme>): Promise<Theme> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Remove user_id from the update object to prevent conflicts
    const { user_id, ...updateData } = theme
    
    const { data, error } = await supabase
      .from('themes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating theme:', error)
      
      // Provide more specific error messages
      if (error.code === '23505') {
        if (error.message.includes('themes_user_name_unique')) {
          throw new Error(`Theme name '${updateData.name}' already exists in your account`)
        }
        throw new Error('A theme with this name already exists in your account')
      }
      
      if (error.code === '42501') {
        throw new Error('You do not have permission to update this theme')
      }
      
      throw new Error(error.message || 'Failed to update theme')
    }
    
    if (!data) {
      throw new Error('Theme not found or you do not have permission to update it')
    }
    
    return data
  },
  
  setActive: async (id: string): Promise<Theme> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // First, deactivate all themes for this user
    await supabase
      .from('themes')
      .update({ is_active: false })
      .eq('user_id', user.id)
    
    // Then activate the selected theme
    const { data, error } = await supabase
      .from('themes')
      .update({ is_active: true })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error setting active theme:', error)
      throw new Error(error.message || 'Failed to set active theme')
    }
    
    if (!data) {
      throw new Error('Theme not found or you do not have permission to update it')
    }
    
    return data
  },
  
  delete: async (id: string): Promise<void> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { error } = await supabase
      .from('themes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error deleting theme:', error)
      throw new Error(error.message)
    }
  },
  
  search: async (query: string): Promise<Theme[]> => {
    const user = await getCurrentUser()
    if (!user) {
      return []
    }
    
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('user_id', user.id)
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error searching themes:', error)
      throw new Error(error.message)
    }
    
    return data || []
  }
}

// Content Templates API
export const contentTemplatesApi = {
  getAll: async (): Promise<ContentTemplate[]> => {
    const user = await getCurrentUser()
    if (!user) {
      console.log('User not authenticated, returning empty content templates list')
      return []
    }
    
    const { data, error } = await supabase
      .from('content_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('category', { ascending: true })
      .order('title', { ascending: true })
    
    if (error) {
      console.error('Error fetching content templates:', error)
      throw new Error(error.message)
    }
    
    return data || []
  },
  
  getByCategory: async (category: string): Promise<ContentTemplate[]> => {
    const user = await getCurrentUser()
    if (!user) {
      console.log('User not authenticated, returning empty content templates list')
      return []
    }
    
    const { data, error } = await supabase
      .from('content_templates')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', category)
      .order('title', { ascending: true })
    
    if (error) {
      console.error('Error fetching content templates by category:', error)
      throw new Error(error.message)
    }
    
    return data || []
  },
  
  getById: async (id: string): Promise<ContentTemplate> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabase
      .from('content_templates')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      console.error('Error fetching content template:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  getByKey: async (templateKey: string): Promise<ContentTemplate | null> => {
    const user = await getCurrentUser()
    if (!user) {
      console.log('User not authenticated, returning null template')
      return null
    }
    
    const { data, error } = await supabase
      .from('content_templates')
      .select('*')
      .eq('user_id', user.id)
      .eq('template_key', templateKey)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No template found
        return null
      }
      console.error('Error fetching content template by key:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  create: async (template: ContentTemplate): Promise<ContentTemplate> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Remove user_id from template object since trigger will set it automatically
    const { user_id, ...templateData } = template
    
    const { data, error } = await supabase
      .from('content_templates')
      .insert([templateData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating content template:', error)
      
      // Provide more specific error messages
      if (error.code === '23505') {
        if (error.message.includes('content_templates_user_key_unique')) {
          throw new Error(`Template key '${templateData.template_key}' already exists in your account`)
        }
        throw new Error('A template with this key already exists in your account')
      }
      
      if (error.code === '42501') {
        throw new Error('You do not have permission to create content templates')
      }
      
      throw new Error(error.message || 'Failed to create content template')
    }
    
    return data
  },
  
  update: async (id: string, template: Partial<ContentTemplate>): Promise<ContentTemplate> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Remove user_id from the update object to prevent conflicts
    const { user_id, ...updateData } = template
    
    const { data, error } = await supabase
      .from('content_templates')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating content template:', error)
      
      // Provide more specific error messages
      if (error.code === '23505') {
        if (error.message.includes('content_templates_user_key_unique')) {
          throw new Error(`Template key '${updateData.template_key}' already exists in your account`)
        }
        throw new Error('A template with this key already exists in your account')
      }
      
      if (error.code === '42501') {
        throw new Error('You do not have permission to update this content template')
      }
      
      throw new Error(error.message || 'Failed to update content template')
    }
    
    if (!data) {
      throw new Error('Content template not found or you do not have permission to update it')
    }
    
    return data
  },
  
  delete: async (id: string): Promise<void> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { error } = await supabase
      .from('content_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error deleting content template:', error)
      throw new Error(error.message)
    }
  },
  
  search: async (query: string): Promise<ContentTemplate[]> => {
    const user = await getCurrentUser()
    if (!user) {
      return []
    }
    
    const { data, error } = await supabase
      .from('content_templates')
      .select('*')
      .eq('user_id', user.id)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,template_key.ilike.%${query}%`)
      .order('category', { ascending: true })
      .order('title', { ascending: true })
    
    if (error) {
      console.error('Error searching content templates:', error)
      throw new Error(error.message)
    }
    
    return data || []
  }
} 