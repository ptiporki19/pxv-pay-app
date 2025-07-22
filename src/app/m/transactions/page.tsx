"use client"

import { useState, useEffect } from "react"
import { DocumentChartBarIcon, CheckCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/solid"
import { MobileStats } from "@/components/mobile/ui/MobileStats"
import { MobileSearch } from "@/components/mobile/ui/MobileSearch"
import { PaymentVerificationCard } from "@/components/mobile/features/PaymentVerificationCard"
import { Button } from "@/components/ui/button"
import { paymentsApi, type Payment } from "@/lib/supabase/client-api"
import { mobileToastMessages } from "@/lib/mobile-toast"

export default function MobileTransactionsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [displayedPayments, setDisplayedPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const ITEMS_PER_PAGE = 20

  const filterOptions = [
    { id: "all", label: "All Status" },
    { id: "completed", label: "Completed" },
    { id: "failed", label: "Failed" },
    { id: "pending", label: "Pending" },
    { id: "pending_verification", label: "Pending Verification" },
  ]

  useEffect(() => {
    loadPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, searchQuery, statusFilter])

  useEffect(() => {
    updateDisplayedPayments()
  }, [filteredPayments, currentPage])

  const loadPayments = async () => {
    try {
      setIsLoading(true)
      const data = await paymentsApi.getMerchantPayments()
      setPayments(data)
    } catch (error) {
      console.error("Failed to load payments:", error)
      mobileToastMessages.verification.loadError()
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
    setCurrentPage(1) // Reset to first page when filters change
  }

  const updateDisplayedPayments = () => {
    const startIndex = 0
    const endIndex = currentPage * ITEMS_PER_PAGE
    const displayed = filteredPayments.slice(startIndex, endIndex)
    
    setDisplayedPayments(displayed)
    setHasMore(endIndex < filteredPayments.length)
  }

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1)
  }

  const handleVerifyPayment = async (paymentId: string, newStatus: 'completed' | 'failed') => {
    try {
      await paymentsApi.updateMerchantPaymentStatus(paymentId, newStatus)
      if (newStatus === 'completed') {
        mobileToastMessages.verification.approved()
      } else {
        mobileToastMessages.verification.rejected()
      }
      await loadPayments()
    } catch (error) {
      console.error("Failed to update payment status:", error)
      if (newStatus === 'completed') {
        mobileToastMessages.verification.approveError()
      } else {
        mobileToastMessages.verification.rejectError()
      }
    }
  }

  const totalPayments = payments.length
  const approvedPayments = payments.filter(p => p.status === 'completed').length

  return (
    <div className="px-4 py-3 pb-20 pt-16">
      {/* Header */}
      <div className="mb-4 flex items-center">
        <Button variant="ghost" size="sm" className="mr-2 p-0 h-auto" onClick={() => window.history.back()}>
          <ArrowLeftIcon className="h-5 w-5 text-foreground" />
        </Button>
        <div className="flex-1 text-right">
          <h1 className="text-lg font-normal text-foreground font-roboto">
            My Transactions
          </h1>
          <p className="text-sm text-muted-foreground font-roboto">
            View and manage all your transactions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <MobileStats
        stats={[
          {
            title: "Total Transactions",
            value: totalPayments.toString(),
            icon: DocumentChartBarIcon,
            color: "blue"
          },
          {
            title: "Approved Transactions", 
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
        placeholder="Search transactions..."
        filterOptions={filterOptions}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      {/* Transaction List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
          </div>
        ) : displayedPayments.length === 0 ? (
          <div className="text-center py-8">
            <DocumentChartBarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-muted-foreground">No transactions found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filter" 
                : "No transactions yet"
              }
            </p>
          </div>
        ) : (
          <>
            {displayedPayments.map((payment) => (
              <PaymentVerificationCard
                key={payment.id}
                payment={payment}
                onVerifyPayment={handleVerifyPayment}
              />
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  className="text-sm font-normal"
                >
                  View More Transactions
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}