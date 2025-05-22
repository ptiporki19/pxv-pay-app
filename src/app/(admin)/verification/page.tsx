import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function VerificationPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Verification</h1>
          <p className="text-muted-foreground">Manage and verify payment submissions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export</Button>
          <Button>Refresh</Button>
        </div>
      </div>

      <Tabs defaultValue="pending" className="mt-6">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
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
                />
              </div>
              <div className="border rounded-lg">
                <div className="flex items-center justify-between border-b px-4 py-3 font-medium">
                  <div className="w-1/6">Transaction ID</div>
                  <div className="w-1/6">Date</div>
                  <div className="w-1/6">Customer</div>
                  <div className="w-1/6">Amount</div>
                  <div className="w-1/6">Method</div>
                  <div className="w-1/6 text-right">Actions</div>
                </div>
                <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="w-1/6 text-sm">TX-12345</div>
                  <div className="w-1/6 text-sm">2023-05-12</div>
                  <div className="w-1/6 text-sm">john@example.com</div>
                  <div className="w-1/6 text-sm">$299.99</div>
                  <div className="w-1/6 text-sm">Bank Transfer</div>
                  <div className="w-1/6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm" variant="default">Verify</Button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="w-1/6 text-sm">TX-12346</div>
                  <div className="w-1/6 text-sm">2023-05-12</div>
                  <div className="w-1/6 text-sm">sarah@example.com</div>
                  <div className="w-1/6 text-sm">$59.99</div>
                  <div className="w-1/6 text-sm">M-Pesa</div>
                  <div className="w-1/6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm" variant="default">Verify</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved" className="p-4 flex items-center justify-center h-96 border rounded-lg mt-4">
          <p className="text-muted-foreground">Approved transactions will be displayed here.</p>
        </TabsContent>
        
        <TabsContent value="rejected" className="p-4 flex items-center justify-center h-96 border rounded-lg mt-4">
          <p className="text-muted-foreground">Rejected transactions will be displayed here.</p>
        </TabsContent>
        
        <TabsContent value="all" className="p-4 flex items-center justify-center h-96 border rounded-lg mt-4">
          <p className="text-muted-foreground">All transactions will be displayed here.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
} 