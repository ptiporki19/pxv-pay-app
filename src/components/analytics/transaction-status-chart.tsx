'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getTransactionStatusAnalytics, type TransactionStatusAnalytics } from '@/lib/actions/analytics-data-simple'

export function TransactionStatusChart() {
  const [data, setData] = useState<TransactionStatusAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getTransactionStatusAnalytics()
        if (result.success && result.data) {
          setData(result.data)
        } else {
          setError(result.error || 'Failed to fetch transaction status data')
        }
      } catch (err) {
        setError('An error occurred while fetching transaction status data')
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
          <p>{error || 'No transaction status data available'}</p>
        </div>
      </div>
    )
  }

  const maxCount = Math.max(...data.map(d => d.count))

  return (
    <div className="h-[350px] w-full space-y-4">
      {/* Status Data */}
      <div className="grid gap-4">
        <div className="grid grid-cols-5 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
          <div>Status</div>
          <div>Count</div>
          <div>Amount</div>
          <div>Percentage</div>
          <div>Visual</div>
        </div>
        {data.map((item, index) => {
          const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0
          const amount = parseFloat(item.total_amount)

          return (
            <div key={index} className="grid grid-cols-5 gap-2 text-sm py-2 border-b">
              <div className="font-medium">
                <Badge variant="outline" className={cn(
                  "font-bold font-geist",
                  item.status === 'completed' && "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
                  item.status === 'pending_verification' && "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                  item.status === 'pending' && "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                  item.status === 'failed' && "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
                  item.status === 'refunded' && "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
                )}>
                  {item.status === 'pending_verification' 
                    ? 'pending verification' 
                    : item.status}
                </Badge>
              </div>
              <div className="font-medium">{item.count}</div>
              <div className="font-medium">${amount.toLocaleString()}</div>
              <div className="font-medium">{item.percentage}%</div>
              <div className="flex items-center">
                <div className="w-full h-2 bg-muted rounded overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-300",
                      item.status === 'completed' && "bg-green-500",
                      item.status === 'pending_verification' && "bg-yellow-500",
                      item.status === 'pending' && "bg-yellow-500",
                      item.status === 'failed' && "bg-red-500",
                      item.status === 'refunded' && "bg-gray-500"
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="pt-4 border-t">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {data.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Transactions</div>
          </div>
          <div className="text-center p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              ${data.reduce((sum, item) => sum + parseFloat(item.total_amount), 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Amount</div>
          </div>
        </div>
      </div>
    </div>
  )
} 