'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
        paymentsApi.getByStatus('pending'),
        paymentsApi.getByStatus('completed'),
        paymentsApi.getByStatus('failed'),
        paymentsApi.getAll()
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
      await paymentsApi.updateStatus(paymentId, newStatus)
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
      payment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.payment_method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const renderPaymentRow = (payment: Payment, showActions: boolean = true) => (
    <div key={payment.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
      <div className="w-1/6 text-sm font-medium">{payment.id?.slice(0, 8)}...</div>
      <div className="w-1/6 text-sm">{formatDate(payment.created_at || '')}</div>
      <div className="w-1/6 text-sm">{payment.description || 'N/A'}</div>
      <div className="w-1/6 text-sm font-medium">{formatAmount(payment.amount, payment.currency)}</div>
      <div className="w-1/6 text-sm">{payment.payment_method}</div>
      <div className="w-1/6 text-right">
        {showActions ? (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline">View</Button>
            {payment.status === 'pending' && (
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
          </div>
        ) : (
          <Badge variant="outline" className={
            payment.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
            payment.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
            'bg-yellow-50 text-yellow-700 border-yellow-200'
          }>
            {payment.status}
          </Badge>
        )}
      </div>
    </div>
  )

  const renderPaymentTable = (payments: Payment[], showActions: boolean = true) => (
    <div className="border rounded-lg">
      <div className="flex items-center justify-between border-b px-4 py-3 font-medium">
        <div className="w-1/6">Transaction ID</div>
        <div className="w-1/6">Date</div>
        <div className="w-1/6">Description</div>
        <div className="w-1/6">Amount</div>
        <div className="w-1/6">Method</div>
        <div className="w-1/6 text-right">{showActions ? 'Actions' : 'Status'}</div>
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