import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function CountriesPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Countries</h1>
          <p className="text-muted-foreground">Manage supported countries for payments.</p>
        </div>
        <Button>Add Country</Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Search countries..."
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Countries</CardTitle>
          <CardDescription>
            Countries that can be used for payment processing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <div className="flex items-center justify-between border-b px-4 py-3 font-medium">
              <div className="w-1/3">Country Name</div>
              <div className="w-1/3">Country Code</div>
              <div className="w-1/3 text-right">Status</div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-1/3">United States</div>
              <div className="w-1/3">US</div>
              <div className="w-1/3 text-right">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                  Active
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-1/3">Canada</div>
              <div className="w-1/3">CA</div>
              <div className="w-1/3 text-right">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                  Active
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-1/3">United Kingdom</div>
              <div className="w-1/3">GB</div>
              <div className="w-1/3 text-right">
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                  Pending
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-1/3">Brazil</div>
              <div className="w-1/3">BR</div>
              <div className="w-1/3 text-right">
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-100">
                  Inactive
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-1/3">Nigeria</div>
              <div className="w-1/3">NG</div>
              <div className="w-1/3 text-right">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                  Active
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 