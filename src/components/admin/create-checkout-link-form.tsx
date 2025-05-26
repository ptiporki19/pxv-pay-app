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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { z } from "zod"

// Form validation schema
const checkoutLinkFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  link_name: z.string().min(1, "Link name is required").max(50, "Link name must be less than 50 characters"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  status: z.enum(["active", "inactive", "draft"]),
  checkout_page_heading: z.string().optional(),
  payment_review_message: z.string().optional(),
})

type CheckoutLinkFormValues = z.infer<typeof checkoutLinkFormSchema>

interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  status: string
}

export function CreateCheckoutLinkForm() {
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
      const supabase = createClient()
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setCurrencies(data || [])
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
  
  // Initialize the form with default values
  const form = useForm<CheckoutLinkFormValues>({
    resolver: zodResolver(checkoutLinkFormSchema),
    defaultValues: {
      title: "",
      link_name: "",
      amount: 0,
      currency: "",
      status: "draft",
      checkout_page_heading: "",
      payment_review_message: "",
    },
  })

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Handle form submission
  async function onSubmit(values: CheckoutLinkFormValues) {
    try {
      setIsLoading(true)
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create checkout links",
          variant: "destructive"
        })
        return
      }

      // Generate unique slug
      const baseSlug = generateSlug(values.title)
      const timestamp = Date.now()
      const slug = `${baseSlug}-${timestamp}`

      // Create checkout link
      const { error } = await supabase
        .from('checkout_links')
        .insert({
          merchant_id: user.id,
          slug: slug,
          title: values.title,
          link_name: values.link_name,
          amount: values.amount,
          currency: values.currency,
          status: values.status,
          active_country_codes: [], // Will be set later in settings
          is_active: values.status === 'active',
          checkout_page_heading: values.checkout_page_heading || null,
          payment_review_message: values.payment_review_message || null,
        })

      if (error) throw error

      toast({ title: "Success", description: "Checkout link created successfully" })
      router.push('/checkout-links')
    } catch (error) {
      console.error("Error creating checkout link:", error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "There was an error creating the checkout link", 
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/checkout-links">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Checkout Links
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Checkout Link</h1>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="max-w-2xl mx-auto p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Product Purchase" {...field} />
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
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
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
                  name="link_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="product-purchase" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            min="0.01"
                            placeholder="99.99" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
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
                              <SelectItem value="no-currencies" disabled>
                                No currencies available. Create a currency first.
                              </SelectItem>
                            ) : (
                              currencies.map((currency) => (
                                <SelectItem key={currency.id} value={currency.code}>
                                  {currency.name} ({currency.code}) - {currency.symbol}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="checkout_page_heading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Checkout Page Heading (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Complete Your Purchase" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_review_message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Review Message (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Thank you for your payment. We will review and confirm within 24 hours."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Link href="/checkout-links">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Checkout Link"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
} 