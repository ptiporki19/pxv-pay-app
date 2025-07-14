'use server'

import { createClient } from '@/lib/supabase/server'

export interface RevenueAnalytics {
  month: string
  transaction_count: number
  total_revenue: string
  avg_transaction_amount: string
  unique_merchants: number
  completed_count: number
  pending_count: number
  failed_count: number
  success_rate: string
}

export interface GeographicAnalytics {
  country_name: string
  country_code: string
  currency_code: string
  payment_count: number
  total_revenue: string
  avg_amount: string
  completed_payments: number
  success_rate: string
}

export interface PaymentMethodAnalytics {
  payment_method: string
  transaction_count: number
  total_revenue: string
  avg_amount: string
  completed_count: number
  pending_count: number
  failed_count: number
  success_rate: string
  currency_code?: string
}

export interface CheckoutLinkAnalytics {
  id: string
  slug: string
  title: string
  checkout_type: string
  payment_count: number
  total_revenue: string
  conversion_rate: string
  currency_code?: string
}

export interface TransactionStatusAnalytics {
  status: string
  count: number
  total_amount: string
  avg_amount: string
  percentage: string
  currency_code?: string // Add currency code for dominant currency display
}

export interface DailyRevenueAnalytics {
  date: string
  transaction_count: number
  total_revenue: string
  avg_transaction_amount: string
  currency_code?: string // Add currency code for country-specific data
}

// Country code to country name and currency mapping
const COUNTRY_MAPPING = {
  'CC': { name: 'Cocos (Keeling) Islands', currency: 'AUD' },
  'CY': { name: 'Cyprus', currency: 'USD' },
  'CA': { name: 'Canada', currency: 'CAD' },
  'US': { name: 'United States', currency: 'USD' },
  'AR': { name: 'Argentina', currency: 'ARS' },
  'HT': { name: 'Haiti', currency: 'HTG' },
  'AU': { name: 'Australia', currency: 'AUD' },
  'GB': { name: 'United Kingdom', currency: 'GBP' },
  'NG': { name: 'Nigeria', currency: 'NGN' },
  'KE': { name: 'Kenya', currency: 'KES' },
  'ZA': { name: 'South Africa', currency: 'ZAR' },
  'GH': { name: 'Ghana', currency: 'GHS' },
  'EG': { name: 'Egypt', currency: 'EGP' },
  'FR': { name: 'France', currency: 'EUR' },
  'DE': { name: 'Germany', currency: 'EUR' },
  'IT': { name: 'Italy', currency: 'EUR' },
  'ES': { name: 'Spain', currency: 'EUR' },
  'BR': { name: 'Brazil', currency: 'BRL' },
  'MX': { name: 'Mexico', currency: 'MXN' },
  'IN': { name: 'India', currency: 'INR' },
  'CN': { name: 'China', currency: 'CNY' },
  'JP': { name: 'Japan', currency: 'JPY' },
  'KR': { name: 'South Korea', currency: 'KRW' },
  'SG': { name: 'Singapore', currency: 'SGD' },
  'MY': { name: 'Malaysia', currency: 'MYR' },
  'TH': { name: 'Thailand', currency: 'THB' },
  'ID': { name: 'Indonesia', currency: 'IDR' },
  'PH': { name: 'Philippines', currency: 'PHP' },
  'VN': { name: 'Vietnam', currency: 'VND' },
  'BD': { name: 'Bangladesh', currency: 'BDT' },
  'PK': { name: 'Pakistan', currency: 'PKR' },
  'LK': { name: 'Sri Lanka', currency: 'LKR' },
  'NP': { name: 'Nepal', currency: 'NPR' },
  'AF': { name: 'Afghanistan', currency: 'AFN' },
  'AE': { name: 'United Arab Emirates', currency: 'AED' },
  'SA': { name: 'Saudi Arabia', currency: 'SAR' },
  'QA': { name: 'Qatar', currency: 'QAR' },
  'KW': { name: 'Kuwait', currency: 'KWD' },
  'BH': { name: 'Bahrain', currency: 'BHD' },
  'OM': { name: 'Oman', currency: 'OMR' },
  'JO': { name: 'Jordan', currency: 'JOD' },
  'LB': { name: 'Lebanon', currency: 'LBP' },
  'SY': { name: 'Syria', currency: 'SYP' },
  'IQ': { name: 'Iraq', currency: 'IQD' },
  'IR': { name: 'Iran', currency: 'IRR' },
  'TR': { name: 'Turkey', currency: 'TRY' },
  'IL': { name: 'Israel', currency: 'ILS' },
  'PS': { name: 'Palestine', currency: 'ILS' },
  'CM': { name: 'Cameroon', currency: 'XAF' },
  'CD': { name: 'Democratic Republic of Congo', currency: 'CDF' },
  'CF': { name: 'Central African Republic', currency: 'XAF' },
  'TD': { name: 'Chad', currency: 'XAF' },
  'GA': { name: 'Gabon', currency: 'XAF' },
  'GQ': { name: 'Equatorial Guinea', currency: 'XAF' },
  'CG': { name: 'Republic of Congo', currency: 'XAF' },
  'RW': { name: 'Rwanda', currency: 'RWF' },
  'BI': { name: 'Burundi', currency: 'BIF' },
  'UG': { name: 'Uganda', currency: 'UGX' },
  'TZ': { name: 'Tanzania', currency: 'TZS' },
  'ET': { name: 'Ethiopia', currency: 'ETB' },
  'SO': { name: 'Somalia', currency: 'SOS' },
  'DJ': { name: 'Djibouti', currency: 'DJF' },
  'ER': { name: 'Eritrea', currency: 'ERN' },
  'SD': { name: 'Sudan', currency: 'SDG' },
  'SS': { name: 'South Sudan', currency: 'SSP' },
  'BY': { name: 'Belarus', currency: 'BYN' },
  'AI': { name: 'Anguilla', currency: 'XCD' }
} as const

