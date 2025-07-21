import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'

const supabase = createClient()

// Helper function to get current user - returns user from users table, not auth.users
async function getCurrentUser() {
  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser()
    if (error || !authUser) {
      console.error('Auth error:', error)
      return null
    }
    
    console.log('Auth user found:', { id: authUser.id, email: authUser.email })
    
    // Get the user from the users table using the auth user's email
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .single()
    
    if (dbError) {
      console.error('Database error when fetching user:', {
        error: dbError,
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        authEmail: authUser.email
      })
      
      // If user not found, try to find by auth user ID or create one
      if (dbError.code === 'PGRST116') {
        console.log('User not found by email, trying by auth ID...')
        
        // Try to find user by auth ID
        const { data: userByAuthId, error: authIdError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        if (!authIdError && userByAuthId) {
          console.log('Found user by auth ID:', userByAuthId)
          return userByAuthId
        }
        
        console.log('User not found in users table, creating...')
        try {
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{
              id: authUser.id,
              email: authUser.email,
              role: 'registered_user',
              active: true
            }])
            .select()
            .single()
          
          if (createError) {
            console.error('Failed to create user:', createError)
            return null
          }
          
          console.log('User created successfully:', newUser)
          return newUser
        } catch (createErr) {
          console.error('Exception creating user:', createErr)
          return null
        }
      }
      
      return null
    }
    
    if (!dbUser) {
      console.error('No user data returned from users table')
      return null
    }
    
    console.log('Database user found:', { id: dbUser.id, email: dbUser.email, role: dbUser.role })
    return dbUser
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
  currency_code?: string
  status: 'active' | 'pending' | 'inactive'
  user_id?: string
  created_at?: string
  updated_at?: string
  currency?: {
    id: string
    name: string
    code: string
    symbol: string
  } | null
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

export interface CountrySpecificDetails {
  custom_fields?: CustomField[]
  instructions?: string
  url?: string | null // For payment-link type
  additional_info?: string
}

export interface PaymentMethod {
  id?: string
  name: string
  type: 'manual' | 'payment-link'
  countries: string[]
  status: 'active' | 'pending' | 'inactive'
  icon?: string | null
  instructions?: string | null // General instructions (fallback)
  instructions_for_checkout?: string | null // General checkout instructions
  url?: string | null // General URL (fallback for payment-link type)
  description?: string | null // For detailed descriptions
  custom_fields?: CustomField[] | null // General custom fields (fallback)
  country_specific_details?: Record<string, CountrySpecificDetails> // Country-specific details
  display_order?: number // Order for displaying payment methods
  image_url?: string | null // Payment method image URL
  user_id?: string
  created_at?: string
  updated_at?: string
}

export interface Payment {
  id?: string
  user_id?: string | null
  merchant_id?: string | null
  amount: number
  currency: string
  payment_method: string
  status: 'pending' | 'completed' | 'failed' | 'pending_verification'
  country?: string | null
  description?: string | null
  metadata?: any
  // New fields for checkout payments
  customer_name?: string | null
  customer_email?: string | null
  payment_proof_url?: string | null
  checkout_link_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface Brand {
  id?: string
  merchant_id?: string
  name: string
  logo_url: string
  is_active: boolean
  subscription_tier?: string
  created_at?: string
  updated_at?: string
}

// Countries API
export const countriesApi = {
  getAll: async (): Promise<Country[]> => {
    try {
      // Fetch all active countries (global data - no user filtering needed)
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true })
      
      if (error) {
        console.error('Error fetching countries:', error)
        throw new Error(error.message)
      }
      
      // If no countries, return empty array
      if (!data || data.length === 0) {
        return []
      }
      
      // Get unique currency codes from countries
      const currencyCodes = [...new Set(data
        .map(country => country.currency_code)
        .filter(Boolean))]
      
      // If no currency codes, return countries as is
      if (currencyCodes.length === 0) {
        return data
      }
      
      // Fetch currencies separately (global data)
      const { data: currencies, error: currenciesError } = await supabase
        .from('currencies')
        .select('id, name, code, symbol')
        .in('code', currencyCodes)
      
      if (currenciesError) {
        console.error('Error fetching currencies:', currenciesError)
        // Return countries without currency data if currency fetch fails
        return data
      }
      
      // Create a map of currencies for quick lookup by code
      const currencyMap = new Map(currencies?.map(c => [c.code, c]) || [])
      
      // Attach currency data to countries
      const countriesWithCurrency = data.map(country => ({
        ...country,
        currency: country.currency_code ? currencyMap.get(country.currency_code) : null
      }))
      
      return countriesWithCurrency
    } catch (error) {
      console.error('Error in getAll countries:', error)
      throw error
    }
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

