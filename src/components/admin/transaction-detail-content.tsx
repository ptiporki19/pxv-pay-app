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
import { Spinner } from "@/components/ui/spinner"

interface TransactionDetail {
  id: string
  created_at: string
  updated_at: string
  amount: string
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'pending_verification'
  payment_method: string
  customer_email?: string
  customer_name?: string
  customer_phone?: string
  country?: string
  description?: string
  reference?: string
  metadata?: any
  fee_amount?: string
  net_amount?: string
  payment_proof_url?: string
  proof_of_payment_url?: string
  proof_uploaded_at?: string
  proof_verification_status?: string
}

interface TransactionDetailContentProps {
  transactionId: string
  backUrl?: string
}

export function TransactionDetailContent({ transactionId, backUrl = "/transactions" }: TransactionDetailContentProps) {
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    loadTransactionDetail()
  }, [transactionId])

  const loadTransactionDetail = async () => {
    try {
      setIsLoading(true)
      
      // Get current user and check permissions
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user profile using email lookup (same pattern as other components)
      const { data: profile } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', user.email)
        .single()

      if (!profile) {
        console.error('User profile not found for email:', user.email)
        return
      }

      const isSuperAdmin = profile?.role === 'super_admin' || 
        user.email === 'admin@pxvpay.com' || 
        user.email === 'dev-admin@pxvpay.com' || 
        user.email === 'superadmin@pxvpay.com'

      // Fetch transaction details with proof of payment fields
      const { data: transactionData, error } = await supabase
        .from('payments')
        .select(`
          id,
          created_at,
          updated_at,
          amount,
          currency,
          status,
          payment_method,
          customer_name,
          customer_email,
          customer_phone,
          country,
          description,
          reference,
          metadata,
          fee_amount,
          net_amount,
          payment_proof_url,
          proof_of_payment_url,
          proof_uploaded_at,
          proof_verification_status,
          merchant_id,
          user_id
        `)
        .eq('id', transactionId)
        .single()

      if (error) {
        console.error('Error loading transaction:', error)
        return
      }

      if (!transactionData) {
        console.error('Transaction not found:', transactionId)
        return
      }

      // Check if user has access to this transaction
      if (!isSuperAdmin && transactionData.merchant_id !== profile.id) {
        console.error('User does not have access to this transaction')
        setTransaction(null)
        return
      }

      // Format transaction data
      const formattedTransaction: TransactionDetail = {
        id: transactionData.id,
        created_at: transactionData.created_at,
        updated_at: transactionData.updated_at,
        amount: transactionData.amount,
        currency: transactionData.currency || 'USD',
        status: transactionData.status,
        payment_method: transactionData.payment_method || 'N/A',
        customer_email: transactionData.customer_email,
        customer_name: transactionData.customer_name,
        customer_phone: transactionData.customer_phone,
        country: transactionData.country,
        description: transactionData.description,
        reference: transactionData.reference,
        metadata: transactionData.metadata,
        fee_amount: transactionData.fee_amount,
        net_amount: transactionData.net_amount,
        payment_proof_url: transactionData.payment_proof_url,
        proof_of_payment_url: transactionData.proof_of_payment_url,
        proof_uploaded_at: transactionData.proof_uploaded_at,
        proof_verification_status: transactionData.proof_verification_status
      }

      setTransaction(formattedTransaction)
    } catch (error) {
      console.error('Error loading transaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyPayment = async (paymentId: string, newStatus: 'completed' | 'failed') => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: newStatus })
        .eq('id', paymentId)

      if (error) throw error

      toast({
        title: "Payment Updated",
        description: `Payment ${newStatus === 'completed' ? 'approved' : 'rejected'} successfully`,
      })
      
      // Reload transaction details to reflect changes
      loadTransactionDetail()
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast({
        title: "Error",
        description: 'Failed to update payment status',
        variant: "destructive",
      })
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadTransactionDetail()
    setIsRefreshing(false)
    toast({
      title: "Refreshed",
      description: "Transaction details have been updated",
    })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    })
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
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'refunded':
        return <AlertCircle className="h-5 w-5 text-blue-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      case 'pending':
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
      case 'failed':
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      case 'refunded':
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      default:
        return "bg-background text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Spinner size="lg" className="mx-auto mb-4" />
              <p className="text-muted-foreground">Loading transaction details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg font-medium">Transaction not found</p>
              <p className="text-muted-foreground mb-4">The requested transaction could not be found.</p>
              <Link href={backUrl}>
                <Button variant="outline">Back to Transactions</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href={backUrl}>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Transactions
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Details</h1>
        </div>

        {/* Content Container */}
        <div className="bg-card rounded-lg shadow-sm border">
          <div className="p-8 space-y-8">
            {/* Transaction Status Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(transaction.status)}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Transaction {transaction.id.slice(0, 8)}...
                  </h2>
                  <p className="text-sm text-gray-600">
                    Created on {formatDate(transaction.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={cn(getStatusBadgeClass(transaction.status))}>
                  {transaction.status.toUpperCase()}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="gap-2"
                >
                  <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Transaction Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Transaction ID</Label>
                    <div className="flex items-center gap-2">
                      <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm font-mono flex-1">
                        {transaction.id}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.id, 'Transaction ID')}
                        className="h-11 px-3"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Reference</Label>
                    <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                      {transaction.reference || 'N/A'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Amount</Label>
                    <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm font-semibold">
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
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                    <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                      {transaction.customer_name || 'N/A'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                    <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                      {transaction.customer_email || 'N/A'}
                    </div>
                  </div>

                  {transaction.customer_phone && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                      <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                        {transaction.customer_phone}
                      </div>
                    </div>
                  )}

                  {transaction.country && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Country</Label>
                      <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                        {transaction.country}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Proof of Payment */}
              {(transaction.payment_proof_url || transaction.proof_of_payment_url) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Proof of Payment</h3>
                  <div className="space-y-4">
                    {transaction.proof_uploaded_at && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Uploaded At</Label>
                          <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                            {formatDate(transaction.proof_uploaded_at)}
                          </div>
                        </div>

                        {transaction.proof_verification_status && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Verification Status</Label>
                            <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                              <Badge variant="outline" className={cn(
                                transaction.proof_verification_status === 'verified' 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : transaction.proof_verification_status === 'rejected'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              )}>
                                {transaction.proof_verification_status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Proof Image Display */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Payment Receipt/Screenshot</Label>
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="max-w-md mx-auto">
                          <img
                            src={transaction.proof_of_payment_url || transaction.payment_proof_url}
                            alt="Proof of Payment"
                            className="w-full h-auto rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => {
                              const imageUrl = transaction.proof_of_payment_url || transaction.payment_proof_url
                              if (imageUrl) {
                                window.open(imageUrl, '_blank')
                              }
                            }}
                          />
                          <div className="mt-3 flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const imageUrl = transaction.proof_of_payment_url || transaction.payment_proof_url
                                if (imageUrl) {
                                  window.open(imageUrl, '_blank')
                                }
                              }}
                              className="gap-2"
                            >
                              <Download className="h-4 w-4" />
                              View Full Size
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const imageUrl = transaction.proof_of_payment_url || transaction.payment_proof_url
                                if (imageUrl) {
                                  copyToClipboard(imageUrl, 'Proof Image URL')
                                }
                              }}
                              className="gap-2"
                            >
                              <Copy className="h-4 w-4" />
                              Copy Link
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Details */}
              {(transaction.fee_amount || transaction.net_amount) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Gross Amount</Label>
                      <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm font-semibold">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </div>
                    </div>
                    {transaction.fee_amount && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Fee Amount</Label>
                        <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                          {formatAmount(transaction.fee_amount, transaction.currency)}
                        </div>
                      </div>
                    )}
                    {transaction.net_amount && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Net Amount</Label>
                        <div className="h-11 px-3 py-2 bg-green-50 border border-green-200 rounded-md flex items-center text-sm font-semibold text-green-700">
                          {formatAmount(transaction.net_amount, transaction.currency)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                <div className="flex items-center justify-between">
                  {/* Left side - Download button */}
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Receipt
                  </Button>
                  
                  {/* Right side - Payment Verification Actions */}
                  {transaction.status === 'pending_verification' && (
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="destructive"
                        className="gap-2 font-geist"
                        onClick={() => handleVerifyPayment(transaction.id, 'failed')}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject Payment
                      </Button>
                      <Button 
                        variant="default"
                        className="gap-2 font-geist"
                        onClick={() => handleVerifyPayment(transaction.id, 'completed')}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve Payment
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 