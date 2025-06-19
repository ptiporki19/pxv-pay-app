"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, Filter, Download, Eye, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Transaction {
  id: string
  created_at: string
  amount: string
  currency: string
  status: 'pending' | 'pending_verification' | 'completed' | 'failed' | 'refunded'
  payment_method: string
  customer_name?: string
  customer_email?: string
  description?: string
  reference?: string
  country?: string
}

export function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [userRole, setUserRole] = useState<string>('merchant')
  
  const supabase = createClient()

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, statusFilter])

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      
      // Get current auth user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('User not authenticated, aborting transaction load.')
        setIsLoading(false)
        return
      }

      // Get database profile to determine role and get the correct ID
      const { data: dbUser, error: profileError } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', user.email) // Use email for reliable lookup
        .single()

      if (profileError || !dbUser) {
        console.warn('Error loading user profile:', profileError?.message)
        setIsLoading(false)
        return
      }

      const isSuperAdmin = dbUser.role === 'super_admin' || 
        user.email === 'admin@pxvpay.com' || 
        user.email === 'dev-admin@pxvpay.com' || 
        user.email === 'superadmin@pxvpay.com'

      setUserRole(isSuperAdmin ? 'super_admin' : 'merchant')

      // Build query based on user role
      let query = supabase.from('payments').select('*')
      
      // If not super admin, filter by the correct database merchant_id
      if (!isSuperAdmin) {
        query = query.eq('merchant_id', dbUser.id) // Use the correct database ID
      }
      
      const { data: transactionsData, error } = await query
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Error loading transactions:', error.message)
        return
      }

      console.log(`Loaded ${transactionsData?.length || 0} transactions for ${isSuperAdmin ? 'super admin' : 'merchant'}`)

      // Format transaction data
      const formattedTransactions: Transaction[] = transactionsData?.map(payment => ({
        id: payment.id,
        created_at: payment.created_at,
        amount: payment.amount?.toString() || '0',
        currency: payment.currency || 'USD',
        status: payment.status,
        payment_method: payment.payment_method || 'N/A',
        customer_name: payment.customer_name,
        customer_email: payment.customer_email,
        description: payment.description,
        reference: payment.reference,
        country: payment.country
      })) || []

      setTransactions(formattedTransactions)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter)
    }

    setFilteredTransactions(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    })
  }

  const formatAmount = (amount: string, currency: string) => {
    const numericAmount = parseFloat(amount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2
    }).format(numericAmount)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'pending_verification':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 font-bold font-geist">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-geist">
            {userRole === 'super_admin' ? 'Platform Transactions' : 'My Transactions'}
          </h1>
        </div>

        <div className="bg-card rounded-lg shadow-sm border">
          <div className="p-6">
            {/* Filters and Search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 font-geist"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] h-11 font-geist">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-geist">All Status</SelectItem>
                    <SelectItem value="completed" className="font-geist">Completed</SelectItem>
                    <SelectItem value="pending_verification" className="font-geist">Pending Verification</SelectItem>
                    <SelectItem value="pending" className="font-geist">Pending</SelectItem>
                    <SelectItem value="failed" className="font-geist">Failed</SelectItem>
                    <SelectItem value="refunded" className="font-geist">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="gap-2 h-11 font-bold font-geist">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            {/* Transaction Summary */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-6 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/30 dark:to-violet-800/20 rounded-xl border border-violet-200 dark:border-violet-700/50 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="text-sm text-violet-600 dark:text-violet-400 font-bold font-geist mb-1">Total Transactions</div>
                <div className="text-3xl font-black text-violet-700 dark:text-violet-300 font-geist">{transactions.length}</div>
                <div className="text-xs text-violet-500 dark:text-violet-400 font-geist mt-1">All time</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/20 rounded-xl border border-green-200 dark:border-green-700/50 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="text-sm text-green-600 dark:text-green-400 font-bold font-geist mb-1">Completed</div>
                <div className="text-3xl font-black text-green-700 dark:text-green-300 font-geist">
                  {transactions.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-xs text-green-500 dark:text-green-400 font-geist mt-1">Successfully processed</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-800/20 rounded-xl border border-amber-200 dark:border-amber-700/50 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="text-sm text-amber-600 dark:text-amber-400 font-bold font-geist mb-1">Pending Verification</div>
                <div className="text-3xl font-black text-amber-700 dark:text-amber-300 font-geist">
                  {transactions.filter(t => t.status === 'pending_verification').length}
                </div>
                <div className="text-xs text-amber-500 dark:text-amber-400 font-geist mt-1">Awaiting review</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/30 dark:to-rose-800/20 rounded-xl border border-red-200 dark:border-red-700/50 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="text-sm text-red-600 dark:text-red-400 font-bold font-geist mb-1">Failed</div>
                <div className="text-3xl font-black text-red-700 dark:text-red-300 font-geist">
                  {transactions.filter(t => t.status === 'failed').length}
                </div>
                <div className="text-xs text-red-500 dark:text-red-400 font-geist mt-1">Rejected payments</div>
              </div>
            </div>

            {/* Transactions Table with Enhanced Styling - Copy from Platform Transactions */}
            <div className="enhanced-table">
              <div className="overflow-hidden border rounded-lg">
              <div className="overflow-x-auto">
                  <div className="border rounded-lg">
                    {/* Table Header - Exact copy from Platform Transactions */}
                    <div className="flex items-center justify-between border-b px-4 py-3 font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200 font-geist font-semibold text-sm">
                      <div className="w-[120px]">Transaction ID</div>
                      <div className="w-[100px]">Date</div>
                      <div className="w-[140px]">Customer</div>
                      <div className="w-[140px]">Merchant</div>
                      <div className="w-[100px]">Amount</div>
                      <div className="w-[120px]">Method</div>
                      <div className="w-[100px]">Status</div>
                      <div className="w-[80px] text-right">Actions</div>
                    </div>
                    
                    {/* Table Body - Exact copy from Platform Transactions */}
                    {isLoading ? (
                      <div className="px-4 py-12 text-center">
                        <div className="text-gray-500 font-geist">Loading transactions...</div>
                      </div>
                    ) : filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between px-4 py-3 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                          <div className="w-[120px]">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">
                              {transaction.id.slice(0, 8)}...
                            </div>
                            {transaction.reference && (
                              <div className="text-xs text-gray-500 font-geist">
                                Ref: {transaction.reference}
                              </div>
                            )}
                          </div>
                          <div className="w-[100px]">
                            <div className="text-sm text-gray-900 dark:text-gray-100 font-geist">
                              {formatDate(transaction.created_at)}
                            </div>
                          </div>
                          <div className="w-[140px]">
                            <div className="text-sm text-gray-900 dark:text-gray-100 font-geist">
                              {transaction.customer_name || transaction.customer_email?.split('@')[0] || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 font-geist">
                              {transaction.customer_email}
                            </div>
                          </div>
                          <div className="w-[140px]">
                            <div className="text-sm text-gray-900 dark:text-gray-100 font-geist">
                                {userRole === 'super_admin' ? 'Merchant' : 'You'}
                              </div>
                            <div className="text-xs text-gray-500 font-geist">
                                Current User
                              </div>
                          </div>
                          <div className="w-[100px]">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 font-geist">
                              {formatAmount(transaction.amount, transaction.currency)}
                            </div>
                          </div>
                          <div className="w-[120px]">
                            <div className="text-sm text-gray-900 dark:text-gray-100 font-geist">
                              {transaction.payment_method}
                            </div>
                          </div>
                          <div className="w-[100px]">
                            <Badge variant="outline" className={cn(getStatusBadgeClass(transaction.status), "font-geist")}>
                              {transaction.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="w-[80px] text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/transactions/${transaction.id}`} className="font-geist">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="font-geist">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Receipt
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-12 text-center">
                          <div className="text-gray-500">
                          <div className="text-lg font-medium mb-2 font-geist">No transactions found</div>
                          <div className="text-sm font-geist">
                              {searchTerm || statusFilter !== 'all' 
                                ? 'Try adjusting your search or filter criteria.'
                                : `${userRole === 'super_admin' ? 'Transactions' : 'Your transactions'} will appear here once payments are processed.`
                              }
                            </div>
                          </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination Info */}
            {filteredTransactions.length > 0 && (
              <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                <div className="font-bold font-geist">
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </div>
                <div className="text-xs font-geist">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 