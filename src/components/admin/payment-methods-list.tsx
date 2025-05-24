"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentMethod, paymentMethodsApi } from "@/lib/supabase/client-api"
import { useAdminStore } from "@/lib/store/admin-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNotificationActions } from "@/providers/notification-provider"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function PaymentMethodsList() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { searchQuery, setSearchQuery, refreshFlag } = useAdminStore()
  const { showSuccess, showError } = useNotificationActions()
  const router = useRouter()

  // Fetch payment methods from the API
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setIsLoading(true)
      try {
        let data
        if (searchQuery.trim()) {
          data = await paymentMethodsApi.search(searchQuery)
        } else {
          data = await paymentMethodsApi.getAll()
        }
        setPaymentMethods(data)
      } catch (error) {
        console.error("Error fetching payment methods:", error)
        showError("Failed to fetch payment methods")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [searchQuery, refreshFlag])

  // Filter payment methods based on active tab
  const filteredMethods = paymentMethods.filter(method => {
    if (activeTab === "all") return true
    return method.type === activeTab
  })

  // Handle delete payment method
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) {
      return
    }

    try {
      await paymentMethodsApi.delete(id)
      showSuccess("Payment method deleted successfully")
      
      // Update local state
      setPaymentMethods(prev => prev.filter(method => method.id !== id))
    } catch (error) {
      console.error("Error deleting payment method:", error)
      showError("Failed to delete payment method")
    }
  }

  // Get method icon
  const getMethodIcon = (method: PaymentMethod) => {
    if (method.icon) {
      return (
        <img
          src={method.icon}
          alt={method.name}
          className="w-6 h-6 object-contain"
        />
      )
    }

    // Default icons based on type
    const iconMap = {
      manual: "Manual",
      "payment-link": "Link",
      bank: "Bank",
      mobile: "Mobile",
      crypto: "Crypto"
    }

    return (
      <span className="text-sm px-2 py-1 bg-gray-100 rounded text-gray-700">
        {iconMap[method.type] || "Payment"}
      </span>
    )
  }

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  // Get type display name
  const getTypeDisplayName = (type: string) => {
    const typeMap = {
      manual: 'Manual Payment',
      'payment-link': 'Payment Link',
      bank: 'Bank Transfer',
      mobile: 'Mobile Money',
      crypto: 'Cryptocurrency'
    }
    return typeMap[type as keyof typeof typeMap] || type
  }

  // Get type description
  const getTypeDescription = (method: PaymentMethod) => {
    if (method.description) return method.description
    
    const descriptionMap = {
      manual: 'Custom payment method with user-defined fields',
      'payment-link': 'External payment link redirection',
      bank: 'Traditional bank transfer method',
      mobile: 'Mobile money payment method',
      crypto: 'Cryptocurrency payment method'
    }
    return descriptionMap[method.type as keyof typeof descriptionMap] || 'Payment method'
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

      <div className="flex items-center py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payment methods..."
            className="w-full bg-white pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="mt-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Methods</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
          <TabsTrigger value="payment-link">Payment Links</TabsTrigger>
          <TabsTrigger value="bank">Bank Transfers</TabsTrigger>
          <TabsTrigger value="mobile">Mobile Money</TabsTrigger>
          <TabsTrigger value="crypto">Cryptocurrencies</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Configure the available payment methods for your checkout.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading payment methods...</p>
                  </div>
                </div>
              ) : filteredMethods.length > 0 ? (
                <div className="grid gap-4">
                  {filteredMethods.map((method) => (
                    <Card key={method.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="flex-shrink-0">
                              {getMethodIcon(method)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{method.name}</h3>
                                <Badge variant="secondary">
                                  {getTypeDisplayName(method.type)}
                                </Badge>
                                <Badge className={getStatusBadgeClass(method.status)}>
                                  {method.status}
                                </Badge>
                              </div>
                              
                              <p className="text-muted-foreground text-sm mb-2">
                                {getTypeDescription(method)}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>
                                  {method.countries.length === 1 && method.countries[0] === 'Global' 
                                    ? 'Available globally' 
                                    : `${method.countries.length} countries`}
                                </span>
                                
                                {method.type === 'manual' && method.custom_fields && (
                                  <span>
                                    {method.custom_fields.length} custom fields
                                  </span>
                                )}
                                
                                {method.type === 'payment-link' && method.url && (
                                  <span className="flex items-center gap-1">
                                    <ExternalLink className="h-3 w-3" />
                                    External link
                                  </span>
                                )}
                              </div>
                              
                              {method.instructions && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {method.instructions}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/payment-methods/edit/${method.id}`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              {method.type === 'payment-link' && method.url && (
                                <DropdownMenuItem onClick={() => window.open(method.url!, '_blank')}>
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  <span>Open Link</span>
                                </DropdownMenuItem>
                              )}
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                    <PlusCircle className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No payment methods found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "all" 
                      ? "Get started by creating your first payment method."
                      : `No ${getTypeDisplayName(activeTab).toLowerCase()} methods found.`}
                  </p>
                  <Link href="/payment-methods/create">
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Payment Method
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
} 