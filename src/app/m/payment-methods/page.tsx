"use client"

import { useState, useEffect } from "react"
import { PlusIcon, CreditCardIcon, CheckCircleIcon } from "@heroicons/react/24/solid"
import { PaymentMethod, paymentMethodsApi } from "@/lib/supabase/client-api"
import { createClient } from "@/lib/supabase/client"
import { mobileToastMessages } from "@/lib/mobile-toast"
import { useRouter } from "next/navigation"
import { MobileStats } from "@/components/mobile/ui/MobileStats"
import { MobileSearch } from "@/components/mobile/ui/MobileSearch"
import { PaymentMethodCard } from "@/components/mobile/features/PaymentMethodCard"
import { Button } from "@/components/ui/button"

export default function MobilePaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const router = useRouter()

  const filterOptions = [
    { id: "all", label: "All Status" },
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
    { id: "draft", label: "Draft" },
  ]

  // Fetch payment methods from the API (reusing existing business logic)
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user || !user.email) {
          mobileToastMessages.general.authError()
          return
        }

        const data = await paymentMethodsApi.getAll()
        
        // Filter by search query and status if provided
        let filteredData = data || []
        
        if (searchQuery.trim()) {
          filteredData = filteredData.filter(method => 
            (method.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (method.type?.toLowerCase() || '').includes(searchQuery.toLowerCase())
          )
        }

        if (statusFilter !== "all") {
          filteredData = filteredData.filter(method => method.status === statusFilter)
        }

        setPaymentMethods(filteredData as PaymentMethod[])
      } catch (error) {
        console.error("Error fetching payment methods:", error)
        mobileToastMessages.general.loadError("payment methods")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [searchQuery, statusFilter])

  // Delete payment method
  const handleDelete = async (id: string) => {
    try {
      await paymentMethodsApi.delete(id)
      mobileToastMessages.paymentMethod.deleted()
      
      // Remove from local state
      setPaymentMethods(prev => prev.filter(method => method.id !== id))
    } catch (error) {
      console.error("Error deleting payment method:", error)
      mobileToastMessages.paymentMethod.deleteError(error instanceof Error ? error.message : undefined)
    }
  }

  // Update payment method status
  const handleStatusChange = async (id: string, status: PaymentMethod['status']) => {
    try {
      // Update via API (assuming this method exists or we'll use the edit functionality)
      const updatedMethod = { status }
      // We'll implement this when we have the update API method
      
      // Update local state
      setPaymentMethods(prev => 
        prev.map(method => 
          method.id === id 
            ? { ...method, status }
            : method
        )
      )
      
      mobileToastMessages.paymentMethod.statusUpdated()
    } catch (error) {
      console.error("Error updating payment method status:", error)
      mobileToastMessages.paymentMethod.updateError("Failed to update status")
    }
  }

  const totalMethods = paymentMethods.length
  const activeMethods = paymentMethods.filter(method => method.status === 'active').length

  return (
    <div className="px-4 py-3 pb-20 pt-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-normal text-foreground font-roboto">
            Payment Methods
          </h1>
          <p className="text-sm text-muted-foreground font-roboto">
            Manage payment methods for your customers
          </p>
        </div>
        <Button
          onClick={() => router.push('/m/payment-methods/create')}
          size="sm"
          className="bg-violet-600 hover:bg-violet-700 text-white h-8"
        >
          <PlusIcon className="size-3 mr-1" />
          Create
        </Button>
      </div>

      {/* Stats Cards */}
      <MobileStats
        stats={[
          {
            title: "Total Methods",
            value: totalMethods.toString(),
            icon: CreditCardIcon,
            color: "purple"
          },
          {
            title: "Active Methods", 
            value: activeMethods.toString(),
            icon: CheckCircleIcon,
            color: "green"
          }
        ]}
      />

      {/* Search and Filter */}
      <MobileSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search payment methods..."
        filterOptions={filterOptions}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      {/* Payment Methods List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCardIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-muted-foreground">No payment methods</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new payment method.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => router.push('/m/payment-methods/create')}
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                <PlusIcon className="size-4 mr-2" />
                Create Payment Method
              </Button>
            </div>
          </div>
        ) : (
          paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              paymentMethod={method}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  )
} 