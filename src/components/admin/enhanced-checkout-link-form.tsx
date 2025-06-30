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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, CreditCard, ShoppingCart, Plus, Grid3X3 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { z } from "zod"
import { productTemplatesApi } from "@/lib/supabase/product-templates-api"
import type { ProductTemplate } from "@/types/content"
import { paymentMethodsApi, countriesApi, brandsApi, Brand } from "@/lib/supabase/client-api"

// Enhanced form validation schema
const enhancedCheckoutLinkFormSchema = z.object({
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

  // Product checkout pricing validation - all product pricing is now custom
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
      if (data.min_amount !== undefined && data.max_amount !== undefined && 
          typeof data.min_amount === 'number' && typeof data.max_amount === 'number' && 
          data.min_amount >= data.max_amount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Maximum amount must be greater than minimum amount",
          path: ["max_amount"],
        });
      }
    }
  }
})

type EnhancedCheckoutLinkFormValues = z.infer<typeof enhancedCheckoutLinkFormSchema>

// Country interface for smart filtering
interface Country {
  id: string
  name: string
  code: string
  currency_code: string
  payment_methods_count?: number
}

// Currency interface
interface Currency {
  id: string
  name: string
  code: string
  symbol: string
}

export function EnhancedCreateCheckoutLinkForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [brands, setBrands] = useState<Brand[]>([])
  const [loadingBrands, setLoadingBrands] = useState(true)
  const [productTemplates, setProductTemplates] = useState<ProductTemplate[]>([])
  const [showProductModal, setShowProductModal] = useState(false)
  const [customPriceValidated, setCustomPriceValidated] = useState(false)
  const router = useRouter()
  
  // Load countries, brands, and products on component mount
  useEffect(() => {
    loadCountriesWithPaymentMethods()
    loadBrands()
    loadProducts()
  }, [])

  // Smart country loading - only show countries that have payment methods
  const loadCountriesWithPaymentMethods = async () => {
    try {
      setLoadingCountries(true)
      
      // Get all user's payment methods first
      const paymentMethods = await paymentMethodsApi.getAll()
      
      if (paymentMethods.length === 0) {
        console.log('No payment methods found for user')
        setCountries([])
        return
      }
      
      // Get all unique country codes from payment methods
      const countryCodesWithPaymentMethods = new Set<string>()
      paymentMethods.forEach((pm: any) => {
        if (pm.countries && Array.isArray(pm.countries)) {
          pm.countries.forEach((countryCode: string) => countryCodesWithPaymentMethods.add(countryCode))
        }
      })
      
      if (countryCodesWithPaymentMethods.size === 0) {
        console.log('No countries found in payment methods')
        setCountries([])
        return
      }
      
      // Get all countries and filter to only those with payment methods
      const allCountries = await countriesApi.getAll()
      const countriesWithPaymentMethods: Country[] = []
      
      allCountries.forEach((country: any) => {
        if (countryCodesWithPaymentMethods.has(country.code)) {
          countriesWithPaymentMethods.push({
            id: country.id || '',
            name: country.name,
            code: country.code,
            currency_code: country.currency_code || '',
            payment_methods_count: paymentMethods.filter((pm: any) => 
              pm.countries && pm.countries.includes(country.code)
            ).length
          })
        }
      })

      console.log('Countries with payment methods:', countriesWithPaymentMethods.length)
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
      // Only load active products for checkout creation
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
  
  // Initialize the form with default values
  const form = useForm<EnhancedCheckoutLinkFormValues>({
    resolver: zodResolver(enhancedCheckoutLinkFormSchema),
    defaultValues: {
      title: "",
      link_name: "",
      brand_id: "",
      checkout_type: "simple",
      amount_type: "fixed",
      amount: 0,
      min_amount: 0,
      max_amount: 0,
      country_codes: [],
      status: "draft",
      custom_price: 0,
    },
  })

  // Watch form values for conditional rendering
  const checkoutType = form.watch("checkout_type")
  const amountType = form.watch("amount_type")
  const selectedProductId = form.watch("product_template_id")
  const customPrice = form.watch("custom_price")
  
  // Get selected product details
  const selectedProduct = productTemplates.find(p => p.id === selectedProductId)

  // Reset custom price validation when custom price changes
  useEffect(() => {
    if (!customPrice) {
      setCustomPriceValidated(false)
    }
  }, [customPrice])

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
    // Update the title field first
    form.setValue("title", title)
    // Then auto-generate the link name
    const slug = generateSlug(title)
    form.setValue("link_name", slug)
  }

  // Validate custom price
  const handleValidateCustomPrice = () => {
    if (customPrice && customPrice > 0) {
      setCustomPriceValidated(true)
      toast({
        title: "Price Validated",
        description: `Custom price of $${customPrice} will be used for this checkout link`
      })
    } else {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price greater than 0",
        variant: "destructive"
      })
    }
  }

  // Product List Item Component for Modal and Main Display
  const ProductListItem = ({ product, isSelected, onClick }: { 
    product: ProductTemplate, 
    isSelected: boolean, 
    onClick: () => void 
  }) => (
    <div
      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
        isSelected
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
          : 'border-border hover:border-muted-foreground/30'
      }`}
      onClick={onClick}
    >
      {/* Product Image */}
      {product.featured_image ? (
        <img 
          src={product.featured_image} 
          alt={product.name}
          className="w-16 h-16 object-cover rounded-md border"
        />
      ) : (
        <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-md border">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      
      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium truncate">{product.name}</h4>
          <Badge variant="secondary" className="text-xs capitalize shrink-0">
            {product.category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.short_description || product.description || 'No description available'}
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span>📦 Price set during checkout</span>
          {product.is_featured && <span>⭐ Featured</span>}
        </div>
      </div>
      
      {/* Selection Indicator */}
      {isSelected && (
        <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-full shrink-0">
          <span className="text-primary-foreground text-xs">✓</span>
        </div>
      )}
    </div>
  )

  // Handle form submission
  async function onSubmit(values: EnhancedCheckoutLinkFormValues) {
    try {
      setIsLoading(true)
      
      console.log('Form submission started with values:', values)
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('User not authenticated')
        toast({
          title: "Error",
          description: "You must be logged in to create checkout links",
          variant: "destructive"
        })
        return
      }

      console.log('Auth user found:', user.id)

      // Get the database user ID using email lookup
      const { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('email', user.email)
        .single()

      if (userError || !dbUser) {
        console.error('Failed to get database user:', userError)
        toast({
          title: "Error",
          description: "Unable to verify user account. Please try logging in again.",
          variant: "destructive"
        })
        return
      }

      console.log('Database user found:', dbUser.id)

      // Get currency from the first selected country
      const selectedCountry = countries.find(c => values.country_codes.includes(c.code))
      if (!selectedCountry?.currency_code) {
        console.error('Selected country currency issue:', { selectedCountry, country_codes: values.country_codes })
        toast({
          title: "Error",
          description: "Selected country must have a currency configured",
          variant: "destructive"
        })
        return
      }

      console.log('Selected country and currency:', selectedCountry)

      // For product checkout, validate that custom price is validated if override pricing is enabled
      if (values.checkout_type === 'product' && !customPriceValidated) {
        console.error('Custom price validation required')
        toast({
          title: "Validation Required",
          description: "Please validate your custom price before creating the checkout link",
          variant: "destructive"
        })
        return
      }

      // Additional validation for product checkout
      if (values.checkout_type === 'product' && !values.product_template_id) {
        console.error('Product template ID missing for product checkout')
        toast({
          title: "Error",
          description: "Please select a product for product checkout",
          variant: "destructive"
        })
        return
      }

      // Generate unique slug
      const baseSlug = generateSlug(values.title)
      const timestamp = Date.now()
      const slug = `${baseSlug}-${timestamp}`

      console.log('Generated slug:', slug)

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

      console.log('Checkout data being sent:', checkoutData)

      // Create checkout link
      const { data, error } = await supabase
        .from('checkout_links')
        .insert(checkoutData)
        .select()

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('Created checkout link:', data)

      toast({ 
        title: "Success", 
        description: `${values.checkout_type === 'product' ? 'Product' : 'Simple'} checkout link created successfully` 
      })
      
      router.push('/checkout-links')
    } catch (error) {
      console.error("Checkout link creation error:", {
        error,
        errorType: typeof error,
        isErrorInstance: error instanceof Error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        stringified: JSON.stringify(error, null, 2)
      })
      
      let errorMessage = "There was an error creating the checkout link"
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase error objects
        const supabaseError = error as any
        if (supabaseError.message) {
          errorMessage = supabaseError.message
        } else if (supabaseError.error?.message) {
          errorMessage = supabaseError.error.message
        } else {
          errorMessage = JSON.stringify(error)
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
          <h1 className="text-3xl font-bold text-foreground">Create Checkout Link</h1>
        </div>

        {/* Form Container */}
        <div className="bg-card rounded-lg shadow-sm border">
          <div className="max-w-4xl mx-auto p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Checkout Type Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Checkout Type</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Choose what type of checkout experience you want to create
                    </p>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="checkout_type"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid grid-cols-2 gap-6"
                            >
                              <div className="flex items-center space-x-3 border rounded-lg p-4 hover:border-primary/30 cursor-pointer transition-colors">
                                <RadioGroupItem value="simple" id="simple" />
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <label htmlFor="simple" className="text-sm font-medium cursor-pointer">
                                      Simple Payment
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                      Collect payments for services, donations, or custom amounts
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3 border rounded-lg p-4 hover:border-primary/30 cursor-pointer transition-colors">
                                <RadioGroupItem value="product" id="product" />
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="h-10 w-10 bg-accent/50 rounded-lg flex items-center justify-center">
                                    <Package className="h-5 w-5 text-accent-foreground" />
                                  </div>
                                  <div>
                                    <label htmlFor="product" className="text-sm font-medium cursor-pointer">
                                      Product Checkout
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                      Sell products with rich descriptions, images, and features
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
                  </CardContent>
                </Card>

                {/* Product Selection (only for product checkout) */}
                {checkoutType === 'product' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Select Product
                      </CardTitle>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Choose a product template from your Product Management library
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowProductModal(true)}
                            className="text-xs"
                          >
                            <Grid3X3 className="h-3 w-3 mr-1" />
                            Browse All
                          </Button>
                          <Button type="button" variant="outline" size="sm" asChild>
                            <Link href="/content/create">
                              <Plus className="h-3 w-3 mr-1" />
                              Create New Product
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {productTemplates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="mb-2">No products available</p>
                          <p className="text-sm">Create your first product to get started</p>
                          <Button variant="outline" className="mt-4" asChild>
                            <Link href="/content/create">
                              <Plus className="h-4 w-4 mr-2" />
                              Create Product
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Available products ({productTemplates.length})
                          </p>
                          
                          {/* Product List - Display up to 4 products in clean list format */}
                          <div className="space-y-2">
                            {productTemplates.slice(0, 4).map((product) => (
                              <ProductListItem
                                key={product.id}
                                product={product}
                                isSelected={selectedProductId === product.id}
                                onClick={() => {
                                  form.setValue("product_template_id", product.id)
                                  // Reset custom price when switching products
                                  form.setValue("custom_price", 0)
                                  setCustomPriceValidated(false)
                                }}
                              />
                            ))}
                          </div>
                          
                          {/* Show "Browse All" if more than 4 products */}
                          {productTemplates.length > 4 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowProductModal(true)}
                              className="w-full mt-3"
                            >
                              <Grid3X3 className="h-4 w-4 mr-2" />
                              Browse All Products ({productTemplates.length})
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Selected Product Confirmation */}
                {checkoutType === 'product' && selectedProduct && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 p-4 bg-accent/50 border border-accent rounded-lg">
                        {selectedProduct.featured_image && (
                          <img 
                            src={selectedProduct.featured_image} 
                            alt={selectedProduct.name}
                            className="w-12 h-12 object-cover rounded-md border"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-accent-foreground">✓ Selected: {selectedProduct.name}</h4>
                          <p className="text-sm text-muted-foreground">Ready for pricing configuration below</p>
                        </div>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {selectedProduct.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Product Selection Modal */}
                <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle>Select Product</DialogTitle>
                      <DialogDescription>
                        Choose from all {productTemplates.length} available products
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                      {productTemplates.map((product) => (
                        <ProductListItem
                          key={product.id}
                          product={product}
                          isSelected={selectedProductId === product.id}
                          onClick={() => {
                            form.setValue("product_template_id", product.id)
                            form.setValue("custom_price", 0)
                            setCustomPriceValidated(false)
                            setShowProductModal(false)
                          }}
                        />
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={checkoutType === 'product' ? "Product Purchase" : "Payment Collection"} 
                                value={field.value}
                                onChange={(e) => {
                                  const value = e.target.value
                                  field.onChange(value)
                                  handleTitleChange(value)
                                }}
                              />
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
                              value={field.value}
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
                              placeholder="checkout-link-name" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            />
                          </FormControl>
                          <FormDescription>
                            This will be your checkout URL: yourstore.com/{field.value}
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
                          <FormLabel>Brand Identity *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={loadingBrands}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={loadingBrands ? "Loading brands..." : "Select brand for checkout"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id!}>
                                  <div className="flex items-center gap-2">
                                    <img 
                                      src={brand.logo_url} 
                                      alt={brand.name}
                                      className="w-5 h-5 rounded-full object-cover"
                                    />
                                    <span>{brand.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            This brand's logo and name will be displayed on the checkout page
                          </FormDescription>
                          {brands.length === 0 && !loadingBrands && (
                            <div className="mt-2">
                              <p className="text-sm text-amber-600">
                                No brands available.{' '}
                                <Link href="/theme/create" className="underline hover:text-amber-700">
                                  Create your first brand
                                </Link>
                                {' '}to get started.
                              </p>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Pricing Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Configuration</CardTitle>
                    {checkoutType === 'product' && selectedProduct ? (
                      <p className="text-sm text-muted-foreground">
                        Set the price for "{selectedProduct.name}" in this checkout link
                      </p>
                    ) : checkoutType === 'simple' ? (
                      <p className="text-sm text-muted-foreground">
                        Configure how customers will pay
                      </p>
                    ) : null}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {checkoutType === 'product' && selectedProduct ? (
                      <div className="space-y-4">
                        {/* Product Pricing - Always Custom Since No Default Pricing */}
                        <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-medium text-sm text-primary">Set Product Price</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Configure the price customers will pay for "{selectedProduct.name}"
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="custom_price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Product Price *</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center gap-3">
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="99.99"
                                        className="text-lg font-semibold"
                                        {...field}
                                        onChange={(e) => {
                                          const value = parseFloat(e.target.value) || 0
                                          field.onChange(value)
                                          setCustomPriceValidated(false)
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleValidateCustomPrice}
                                        disabled={!customPrice || customPrice <= 0}
                                        className="whitespace-nowrap"
                                      >
                                        {customPriceValidated ? "✓ Validated" : "Validate Price"}
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    Enter the amount customers will pay for this product
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {customPriceValidated && customPrice && customPrice > 0 && (
                              <div className="p-3 bg-accent/50 border border-accent rounded-lg">
                                <div className="flex items-center gap-2 text-accent-foreground">
                                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-primary-foreground text-xs">✓</span>
                                  </div>
                                  <span className="text-sm font-medium">
                                    Price confirmed: ${customPrice.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : checkoutType === 'simple' ? (
                      // Simple Checkout Pricing
                      <>
                        <FormField
                          control={form.control}
                          name="amount_type"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Payment Type</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="flex flex-col space-y-2"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="fixed" id="fixed" />
                                    <label htmlFor="fixed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                      Fixed Amount
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="flexible" id="flexible" />
                                    <label htmlFor="flexible" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                      Flexible Amount (Let customers choose)
                                    </label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {amountType === 'fixed' && (
                          <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Amount *</FormLabel>
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
                        )}

                        {amountType === 'flexible' && (
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="min_amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Minimum Amount</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
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
                                  <FormLabel>Maximum Amount</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
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
                      </>
                    ) : null}
                  </CardContent>
                </Card>

                {/* Enhanced Countries Section with Smart Filtering */}
                <Card>
                  <CardHeader>
                    <CardTitle>Availability</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Countries listed below have payment methods configured and are ready for checkout
                    </p>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="country_codes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available Countries *</FormLabel>
                          
                          {countries.length === 0 && !loadingCountries ? (
                            <div className="text-center py-8 border border-dashed rounded-lg">
                              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                <CreditCard className="h-12 w-12 opacity-50" />
                                <div>
                                  <p className="font-medium">No Countries Available</p>
                                  <p className="text-sm">You need to create payment methods for countries first</p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href="/payment-methods/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Payment Method
                                  </Link>
                                </Button>
                              </div>
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
                                  <SelectTrigger>
                                    <SelectValue placeholder={loadingCountries ? "Loading countries..." : "Select countries with payment methods"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {countries.map((country) => (
                                    <SelectItem key={country.id} value={country.code}>
                                      <div className="flex items-center gap-2">
                                        <span>{country.name} ({country.code})</span>
                                        <Badge variant="outline" className="text-xs">
                                          {country.currency_code}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                          ✓ Payment methods available
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              {/* Display selected countries */}
                              {field.value && field.value.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {field.value.map((countryCode) => {
                                    const country = countries.find(c => c.code === countryCode)
                                    return (
                                      <Badge key={countryCode} variant="secondary" className="gap-1">
                                        {country?.name} ({countryCode}) - {country?.currency_code}
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
                          
                          <FormDescription>
                            Only countries with configured payment methods are shown. The currency will be automatically determined by the selected country.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                  <Link href="/checkout-links">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isLoading || countries.length === 0 || brands.length === 0}>
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