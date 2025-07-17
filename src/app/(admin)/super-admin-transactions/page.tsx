"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, Filter, Download, Eye, MoreHorizontal, Info, ExternalLink, Copy, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { toast } from "@/components/ui/use-toast"
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Transaction {
  id: string
  created_at: string
  amount: string
  currency: string
  status: 'pending' | 'pending_verification' | 'completed' | 'failed'
  payment_method: string
  customer_name?: string
  customer_email?: string
  merchant_email?: string
  description?: string
  reference?: string
}

export default function SuperAdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])

  
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
      
      // Get current user and verify super admin status
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const isSuperAdmin = profile?.role === 'super_admin' || 
        user.email === 'admin@pxvpay.com' || 
        user.email === 'dev-admin@pxvpay.com' || 
        user.email === 'superadmin@pxvpay.com'

      if (!isSuperAdmin) {
        console.error('Unauthorized access to super admin transactions')
        return
      }

      // Fetch all transactions across the platform - using simple query like dashboard
      const { data: transactionsData, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading transactions:', error.message)
        return
      }

      console.log('Loaded transactions:', transactionsData?.length || 0)

      // Get unique merchant IDs to fetch merchant emails separately
      const merchantIds = [...new Set(transactionsData?.map(p => p.merchant_id).filter(Boolean))]
      
      // Fetch merchant emails separately if we have merchant IDs
      let merchantEmails: Record<string, string> = {}
      if (merchantIds.length > 0) {
        const { data: merchants } = await supabase
          .from('users')
          .select('id, email')
          .in('id', merchantIds)
        
        if (merchants) {
          merchantEmails = Object.fromEntries(
            merchants.map(m => [m.id, m.email])
          )
        }
      }

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
        merchant_email: payment.merchant_id ? merchantEmails[payment.merchant_id] || payment.merchant_id : 'N/A',
        description: payment.description,
        reference: payment.reference
      })) || []

      console.log('Formatted transactions:', formattedTransactions.length)
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
        transaction.merchant_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      default:
        return "bg-background text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
    }
  }



  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: `${label} has been copied to your clipboard.`,
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'pending':
      case 'pending_verification':
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/super-admin">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Platform Transactions</h1>
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
            <div className="overflow-hidden border rounded-lg">
              <div className="overflow-x-auto">
                <div className="border rounded-lg">
                  {/* Table Header */}
                  <div className="flex items-center justify-between border-b px-4 py-3 font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200 font-roboto font-semibold text-sm">
                    <div className="w-[120px]">Transaction ID</div>
                    <div className="w-[100px]">Date</div>
                    <div className="w-[140px]">Customer</div>
                    <div className="w-[140px]">Merchant</div>
                    <div className="w-[100px]">Amount</div>
                    <div className="w-[120px]">Method</div>
                    <div className="w-[100px]">Status</div>
                    <div className="w-[80px] text-right">Actions</div>
                  </div>
                  
                  {/* Table Body */}
                    {isLoading ? (
                    <div className="px-4 py-12 text-center">
                      <div className="text-gray-500 font-roboto">Loading transactions...</div>
                    </div>
                    ) : filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between px-4 py-3 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                        <div className="w-[120px]">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">
                              {transaction.id.slice(0, 8)}...
                            </div>
                            {transaction.reference && (
                            <div className="text-xs text-gray-500 font-roboto">
                                Ref: {transaction.reference}
                              </div>
                            )}
                        </div>
                        <div className="w-[100px]">
                          <div className="text-sm text-gray-900 dark:text-gray-100 font-roboto">
                              {formatDate(transaction.created_at)}
                            </div>
                        </div>
                        <div className="w-[140px]">
                          <div className="text-sm text-gray-900 dark:text-gray-100 font-roboto">
                              {transaction.customer_name || transaction.customer_email?.split('@')[0] || 'N/A'}
                            </div>
                          <div className="text-xs text-gray-500 font-roboto">
                              {transaction.customer_email}
                            </div>
                        </div>
                        <div className="w-[140px]">
                          <div className="text-sm text-gray-900 dark:text-gray-100 font-roboto">
                              {transaction.merchant_email?.split('@')[0] || 'N/A'}
                            </div>
                          <div className="text-xs text-gray-500 font-roboto">
                              {transaction.merchant_email}
                            </div>
                        </div>
                        <div className="w-[100px]">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 font-roboto">
                              {formatAmount(transaction.amount, transaction.currency)}
                            </div>
                        </div>
                        <div className="w-[120px]">
                          <div className="text-sm text-gray-900 dark:text-gray-100 font-roboto">
                              {transaction.payment_method}
                            </div>
                        </div>
                        <div className="w-[100px]">
                          <Badge variant="outline" className={cn(getStatusBadgeClass(transaction.status), "font-roboto")}>
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
                                <Link href={`/super-admin-transactions/${transaction.id}`} className="font-roboto">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                  </Link>
                                </DropdownMenuItem>
                              <DropdownMenuItem className="font-roboto">
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
                        <div className="text-lg font-medium mb-2 font-roboto">No transactions found</div>
                        <div className="text-sm font-roboto">
                              {searchTerm || statusFilter !== 'all' 
                                ? 'Try adjusting your search or filter criteria.'
                                : 'Transactions will appear here once payments are processed.'
                              }
                            </div>
                          </div>
                    </div>
                    )}
                </div>
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