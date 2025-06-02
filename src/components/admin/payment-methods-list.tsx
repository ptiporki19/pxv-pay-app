"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PaymentMethod, paymentMethodsApi } from "@/lib/supabase/client-api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export function PaymentMethodsList() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Fetch payment methods from the API
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setIsLoading(true)
      try {
        const data = await paymentMethodsApi.getAll()
        // Filter by search query and status if provided
        let filteredData = data
        
        if (searchQuery.trim()) {
          filteredData = filteredData.filter(method => 
            method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            method.type.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }

        if (statusFilter !== "all") {
          filteredData = filteredData.filter(method => method.status === statusFilter)
        }

        setPaymentMethods(filteredData)
      } catch (error) {
        console.error("Error fetching payment methods:", error)
        toast({ 
          title: "Error", 
          description: "Failed to fetch payment methods", 
          variant: "destructive" 
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [searchQuery, statusFilter])

  // Handle delete payment method
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) return
    
    setIsLoading(true)
    try {
      await paymentMethodsApi.delete(id)
      toast({ title: "Success", description: "Payment method deleted successfully" })
      // Refresh the list
      const data = await paymentMethodsApi.getAll()
      setPaymentMethods(data)
    } catch (error) {
      console.error("Error deleting payment method:", error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to delete payment method", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Status badge style helper
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    }
  }

  // Format type display
  const formatType = (type: string) => {
    switch (type) {
      case 'manual':
        return 'Manual Payment'
      case 'payment-link':
        return '🔗 Payment Link'
      // Fallback for existing database entries - treat all as manual
      case 'bank':
      case 'bank_transfer':
      case 'mobile':
      case 'crypto':
      case 'cryptocurrency':
      case 'digital_wallet':
        return 'Manual Payment'
      default:
        return 'Manual Payment'
    }
  }

  // Format countries display
  const formatCountries = (countries: string[]) => {
    if (!countries || countries.length === 0) return 'None'
    if (countries.includes('Global')) return 'Global'
    if (countries.length === 1) return countries[0]
    if (countries.length <= 3) return countries.join(', ')
    return `${countries.slice(0, 2).join(', ')} +${countries.length - 2}`
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
          <p className="text-muted-foreground">Manage payment methods for your checkout.</p>
        </div>
        <Link href="/payment-methods/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </Link>
      </div>

      <div className="flex items-center py-4 gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payment methods..."
            className="w-full bg-white pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <div className="flex items-center justify-between border-b px-4 py-3 font-medium">
          <div className="w-1/3">Payment Method Name</div>
          <div className="w-1/3">Supported Countries</div>
          <div className="w-1/6 text-center">Status</div>
          <div className="w-1/6 text-right">Actions</div>
        </div>
        
        {isLoading ? (
          <div className="px-4 py-3 text-center text-muted-foreground">
            Loading payment methods...
          </div>
        ) : paymentMethods.length > 0 ? (
          paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between px-4 py-3 border-b hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-1/3 flex items-center space-x-3">
                {method.icon && (
                  <img src={method.icon} alt={method.name} className="w-6 h-6 object-contain" />
                )}
                <span>{method.name}</span>
              </div>
              <div className="w-1/3">{formatCountries(method.countries)}</div>
              <div className="w-1/6 text-center">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(method.status)}`}>
                  {method.status === 'active' ? 'Active' : 
                   method.status === 'pending' ? 'Pending' : 'Inactive'}
                </span>
              </div>
              <div className="w-1/6 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/payment-methods/edit/${method.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => method.id && handleDelete(method.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-3 text-center text-muted-foreground">
            No payment methods found. Add one to get started.
          </div>
        )}
      </div>
    </>
  )
} 