"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  XMarkIcon,
  DocumentIcon,
  PhotoIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/solid"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { paymentsApi, type Payment } from "@/lib/supabase/client-api"
import { toast } from "@/components/ui/use-toast"

export default function MobileTransactionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadPaymentDetails(params.id as string)
    }
  }, [params.id])

  const loadPaymentDetails = async (paymentId: string) => {
    try {
      setIsLoading(true)
      // Get all merchant payments and find the specific one
      const allPayments = await paymentsApi.getMerchantPayments()
      const foundPayment = allPayments.find(p => p.id === paymentId)
      
      if (foundPayment) {
        setPayment(foundPayment)
      } else {
        toast({
          title: "Payment not found",
          description: "The requested payment could not be found",
          variant: "destructive"
        })
        router.push('/m/verification')
      }
    } catch (error) {
      console.error("Failed to load payment details:", error)
      toast({
        title: "Error",
        description: "Failed to load payment details",
        variant: "destructive"
      })
      router.push('/m/verification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyPayment = async (newStatus: 'completed' | 'failed') => {
    if (!payment?.id) return
    
    try {
      setIsProcessing(true)
      await paymentsApi.updateMerchantPaymentStatus(payment.id, newStatus)
      toast({
        title: "Payment updated",
        description: `Payment ${newStatus === 'completed' ? 'approved' : 'rejected'} successfully`,
      })
      // Refresh payment data
      await loadPaymentDetails(payment.id)
    } catch (error) {
      console.error("Failed to update payment status:", error)
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'failed':
        return 'destructive'
      case 'pending_verification':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Approved'
      case 'failed':
        return 'Rejected'
      case 'pending_verification':
        return 'Pending Verification'
      default:
        return status
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isImageFile = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension || '')
  }

  const isPdfFile = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase()
    return extension === 'pdf'
  }

  const handleDownloadProof = async () => {
    if (!payment?.payment_proof_url) return
    
    try {
      const response = await fetch(payment.payment_proof_url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `payment-proof-${payment.id}.${payment.payment_proof_url.split('.').pop()}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
      toast({
        title: "Download started",
        description: "Payment proof file is being downloaded",
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download payment proof",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 py-3 pb-20 pt-16">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="px-4 py-3 pb-20 pt-16">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">Payment not found</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-3 pb-20 pt-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeftIcon className="size-4 text-muted-foreground" />
        </button>
        <div className="text-right">
          <h1 className="text-lg font-semibold text-foreground font-roboto">
            Payment Details
          </h1>
          <p className="text-xs text-muted-foreground font-roboto">
            Transaction verification
          </p>
        </div>
      </div>

      {/* Payment Information */}
      <div className="space-y-4">
        {/* Amount and Status */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-card-foreground font-roboto">
              {formatAmount(payment.amount, payment.currency)}
            </h2>
            <Badge variant={getStatusVariant(payment.status)} className={getStatusColor(payment.status)}>
              {getStatusLabel(payment.status)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground font-roboto">
            Payment Method: {payment.payment_method}
          </p>
        </div>

        {/* Customer Information */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 font-roboto">Customer Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground font-roboto">Name:</span>
              <span className="text-card-foreground font-roboto">{payment.customer_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-roboto">Email:</span>
              <span className="text-card-foreground font-roboto">{payment.customer_email || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-roboto">Country:</span>
              <span className="text-card-foreground font-roboto">{payment.country || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 font-roboto">Transaction Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground font-roboto">Transaction ID:</span>
              <span className="text-card-foreground font-mono text-xs">{payment.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-roboto">Checkout Link:</span>
              <span className="text-card-foreground font-mono text-xs">{payment.checkout_link_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-roboto">Created:</span>
              <span className="text-card-foreground font-roboto">{payment.created_at ? formatDate(payment.created_at) : 'N/A'}</span>
            </div>
            {payment.description && (
              <div className="flex justify-between">
                <span className="text-muted-foreground font-roboto">Description:</span>
                <span className="text-card-foreground font-roboto">{payment.description}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Proof */}
        {payment.payment_proof_url && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-card-foreground mb-3 font-roboto">Payment Proof</h3>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isImageFile(payment.payment_proof_url) ? (
                  <PhotoIcon className="size-4 text-violet-600" />
                ) : (
                  <DocumentIcon className="size-4 text-violet-600" />
                )}
                <span className="text-sm text-card-foreground font-roboto">
                  {isImageFile(payment.payment_proof_url) ? 'Image File' : isPdfFile(payment.payment_proof_url) ? 'PDF Document' : 'File'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadProof}
                className="text-xs"
              >
                <ArrowDownTrayIcon className="size-3 mr-1" />
                Download
              </Button>
            </div>

            {isImageFile(payment.payment_proof_url) && (
              <div className="mt-3">
                <img
                  src={payment.payment_proof_url}
                  alt="Payment proof"
                  className="w-full max-h-64 object-cover rounded-lg border border-border"
                />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {payment.status === 'pending_verification' && (
          <div className="flex gap-3 pt-4">
            <Button
              variant="destructive"
              onClick={() => handleVerifyPayment('failed')}
              disabled={isProcessing}
              className="flex-1 h-10 font-roboto"
            >
              <XMarkIcon className="size-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Reject Payment'}
            </Button>
            <Button
              variant="default"
              onClick={() => handleVerifyPayment('completed')}
              disabled={isProcessing}
              className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 font-roboto"
            >
              <CheckIcon className="size-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Approve Payment'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 