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
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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
        {/* Table Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200 font-geist font-semibold text-sm">
          <div className="w-[200px]">Payment Method Name</div>
          <div className="w-[200px]">Supported Countries</div>
          <div className="w-[100px] text-center">Status</div>
          <div className="w-[100px] text-right">Actions</div>
        </div>
        
        {/* Table Body */}
        {isLoading ? (
          <div className="px-4 py-12 text-center text-muted-foreground">
            <div className="text-base font-medium font-geist">Loading payment methods...</div>
          </div>
        ) : paymentMethods.length > 0 ? (
          paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between px-4 py-3 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
              <div className="w-[200px] flex items-center space-x-3">
                {method.icon && (
                  <img src={method.icon} alt={method.name} className="w-6 h-6 object-contain" />
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-geist">{method.name}</span>
              </div>
              <div className="w-[200px]">
                <span className="text-sm text-gray-900 dark:text-gray-100 font-geist">{formatCountries(method.countries)}</span>
              </div>
              <div className="w-[100px] text-center">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "font-geist",
                    method.status === 'active' && 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400',
                    method.status === 'pending' && 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400',
                    method.status === 'inactive' && 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400'
                  )}
                >
                  {method.status === 'active' ? 'Active' : 
                   method.status === 'pending' ? 'Pending' : 'Inactive'}
                </Badge>
              </div>
              <div className="w-[100px] text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/payment-methods/edit/${method.id}`} className="font-geist">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => method.id && handleDelete(method.id)}
                      className="text-red-600 font-geist"
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
          <div className="px-4 py-12 text-center text-muted-foreground">
            <div className="text-base font-medium font-geist">No payment methods found. Add one to get started.</div>
          </div>
        )}
      </div>
    </>
  )
} 