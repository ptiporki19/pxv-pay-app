import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import { Search } from "lucide-react"

interface PaymentMethod {
  id: string
  name: string
  type: 'bank' | 'mobile' | 'crypto'
  countries: string[]
  status: 'active' | 'pending' | 'inactive'
  icon?: string
  created_at: string
}

export default async function PaymentMethodsPage() {
  const supabase = createClient()
  
  // Fetch payment methods from Supabase
  let { data: paymentMethods, error } = await supabase
    .from('payment_methods')
    .select('*')
    .order('name', { ascending: true })
  
  // If payment_methods table doesn't exist or is empty, insert some default data
  if (error || !paymentMethods || paymentMethods.length === 0) {
    const defaultPaymentMethods = [
      { 
        name: "Bank Transfer (USD)", 
        type: "bank", 
        countries: ["US", "CA"],
        status: "active", 
        icon: "BT" 
      },
      { 
        name: "M-Pesa", 
        type: "mobile", 
        countries: ["KE", "TZ"],
        status: "active", 
        icon: "MM" 
      },
      { 
        name: "SEPA Transfer", 
        type: "bank", 
        countries: ["EU"],
        status: "inactive", 
        icon: "BT" 
      },
      { 
        name: "Bitcoin", 
        type: "crypto", 
        countries: ["Global"],
        status: "active", 
        icon: "BTC" 
      },
    ]
    
    // Insert default payment methods
    await supabase
      .from('payment_methods')
      .insert(defaultPaymentMethods)
    
    // Fetch payment methods again after inserting defaults
    const { data: refreshedMethods } = await supabase
      .from('payment_methods')
      .select('*')
      .order('name', { ascending: true })
    
    // Use the refreshed data
    if (refreshedMethods) {
      paymentMethods = refreshedMethods
    }
  }

  // Filter payment methods by type for tabs
  const bankMethods = paymentMethods?.filter(method => method.type === 'bank') || []
  const mobileMethods = paymentMethods?.filter(method => method.type === 'mobile') || []
  const cryptoMethods = paymentMethods?.filter(method => method.type === 'crypto') || []

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manual Payment Methods</h1>
          <p className="text-muted-foreground">Manage payment methods for your checkout.</p>
        </div>
        <Button>Add Payment Method</Button>
      </div>

      <Tabs defaultValue="all" className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All Methods</TabsTrigger>
          <TabsTrigger value="bank">Bank Transfers</TabsTrigger>
          <TabsTrigger value="mobile">Mobile Money</TabsTrigger>
          <TabsTrigger value="crypto">Cryptocurrencies</TabsTrigger>
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
              <div className="flex items-center py-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payment methods..."
                    className="w-full bg-white pl-8"
                  />
                </div>
              </div>
              <div className="border rounded-lg">
                <div className="flex items-center justify-between border-b px-4 py-3 font-medium">
                  <div className="w-1/4">Method Name</div>
                  <div className="w-1/4">Type</div>
                  <div className="w-1/4">Countries</div>
                  <div className="w-1/4 text-right">Status</div>
                </div>
                
                {paymentMethods && paymentMethods.length > 0 ? (
                  paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-1/4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          {method.icon || method.type.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{method.name}</span>
                      </div>
                      <div className="w-1/4">
                        {method.type === 'bank' ? 'Bank' : 
                         method.type === 'mobile' ? 'Mobile Money' : 'Cryptocurrency'}
                      </div>
                      <div className="w-1/4">{method.countries.join(', ')}</div>
                      <div className="w-1/4 text-right">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                          ${method.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 
                            method.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'}`}>
                          {method.status === 'active' ? 'Active' : 
                           method.status === 'pending' ? 'Pending' : 'Inactive'}
                        </span>
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
        <TabsContent value="bank" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank Transfer Methods</CardTitle>
              <CardDescription>Bank and wire transfer payment options</CardDescription>
            </CardHeader>
            <CardContent>
              {bankMethods.length > 0 ? (
                <div className="border rounded-lg">
                  <div className="flex items-center justify-between border-b px-4 py-3 font-medium">
                    <div className="w-1/4">Method Name</div>
                    <div className="w-1/4">Countries</div>
                    <div className="w-1/4">Status</div>
                    <div className="w-1/4 text-right">Actions</div>
                  </div>
                  {bankMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-1/4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          {method.icon || 'BT'}
                        </div>
                        <span>{method.name}</span>
                      </div>
                      <div className="w-1/4">{method.countries.join(', ')}</div>
                      <div className="w-1/4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                          ${method.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {method.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="w-1/4 text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 flex items-center justify-center h-48 border rounded-lg">
                  <p className="text-muted-foreground">No bank transfer methods found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="mobile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Mobile Money Methods</CardTitle>
              <CardDescription>Mobile payment options</CardDescription>
            </CardHeader>
            <CardContent>
              {mobileMethods.length > 0 ? (
                <div className="border rounded-lg">
                  <div className="flex items-center justify-between border-b px-4 py-3 font-medium">
                    <div className="w-1/4">Method Name</div>
                    <div className="w-1/4">Countries</div>
                    <div className="w-1/4">Status</div>
                    <div className="w-1/4 text-right">Actions</div>
                  </div>
                  {mobileMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-1/4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          {method.icon || 'MM'}
                        </div>
                        <span>{method.name}</span>
                      </div>
                      <div className="w-1/4">{method.countries.join(', ')}</div>
                      <div className="w-1/4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                          ${method.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {method.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="w-1/4 text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 flex items-center justify-center h-48 border rounded-lg">
                  <p className="text-muted-foreground">No mobile money methods found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="crypto" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Cryptocurrency Methods</CardTitle>
              <CardDescription>Cryptocurrency payment options</CardDescription>
            </CardHeader>
            <CardContent>
              {cryptoMethods.length > 0 ? (
                <div className="border rounded-lg">
                  <div className="flex items-center justify-between border-b px-4 py-3 font-medium">
                    <div className="w-1/4">Method Name</div>
                    <div className="w-1/4">Countries</div>
                    <div className="w-1/4">Status</div>
                    <div className="w-1/4 text-right">Actions</div>
                  </div>
                  {cryptoMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-1/4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          {method.icon || 'BTC'}
                        </div>
                        <span>{method.name}</span>
                      </div>
                      <div className="w-1/4">{method.countries.join(', ')}</div>
                      <div className="w-1/4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                          ${method.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {method.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="w-1/4 text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 flex items-center justify-center h-48 border rounded-lg">
                  <p className="text-muted-foreground">No cryptocurrency methods found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 