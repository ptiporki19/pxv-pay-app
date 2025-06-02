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

  const renderPaymentRow = (payment: Payment, showActions: boolean = true) => (
    <div key={payment.id} className="flex items-center justify-between px-4 py-3 border-b hover:bg-gray-50 dark:hover:bg-gray-800">
      <div className="w-1/8 text-sm font-medium">{payment.id?.slice(0, 8)}...</div>
      <div className="w-1/8 text-sm">{formatDate(payment.created_at || '')}</div>
      <div className="w-1/6 text-sm">
        <div className="font-medium">{payment.customer_name || 'N/A'}</div>
        <div className="text-xs text-muted-foreground">{payment.customer_email || ''}</div>
      </div>
      <div className="w-1/8 text-sm font-medium">{formatAmount(payment.amount, payment.currency)}</div>
      <div className="w-1/8 text-sm">{payment.payment_method}</div>
      <div className="w-1/8 text-sm">{payment.country || 'N/A'}</div>
      <div className="w-1/6 text-right">
          <div className="flex justify-end gap-2">
          {/* Always show View Proof button if proof exists */}
          {payment.payment_proof_url && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">View Proof</Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Payment Proof Verification</DialogTitle>
                  <DialogDescription>
                    Review payment proof submitted by {payment.customer_name}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-6">
                  {/* Payment Details Card */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-3">Payment Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Customer:</span>
                        <div>{payment.customer_name}</div>
                        <div className="text-gray-600">{payment.customer_email}</div>
                      </div>
                      <div>
                        <span className="font-medium">Transaction ID:</span>
                        <div className="font-mono text-xs">{payment.id}</div>
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span>
                        <div className="text-lg font-semibold">{formatAmount(payment.amount, payment.currency)}</div>
                      </div>
                      <div>
                        <span className="font-medium">Payment Method:</span>
                        <div>{payment.payment_method}</div>
                      </div>
                      <div>
                        <span className="font-medium">Country:</span>
                        <div>{payment.country || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>
                        <div>{formatDate(payment.created_at || '')}</div>
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <div>
                          <Badge variant="outline" className={
                            payment.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                            payment.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }>
                            {payment.status?.replace('_', ' ') || 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Checkout Link:</span>
                        <div className="font-mono text-xs">{payment.checkout_link_id}</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Proof Image */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Payment Proof Image</h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                            Enlarge Image
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
                              src={payment.payment_proof_url}
                              alt="Full size payment proof"
                              className="w-full h-auto rounded border shadow-lg"
                              style={{ maxWidth: 'none', objectFit: 'contain' }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="border rounded-lg p-4 bg-white">
                      <img
                        src={payment.payment_proof_url}
                        alt="Payment proof submitted by customer"
                        className="w-full h-auto max-h-96 object-contain rounded border cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          // Find and click the enlarge button
                          const enlargeButton = document.querySelector('[aria-label="Enlarge Image"]') as HTMLButtonElement;
                          if (enlargeButton) enlargeButton.click();
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const errorDiv = target.nextElementSibling as HTMLElement;
                          if (errorDiv) errorDiv.style.display = 'block';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully');
                        }}
                      />
                      <div 
                        className="hidden text-center p-8 text-gray-100 bg-gray-50 rounded border space-y-4"
                        style={{ display: 'none' }}
                      >
                        <div className="text-gray-600">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-lg font-medium">Unable to display payment proof image</p>
                          <p className="text-sm text-gray-500">The image may be processing or there may be a connectivity issue.</p>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500 break-all">Image URL: {payment.payment_proof_url}</p>
                          <div className="flex justify-center gap-3">
                            <a 
                              href={payment.payment_proof_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Open in new tab
                            </a>
                            <button 
                              onClick={() => {
                                // Try to download the image
                                const link = document.createElement('a');
                                link.href = payment.payment_proof_url!;
                                link.download = `payment-proof-${payment.id}.png`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                            >
                              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download image
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 bg-gray-100 rounded p-3">
                          <p><strong>Troubleshooting:</strong></p>
                          <ul className="list-disc list-inside space-y-1 mt-1">
                            <li>Check if Supabase storage is running</li>
                            <li>Verify bucket policies allow public access</li>
                            <li>Try refreshing the page</li>
                            <li>Use "Open in new tab" to view the image directly</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {payment.status === 'pending_verification' && (
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button 
                        variant="outline"
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
                  onClick={() => handleVerifyPayment(payment.id!, 'completed')}
                >
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleVerifyPayment(payment.id!, 'failed')}
                >
                  Reject
                </Button>
              </>
            )}

          {/* Show status badge for non-pending payments when not showing actions */}
          {!showActions && (
          <Badge variant="outline" className={
            payment.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
            payment.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
            'bg-yellow-50 text-yellow-700 border-yellow-200'
          }>
              {payment.status?.replace('_', ' ') || 'Pending'}
          </Badge>
        )}
        </div>
      </div>
    </div>
  )

  const renderPaymentTable = (payments: Payment[], showActions: boolean = true) => (
    <div className="border rounded-lg">
      <div className="flex items-center justify-between border-b px-4 py-3 font-medium">
        <div className="w-1/8">Transaction ID</div>
        <div className="w-1/8">Date</div>
        <div className="w-1/6">Customer</div>
        <div className="w-1/8">Amount</div>
        <div className="w-1/8">Method</div>
        <div className="w-1/8">Country</div>
        <div className="w-1/6 text-right">
          {showActions ? 'Actions' : 'View / Status'}
        </div>
      </div>
      {loading ? (
        <div className="px-4 py-8 text-center text-muted-foreground">
          Loading payments...
        </div>
      ) : filteredPayments(payments).length > 0 ? (
        filteredPayments(payments).map(payment => renderPaymentRow(payment, showActions))
      ) : (
        <div className="px-4 py-8 text-center text-muted-foreground">
          {searchQuery ? 'No payments found matching your search.' : 'No payments found.'}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Verification</h1>
          <p className="text-muted-foreground">Manage and verify payment submissions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export</Button>
          <Button onClick={loadPaymentData}>Refresh</Button>
        </div>
      </div>

      <Tabs defaultValue="pending" className="mt-6">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingPayments.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedPayments.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedPayments.length})</TabsTrigger>
          <TabsTrigger value="all">All Transactions ({allPayments.length})</TabsTrigger>
        </TabsList>
        
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