function getCountryInfo(countryCode: string) {
  const info = COUNTRY_MAPPING[countryCode as keyof typeof COUNTRY_MAPPING]
  return {
    name: info?.name || countryCode,
    currency: info?.currency || 'USD'
  }
}

async function getUserProfile(supabase: any, email: string) {
  const { data: userProfile, error: userError } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', email)
    .single()

  if (userError || !userProfile) {
    throw new Error('Unable to verify user account')
  }

  return userProfile
}

export async function getRevenueAnalytics(): Promise<{ success: boolean; data: RevenueAnalytics[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.email) {
      return { success: false, data: null, error: 'No authenticated session' }
    }

    await getUserProfile(supabase, session.user.email)

    const query = `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as transaction_count,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_transaction_amount,
        COUNT(DISTINCT merchant_id) as unique_merchants,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
        ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate
      FROM payments
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12
    `

    const { data, error } = await supabase.from('payments').select().limit(0)
    if (error) throw error

    // Execute raw query
    const { data: rawData, error: queryError } = await (supabase as any).rpc('exec', { query })
    
    const formattedData: RevenueAnalytics[] = (rawData || []).map((item: any) => ({
      month: item.month,
      transaction_count: Number(item.transaction_count),
      total_revenue: item.total_revenue?.toString() || '0',
      avg_transaction_amount: item.avg_transaction_amount?.toString() || '0',
      unique_merchants: Number(item.unique_merchants),
      completed_count: Number(item.completed_count),
      pending_count: Number(item.pending_count),
      failed_count: Number(item.failed_count),
      success_rate: item.success_rate?.toString() || '0'
    }))

    return { success: true, data: formattedData, error: null }

  } catch (error) {
    return { 
      success: false, 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function getGeographicAnalytics(): Promise<{ success: boolean; data: GeographicAnalytics[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.email) {
      return { success: false, data: null, error: 'No authenticated session' }
    }

    const userProfile = await getUserProfile(supabase, session.user.email)
    const isSuperAdmin = userProfile.role === 'super_admin' || 
      session.user.email === 'admin@pxvpay.com' ||
      session.user.email === 'dev-admin@pxvpay.com' ||
      session.user.email === 'superadmin@pxvpay.com'

    // Build query based on user role
    let query = supabase
      .from('payments')
      .select('country, currency, amount, status')

    // Filter by merchant if not super admin
    if (!isSuperAdmin) {
      query = query.eq('merchant_id', userProfile.id)
    }

    const { data: paymentsData, error } = await query

    if (error) {
      return { success: false, data: null, error: error.message }
    }

    // Group and aggregate data by country
    const countryStats = new Map<string, {
      totalRevenue: number
      paymentCount: number
      completedPayments: number
      currency: string
    }>()

    paymentsData?.forEach(payment => {
      if (!payment.country) return
      
      const existing = countryStats.get(payment.country) || {
        totalRevenue: 0,
        paymentCount: 0,
        completedPayments: 0,
        currency: payment.currency || 'USD'
      }

      existing.totalRevenue += parseFloat(payment.amount?.toString() || '0')
      existing.paymentCount += 1
      if (payment.status === 'completed') {
        existing.completedPayments += 1
      }

      countryStats.set(payment.country, existing)
    })

    // Convert to array and format
    const formattedData: GeographicAnalytics[] = Array.from(countryStats.entries()).map(([country, stats]) => {
      const { name, currency } = getCountryInfo(country)
      return {
        country_name: name,
        country_code: country,
        currency_code: currency,
        payment_count: stats.paymentCount,
        total_revenue: stats.totalRevenue.toString(),
        avg_amount: stats.paymentCount > 0 ? (stats.totalRevenue / stats.paymentCount).toString() : '0',
        completed_payments: stats.completedPayments,
        success_rate: stats.paymentCount > 0 ? ((stats.completedPayments / stats.paymentCount) * 100).toString() : '0'
      }
    })

    // Sort by total revenue descending
    formattedData.sort((a, b) => parseFloat(b.total_revenue) - parseFloat(a.total_revenue))

    return { success: true, data: formattedData, error: null }

  } catch (error) {
    return { 
      success: false, 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function getPaymentMethodAnalytics(): Promise<{ success: boolean; data: PaymentMethodAnalytics[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.email) {
      return { success: false, data: null, error: 'No authenticated session' }
    }

    const userProfile = await getUserProfile(supabase, session.user.email)
    const isSuperAdmin = userProfile.role === 'super_admin' || 
      session.user.email === 'admin@pxvpay.com' ||
      session.user.email === 'dev-admin@pxvpay.com' ||
      session.user.email === 'superadmin@pxvpay.com'

    // Build query based on user role
    let query = supabase
      .from('payments')
      .select('payment_method, currency, amount, status, country')

    // Filter by merchant if not super admin
    if (!isSuperAdmin) {
      query = query.eq('merchant_id', userProfile.id)
    }

    const { data: paymentsData, error } = await query

    if (error) {
      return { success: false, data: null, error: error.message }
    }

    // Group and aggregate data by payment method
    const methodStats = new Map<string, {
      totalRevenue: number
      transactionCount: number
      completedCount: number
      pendingCount: number
      failedCount: number
      currencies: Map<string, number>
    }>()

    paymentsData?.forEach(payment => {
      if (!payment.payment_method) return
      
      const existing = methodStats.get(payment.payment_method) || {
        totalRevenue: 0,
        transactionCount: 0,
        completedCount: 0,
        pendingCount: 0,
        failedCount: 0,
        currencies: new Map<string, number>()
      }

      const amount = parseFloat(payment.amount?.toString() || '0')
      const currency = payment.currency || getCountryInfo(payment.country || '').currency
      
      existing.totalRevenue += amount
      existing.transactionCount += 1
      
      // Track currency amounts
      existing.currencies.set(currency, (existing.currencies.get(currency) || 0) + amount)
      
      switch (payment.status) {
        case 'completed':
          existing.completedCount += 1
          break
        case 'pending':
        case 'pending_verification':
          existing.pendingCount += 1
          break
        case 'failed':
        case 'cancelled':
          existing.failedCount += 1
          break
      }

      methodStats.set(payment.payment_method, existing)
    })

    // Convert to array and format
    const formattedData: PaymentMethodAnalytics[] = Array.from(methodStats.entries()).map(([method, stats]) => {
      // Get the dominant currency for this payment method
      let dominantCurrency = 'USD'
      let maxAmount = 0
      for (const [currency, amount] of stats.currencies.entries()) {
        if (amount > maxAmount) {
          maxAmount = amount
          dominantCurrency = currency
        }
      }
      
      return {
        payment_method: method,
        transaction_count: stats.transactionCount,
        total_revenue: stats.totalRevenue.toString(),
        avg_amount: stats.transactionCount > 0 ? (stats.totalRevenue / stats.transactionCount).toString() : '0',
        completed_count: stats.completedCount,
        pending_count: stats.pendingCount,
        failed_count: stats.failedCount,
        success_rate: stats.transactionCount > 0 ? ((stats.completedCount / stats.transactionCount) * 100).toString() : '0',
        currency_code: dominantCurrency
      }
    })

    // Sort by total revenue descending
    formattedData.sort((a, b) => parseFloat(b.total_revenue) - parseFloat(a.total_revenue))

    return { success: true, data: formattedData, error: null }

  } catch (error) {
    return { 
      success: false, 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function getCheckoutLinkAnalytics(): Promise<{ success: boolean; data: CheckoutLinkAnalytics[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.email) {
      return { success: false, data: null, error: 'No authenticated session' }
    }

    const userProfile = await getUserProfile(supabase, session.user.email)
    const isSuperAdmin = userProfile.role === 'super_admin' || 
      session.user.email === 'admin@pxvpay.com' ||
      session.user.email === 'dev-admin@pxvpay.com' ||
      session.user.email === 'superadmin@pxvpay.com'

    // Get checkout links for the user
    let checkoutQuery = supabase
      .from('checkout_links')
      .select('id, slug, title, checkout_type, merchant_id')
      .eq('status', 'active')

    if (!isSuperAdmin) {
      checkoutQuery = checkoutQuery.eq('merchant_id', userProfile.id)
    }

    const { data: checkoutLinks, error: linksError } = await checkoutQuery

    if (linksError) {
      return { success: false, data: null, error: linksError.message }
    }

    if (!checkoutLinks || checkoutLinks.length === 0) {
      return { success: true, data: [], error: null }
    }

    const linkIds = checkoutLinks.map(link => link.id);

    // Fetch all payments related to these checkout links
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('checkout_link_id, amount, currency, status')
      .in('checkout_link_id', linkIds)

    if (paymentsError) {
      return { success: false, data: null, error: paymentsError.message }
    }

    // Process payments
    const linkStats = new Map<string, {
      payment_count: number
      completed_count: number
      total_revenue: number
      currencies: Map<string, number>
    }>()

    payments?.forEach(p => {
      if (!p.checkout_link_id) return;

      const stats = linkStats.get(p.checkout_link_id) || {
        payment_count: 0,
        completed_count: 0,
        total_revenue: 0,
        currencies: new Map()
      }

      const amount = parseFloat(p.amount?.toString() || '0')
      const currency = p.currency || 'USD'

      stats.payment_count += 1
      stats.total_revenue += amount
      if (p.status === 'completed') {
        stats.completed_count += 1
      }
      stats.currencies.set(currency, (stats.currencies.get(currency) || 0) + amount)

      linkStats.set(p.checkout_link_id, stats)
    })

    // Format the final data
    const formattedData: CheckoutLinkAnalytics[] = checkoutLinks
      .map(link => {
        const stats = linkStats.get(link.id) || {
          payment_count: 0,
          completed_count: 0,
          total_revenue: 0,
          currencies: new Map()
        }

        // Determine dominant currency
        let dominantCurrency = 'USD'
        let maxAmount = 0
        for (const [currency, amount] of stats.currencies.entries()) {
          if (amount > maxAmount) {
            maxAmount = amount
            dominantCurrency = currency
          }
        }

        return {
          id: link.id,
          slug: link.slug,
          title: link.title || 'Untitled',
          checkout_type: link.checkout_type || 'payment_link',
          payment_count: stats.payment_count,
          total_revenue: stats.total_revenue.toFixed(2),
          conversion_rate: (stats.payment_count > 0 ? (stats.completed_count / stats.payment_count) * 100 : 0).toFixed(2),
          currency_code: dominantCurrency
        }
      })
      .sort((a, b) => parseFloat(b.total_revenue) - parseFloat(a.total_revenue))
      .slice(0, 4) // Return top 4

    return { success: true, data: formattedData, error: null }

  } catch (error) {
    return { 
      success: false, 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function getTransactionStatusAnalytics(): Promise<{ success: boolean; data: TransactionStatusAnalytics[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.email) {
      return { success: false, data: null, error: 'No authenticated session' }
    }

    const userProfile = await getUserProfile(supabase, session.user.email)
    const isSuperAdmin = userProfile.role === 'super_admin' || 
      session.user.email === 'admin@pxvpay.com' ||
      session.user.email === 'dev-admin@pxvpay.com' ||
      session.user.email === 'superadmin@pxvpay.com'

    // Build query based on user role
    let query = supabase
      .from('payments')
      .select('status, amount, currency, country')

    // Filter by merchant if not super admin
    if (!isSuperAdmin) {
      query = query.eq('merchant_id', userProfile.id)
    }

    const { data: paymentsData, error } = await query

    if (error) {
      return { success: false, data: null, error: error.message }
    }

    // Group and aggregate data by status
    const statusStats = new Map<string, {
      count: number
      totalAmount: number
    }>()

    // Track overall currency totals to determine dominant currency
    const currencyTotals = new Map<string, number>()
    let totalTransactions = 0

    paymentsData?.forEach(payment => {
      const status = payment.status || 'unknown'
      const amount = parseFloat(payment.amount?.toString() || '0')
      const currency = payment.currency || getCountryInfo(payment.country || '').currency
      
      const existing = statusStats.get(status) || {
        count: 0,
        totalAmount: 0
      }

      existing.count += 1
      existing.totalAmount += amount
      totalTransactions += 1

      // Track currency totals for dominant currency calculation
      currencyTotals.set(currency, (currencyTotals.get(currency) || 0) + amount)

      statusStats.set(status, existing)
    })

    // Determine the dominant currency
    let dominantCurrency = 'USD'
    let maxTotal = 0
    for (const [currency, total] of currencyTotals.entries()) {
      if (total > maxTotal) {
        maxTotal = total
        dominantCurrency = currency
      }
    }

    // Convert to array and format
    const formattedData: TransactionStatusAnalytics[] = Array.from(statusStats.entries()).map(([status, stats]) => {
      return {
        status,
        count: stats.count,
        total_amount: stats.totalAmount.toString(),
        avg_amount: stats.count > 0 ? (stats.totalAmount / stats.count).toString() : '0',
        percentage: totalTransactions > 0 ? ((stats.count / totalTransactions) * 100).toString() : '0',
        currency_code: dominantCurrency
      }
    })

    // Sort by count descending
    formattedData.sort((a, b) => b.count - a.count)

    return { success: true, data: formattedData, error: null }

  } catch (error) {
    return { 
      success: false, 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function getDailyRevenueAnalytics(timeRange: string = '30', countryName?: string): Promise<{ success: boolean; data: DailyRevenueAnalytics[] | null; error: string | null; currency?: string }> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.email) {
      return { success: false, data: null, error: 'No authenticated session' }
    }

    const userProfile = await getUserProfile(supabase, session.user.email)
    const isSuperAdmin = userProfile.role === 'super_admin' || 
      session.user.email === 'admin@pxvpay.com' ||
      session.user.email === 'dev-admin@pxvpay.com' ||
      session.user.email === 'superadmin@pxvpay.com'

    // Calculate date range - but make it more inclusive for testing
    const days = parseInt(timeRange)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Math.max(days, 60)) // Ensure we get all test data

    // Build query based on user role and country filter
    let query = supabase
      .from('payments')
      .select('created_at, amount, status, country, currency')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    // Filter by merchant if not super admin
    if (!isSuperAdmin) {
      query = query.eq('merchant_id', userProfile.id)
    }

    // Filter by country if specified (now we expect country codes, not names)
    let targetCountryCode: string | null = null
    if (countryName && countryName !== 'All Countries') {
      // Convert country name back to code for filtering
      targetCountryCode = Object.keys(COUNTRY_MAPPING).find(code => 
        COUNTRY_MAPPING[code as keyof typeof COUNTRY_MAPPING].name === countryName
      ) || countryName
      query = query.eq('country', targetCountryCode)
    }

    const { data: paymentsData, error } = await query

    if (error) {
      return { success: false, data: null, error: error.message }
    }

    // Determine currency to display
    let currency = 'USD'
    if (countryName && countryName !== 'All Countries' && targetCountryCode) {
      // Use specific country's currency
      currency = getCountryInfo(targetCountryCode).currency
    } else {
      // For "All Countries", determine the dominant currency by transaction volume
      const currencyTotals = new Map<string, number>()
      paymentsData?.forEach(payment => {
        const paymentCurrency = payment.currency || 'USD'
        const amount = parseFloat(payment.amount?.toString() || '0')
        currencyTotals.set(paymentCurrency, (currencyTotals.get(paymentCurrency) || 0) + amount)
      })
      
      // Find the currency with the highest total transaction value
      let maxTotal = 0
      for (const [curr, total] of currencyTotals.entries()) {
        if (total > maxTotal) {
          maxTotal = total
          currency = curr
        }
      }
    }

    // For "All Countries", we need to convert all amounts to the dominant currency
    // For simplicity, we'll use the amounts as-is but show the dominant currency
    // In a real scenario, you'd want to use exchange rates

    // Group payments by date, but only include transactions in the selected timeframe for display
    const actualStartDate = new Date()
    actualStartDate.setDate(actualStartDate.getDate() - days)
    
    const dailyData = new Map<string, { count: number; total: number }>()
    
    // Initialize all dates in the display range with zero values
    for (let d = new Date(actualStartDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      dailyData.set(dateStr, { count: 0, total: 0 })
    }

    // Aggregate payment data for the display timeframe
    paymentsData?.forEach(payment => {
      const paymentDate = new Date(payment.created_at)
      const dateStr = paymentDate.toISOString().split('T')[0]
      
      // Only include payments within the display timeframe
      if (paymentDate >= actualStartDate && paymentDate <= endDate) {
        const existing = dailyData.get(dateStr) || { count: 0, total: 0 }
        let amount = parseFloat(payment.amount?.toString() || '0')
        
        // If showing all countries and payment currency differs from display currency,
        // for now we'll show the amount as-is (in a real app, convert via exchange rates)
        if (countryName === 'All Countries' || !countryName) {
          // For mixed currency display, we could either:
          // 1. Convert all to a base currency (requires exchange rates)
          // 2. Show amounts as-is but note it's mixed
          // 3. Use the payment's original currency amount
          
          // For now, let's normalize all amounts to the dominant currency context
          // This is a simplified approach - in production you'd use real exchange rates
          const paymentCurrency = payment.currency || 'USD'
          if (paymentCurrency !== currency) {
            // Simple normalization: if showing AUD but payment is in USD, roughly convert
            // This is NOT accurate and is just for demonstration
            if (currency === 'AUD' && paymentCurrency === 'USD') {
              amount = amount * 1.5 // Rough USD to AUD
            } else if (currency === 'USD' && paymentCurrency === 'AUD') {
              amount = amount / 1.5 // Rough AUD to USD
            } else if (currency === 'CAD' && paymentCurrency === 'USD') {
              amount = amount * 1.35 // Rough USD to CAD
            } else if (currency === 'USD' && paymentCurrency === 'CAD') {
              amount = amount / 1.35 // Rough CAD to USD
            }
            // For other currencies, use as-is for now
          }
        }
        
        dailyData.set(dateStr, {
          count: existing.count + 1,
          total: existing.total + amount
        })
      }
    })

    // Convert to array format
    const formattedData: DailyRevenueAnalytics[] = Array.from(dailyData.entries()).map(([date, data]) => ({
      date,
      transaction_count: data.count,
      total_revenue: data.total.toString(),
      avg_transaction_amount: data.count > 0 ? (data.total / data.count).toString() : '0',
      currency_code: currency
    }))

    return { success: true, data: formattedData, error: null, currency }

  } catch (error) {
    return { 
      success: false, 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function getAnalyticsSummary(): Promise<{ success: boolean; data: any | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.email) {
      return { success: false, data: null, error: 'No authenticated session' }
    }

    const userProfile = await getUserProfile(supabase, session.user.email)
    const isSuperAdmin = userProfile.role === 'super_admin' || session.user.email === 'admin@pxvpay.com'

    // Get revenue analytics for summary
    const revenueResult = await getRevenueAnalytics()
    if (!revenueResult.success || !revenueResult.data) {
      return { success: false, data: null, error: 'Unable to fetch revenue data' }
    }

    // Get checkout links count
    let checkoutQuery = supabase
      .from('checkout_links')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (!isSuperAdmin) {
      checkoutQuery = checkoutQuery.eq('merchant_id', userProfile.id)
    }

    const { count: checkoutCount, error: checkoutError } = await checkoutQuery

    if (checkoutError) {
      return { success: false, data: null, error: checkoutError.message }
    }

    const current = revenueResult.data[0]
    const previous = revenueResult.data[1]

    const summary = {
      current_month: current,
      previous_month: previous,
      growth_rate: current && previous ? 
        ((parseFloat(current.total_revenue) - parseFloat(previous.total_revenue)) / parseFloat(previous.total_revenue) * 100).toFixed(2) : 
        '0.00',
      active_checkout_links: checkoutCount || 0
    }

    return { success: true, data: summary, error: null }

  } catch (error) {
    return { 
      success: false, 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
} 