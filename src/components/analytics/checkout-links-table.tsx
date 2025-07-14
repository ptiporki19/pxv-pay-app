'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getCheckoutLinkAnalytics, type CheckoutLinkAnalytics } from '@/lib/actions/analytics-data-simple'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

export function ProductPerformance() {
  const [data, setData] = useState<CheckoutLinkAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const result = await getCheckoutLinkAnalytics()
        if (result.success && result.data) {
          // Limit to top 4 products for clean display without scrolling
          setData(result.data.slice(0, 4))
        } else {
          setError(result.error || 'Failed to fetch product performance data')
        }
      } catch (err) {
        console.error('Product performance error:', err)
        setError('An error occurred while fetching product performance data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card className="h-[500px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-geist">
            Product Performance
          </CardTitle>
          <CardDescription className="text-sm font-medium text-gray-600 dark:text-gray-300 font-geist">
            Top performing products by revenue
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
            <span className="text-sm text-muted-foreground">Loading products...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data.length) {
    return (
      <Card className="h-[500px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-geist">
            Product Performance
          </CardTitle>
          <CardDescription className="text-sm font-medium text-gray-600 dark:text-gray-300 font-geist">
            Top performing products by revenue
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">{error || 'No product performance data available'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const topProduct = data[0]

  return (
    <Card className="h-[500px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-geist">
          Product Performance
        </CardTitle>
        <CardDescription className="text-sm font-medium text-gray-600 dark:text-gray-300 font-geist">
          Top performing products by revenue
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[340px] space-y-2">
        {data.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors">
            <div className="flex-1 min-w-0 pr-3">
              <p className="font-semibold text-sm truncate" title={item.title || 'Unknown Product'}>
                {item.title || 'Unknown Product'}
              </p>
              <p className="text-xs text-muted-foreground">{item.payment_count || 0} sales</p>
              <p className="text-xs text-muted-foreground">{parseFloat(item.conversion_rate || '0').toFixed(2)}% conversion rate</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-base text-violet-500">
                {item.currency_code} {parseFloat(item.total_revenue || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                Type: {item.checkout_type?.replace('_', ' ') || 'Standard'}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="pt-3">
        <div className="text-xs text-muted-foreground w-full">
          <span className="truncate block" title={`Top: ${topProduct.title} - ${topProduct.currency_code} ${parseFloat(topProduct.total_revenue || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
            Top: {topProduct.title} - {topProduct.currency_code} {parseFloat(topProduct.total_revenue || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
} 