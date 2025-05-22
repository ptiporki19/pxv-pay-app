import { createClient } from '@/lib/supabase/client'

// Types
export interface Country {
  id?: string
  name: string
  code: string
  status: 'active' | 'pending' | 'inactive'
  created_at?: string
  updated_at?: string
}

export interface Currency {
  id?: string
  name: string
  code: string
  symbol: string
  status: 'active' | 'pending' | 'inactive'
  created_at?: string
  updated_at?: string
}

export interface PaymentMethod {
  id?: string
  name: string
  type: 'bank' | 'mobile' | 'crypto' | 'payment-link'
  countries: string[]
  status: 'active' | 'pending' | 'inactive'
  icon?: string | null
  instructions?: string | null
  url?: string | null // For payment-link type
  created_at?: string
  updated_at?: string
}

// Create a singleton supabase client
const supabase = createClient()

// Countries API
export const countriesApi = {
  getAll: async (): Promise<Country[]> => {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching countries:', error)
      throw new Error(error.message)
    }
    
    return data || []
  },
  
  getById: async (id: string): Promise<Country> => {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching country:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  create: async (country: Country): Promise<Country> => {
    const { data, error } = await supabase
      .from('countries')
      .insert([country])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating country:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  update: async (id: string, country: Partial<Country>): Promise<Country> => {
    const { data, error } = await supabase
      .from('countries')
      .update(country)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating country:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  delete: async (id: string): Promise<void> => {
    // First check if there are any payment methods linked to this country
    const { data: linkedMethods } = await supabase
      .from('payment_methods')
      .select('id, countries')
      .contains('countries', [id])

    if (linkedMethods && linkedMethods.length > 0) {
      throw new Error('Cannot delete a country that is linked to payment methods')
    }

    const { error } = await supabase
      .from('countries')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting country:', error)
      throw new Error(error.message)
    }
  },
  
  search: async (query: string): Promise<Country[]> => {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
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
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching currencies:', error)
      throw new Error(error.message)
    }
    
    return data || []
  },
  
  getById: async (id: string): Promise<Currency> => {
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching currency:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  create: async (currency: Currency): Promise<Currency> => {
    const { data, error } = await supabase
      .from('currencies')
      .insert([currency])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating currency:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  update: async (id: string, currency: Partial<Currency>): Promise<Currency> => {
    const { data, error } = await supabase
      .from('currencies')
      .update(currency)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating currency:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('currencies')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting currency:', error)
      throw new Error(error.message)
    }
  },
  
  search: async (query: string): Promise<Currency[]> => {
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .or(`name.ilike.%${query}%,code.ilike.%${query}%,symbol.ilike.%${query}%`)
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
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching payment methods:', error)
      throw new Error(error.message)
    }
    
    return data || []
  },
  
  getById: async (id: string): Promise<PaymentMethod> => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching payment method:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  create: async (method: PaymentMethod): Promise<PaymentMethod> => {
    // Handle icon upload if provided
    if (method.icon && method.icon.startsWith('data:')) {
      const iconPath = await uploadIcon(method.icon, method.name)
      method.icon = iconPath
    }
    
    const { data, error } = await supabase
      .from('payment_methods')
      .insert([method])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating payment method:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  update: async (id: string, method: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    // Handle icon upload if provided
    if (method.icon && method.icon.startsWith('data:')) {
      const iconPath = await uploadIcon(method.icon, id)
      method.icon = iconPath
    }
    
    const { data, error } = await supabase
      .from('payment_methods')
      .update(method)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating payment method:', error)
      throw new Error(error.message)
    }
    
    return data
  },
  
  delete: async (id: string): Promise<void> => {
    // First get the payment method to check if it has an icon to delete
    const { data: method, error: fetchError } = await supabase
      .from('payment_methods')
      .select('icon')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      console.error('Error fetching payment method for deletion:', fetchError)
      throw new Error(fetchError.message)
    }
    
    // Delete payment method from database
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting payment method:', error)
      throw new Error(error.message)
    }
    
    // Delete icon if exists
    if (method && method.icon) {
      try {
        const pathParts = method.icon.split('/')
        const filename = pathParts[pathParts.length - 1]
        await supabase.storage.from('icons').remove([filename])
      } catch (err) {
        console.error('Error deleting payment method icon:', err)
        // We don't throw here as the payment method was already deleted
      }
    }
  },
  
  search: async (query: string): Promise<PaymentMethod[]> => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
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