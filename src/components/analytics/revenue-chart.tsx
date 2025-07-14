'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { getRevenueAnalytics, type RevenueAnalytics } from '@/lib/actions/analytics-data-simple'

export function RevenueChart() {
  const [data, setData] = useState<RevenueAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getRevenueAnalytics()
        if (result.success && result.data) {
          setData(result.data)
        } else {
          setError(result.error || 'Failed to fetch revenue data')
        }
      } catch (err) {
        setError('An error occurred while fetching revenue data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="h-[350px] w-full animate-pulse bg-muted rounded" />
    )
  }

  if (error || !data.length) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>{error || 'No revenue data available'}</p>
        </div>
      </div>
    )
  }

  const maxRevenue = Math.max(...data.map(d => parseFloat(d.total_revenue)))

  return (
    <div className="h-[350px] w-full space-y-4">
      {/* Revenue Data Table */}
      <div className="grid gap-4">
        <div className="grid grid-cols-7 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
          <div>Month</div>
          <div>Revenue</div>
          <div>Transactions</div>
          <div>Avg Amount</div>
          <div>Success Rate</div>
          <div>Completed</div>
          <div>Pending</div>
        </div>
        {data.slice(0, 6).map((item, index) => {
          const monthDate = new Date(item.month)
          const monthName = monthDate.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          })
          const revenue = parseFloat(item.total_revenue)
          const barWidth = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0

          return (
            <div key={index} className="grid grid-cols-7 gap-2 text-sm py-2 border-b">
              <div className="font-medium">{monthName}</div>
              <div className="flex items-center space-x-2">
                <div className="min-w-0 flex-1">
                  <div className="h-2 bg-muted rounded overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  ${revenue.toLocaleString()}
                </span>
              </div>
              <div>{item.transaction_count}</div>
              <div>${parseFloat(item.avg_transaction_amount).toLocaleString()}</div>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  parseFloat(item.success_rate) >= 50 
                    ? 'bg-green-100 text-green-800' 
                    : parseFloat(item.success_rate) >= 25 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {item.success_rate}%
                </span>
              </div>
              <div className="text-green-600">{item.completed_count}</div>
              <div className="text-yellow-600">{item.pending_count}</div>
            </div>
          )
        })}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-lg font-bold">
              ${data.reduce((sum, item) => sum + parseFloat(item.total_revenue), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Transactions</div>
            <div className="text-lg font-bold">
              {data.reduce((sum, item) => sum + item.transaction_count, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Avg Success Rate</div>
            <div className="text-lg font-bold">
              {(data.reduce((sum, item) => sum + parseFloat(item.success_rate), 0) / data.length).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 