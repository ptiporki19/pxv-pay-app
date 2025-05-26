"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Country, countriesApi, Currency, currenciesApi } from "@/lib/supabase/client-api"
import { countryFormSchema, CountryFormValues } from "@/lib/validations/admin-forms"
import { useRouter } from "next/navigation"

interface CountryFormProps {
  initialData?: Country
}

export function CountryFormSimple({ initialData }: CountryFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loadingCurrencies, setLoadingCurrencies] = useState(true)
  const router = useRouter()
  
  // Load currencies on component mount
  useEffect(() => {
    loadCurrencies()
  }, [])

  const loadCurrencies = async () => {
    try {
      setLoadingCurrencies(true)
      const currencyData = await currenciesApi.getAll()
      setCurrencies(currencyData)
    } catch (error) {
      console.error('Error loading currencies:', error)
      toast({
        title: "Error",
        description: "Failed to load currencies. Please refresh the page.",
        variant: "destructive"
      })
    } finally {
      setLoadingCurrencies(false)
    }
  }
  
  // Initialize the form with default values or existing data
  const form = useForm<CountryFormValues>({
    resolver: zodResolver(countryFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      code: initialData.code,
      currency_id: initialData.currency_id || "",
      status: initialData.status,
    } : {
      name: "",
      code: "",
      currency_id: "",
      status: "inactive",
    },
  })

  // Handle form submission
  async function onSubmit(values: CountryFormValues) {
    try {
      setIsLoading(true)
      
      if (initialData?.id) {
        // Update existing country
        await countriesApi.update(initialData.id, values)
        toast({ title: "Success", description: "Country updated successfully" })
      } else {
        // Create new country
        await countriesApi.create(values)
        toast({ title: "Success", description: "Country created successfully" })
      }
      
      // Navigate back to countries list
      router.push('/countries')
    } catch (error) {
      console.error("Error saving country:", error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "There was an error processing your request", 
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country Name</FormLabel>
                  <FormControl>
                    <Input placeholder="United States" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="US" 
                    {...field} 
                    maxLength={5}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Currency *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={loadingCurrencies}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCurrencies ? "Loading currencies..." : "Select currency"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.length === 0 && !loadingCurrencies ? (
                      <SelectItem value="" disabled>
                        No currencies available. Create a currency first.
                      </SelectItem>
                    ) : (
                      currencies
                        .filter(currency => currency.status === 'active')
                        .map((currency) => (
                          <SelectItem key={currency.id} value={currency.id!}>
                            {currency.name} ({currency.code}) - {currency.symbol}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
                {currencies.length === 0 && !loadingCurrencies && (
                  <p className="text-sm text-muted-foreground">
                    You need to create at least one active currency before creating a country.{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-sm"
                      onClick={() => router.push('/currencies/create')}
                    >
                      Create Currency
                    </Button>
                  </p>
                )}
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/countries')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || (currencies.length === 0 && !loadingCurrencies)}
            >
              {isLoading ? "Saving..." : initialData ? "Update Country" : "Create Country"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 