'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { paymentsApi, type Payment } from "@/lib/supabase/client-api"
import { toast } from "sonner"
import { 
  Download, 
  FileText, 
  Eye, 
  ExternalLink, 
  ImageIcon,
  AlertCircle 
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function VerificationPage() {
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([])
  const [approvedPayments, setApprovedPayments] = useState<Payment[]>([])
  const [rejectedPayments, setRejectedPayments] = useState<Payment[]>([])
  const [allPayments, setAllPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadPaymentData()
  }, [])

  const loadPaymentData = async () => {
    setLoading(true)
    try {
      const [pending, completed, failed, all] = await Promise.all([
        paymentsApi.getMerchantPaymentsByStatus('pending_verification'),
        paymentsApi.getMerchantPaymentsByStatus('completed'),
        paymentsApi.getMerchantPaymentsByStatus('failed'),
        paymentsApi.getMerchantPayments()
      ])
      
      setPendingPayments(pending)
      setApprovedPayments(completed)
      setRejectedPayments(failed)
      setAllPayments(all)
    } catch (error) {
      console.error('Error loading payment data:', error)
      toast.error('Failed to load payment data')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPayment = async (paymentId: string, newStatus: 'completed' | 'failed') => {
    try {
      await paymentsApi.updateMerchantPaymentStatus(paymentId, newStatus)
      toast.success(`Payment ${newStatus === 'completed' ? 'approved' : 'rejected'} successfully`)
      loadPaymentData() // Refresh data
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast.error('Failed to update payment status')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatAmount = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const filteredPayments = (payments: Payment[]) => {
    if (!searchQuery) return payments
    return payments.filter(payment => 
      payment.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.payment_method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const getFileExtension = (url: string): string => {
    if (!url) return ''
    const parts = url.split('.')
    return parts[parts.length - 1]?.toLowerCase() || ''
  }

  const isImageFile = (url: string): boolean => {
    const extension = getFileExtension(url)
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)
  }

  const isPdfFile = (url: string): boolean => {
    const extension = getFileExtension(url)
    return extension === 'pdf'
  }

  const handleDownloadProof = async (url: string, paymentId: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `payment-proof-${paymentId}.${getFileExtension(url)}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
      toast.success('Proof file downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download proof file')
    }
  }

  const renderProofViewer = (payment: Payment) => {
    if (!payment.payment_proof_url) {
      return (
        <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium">No proof of payment uploaded</p>
          <p className="text-sm">The customer has not provided payment proof yet.</p>
        </div>
      )
    }

    const proofUrl = payment.payment_proof_url
    const isImage = isImageFile(proofUrl)
    const isPdf = isPdfFile(proofUrl)

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Payment Proof</h3>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleDownloadProof(proofUrl, payment.id!)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => window.open(proofUrl, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
          </div>
        </div>

        {isImage && (
          <div className="space-y-4">
            {/* Thumbnail view */}
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <img
                src={proofUrl}
                alt="Payment proof"
                className="w-full h-auto max-h-96 object-contain"
                crossOrigin="anonymous"
                loading="lazy"
                onError={(e) => {
                  console.error('Image load error for URL:', proofUrl);
                  const target = e.target as HTMLImageElement
                  
                  // Try to reload the image once with cache-busting
                  if (!target.dataset.retried) {
                    target.dataset.retried = 'true'
                    setTimeout(() => {
                      target.src = proofUrl + '?t=' + Date.now()
                    }, 1000)
                    return
                  }
                  
                  target.style.display = 'none'
                  const errorDiv = target.nextElementSibling as HTMLElement;
                  if (errorDiv) {
                    errorDiv.classList.remove('hidden')
                    errorDiv.classList.add('block')
                  }
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', proofUrl);
                  // Ensure error div is hidden when image loads successfully
                  const target = document.querySelector(`img[src="${proofUrl}"]`) as HTMLImageElement;
                  if (target) {
                    const errorDiv = target.nextElementSibling as HTMLElement;
                    if (errorDiv) {
                      errorDiv.classList.add('hidden')
                      errorDiv.classList.remove('block')
                    }
                  }
                }}
              />
              <div className="hidden text-center p-8 text-gray-500">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium">Image could not be loaded</p>
                <p className="text-sm mb-4">There may be an issue with the image file.</p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 break-all">Image URL: {proofUrl}</p>
                  <div className="flex justify-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(proofUrl, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in new tab
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadProof(proofUrl, payment.id!)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download image
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Full size view option */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Full Size
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Full Size Payment Proof</DialogTitle>
                  <DialogDescription>
                    High resolution view of payment proof from {payment.customer_name}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 overflow-auto max-h-[80vh]">
                  <img
                    src={proofUrl}
                    alt="Full size payment proof"
                    className="w-full h-auto rounded border shadow-lg"
                    style={{ maxWidth: 'none', objectFit: 'contain' }}
                    crossOrigin="anonymous"
                    loading="eager"
                    onError={(e) => {
                      console.error('Full size image load error for URL:', proofUrl);
                      toast.error('Failed to load full size image');
                    }}
                    onLoad={() => {
                      console.log('Full size image loaded successfully:', proofUrl);
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {isPdf && (
          <div className="space-y-4">
            {/* PDF viewer */}
            <div className="border rounded-lg overflow-hidden bg-gray-50" style={{ height: '500px' }}>
              <iframe
                src={`${proofUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full"
                title="Payment Proof PDF"
                onError={() => {
                  toast.error('PDF could not be loaded in preview')
                }}
              />
            </div>
            
            {/* Fallback for PDF viewing */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                If the PDF doesn't display properly above, use the buttons below:
              </p>
              <div className="flex justify-center gap-2">
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => window.open(proofUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Open PDF in New Tab
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isImage && !isPdf && (
          <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Unknown file type</p>
            <p className="text-sm mb-4">This file format cannot be previewed.</p>
            <div className="flex justify-center gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDownloadProof(proofUrl, payment.id!)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download File
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open(proofUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 break-all">
              File: {proofUrl}
            </p>
          </div>
        )}
      </div>
    )
  }

  const renderPaymentRow = (payment: Payment, showActions: boolean = true) => (
    <div key={payment.id} className="flex items-center justify-between px-4 py-3 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
      <div className="w-[120px]">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">{payment.id?.slice(0, 8)}...</span>
      </div>
      <div className="w-[100px]">
        <span className="text-sm text-gray-900 dark:text-gray-100 font-geist">{formatDate(payment.created_at || '')}</span>
      </div>
      <div className="w-[160px]">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 font-geist">{payment.customer_name || 'N/A'}</div>
        <div className="text-xs text-gray-500 font-geist">{payment.customer_email || ''}</div>
      </div>
      <div className="w-[100px]">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-geist">{formatAmount(payment.amount, payment.currency)}</span>
      </div>
      <div className="w-[100px]">
        <span className="text-sm text-gray-900 dark:text-gray-100 font-geist">{payment.payment_method}</span>
      </div>
      <div className="w-[100px]">
        <span className="text-sm text-gray-900 dark:text-gray-100 font-geist">{payment.country || 'N/A'}</span>
      </div>
      <div className="w-[140px] text-right">
          <div className="flex justify-end gap-2">
          {/* Always show View Proof button if proof exists */}
          {payment.payment_proof_url && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="flex items-center gap-1 font-geist">
                  {isImageFile(payment.payment_proof_url) && <ImageIcon className="h-3 w-3" />}
                  {isPdfFile(payment.payment_proof_url) && <FileText className="h-3 w-3" />}
                  {!isImageFile(payment.payment_proof_url) && !isPdfFile(payment.payment_proof_url) && <FileText className="h-3 w-3" />}
                  View Proof
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-geist">Payment Proof Verification</DialogTitle>
                  <DialogDescription className="font-geist">
                    Review payment proof submitted by {payment.customer_name}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-6">
                  {/* Payment Details Card */}
                  <div className="p-4 bg-background rounded-lg">
                    <h3 className="font-semibold mb-3 font-geist">Payment Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium font-geist">Customer:</span>
                        <div className="font-geist">{payment.customer_name}</div>
                        <div className="text-gray-600 font-geist">{payment.customer_email}</div>
                      </div>
                      <div>
                        <span className="font-medium font-geist">Transaction ID:</span>
                        <div className="font-mono text-xs">{payment.id}</div>
                      </div>
                      <div>
                        <span className="font-medium font-geist">Amount:</span>
                        <div className="text-lg font-semibold font-geist">{formatAmount(payment.amount, payment.currency)}</div>
                      </div>
                      <div>
                        <span className="font-medium font-geist">Payment Method:</span>
                        <div className="font-geist">{payment.payment_method}</div>
                      </div>
                      <div>
                        <span className="font-medium font-geist">Country:</span>
                        <div className="font-geist">{payment.country || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="font-medium font-geist">Submitted:</span>
                        <div className="font-geist">{formatDate(payment.created_at || '')}</div>
                      </div>
                      <div>
                        <span className="font-medium font-geist">Status:</span>
                        <div>
                          <Badge variant="outline" className={cn(
                            "font-geist",
                            payment.status === 'completed' && 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400',
                            payment.status === 'failed' && 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400',
                            payment.status === 'pending_verification' && 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400'
                          )}>
                            {payment.status?.replace('_', ' ') || 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium font-geist">Checkout Link:</span>
                        <div className="font-mono text-xs">{payment.checkout_link_id}</div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Payment Proof Viewer */}
                  {renderProofViewer(payment)}

                  {/* Action Buttons */}
                  {payment.status === 'pending_verification' && (
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button 
                        variant="outline"
                        className="font-geist"
                        onClick={() => {
                          // Close modal first, then handle action
                          const modal = document.querySelector('[role="dialog"]') as HTMLElement;
                          if (modal) modal.style.display = 'none';
                        }}
                      >
                        Close
                      </Button>
                      <Button 
                        variant="destructive"
                        className="font-geist"
                        onClick={() => {
                          handleVerifyPayment(payment.id!, 'failed');
                          // Close modal
                          const modal = document.querySelector('[role="dialog"]') as HTMLElement;
                          if (modal) modal.style.display = 'none';
                        }}
                      >
                        Reject Payment
                      </Button>
                      <Button 
                        variant="default"
                        className="font-geist"
                        onClick={() => {
                          handleVerifyPayment(payment.id!, 'completed');
                          // Close modal
                          const modal = document.querySelector('[role="dialog"]') as HTMLElement;
                          if (modal) modal.style.display = 'none';
                        }}
                      >
                        Approve Payment
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {/* Show action buttons only for pending payments and when showActions is true */}
          {showActions && payment.status === 'pending_verification' && (
              <>
                <Button 
                  size="sm" 
                  variant="default"
                  className="font-geist"
                  onClick={() => handleVerifyPayment(payment.id!, 'completed')}
                >
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  className="font-geist"
                  onClick={() => handleVerifyPayment(payment.id!, 'failed')}
                >
                  Reject
                </Button>
              </>
            )}

          {/* Show status badge for non-pending payments when not showing actions */}
          {!showActions && (
          <Badge variant="outline" className={cn(
            "font-geist",
            payment.status === 'completed' && 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400',
            payment.status === 'failed' && 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400',
            payment.status === 'pending_verification' && 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400'
          )}>
              {payment.status?.replace('_', ' ') || 'Pending'}
          </Badge>
        )}
        </div>
      </div>
    </div>
  )

  const renderPaymentTable = (payments: Payment[], showActions: boolean = true) => (
    <div className="border rounded-lg">
      {/* Table Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200 font-geist font-semibold text-sm">
        <div className="w-[120px]">Transaction ID</div>
        <div className="w-[100px]">Date</div>
        <div className="w-[160px]">Customer</div>
        <div className="w-[100px]">Amount</div>
        <div className="w-[100px]">Method</div>
        <div className="w-[100px]">Country</div>
        <div className="w-[140px] text-right">
          {showActions ? 'Actions' : 'View / Status'}
        </div>
      </div>
      {loading ? (
        <div className="px-4 py-12 text-center text-muted-foreground">
          <div className="text-base font-medium font-geist">Loading payments...</div>
        </div>
      ) : filteredPayments(payments).length > 0 ? (
        filteredPayments(payments).map(payment => renderPaymentRow(payment, showActions))
      ) : (
        <div className="px-4 py-12 text-center text-muted-foreground">
          <div className="text-base font-medium font-geist">
          {searchQuery ? 'No payments found matching your search.' : 'No payments found.'}
          </div>
        </div>
      )}
    </div>
  )

  const handleRefresh = () => {
    loadPaymentData()
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-geist text-gray-900 dark:text-white">Payment Verification</h1>
          <p className="text-muted-foreground">Manage and verify payment submissions.</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="mt-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingPayments.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedPayments.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedPayments.length})</TabsTrigger>
            <TabsTrigger value="all">All Transactions ({allPayments.length})</TabsTrigger>
          </TabsList>
          <Button variant="outline" onClick={handleRefresh} className="font-geist">
            Refresh
          </Button>
        </div>
        
        <TabsContent value="pending" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Verifications</CardTitle>
              <CardDescription>Payments that need your verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center py-4">
                <Input
                  placeholder="Search transactions..."
                  className="max-w-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {renderPaymentTable(pendingPayments, true)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Payments</CardTitle>
              <CardDescription>Successfully verified and completed payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center py-4">
                <Input
                  placeholder="Search transactions..."
                  className="max-w-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {renderPaymentTable(approvedPayments, false)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Payments</CardTitle>
              <CardDescription>Payments that were rejected during verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center py-4">
                <Input
                  placeholder="Search transactions..."
                  className="max-w-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {renderPaymentTable(rejectedPayments, false)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>Complete transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center py-4">
                <Input
                  placeholder="Search transactions..."
                  className="max-w-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {renderPaymentTable(allPayments, false)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 