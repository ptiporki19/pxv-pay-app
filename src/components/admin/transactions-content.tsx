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
  const [userRole, setUserRole] = useState<string>('')
  
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
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatAmount = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount)
    
    if (isNaN(numAmount)) {
      return `0 ${currency || 'USD'}`
    }
    
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numAmount)
    
    return `${formattedAmount} ${currency || 'USD'}`
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      case 'pending':
      case 'pending_verification':
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
      case 'failed':
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      case 'refunded':
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      default:
        return "bg-background text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
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
                    className="pl-10 h-11"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] h-11">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending_verification">Pending Verification</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="gap-2 h-11">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            {/* Transaction Summary */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-background rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600">Total Transactions</div>
                <div className="text-2xl font-bold text-gray-900">{transactions.length}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-green-600">Completed</div>
                <div className="text-2xl font-bold text-green-700">
                  {transactions.filter(t => t.status === 'completed').length}
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-sm text-yellow-600">Pending Verification</div>
                <div className="text-2xl font-bold text-yellow-700">
                  {transactions.filter(t => t.status === 'pending_verification').length}
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-sm text-red-600">Failed</div>
                <div className="text-2xl font-bold text-red-700">
                  {transactions.filter(t => t.status === 'failed').length}
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-background">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="text-gray-500">Loading transactions...</div>
                        </td>
                      </tr>
                    ) : filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-background transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.id.slice(0, 8)}...
                            </div>
                            {transaction.reference && (
                              <div className="text-xs text-gray-500">
                                Ref: {transaction.reference}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(transaction.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {transaction.customer_name || transaction.customer_email?.split('@')[0] || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {transaction.customer_email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatAmount(transaction.amount, transaction.currency)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {transaction.payment_method}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className={cn(getStatusBadgeClass(transaction.status))}>
                              {transaction.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/transactions/${transaction.id}`} className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Receipt
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="text-gray-500">
                            <div className="text-lg font-medium mb-2">No transactions found</div>
                            <div className="text-sm">
                              {searchTerm || statusFilter !== 'all' 
                                ? 'Try adjusting your search or filter criteria.'
                                : `${userRole === 'super_admin' ? 'Transactions' : 'Your transactions'} will appear here once payments are processed.`
                              }
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Info */}
            {filteredTransactions.length > 0 && (
              <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                <div>
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </div>
                <div className="text-xs">
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