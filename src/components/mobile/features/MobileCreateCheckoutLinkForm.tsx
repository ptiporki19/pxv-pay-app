"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ArrowLeftIcon, PlusIcon, CubeIcon, CreditCardIcon } from "@heroicons/react/24/solid"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { z } from "zod"
import { paymentMethodsApi, countriesApi, brandsApi, Brand } from "@/lib/supabase/client-api"
import { productTemplatesApi } from "@/lib/supabase/product-templates-api"
import type { ProductTemplate } from "@/types/content"

// Enhanced form validation schema (same as desktop)
const mobileCheckoutLinkSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  link_name: z.string().min(1, "Link name is required").max(50, "Link name must be less than 50 characters"),
  brand_id: z.string().min(1, "Please select a brand for your checkout page"),
  checkout_type: z.enum(["simple", "product"], {
    required_error: "Please select a checkout type",
  }),
  // Product-specific fields
  product_template_id: z.string().optional(),
  custom_price: z.number({ coerce: true, invalid_type_error: "Custom price must be a number" }).optional(),
  // Simple checkout fields
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
  // Product checkout validation
  if (data.checkout_type === "product" && !data.product_template_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select a product for product checkout",
      path: ["product_template_id"],
    });
  }

  // Product checkout pricing validation
  if (data.checkout_type === "product") {
    if (data.custom_price === undefined || data.custom_price === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Product price is required for product checkout.",
        path: ["custom_price"],
      });
    } else if (typeof data.custom_price === 'number' && data.custom_price < 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Product price must be at least 0.01.",
        path: ["custom_price"],
      });
    }
  }

  // Simple checkout validation
  if (data.checkout_type === "simple") {
    if (data.amount_type === "fixed") {
      if (data.amount === undefined || data.amount === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Amount is required for fixed pricing",
          path: ["amount"],
        });
      } else if (typeof data.amount === 'number' && data.amount < 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Amount must be at least 0.01",
          path: ["amount"],
        });
      }
    }

    if (data.amount_type === "flexible") {
      if (data.min_amount === undefined || data.min_amount === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Minimum amount is required for flexible pricing",
          path: ["min_amount"],
        });
      } else if (typeof data.min_amount === 'number' && data.min_amount < 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Minimum amount must be at least 0.01",
          path: ["min_amount"],
        });
      }

      if (data.max_amount === undefined || data.max_amount === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Maximum amount is required for flexible pricing",
          path: ["max_amount"],
        });
      } else if (typeof data.max_amount === 'number' && data.max_amount < 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Maximum amount must be at least 0.01",
          path: ["max_amount"],
        });
      }

      if (typeof data.min_amount === 'number' && typeof data.max_amount === 'number' && data.min_amount >= data.max_amount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Maximum amount must be greater than minimum amount",
          path: ["max_amount"],
        });
      }
    }
  }
});

type MobileCheckoutLinkValues = z.infer<typeof mobileCheckoutLinkSchema>

interface Country {
  id: string
  name: string
  code: string
  currency_code: string
  payment_methods_count: number
}

export function MobileCreateCheckoutLinkForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingCountries, setLoadingCountries] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [loadingBrands, setLoadingBrands] = useState(false)
  const [productTemplates, setProductTemplates] = useState<ProductTemplate[]>([])
  const router = useRouter()

  const form = useForm<MobileCheckoutLinkValues>({
    resolver: zodResolver(mobileCheckoutLinkSchema),
    defaultValues: {
      title: "",
      link_name: "",
      brand_id: "",
      checkout_type: "simple",
      product_template_id: "",
      custom_price: 0,
      amount_type: "fixed",
      amount: 0,
      min_amount: 0,
      max_amount: 0,
      country_codes: [],
      status: "draft",
    },
  })

  const checkoutType = form.watch("checkout_type")
  const amountType = form.watch("amount_type")
  const selectedProductId = form.watch("product_template_id")
  const selectedProduct = productTemplates.find(p => p.id === selectedProductId)

  useEffect(() => {
    loadCountries()
    loadProducts()
    loadBrands()
  }, [])

  const loadCountries = async () => {
    try {
      setLoadingCountries(true)
      const [countriesData, paymentMethods] = await Promise.all([
        countriesApi.getAll(),
        paymentMethodsApi.getAll()
      ])

      const countriesWithPaymentMethods = countriesData
        .filter(country => country.id && country.name && country.code)
        .map(country => ({
          id: country.id!,
          name: country.name!,
          code: country.code!,
          currency_code: country.currency_code || '',
          payment_methods_count: paymentMethods.filter((pm: any) => 
            pm.countries && pm.countries.includes(country.code)
          ).length
        }))
        .filter(country => country.payment_methods_count > 0)

      setCountries(countriesWithPaymentMethods)
      
      if (countriesWithPaymentMethods.length === 0) {
        toast({
          title: "No Countries Available",
          description: "Please create payment methods for countries first before creating checkout links.",
          variant: "destructive"
        })
      }
      
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

  const loadProducts = async () => {
    try {
      const productsData = await productTemplatesApi.getAll({ is_active: true })
      setProductTemplates(productsData)
    } catch (error) {
      console.error('Error loading products:', error)
      toast({
        title: "Error",
        description: "Failed to load products. Please refresh the page.",
        variant: "destructive"
      })
    }
  }

  const loadBrands = async () => {
    try {
      setLoadingBrands(true)
      const brandsData = await brandsApi.getAll()
      setBrands(brandsData)
    } catch (error) {
      console.error('Error loading brands:', error)
      toast({
        title: "Error",
        description: "Failed to load brands. Please refresh the page.",
        variant: "destructive"
      })
    } finally {
      setLoadingBrands(false)
    }
  }

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Auto-generate link name when title changes
  const handleTitleChange = (title: string) => {
    form.setValue("title", title)
    const slug = generateSlug(title)
    form.setValue("link_name", slug)
  }

  async function onSubmit(values: MobileCheckoutLinkValues) {
    try {
      setIsLoading(true)
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !user.email) {
        toast({
          title: "Error",
          description: "You must be logged in to create checkout links",
          variant: "destructive"
        })
        return
      }

      // Get the database user ID using email lookup
      const { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('email', user.email)
        .single()

      if (userError || !dbUser) {
        toast({
          title: "Error",
          description: "Unable to verify user account. Please try logging in again.",
          variant: "destructive"
        })
        return
      }

      // Get currency from the first selected country
      const selectedCountry = countries.find(c => values.country_codes.includes(c.code))
      if (!selectedCountry?.currency_code) {
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

      // Prepare data based on checkout type
      const checkoutData: any = {
        merchant_id: dbUser.id,
        slug: slug,
        title: values.title,
        link_name: values.link_name,
        brand_id: values.brand_id,
        currency: selectedCountry.currency_code,
        status: values.status,
        active_country_codes: values.country_codes,
        is_active: values.status === 'active',
        checkout_page_heading: "Complete Your Payment",
        payment_review_message: "Thank you for your payment. We will review and confirm within 24 hours.",
        checkout_type: values.checkout_type,
      }

      if (values.checkout_type === 'product') {
        // Product checkout data
        checkoutData.product_template_id = values.product_template_id
        checkoutData.custom_price = values.custom_price
      } else {
        // Simple checkout data
        checkoutData.amount_type = values.amount_type
        checkoutData.amount = values.amount_type === 'fixed' ? values.amount : 0
        checkoutData.min_amount = values.amount_type === 'flexible' ? values.min_amount : null
        checkoutData.max_amount = values.amount_type === 'flexible' ? values.max_amount : null
        checkoutData.product_template_id = null
      }

      // Create checkout link
      const { data, error } = await supabase
        .from('checkout_links')
        .insert(checkoutData)
        .select()

      if (error) {
        throw error
      }

      toast({ 
        title: "Success", 
        description: `${values.checkout_type === 'product' ? 'Product' : 'Simple'} checkout link created successfully` 
      })
      
      router.push('/m/checkout-links')
    } catch (error) {
      console.error("Checkout link creation error:", error)
      
      let errorMessage = "There was an error creating the checkout link"
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        const supabaseError = error as any
        if (supabaseError.message) {
          errorMessage = supabaseError.message
        }
      }
      
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="px-4 py-3 pb-20 pt-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeftIcon className="size-4 text-muted-foreground" />
        </button>
        <div className="text-right">
          <h1 className="text-lg font-semibold text-foreground font-roboto">
            Create Checkout Link
          </h1>
          <p className="text-xs text-muted-foreground font-roboto">
            Set up a new payment link
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          
          {/* Checkout Type Selection */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="checkout_type"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-medium font-roboto">Checkout Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-1 gap-2"
                    >
                      <div className="flex items-center space-x-2 border border-border rounded-lg p-3 hover:border-violet-300 cursor-pointer transition-colors">
                        <RadioGroupItem value="simple" id="simple" />
                        <div className="flex items-center gap-2 flex-1">
                          <div className="h-6 w-6 bg-violet-100 rounded-md flex items-center justify-center">
                            <CreditCardIcon className="h-3 w-3 text-violet-600" />
                          </div>
                          <div>
                            <label htmlFor="simple" className="text-xs font-medium cursor-pointer font-roboto">
                              Simple Payment
                            </label>
                            <p className="text-xs text-muted-foreground font-roboto">
                              Collect payments for services or custom amounts
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 border border-border rounded-lg p-3 hover:border-violet-300 cursor-pointer transition-colors">
                        <RadioGroupItem value="product" id="product" />
                        <div className="flex items-center gap-2 flex-1">
                          <div className="h-6 w-6 bg-violet-100 rounded-md flex items-center justify-center">
                            <CubeIcon className="h-3 w-3 text-violet-600" />
                          </div>
                          <div>
                            <label htmlFor="product" className="text-xs font-medium cursor-pointer font-roboto">
                              Product Checkout
                            </label>
                            <p className="text-xs text-muted-foreground font-roboto">
                              Sell products with descriptions and images
                            </p>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Product Selection (only for product checkout) */}
          {checkoutType === 'product' && (
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="product_template_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium font-roboto">Select Product</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500">
                          <SelectValue placeholder="Choose a product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productTemplates.map((product) => (
                          <SelectItem key={product.id} value={product.id} className="text-xs">
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedProduct && (
                <div className="p-2 bg-violet-50 border border-violet-200 rounded-lg">
                  <p className="text-xs font-medium text-violet-900 font-roboto">
                    ✓ Selected: {selectedProduct.name}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium font-roboto">Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={checkoutType === 'product' ? "Product Purchase" : "Payment Collection"} 
                      value={field.value}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value)
                        handleTitleChange(value)
                      }}
                      className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium font-roboto">Link Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="checkout-link-name" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500"
                    />
                  </FormControl>
                  <FormDescription className="text-xs font-roboto">
                    URL: yourstore.com/c/{field.value || 'link-name'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium font-roboto">Brand</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={loadingBrands}>
                    <FormControl>
                      <SelectTrigger className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500">
                        <SelectValue placeholder={loadingBrands ? "Loading brands..." : "Select brand"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands.filter(brand => brand.id != null).map((brand) => (
                        <SelectItem key={brand.id} value={brand.id!} className="text-xs">
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Pricing Configuration */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-foreground font-roboto">Pricing</h3>
            
            {checkoutType === 'product' && selectedProduct ? (
              <FormField
                control={form.control}
                name="custom_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium font-roboto">Product Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-violet-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : checkoutType === 'simple' ? (
              <>
                {/* Payment Type for Simple Checkout */}
                <FormField
                  control={form.control}
                  name="amount_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium font-roboto">Payment Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-1 gap-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fixed" id="fixed" />
                            <label htmlFor="fixed" className="text-xs font-medium cursor-pointer font-roboto">
                              Fixed Amount
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="flexible" id="flexible" />
                            <label htmlFor="flexible" className="text-xs font-medium cursor-pointer font-roboto">
                              Let customers choose amount
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amount Fields for Simple Checkout */}
                {amountType === 'fixed' && (
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium font-roboto">Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              className="text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-violet-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {amountType === 'flexible' && (
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="min_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium font-roboto">Min Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              className="text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-violet-500"
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
                          <FormLabel className="text-xs font-medium font-roboto">Max Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="1000.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              className="text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-violet-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Countries */}
          <FormField
            control={form.control}
            name="country_codes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium font-roboto">Countries</FormLabel>
                
                {countries.length === 0 && !loadingCountries ? (
                  <div className="text-center py-4 border border-dashed rounded-lg">
                    <p className="text-xs text-muted-foreground font-roboto">
                      No countries available. Create payment methods first.
                    </p>
                  </div>
                ) : (
                  <>
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
                        <SelectTrigger className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500">
                          <SelectValue placeholder={loadingCountries ? "Loading..." : "Select countries"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.code} className="text-xs">
                            {country.name} ({country.code}) - {country.currency_code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Display selected countries */}
                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {field.value.map((countryCode) => {
                          const country = countries.find(c => c.code === countryCode)
                          return (
                            <Badge key={countryCode} variant="secondary" className="text-xs gap-1">
                              {country?.name} ({countryCode})
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(field.value.filter(code => code !== countryCode))
                                }}
                                className="ml-1 hover:text-destructive"
                              >
                                ×
                              </button>
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
                
                <FormDescription className="text-xs font-roboto">
                  Only countries with payment methods are shown
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium font-roboto">Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft" className="text-xs">Draft</SelectItem>
                    <SelectItem value="active" className="text-xs">Active</SelectItem>
                    <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button - Smaller size */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading || countries.length === 0 || brands.length === 0}
              className="w-full h-10 bg-violet-600 hover:bg-violet-700 text-white font-roboto"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span className="text-xs">Creating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <PlusIcon className="size-3" />
                  <span className="text-xs">Create Checkout Link</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 
 