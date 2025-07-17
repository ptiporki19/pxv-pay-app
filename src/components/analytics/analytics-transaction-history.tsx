'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Info as InfoIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Transaction {
  id: string
  fullId: string
  date: string
  customer: string
  customerEmail: string
  amount: number
  currency: string
  method: string
  country: string
  status: string
}

export function AnalyticsTransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('merchant')

  useEffect(() => {
    async function loadTransactions() {
      try {
        const supabase = createClient()
        
        // Get current auth user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        // Get database profile to determine role and get the correct ID
        const { data: dbUser, error: profileError } = await supabase
          .from('users')
          .select('id, role')
          .eq('email', user.email || '')
          .single()

        if (profileError || !dbUser) {
          setLoading(false)
          return
        }

        const isSuperAdmin = dbUser.role === 'super_admin' || 
          user.email === 'admin@pxvpay.com' || 
          user.email === 'dev-admin@pxvpay.com' || 
          user.email === 'superadmin@pxvpay.com'

        setUserRole(isSuperAdmin ? 'super_admin' : 'merchant')

        // Build payments query based on user role
        let paymentsQuery = supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)

        // If not super admin, filter by merchant_id using the correct database ID
        if (!isSuperAdmin && dbUser?.id) {
          paymentsQuery = paymentsQuery.eq('merchant_id', dbUser.id)
        }

        const { data: recentPayments } = await paymentsQuery
        
        // Format payment data using the same logic as dashboard
        const formattedPayments: Transaction[] = recentPayments?.map(payment => ({
          id: payment.id || 'N/A',
          fullId: payment.id || 'N/A',
          date: payment.created_at ? new Date(payment.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'N/A',
          customer: payment.customer_name || payment.customer_email?.split('@')[0] || 'N/A',
          customerEmail: payment.customer_email || '',
          amount: payment.amount && payment.currency ? payment.amount : 0,
          currency: payment.currency || 'USD',
          method: payment.payment_method || 'N/A',
          country: payment.country || 'N/A',
          status: payment.status || 'pending'
        })) || []

        setTransactions(formattedPayments)
      } catch (error) {
        console.error('Error loading transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [])

  return (
    <div className="rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm bg-white dark:bg-gray-800">
      <div className="overflow-x-auto">
        <div className="border rounded-lg">
          {/* Table Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200 font-roboto font-semibold text-sm">
            <div className="w-[120px]">Transaction ID</div>
            <div className="w-[100px]">Date</div>
            <div className="w-[160px]">Customer</div>
            <div className="w-[100px]">Amount</div>
            <div className="w-[120px]">Method</div>
            <div className="w-[80px]">Country</div>
            <div className="w-[140px] text-right">View / Status</div>
          </div>
          
          {/* Table Body */}
          {loading ? (
            <div className="px-4 py-12 text-center">
              <div className="text-gray-500 font-roboto">Loading transactions...</div>
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((payment) => (
              <div key={payment.fullId} className="flex items-center justify-between px-4 py-3 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                <div className="w-[120px]">
                  <span className="text-sm font-mono text-gray-900 dark:text-gray-100">{payment.id.slice(0, 8)}...</span>
                </div>
                <div className="w-[100px]">
                  <span className="text-sm font-roboto text-gray-900 dark:text-gray-100">{payment.date}</span>
                </div>
                <div className="w-[160px]">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 font-roboto">{payment.customer}</div>
                  <div className="text-xs text-muted-foreground font-medium font-roboto">{payment.customerEmail}</div>
                </div>
                <div className="w-[100px]">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100 font-roboto">{payment.amount} {payment.currency}</span>
                </div>
                <div className="w-[120px]">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-roboto">{payment.method}</span>
                </div>
                <div className="w-[80px]">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-roboto">{payment.country}</span>
                </div>
                <div className="w-[140px] text-right">
                  <div className="flex justify-end gap-2">
                    {/* Transaction Details Link */}
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/transactions/${payment.fullId}`}>
                        <InfoIcon className="h-4 w-4" />
                        <span className="sr-only">View Transaction Details</span>
                      </Link>
                    </Button>

                    <Badge variant="outline" className={cn(
                      "font-bold font-roboto",
                      payment.status === 'completed' && "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
                      payment.status === 'pending_verification' && "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                      payment.status === 'pending' && "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                      payment.status === 'failed' && "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
                      payment.status === 'refunded' && "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
                    )}>
                      {payment.status === 'pending_verification' 
                        ? 'pending verification' 
                        : payment.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <p className="text-base font-bold text-muted-foreground font-roboto">No transactions found</p>
                <p className="text-sm text-muted-foreground font-roboto">Start by creating your first checkout link</p>
                <Button size="sm" className="mt-2 font-bold font-roboto" asChild>
                  <Link href="/checkout-links/create">Create Checkout Link</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 