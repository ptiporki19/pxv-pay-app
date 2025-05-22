import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/server"
import { Search } from "lucide-react"

interface Country {
  id: string
  name: string
  code: string
  status: 'active' | 'pending' | 'inactive'
  created_at: string
}

export default async function CountriesPage() {
  const supabase = createClient()
  
  // Fetch countries from Supabase
  let { data: countries, error } = await supabase
    .from('countries')
    .select('*')
    .order('name', { ascending: true })
  
  // If countries table doesn't exist or is empty, insert some default data
  if (error || !countries || countries.length === 0) {
    const defaultCountries = [
      { name: "United States", code: "US", status: "active" },
      { name: "Canada", code: "CA", status: "active" },
      { name: "United Kingdom", code: "GB", status: "pending" },
      { name: "Brazil", code: "BR", status: "inactive" },
      { name: "Nigeria", code: "NG", status: "active" },
    ]
    
    // Insert default countries
    await supabase
      .from('countries')
      .insert(defaultCountries)
    
    // Fetch countries again after inserting defaults
    const { data: refreshedCountries } = await supabase
      .from('countries')
      .select('*')
      .order('name', { ascending: true })
    
    // Use the refreshed data
    if (refreshedCountries) {
      countries = refreshedCountries
    }
  }

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
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search countries..."
            className="w-full bg-white pl-8"
          />
        </div>
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
            
            {countries && countries.length > 0 ? (
              countries.map((country) => (
                <div key={country.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="w-1/3">{country.name}</div>
                  <div className="w-1/3">{country.code}</div>
                  <div className="w-1/3 text-right">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${country.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 
                        country.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}>
                      {country.status === 'active' ? 'Active' : 
                       country.status === 'pending' ? 'Pending' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-muted-foreground">
                No countries found. Add one to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 