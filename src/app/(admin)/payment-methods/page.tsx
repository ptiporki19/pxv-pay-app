import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PaymentMethodsPage() {
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
                <Input
                  placeholder="Search payment methods..."
                  className="max-w-sm"
                />
              </div>
              <div className="border rounded-lg">
                <div className="flex items-center justify-between border-b px-4 py-3 font-medium">
                  <div className="w-1/4">Method Name</div>
                  <div className="w-1/4">Type</div>
                  <div className="w-1/4">Countries</div>
                  <div className="w-1/4 text-right">Status</div>
                </div>
                <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="w-1/4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">BT</div>
                    <span>Bank Transfer (USD)</span>
                  </div>
                  <div className="w-1/4">Bank</div>
                  <div className="w-1/4">US, CA</div>
                  <div className="w-1/4 text-right">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                      Active
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="w-1/4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">MM</div>
                    <span>M-Pesa</span>
                  </div>
                  <div className="w-1/4">Mobile Money</div>
                  <div className="w-1/4">KE, TZ</div>
                  <div className="w-1/4 text-right">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                      Active
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="w-1/4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">BT</div>
                    <span>SEPA Transfer</span>
                  </div>
                  <div className="w-1/4">Bank</div>
                  <div className="w-1/4">EU Countries</div>
                  <div className="w-1/4 text-right">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                      Inactive
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="w-1/4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">BTC</div>
                    <span>Bitcoin</span>
                  </div>
                  <div className="w-1/4">Cryptocurrency</div>
                  <div className="w-1/4">Global</div>
                  <div className="w-1/4 text-right">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bank" className="p-4 flex items-center justify-center h-96 border rounded-lg mt-4">
          <p className="text-muted-foreground">Bank transfer methods will be displayed here.</p>
        </TabsContent>
        <TabsContent value="mobile" className="p-4 flex items-center justify-center h-96 border rounded-lg mt-4">
          <p className="text-muted-foreground">Mobile money methods will be displayed here.</p>
        </TabsContent>
        <TabsContent value="crypto" className="p-4 flex items-center justify-center h-96 border rounded-lg mt-4">
          <p className="text-muted-foreground">Cryptocurrency methods will be displayed here.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
} 