"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal } from "lucide-react"
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
import { toast } from "@/components/ui/use-toast"

export function PaymentMethodsList() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { openModal, searchQuery, setSearchQuery, refreshFlag } = useAdminStore()

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
  }, [searchQuery, refreshFlag])

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

  // Filter methods by type
  const filteredMethods = (type?: string) => {
    if (type && type !== 'all') {
      return paymentMethods.filter(method => method.type === type)
    }
    return paymentMethods
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

  // Method icon
  const getMethodIcon = (method: PaymentMethod) => {
    if (method.icon) {
      return (
        <img 
          src={method.icon} 
          alt={method.name}
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.src = `/icons/${method.type}.svg`
          }}
        />
      )
    }
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
        {method.type.substring(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
          <p className="text-muted-foreground">Manage payment methods for your checkout.</p>
        </div>
        <Button onClick={() => openModal('payment-method', 'create')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
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
          <TabsTrigger value="bank">Bank Transfers</TabsTrigger>
          <TabsTrigger value="mobile">Mobile Money</TabsTrigger>
          <TabsTrigger value="crypto">Cryptocurrencies</TabsTrigger>
          <TabsTrigger value="payment-link">Payment Links</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Configure the available payment methods for your checkout.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <div className="flex items-center justify-between border-b px-4 py-3 font-medium">
                  <div className="w-1/4">Method Name</div>
                  <div className="w-1/5">Type</div>
                  <div className="w-1/5">Countries</div>
                  <div className="w-1/6 text-center">Status</div>
                  <div className="w-1/12 text-right">Actions</div>
                </div>
                
                {isLoading ? (
                  <div className="px-4 py-3 text-center text-muted-foreground">
                    Loading payment methods...
                  </div>
                ) : paymentMethods.length > 0 ? (
                  paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-1/4 flex items-center gap-2">
                        {getMethodIcon(method)}
                        <span>{method.name}</span>
                      </div>
                      <div className="w-1/5">
                        {method.type === 'bank' ? 'Bank Transfer' : 
                         method.type === 'mobile' ? 'Mobile Money' : 
                         method.type === 'crypto' ? 'Cryptocurrency' : 'Payment Link'}
                      </div>
                      <div className="w-1/5 truncate">{method.countries.join(', ')}</div>
                      <div className="w-1/6 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(method.status)}`}>
                          {method.status === 'active' ? 'Active' : 
                          method.status === 'pending' ? 'Pending' : 'Inactive'}
                        </span>
                      </div>
                      <div className="w-1/12 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openModal('payment-method', 'edit', method)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
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
            </CardContent>
          </Card>
        </TabsContent>
        
        {['bank', 'mobile', 'crypto', 'payment-link'].map((type) => (
          <TabsContent key={type} value={type} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {type === 'bank' ? 'Bank Transfer Methods' : 
                  type === 'mobile' ? 'Mobile Money Methods' : 
                  type === 'crypto' ? 'Cryptocurrency Methods' : 'Payment Link Methods'}
                </CardTitle>
                <CardDescription>
                  {type === 'bank' ? 'Bank and wire transfer payment options' : 
                  type === 'mobile' ? 'Mobile payment options' : 
                  type === 'crypto' ? 'Cryptocurrency payment options' : 'External payment link options'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredMethods(type).length > 0 ? (
                  <div className="border rounded-lg">
                    <div className="flex items-center justify-between border-b px-4 py-3 font-medium">
                      <div className="w-1/4">Method Name</div>
                      <div className="w-1/4">Countries</div>
                      <div className="w-1/4">Status</div>
                      <div className="w-1/4 text-right">Actions</div>
                    </div>
                    {filteredMethods(type).map((method) => (
                      <div key={method.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="w-1/4 flex items-center gap-2">
                          {getMethodIcon(method)}
                          <span>{method.name}</span>
                        </div>
                        <div className="w-1/4 truncate">{method.countries.join(', ')}</div>
                        <div className="w-1/4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(method.status)}`}>
                            {method.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="w-1/4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => openModal('payment-method', 'edit', method)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600" 
                            onClick={() => method.id && handleDelete(method.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 flex items-center justify-center h-48 border rounded-lg">
                    <p className="text-muted-foreground">
                      No {type === 'bank' ? 'bank transfer' : 
                      type === 'mobile' ? 'mobile money' : 
                      type === 'crypto' ? 'cryptocurrency' : 'payment link'} methods found.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </>
  )
} 