    // Include user_id in the insert data to satisfy RLS policy
    const countryData = {
      ...country,
      user_id: user.id
    }

    const { data, error } = await supabase
      .from('countries')
      .insert([countryData])
      .select()
      .single()

    if (error) {
      console.error('Error creating country:', error)
      
      // Provide more specific error messages for common errors
      if (error.code === '23505') {
        // Unique constraint violation
        if (error.message.includes('countries_code_key')) {
          throw new Error(`Country code '${country.code}' already exists.`)
        }
        if (error.message.includes('countries_user_code_unique')) {
          throw new Error(`You already have a country with code '${country.code}'.`)
        }
        if (error.message.includes('countries_user_name_unique')) {
          throw new Error(`You already have a country named '${country.name}'.`)
        }
        throw new Error(`This country already exists.`)
      }
      
      if (error.code === '23503') {
        // Foreign key constraint violation
        if (error.message.includes('currency_id')) {
          throw new Error('The selected currency is invalid. Please select a valid currency.')
        }
        throw new Error('Invalid reference data. Please check your selections.')
      }
      
      if (error.code === '42501') {
        throw new Error('You do not have permission to create countries.')
      }
      
      // Generic error message
      throw new Error(error.message || 'Failed to create country. Please try again.')
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
    try {
      // Fetch all currencies (global data - no user filtering needed)
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) {
        console.error('Error fetching currencies:', error)
        throw new Error(error.message)
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getAll currencies:', error)
      throw error
    }
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
      
      // Handle empty error object
      if (!error.message && !error.code) {
        throw new Error('Failed to create currency. Please check your input and try again.')
      }
      
      // Provide more specific error messages for common errors
      if (error.code === '23505') {
        // Unique constraint violation
        if (error.message.includes('currencies_code_key')) {
          throw new Error(`Currency code '${currency.code}' already exists.`)
        }
        if (error.message.includes('currencies_user_code_unique')) {
          throw new Error(`You already have a currency with code '${currency.code}'.`)
        }
        if (error.message.includes('currencies_user_name_unique')) {
          throw new Error(`You already have a currency named '${currency.name}'.`)
        }
        throw new Error(`This currency already exists.`)
      }
      
      if (error.code === '42501') {
        throw new Error('You do not have permission to create currencies.')
      }
      
      // Generic error message
      throw new Error(error.message || 'Failed to create currency. Please try again.')
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
    
    // Map database columns to interface
    const mappedData = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      icon: item.icon_url,
      description: item.description,
      instructions: item.instructions,
      custom_fields: item.account_details,
      countries: item.countries,
      status: item.status,
      display_order: item.sort_order,
      image_url: item.image_url,
      user_id: item.user_id,
      created_at: item.created_at,
      updated_at: item.updated_at
    }))
    
    return mappedData
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
    
    // Map database columns to interface
    const mappedData: PaymentMethod = {
      id: data.id,
      name: data.name,
      type: data.type,
      icon: data.icon_url,
      description: data.description,
      instructions: data.instructions,
      custom_fields: data.account_details,
      countries: data.countries,
      status: data.status,
      display_order: data.sort_order,
      user_id: data.user_id,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
    
    return mappedData
  },
  
  create: async (method: PaymentMethod): Promise<PaymentMethod> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Handle icon upload if provided
    let iconUrl = null
    if (method.icon && method.icon.startsWith('data:')) {
      iconUrl = await uploadIcon(method.icon, method.name)
    } else if (method.icon) {
      iconUrl = method.icon
    }
    
    // Map interface fields to database columns
    const dbMethod = {
      user_id: user.id,
      name: method.name,
      type: method.type,
      icon_url: iconUrl,
      description: method.description || null,
      instructions: method.instructions || null,
      account_details: method.custom_fields || null,
      countries: method.countries || [],
      status: method.status,
      sort_order: method.display_order || 0,
      image_url: method.image_url || null
    }
    
    const { data, error } = await supabase
      .from('payment_methods')
      .insert([dbMethod])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating payment method:', error)
      
      // Handle empty error object
      if (!error.message && !error.code) {
        throw new Error('Failed to create payment method. Please check your input and try again.')
      }
      
      // Provide more specific error messages for common errors
      if (error.code === '23505') {
        // Unique constraint violation
        if (error.message.includes('payment_methods_user_name_unique')) {
          throw new Error(`You already have a payment method named '${method.name}'.`)
        }
        throw new Error(`This payment method name already exists.`)
      }
      
      if (error.code === '42501') {
        throw new Error('You do not have permission to create payment methods.')
      }
      
      // Generic error message
      throw new Error(error.message || 'Failed to create payment method. Please try again.')
    }
    
    // Map database columns back to interface
    const mappedData: PaymentMethod = {
      id: data.id,
      name: data.name,
      type: data.type,
      icon: data.icon_url,
      description: data.description,
      instructions: data.instructions,
      custom_fields: data.account_details,
      countries: data.countries,
      status: data.status,
      display_order: data.sort_order,
      user_id: data.user_id,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
    
    return mappedData
  },
  
  update: async (id: string, method: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Handle icon upload if provided
    let iconUrl = undefined
    if (method.icon && method.icon.startsWith('data:')) {
      iconUrl = await uploadIcon(method.icon, id)
    } else if (method.icon !== undefined) {
      iconUrl = method.icon
    }
    
    // Map interface fields to database columns
    const updateData: any = {}
    if (method.name !== undefined) updateData.name = method.name
    if (method.type !== undefined) updateData.type = method.type
    if (iconUrl !== undefined) updateData.icon_url = iconUrl
    if (method.description !== undefined) updateData.description = method.description
    if (method.instructions !== undefined) updateData.instructions = method.instructions
    if (method.custom_fields !== undefined) updateData.account_details = method.custom_fields
    if (method.countries !== undefined) updateData.countries = method.countries
    if (method.status !== undefined) updateData.status = method.status
    if (method.display_order !== undefined) updateData.sort_order = method.display_order
    
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
    
    // Map database columns back to interface
    const mappedData: PaymentMethod = {
      id: data.id,
      name: data.name,
      type: data.type,
      icon: data.icon_url,
      description: data.description,
      instructions: data.instructions,
      custom_fields: data.account_details,
      countries: data.countries,
      status: data.status,
      display_order: data.sort_order,
      user_id: data.user_id,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
    
    return mappedData
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
  },

  // Get payment methods for a specific country with country-specific details
  getForCountry: async (countryCode: string): Promise<PaymentMethod[]> => {
    const user = await getCurrentUser()
    if (!user) {
      console.log('User not authenticated, returning empty payment methods list')
      return []
    }
    
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .contains('countries', [countryCode])
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching payment methods for country:', error)
      throw new Error(error.message)
    }
    
    return data || []
  },

  // Get country-specific details for a payment method
  getCountrySpecificDetails: (paymentMethod: PaymentMethod, countryCode: string): CountrySpecificDetails | null => {
    if (!paymentMethod.country_specific_details || !paymentMethod.country_specific_details[countryCode]) {
      return null
    }
    
    return paymentMethod.country_specific_details[countryCode]
  },

  // Get effective details for a payment method in a specific country (with fallbacks)
  getEffectiveDetails: (paymentMethod: PaymentMethod, countryCode: string) => {
    const countrySpecific = paymentMethod.country_specific_details?.[countryCode]
    
    return {
      instructions: countrySpecific?.instructions || paymentMethod.instructions_for_checkout || paymentMethod.instructions || '',
      url: countrySpecific?.url || paymentMethod.url || '',
      custom_fields: countrySpecific?.custom_fields || paymentMethod.custom_fields || [],
      additional_info: countrySpecific?.additional_info || ''
    }
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
      .from('payment-method-icons')
      .upload(fileName, file)
    
    if (error) {
      console.error('Error uploading icon:', error)
      throw new Error(error.message)
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('payment-method-icons')
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
  
  getByStatus: async (status: 'pending' | 'completed' | 'failed' | 'pending_verification'): Promise<Payment[]> => {
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
  
  updateStatus: async (id: string, status: 'pending' | 'completed' | 'failed' | 'pending_verification'): Promise<Payment> => {
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
  },

  // NEW: Get payments received by merchant (for verification page)
  getMerchantPayments: async (): Promise<Payment[]> => {
    const user = await getCurrentUser()
    if (!user) {
      console.log('User not authenticated, returning empty merchant payments list')
      return []
    }
    
    // Get database user ID using email lookup
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', user.email)
      .single()

    if (userError || !dbUser) {
      console.error('Failed to get database user for merchant payments:', userError)
      throw new Error('Unable to verify user account')
    }
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('merchant_id', dbUser.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching merchant payments:', error)
      throw new Error(error.message)
    }
    
    return data || []
  },

  // NEW: Get merchant payments by status
  getMerchantPaymentsByStatus: async (status: 'pending' | 'completed' | 'failed' | 'pending_verification'): Promise<Payment[]> => {
    const user = await getCurrentUser()
    if (!user) {
      console.log('User not authenticated, returning empty merchant payments list')
      return []
    }
    
    // Get database user ID using email lookup
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', user.email)
      .single()

    if (userError || !dbUser) {
      console.error('Failed to get database user for merchant payments by status:', userError)
      throw new Error('Unable to verify user account')
    }
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('merchant_id', dbUser.id)
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching merchant payments by status:', error)
      throw new Error(error.message)
    }
    
    return data || []
  },

  // NEW: Update payment status (for merchants)
  updateMerchantPaymentStatus: async (id: string, status: 'completed' | 'failed'): Promise<Payment> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Get database user ID using email lookup
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', user.email)
      .single()

    if (userError || !dbUser) {
      console.error('Failed to get database user for payment status update:', userError)
      throw new Error('Unable to verify user account')
    }
    
    const { data, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', id)
      .eq('merchant_id', dbUser.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating merchant payment status:', error)
      throw new Error(error.message)
    }
    
    return data
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
      console.log('User not authenticated, returning system themes only')
      
      // Return system themes for unauthenticated users
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .eq('is_system_theme', true)
        .order('name', { ascending: true })
      
      if (error) {
        console.error('Error fetching system themes:', error)
        return []
      }
      
      return data || []
    }
 
    // Get both user themes and system themes for authenticated users
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .or(`user_id.eq.${user.id},is_system_theme.eq.true`)
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

// Checkout Links API
export const checkoutLinksApi = {
  getAll: async (): Promise<any[]> => {
    const user = await getCurrentUser()
    if (!user) {
      console.log('User not authenticated, returning empty checkout links list')
      return []
    }
    
    try {
      const { data, error } = await supabase
        .from('checkout_links')
        .select(`
          *,
          payments:payments(count)
        `)
        .eq('merchant_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching checkout links:', error)
        throw new Error(error.message)
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getAll checkout links:', error)
      throw error
    }
  },
  
  getById: async (id: string): Promise<any> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabase
      .from('checkout_links')
      .select('*')
      .eq('id', id)
      .eq('merchant_id', user.id)
      .single()
    
    if (error) {
      console.error('Error fetching checkout link:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  create: async (checkoutLink: any): Promise<any> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Explicitly set merchant_id to the database user ID (not relying on RLS)
    const { merchant_id, ...checkoutLinkData } = checkoutLink
    const finalCheckoutData = {
      ...checkoutLinkData,
      merchant_id: user.id  // Use database user ID explicitly
    }
    
    const { data, error } = await supabase
      .from('checkout_links')
      .insert([finalCheckoutData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating checkout link:', error)
      
      // Provide more specific error messages
      if (error.code === '23505') {
        if (error.message.includes('checkout_links_slug_unique')) {
          throw new Error(`Slug '${checkoutLinkData.slug}' already exists`)
        }
        throw new Error('A checkout link with this slug already exists')
      }
      
      if (error.code === '42501') {
        throw new Error('You do not have permission to create checkout links')
      }
      
      throw new Error(error.message || 'Failed to create checkout link')
    }
    
    return data
  },
  
  update: async (id: string, checkoutLink: any): Promise<any> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    // Use database user ID for filtering (not auth ID)
    const { merchant_id, ...updateData } = checkoutLink
    
    const { data, error } = await supabase
      .from('checkout_links')
      .update(updateData)
      .eq('id', id)
      .eq('merchant_id', user.id)  // user.id is already the database user ID
      .select()
      .single()
    
    if (error) {
      console.error('Error updating checkout link:', error)
      
      // Provide more specific error messages
      if (error.code === '23505') {
        if (error.message.includes('checkout_links_slug_unique')) {
          throw new Error(`Slug '${updateData.slug}' already exists`)
        }
        throw new Error('A checkout link with this slug already exists')
      }
      
      if (error.code === '42501') {
        throw new Error('You do not have permission to update this checkout link')
      }
      
      throw new Error(error.message || 'Failed to update checkout link')
    }
    
    if (!data) {
      throw new Error('Checkout link not found or you do not have permission to update it')
    }
    
    return data
  },
  
  delete: async (id: string): Promise<void> => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { error } = await supabase
      .from('checkout_links')
      .delete()
      .eq('id', id)
      .eq('merchant_id', user.id)
    
    if (error) {
      console.error('Error deleting checkout link:', error)
      throw new Error(error.message)
    }
  }
}

// Brands API
export const brandsApi = {
  getAll: async (): Promise<Brand[]> => {
    try {
      // Get current user with better error handling (copying product API pattern)
      const { data: authData, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.log('User not authenticated, returning empty brands list')
        return []
      }
      
      if (!authData?.user) {
        console.log('User not authenticated, returning empty brands list')
        return []
      }

      // Get the database user ID using email lookup (like product API)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', authData.user.email)
        .single()

      if (userError || !userData) {
        console.log('User not found in database, returning empty brands list')
        return []
      }

      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('merchant_id', userData.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching brands:', error)
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error('Error in getAll brands:', error)
      throw error
    }
  },

  getById: async (id: string): Promise<Brand> => {
    // Get current user (copying product API pattern)
    const { data: authData, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authData?.user) {
      throw new Error('User not authenticated')
    }

    // Get the database user ID using email lookup (like product API)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', authData.user.email)
      .single()

    if (userError || !userData) {
      throw new Error('Failed to get user information')
    }

    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .eq('merchant_id', userData.id)
      .single()

    if (error) {
      console.error('Error fetching brand:', error)
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error('Brand not found')
    }

    return data
  },

  create: async (brand: Omit<Brand, 'id' | 'merchant_id' | 'created_at' | 'updated_at'>): Promise<Brand> => {
    try {
      // Get current user with better error handling (copying product API pattern)
      const { data: authData, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Authentication error:', authError)
        throw new Error(`Authentication failed: ${authError.message}`)
      }
      
      if (!authData?.user) {
        throw new Error('User not authenticated - please log in and try again')
      }

      const authUser = authData.user
      console.log('Creating brand for auth user:', authUser.id, authUser.email)

      // Get the database user ID using email lookup (like product API)
      const { data: userData, error: userError } = await supabase
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

      // Check brand limits (future subscription feature)
      const existingBrands = await brandsApi.getAll()
      const BRAND_LIMITS = {
        free: 10,     // Generous MVP limit
        pro: 50,      // Future pro limit  
        enterprise: -1 // Future unlimited
      }
      
      // For MVP, all users get generous limits
      const userLimit = BRAND_LIMITS.free
      if (userLimit > 0 && existingBrands.length >= userLimit) {
        throw new Error(`You have reached the maximum number of brands (${userLimit}). Upgrade your plan for more brands.`)
      }

      const brandData = {
        ...brand,
        merchant_id: userData.id, // Use database user ID instead of auth user ID
        subscription_tier: 'free' // Future: get from user's actual subscription
      }

      console.log('Inserting brand data:', brandData)

      const { data, error } = await supabase
        .from('brands')
        .insert([brandData])
        .select()
        .single()

      if (error) {
        console.error('Database insert error:', error)
        
        // Provide specific error messages for common issues
        if (error.code === '42501') {
          throw new Error('Permission denied - you do not have access to create brands')
        }
        
        if (error.code === '23505') {
          if (error.message.includes('brands_merchant_id_name_key')) {
            throw new Error(`A brand with the name "${brand.name}" already exists`)
          }
          throw new Error('A brand with this name already exists')
        }
        
        if (error.message) {
          throw new Error(`Database error: ${error.message}`)
        }
        
        throw new Error('Failed to create brand - unknown database error')
      }

      if (!data) {
        throw new Error('Brand creation failed - no data returned')
      }
      
      console.log('Brand created successfully:', data.id)
      return data
    } catch (error) {
      console.error('Error creating brand:', error)
      
      // Ensure we always throw an Error object with a message
      if (error instanceof Error) {
        throw error
      }
      
      // Handle cases where error might be empty object or weird format
      if (typeof error === 'object' && error !== null) {
        const errorMsg = (error as any).message || (error as any).error || JSON.stringify(error)
        throw new Error(`Brand creation failed: ${errorMsg}`)
      }
      
      throw new Error('Brand creation failed due to an unknown error')
    }
  },

  update: async (id: string, brand: Partial<Omit<Brand, 'id' | 'merchant_id' | 'created_at' | 'updated_at'>>): Promise<Brand> => {
    // Get current user (copying product API pattern)
    const { data: authData, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authData?.user) {
      throw new Error('User not authenticated')
    }

    // Get the database user ID using email lookup (like product API)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', authData.user.email)
      .single()

    if (userError || !userData) {
      throw new Error('Failed to get user information')
    }

    const { data, error } = await supabase
      .from('brands')
      .update(brand)
      .eq('id', id)
      .eq('merchant_id', userData.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating brand:', error)
      
      if (error.code === '23505') {
        if (error.message.includes('brands_merchant_id_name_key')) {
          throw new Error(`A brand with the name "${brand.name}" already exists`)
        }
        throw new Error('A brand with this name already exists')
      }
      
      throw new Error(error.message || 'Failed to update brand')
    }

    if (!data) {
      throw new Error('Brand not found or you do not have permission to update it')
    }

    return data
  },

  delete: async (id: string): Promise<void> => {
    // Get current user (copying product API pattern)
    const { data: authData, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authData?.user) {
      throw new Error('User not authenticated')
    }

    // Get the database user ID using email lookup (like product API)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', authData.user.email)
      .single()

    if (userError || !userData) {
      throw new Error('Failed to get user information')
    }

    // Check if brand is being used by any checkout links
    const { data: checkoutLinks, error: checkError } = await supabase
      .from('checkout_links')
      .select('id, title')
      .eq('brand_id', id)
      .eq('merchant_id', userData.id)
      .limit(1)

    if (checkError) {
      console.error('Error checking brand usage:', checkError)
      throw new Error('Failed to check if brand is in use')
    }

    if (checkoutLinks && checkoutLinks.length > 0) {
      throw new Error('Cannot delete brand that is being used by checkout links. Please update those checkout links first.')
    }

    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id)
      .eq('merchant_id', userData.id)

    if (error) {
      console.error('Error deleting brand:', error)
      throw new Error(error.message)
    }
  },

  // Helper function to upload brand logo
  uploadLogo: async (file: File, brandName: string): Promise<string> => {
    try {
      // Get current user (copying product API pattern)
      const { data: authData, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authData?.user) {
        throw new Error('User not authenticated')
      }

      // Get the database user ID using email lookup (like product API)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', authData.user.email)
        .single()

      if (userError || !userData) {
        throw new Error('Failed to get user information')
      }

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file')
      }

      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        throw new Error('Image file must be less than 2MB')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userData.id}/${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('brand-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading logo:', error)
        throw new Error(error.message)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('brand-logos')
        .getPublicUrl(data.path)

      return urlData.publicUrl
    } catch (error) {
      console.error('Error in uploadLogo:', error)
      throw error
    }
  }
} 