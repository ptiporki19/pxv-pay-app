"use client"

import { useState, useEffect } from "react"
import { ShieldCheckIcon, ClockIcon, CheckCircleIcon } from "@heroicons/react/24/solid"
import { MobileStats } from "@/components/mobile/ui/MobileStats"
import { MobileSearch } from "@/components/mobile/ui/MobileSearch"
import { PaymentVerificationCard } from "@/components/mobile/features/PaymentVerificationCard"
import { paymentsApi, type Payment } from "@/lib/supabase/client-api"
import { toast } from "@/components/ui/use-toast"

export default function MobileVerificationPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending_verification")

  const filterOptions = [
    { id: "pending_verification", label: "Pending" },
    { id: "completed", label: "Approved" },
    { id: "failed", label: "Rejected" },
    { id: "all", label: "All Status" },
  ]

  useEffect(() => {
    loadPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, searchQuery, statusFilter])

  const loadPayments = async () => {
    try {
      setIsLoading(true)
      const data = await paymentsApi.getMerchantPayments()
      setPayments(data)
    } catch (error) {
      console.error("Failed to load payments:", error)
      toast({
        title: "Error",
        description: "Failed to load payment verifications",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterPayments = () => {
    let filtered = payments

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((payment) =>
        payment.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.payment_method.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.id?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter)
    }

    setFilteredPayments(filtered)
  }

  const handleVerifyPayment = async (paymentId: string, newStatus: 'completed' | 'failed') => {
    try {
      await paymentsApi.updateMerchantPaymentStatus(paymentId, newStatus)
      toast({
        title: "Payment updated",
        description: `Payment ${newStatus === 'completed' ? 'approved' : 'rejected'} successfully`,
      })
      await loadPayments()
    } catch (error) {
      console.error("Failed to update payment status:", error)
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive"
      })
    }
  }

  const totalPayments = payments.length
  const pendingPayments = payments.filter(p => p.status === 'pending_verification').length
  const approvedPayments = payments.filter(p => p.status === 'completed').length

  return (
    <div className="px-4 py-3 pb-20 pt-16">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-foreground font-roboto">
          Payment Verification
        </h1>
        <p className="text-sm text-muted-foreground font-roboto">
          Review and verify customer payments
        </p>
      </div>

      {/* Stats Cards */}
      <MobileStats
        stats={[
          {
            title: "Pending",
            value: pendingPayments.toString(),
            icon: ClockIcon,
            color: "yellow"
          },
          {
            title: "Approved", 
            value: approvedPayments.toString(),
            icon: CheckCircleIcon,
            color: "green"
          }
        ]}
      />

      {/* Search and Filter */}
      <MobileSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search payments..."
        filterOptions={filterOptions}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      {/* Payment Verification List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-8">
            <ShieldCheckIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-muted-foreground">No payments found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filter" 
                : "No payment verifications yet"
              }
            </p>
          </div>
        ) : (
          filteredPayments.map((payment) => (
            <PaymentVerificationCard
              key={payment.id}
              payment={payment}
              onVerifyPayment={handleVerifyPayment}
            />
          ))
        )}
      </div>
    </div>
  )
} 