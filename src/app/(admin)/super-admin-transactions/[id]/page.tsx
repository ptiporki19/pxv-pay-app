"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Copy, Download, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface TransactionDetail {
  id: string
  created_at: string
  updated_at: string
  amount: string
  currency: string
  status: 'pending' | 'pending_verification' | 'completed' | 'failed' | 'refunded'
  payment_method: string
  customer_name?: string
  customer_email?: string
  merchant_email?: string
  description?: string
  reference?: string
  payment_proof_url?: string
  checkout_link_id?: string
  country?: string
}

interface SuperAdminTransactionDetailProps {
  params: { id: string }
}

export default function SuperAdminTransactionDetailPage({ params }: SuperAdminTransactionDetailProps) {
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadTransaction()
  }, [params.id])

  const loadTransaction = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user and verify super admin status
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        return
      }

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
        setError('Unauthorized access')
        return
      }

      // Fetch transaction details
      const { data: transactionData, error: transactionError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', params.id)
        .single()

      if (transactionError) {
        console.error('Error loading transaction:', transactionError)
        setError('Transaction not found')
        return
      }

      // Get merchant email separately if merchant_id exists
      let merchantEmail = 'N/A'
      if (transactionData?.merchant_id) {
        const { data: merchant } = await supabase
          .from('users')
          .select('email')
          .eq('id', transactionData.merchant_id)
          .single()
        
        if (merchant) {
          merchantEmail = merchant.email
        }
      }

      if (transactionData) {
        setTransaction({
          id: transactionData.id,
          created_at: transactionData.created_at,
          updated_at: transactionData.updated_at,
          amount: transactionData.amount?.toString() || '0',
          currency: transactionData.currency || 'USD',
          status: transactionData.status,
          payment_method: transactionData.payment_method || 'N/A',
          customer_name: transactionData.customer_name,
          customer_email: transactionData.customer_email,
          merchant_email: merchantEmail,
          description: transactionData.description,
          reference: transactionData.reference,
          payment_proof_url: transactionData.payment_proof_url,
          checkout_link_id: transactionData.checkout_link_id,
          country: transactionData.country
        })
      }
    } catch (err) {
      console.error('Error loading transaction:', err)
      setError('Failed to load transaction')
    } finally {
      setLoading(false)
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-green-50 text-green-700 border-green-200"
      case 'pending':
      case 'pending_verification':
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case 'failed':
        return "bg-red-50 text-red-700 border-red-200"
      case 'refunded':
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return "bg-background text-gray-700 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error || 'Transaction not found'}</p>
          <Link href="/super-admin-transactions">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Transactions
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/super-admin-transactions">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Transactions
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download Receipt
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Transaction Information */}
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              {getStatusIcon(transaction.status)}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Transaction Information</h2>
                <Badge variant="outline" className={cn("mt-1", getStatusBadgeClass(transaction.status))}>
                  {transaction.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Transaction ID</Label>
                  <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center justify-between text-sm">
                    <span className="font-mono">{transaction.id}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(transaction.id, "Transaction ID")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Amount</Label>
                  <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm font-medium">
                    {formatAmount(transaction.amount, transaction.currency)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
                  <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                    {transaction.payment_method}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Country</Label>
                  <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                    {transaction.country || 'N/A'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Created At</Label>
                  <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                    {formatDate(transaction.created_at)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                  <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                    {formatDate(transaction.updated_at)}
                  </div>
                </div>
              </div>

              {transaction.description && (
                <div className="space-y-2 mt-6">
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  <div className="min-h-[44px] px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                    {transaction.description}
                  </div>
                </div>
              )}

              {transaction.reference && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Reference</Label>
                  <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center justify-between text-sm">
                    <span className="font-mono">{transaction.reference}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(transaction.reference || '', "Reference")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer & Merchant Information */}
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer & Merchant Information</h2>
            
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Customer</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Name</Label>
                    <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                      {transaction.customer_name || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center justify-between text-sm">
                      <span>{transaction.customer_email || 'N/A'}</span>
                      {transaction.customer_email && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(transaction.customer_email || '', "Customer Email")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Merchant Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Merchant</h3>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center justify-between text-sm">
                    <span>{transaction.merchant_email || 'N/A'}</span>
                    {transaction.merchant_email && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(transaction.merchant_email || '', "Merchant Email")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              {transaction.payment_proof_url && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Payment Proof</h3>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Proof URL</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <a href={transaction.payment_proof_url} target="_blank" rel="noopener noreferrer">
                          View Proof
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.payment_proof_url || '', "Proof URL")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 