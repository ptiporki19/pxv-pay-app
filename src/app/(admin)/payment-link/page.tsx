import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function PaymentLinkPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Links</h1>
          <p className="text-muted-foreground">Create and manage payment links for your customers.</p>
        </div>
        <Button>Create New Link</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create a Payment Link</CardTitle>
            <CardDescription>
              Generate a custom payment link to share with your customers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <div className="flex">
                <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-l-md border border-r-0 border-gray-200 dark:border-gray-700">
                  $
                </div>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="rounded-l-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <select className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2">
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="NGN">NGN - Nigerian Naira</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Payment for..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Expires After</label>
              <select className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2">
                <option value="24h">24 hours</option>
                <option value="48h">48 hours</option>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
                <option value="never">Never</option>
              </select>
            </div>
            <Button className="w-full">Generate Link</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payment Links</CardTitle>
            <CardDescription>
              Your most recently created payment links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-md p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">Invoice #12345</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created 2 days ago</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs px-2.5 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-bold">$299.99</p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Copy</Button>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">Product Purchase</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created 5 days ago</p>
                  </div>
                  <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs px-2.5 py-0.5 rounded-full">
                    Paid
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-bold">$59.99</p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">Subscription Renewal</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created 1 week ago</p>
                  </div>
                  <span className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs px-2.5 py-0.5 rounded-full">
                    Expired
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-bold">$19.99</p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Renew</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 