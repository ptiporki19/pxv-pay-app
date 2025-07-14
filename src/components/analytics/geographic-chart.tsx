'use client'

import { useEffect, useState } from 'react'
import { getGeographicAnalytics, type GeographicAnalytics } from '@/lib/actions/analytics-data-simple'

export function GeographicChart() {
  const [data, setData] = useState<GeographicAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getGeographicAnalytics()
        if (result.success && result.data) {
          setData(result.data)
        } else {
          setError(result.error || 'Failed to fetch geographic data')
        }
      } catch (err) {
        setError('An error occurred while fetching geographic data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="h-[350px] w-full animate-pulse bg-muted rounded" />
  }

  if (error || !data.length) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>{error || 'No geographic data available'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[350px] w-full">
      <div className="grid gap-2">
        <div className="grid grid-cols-5 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
          <div>Country</div>
          <div>Revenue</div>
          <div>Transactions</div>
          <div>Success Rate</div>
          <div>Avg Amount</div>
        </div>
        {data.slice(0, 8).map((item, index) => (
          <div key={index} className="grid grid-cols-5 gap-2 text-sm py-2 border-b">
            <div className="font-medium">{item.country_name}</div>
            <div>${parseFloat(item.total_revenue).toLocaleString()}</div>
            <div>{item.payment_count}</div>
            <div>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                parseFloat(item.success_rate) >= 50 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {item.success_rate}%
              </span>
            </div>
            <div>${parseFloat(item.avg_amount).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
} 