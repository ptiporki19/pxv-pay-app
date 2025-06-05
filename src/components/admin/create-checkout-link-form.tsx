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
  FormDescription,
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
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { z } from "zod"
import { Country } from "@/types/checkout"

// Form validation schema
const checkoutLinkFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  link_name: z.string().min(1, "Link name is required").max(50, "Link name must be less than 50 characters"),
  amount_type: z.enum(["fixed", "flexible"], {
    required_error: "Please select an amount type",
  }),
  amount: z.number({ coerce: true, invalid_type_error: "Amount must be a number" }).optional(),
  min_amount: z.number({ coerce: true, invalid_type_error: "Minimum amount must be a number" }).optional(),
  max_amount: z.number({ coerce: true, invalid_type_error: "Maximum amount must be a number" }).optional(),
  country_codes: z.array(z.string()).min(1, "At least one country must be selected"),
  status: z.enum(["active", "inactive", "draft"]),
})
.superRefine((data, ctx) => {
  if (data.amount_type === "fixed") {
    if (data.amount === undefined || data.amount === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount is required for fixed amount type.",
        path: ["amount"],
      });
    } else if (typeof data.amount === 'number' && data.amount < 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount must be at least 0.01.",
        path: ["amount"],
      });
    }
  } else if (data.amount_type === "flexible") {
    let minAmountIsValid = true; // Assume valid until a check fails
    if (data.min_amount === undefined || data.min_amount === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Minimum amount is required.", path: ["min_amount"] });
      minAmountIsValid = false;
    } else if (typeof data.min_amount === 'number' && data.min_amount < 0.01) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Minimum amount must be at least 0.01.", path: ["min_amount"] });
      minAmountIsValid = false;
    }

    let maxAmountIsValid = true; // Assume valid until a check fails
    if (data.max_amount === undefined || data.max_amount === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Maximum amount is required.", path: ["max_amount"] });
      maxAmountIsValid = false;
    } else if (typeof data.max_amount === 'number' && data.max_amount < 0.01) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Maximum amount must be at least 0.01.", path: ["max_amount"] });
      maxAmountIsValid = false;
    }

    // Only check min vs max if both are individually valid numbers
    if (minAmountIsValid && maxAmountIsValid &&
        typeof data.min_amount === 'number' && typeof data.max_amount === 'number' &&
        data.min_amount > data.max_amount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum amount cannot be less than minimum amount.",
        path: ["max_amount"], // You can also use ["min_amount"] or a more general path
      });
    }
  }
});

type CheckoutLinkFormValues = z.infer<typeof checkoutLinkFormSchema>

// Predefined values for checkout page heading and payment review message
const PREDEFINED_CHECKOUT_HEADING = "Complete Your Payment"
const PREDEFINED_PAYMENT_REVIEW_MESSAGE = "Thank you for your payment. We will review and confirm within 24 hours."

export function CreateCheckoutLinkForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const router = useRouter()
  
  // Load countries on component mount
  useEffect(() => {
    loadCountries()
  }, [])

  const loadCountries = async () => {
    try {
      setLoadingCountries(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('countries')
        .select(`
          *,
          currency:currencies(
            id,
            name,
            code,
            symbol
          )
        `)
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setCountries(data || [])
    } catch (error) {
      console.error('Error loading countries:', error)
      toast({
        title: "Error",
        description: "Failed to load countries. Please refresh the page.",
        variant: "destructive"
      })
    } finally {
      setLoadingCountries(false)
    }
  }
  
  // Initialize the form with default values
  const form = useForm<CheckoutLinkFormValues>({
    resolver: zodResolver(checkoutLinkFormSchema),
    defaultValues: {
      title: "",
      link_name: "",
      amount_type: "fixed",
      amount: 0,
      min_amount: 0,
      max_amount: 0,
      country_codes: [],
      status: "draft",
    },
  })

  // Watch amount_type to show/hide relevant fields
  const amountType = form.watch("amount_type")

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

      // Get currency from the first selected country
      const selectedCountry = countries.find(c => values.country_codes.includes(c.code))
      if (!selectedCountry?.currency) {
        toast({
          title: "Error",
          description: "Selected country must have a currency configured",
          variant: "destructive"
        })
        return
      }

      // Generate unique slug
      const baseSlug = generateSlug(values.title)
      const timestamp = Date.now()
      const slug = `${baseSlug}-${timestamp}`

      // Create checkout link with predefined heading and message
      const { error } = await supabase
        .from('checkout_links')
        .insert({
          merchant_id: user.id,
          slug: slug,
          title: values.title,
          link_name: values.link_name,
          amount_type: values.amount_type,
          amount: values.amount_type === 'fixed' ? values.amount : 0,
          min_amount: values.amount_type === 'flexible' ? values.min_amount : null,
          max_amount: values.amount_type === 'flexible' ? values.max_amount : null,
          currency: selectedCountry.currency.code,
          status: values.status,
          active_country_codes: values.country_codes,
          is_active: values.status === 'active',
          checkout_page_heading: PREDEFINED_CHECKOUT_HEADING,
          payment_review_message: PREDEFINED_PAYMENT_REVIEW_MESSAGE,
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
    <div className="min-h-screen bg-background">
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
        <div className="bg-card rounded-lg shadow-sm border">
          <div className="max-w-2xl mx-auto p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
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
                      <FormLabel>Link Name *</FormLabel>
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

                {/* Amount Type Selection */}
                <FormField
                  control={form.control}
                  name="amount_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Type *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select amount type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Amount - I&apos;ll set a specific amount customers must pay</SelectItem>
                          <SelectItem value="flexible">Flexible Amount - Customers can enter their own amount</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose whether customers pay a fixed amount or can enter their own amount within limits
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amount Fields - Conditional based on amount_type */}
                {amountType === "fixed" && (
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fixed Amount *</FormLabel>
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
                        <FormDescription>
                          This is the exact amount customers will pay
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {amountType === "flexible" && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="min_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Amount *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0.01"
                              placeholder="10.00" 
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
                      name="max_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Amount *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0.01"
                              placeholder="1000.00" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="country_codes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Countries *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          const currentValues = field.value || []
                          if (!currentValues.includes(value)) {
                            field.onChange([...currentValues, value])
                          }
                        }}
                        disabled={loadingCountries}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingCountries ? "Loading countries..." : "Select countries"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.length === 0 && !loadingCountries ? (
                            <SelectItem value="no-countries" disabled>
                              No countries available. Create a country first.
                            </SelectItem>
                          ) : (
                            countries.map((country) => (
                              <SelectItem key={country.id} value={country.code}>
                                {country.name} ({country.code}) - {country.currency?.code}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      
                      {/* Display selected countries */}
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((countryCode) => {
                            const country = countries.find(c => c.code === countryCode)
                            return (
                              <div key={countryCode} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                {country?.name} ({countryCode})
                                <button
                                  type="button"
                                  onClick={() => {
                                    field.onChange(field.value.filter(code => code !== countryCode))
                                  }}
                                  className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                  ×
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                      <FormDescription>
                        Select the countries where this checkout link will be available. Currency will be determined by the country.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Information about predefined values */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Checkout Page Settings</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div>
                      <span className="font-medium">Checkout Page Heading:</span> &quot;{PREDEFINED_CHECKOUT_HEADING}&quot;
                    </div>
                    <div>
                                              <span className="font-medium">Payment Review Message:</span> &quot;{PREDEFINED_PAYMENT_REVIEW_MESSAGE}&quot;
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    These values are automatically set for all checkout links to ensure consistency.
                  </p>
                </div>

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