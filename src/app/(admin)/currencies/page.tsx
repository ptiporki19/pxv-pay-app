import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/server"
import { Search } from "lucide-react"

interface Currency {
  id: string
  name: string
  code: string
  symbol: string
  status: 'active' | 'pending' | 'inactive'
  created_at: string
}

export default async function CurrenciesPage() {
  const supabase = createClient()
  
  // Fetch currencies from Supabase
  let { data: currencies, error } = await supabase
    .from('currencies')
    .select('*')
    .order('name', { ascending: true })
  
  // If currencies table doesn't exist or is empty, insert some default data
  if (error || !currencies || currencies.length === 0) {
    const defaultCurrencies = [
      { name: "US Dollar", code: "USD", symbol: "$", status: "active" },
      { name: "Euro", code: "EUR", symbol: "€", status: "active" },
      { name: "British Pound", code: "GBP", symbol: "£", status: "active" },
      { name: "Nigerian Naira", code: "NGN", symbol: "₦", status: "active" },
      { name: "Brazilian Real", code: "BRL", symbol: "R$", status: "pending" },
    ]
    
    // Insert default currencies
    await supabase
      .from('currencies')
      .insert(defaultCurrencies)
    
    // Fetch currencies again after inserting defaults
    const { data: refreshedCurrencies } = await supabase
      .from('currencies')
      .select('*')
      .order('name', { ascending: true })
    
    // Use the refreshed data
    if (refreshedCurrencies) {
      currencies = refreshedCurrencies
    }
  }

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
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search currencies..."
            className="w-full bg-white pl-8"
          />
        </div>
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
            
            {currencies && currencies.length > 0 ? (
              currencies.map((currency) => (
                <div key={currency.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="w-1/4">{currency.name}</div>
                  <div className="w-1/4">{currency.code}</div>
                  <div className="w-1/4">{currency.symbol}</div>
                  <div className="w-1/4 text-right">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${currency.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 
                        currency.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}>
                      {currency.status === 'active' ? 'Active' : 
                       currency.status === 'pending' ? 'Pending' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-muted-foreground">
                No currencies found. Add one to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 