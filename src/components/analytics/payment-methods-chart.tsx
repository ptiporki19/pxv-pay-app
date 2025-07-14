'use client'

import { useEffect, useState } from 'react'
import { getPaymentMethodAnalytics, type PaymentMethodAnalytics } from '@/lib/actions/analytics-data-simple'

export function PaymentMethodsChart() {
  const [data, setData] = useState<PaymentMethodAnalytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getPaymentMethodAnalytics()
        if (result.success && result.data) {
          setData(result.data)
        }
      } catch (err) {
        console.error('Error fetching payment methods data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="h-[350px] w-full animate-pulse bg-muted rounded" />
  }

  return (
    <div className="h-[350px] w-full">
      <div className="grid gap-2">
        <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
          <div>Payment Method</div>
          <div>Revenue</div>
          <div>Transactions</div>
          <div>Success Rate</div>
        </div>
        {data.slice(0, 8).map((item, index) => (
          <div key={index} className="grid grid-cols-4 gap-2 text-sm py-2 border-b">
            <div className="font-medium">{item.payment_method}</div>
            <div>${parseFloat(item.total_revenue).toLocaleString()}</div>
            <div>{item.transaction_count}</div>
            <div>{item.success_rate}%</div>
          </div>
        ))}
      </div>
    </div>
  )
} 