import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function CurrenciesPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Currencies</h1>
          <p className="text-muted-foreground">Manage supported currencies for payments.</p>
        </div>
        <Button>Add Currency</Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Search currencies..."
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Currencies</CardTitle>
          <CardDescription>
            Currencies that can be used for payment processing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <div className="flex items-center justify-between border-b px-4 py-3 font-medium">
              <div className="w-1/4">Currency Name</div>
              <div className="w-1/4">Currency Code</div>
              <div className="w-1/4">Symbol</div>
              <div className="w-1/4 text-right">Status</div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-1/4">US Dollar</div>
              <div className="w-1/4">USD</div>
              <div className="w-1/4">$</div>
              <div className="w-1/4 text-right">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                  Active
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-1/4">Euro</div>
              <div className="w-1/4">EUR</div>
              <div className="w-1/4">€</div>
              <div className="w-1/4 text-right">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                  Active
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-1/4">British Pound</div>
              <div className="w-1/4">GBP</div>
              <div className="w-1/4">£</div>
              <div className="w-1/4 text-right">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                  Active
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-1/4">Nigerian Naira</div>
              <div className="w-1/4">NGN</div>
              <div className="w-1/4">₦</div>
              <div className="w-1/4 text-right">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                  Active
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-1/4">Brazilian Real</div>
              <div className="w-1/4">BRL</div>
              <div className="w-1/4">R$</div>
              <div className="w-1/4 text-right">
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                  Pending
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 