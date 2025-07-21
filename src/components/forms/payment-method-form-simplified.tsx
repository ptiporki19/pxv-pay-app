"use client"

import { useState, useEffect, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Country, PaymentMethod, CustomField, countriesApi, paymentMethodsApi } from "@/lib/supabase/client-api"
import { useAdminStore } from "@/lib/store/admin-store"
import { 
  paymentMethodFormSchema, 
  PaymentMethodFormValues,
  CustomFieldType
} from "@/lib/validations/admin-forms"
import { Check, ChevronsUpDown, Plus, Trash2, Settings, Globe, MapPin, Edit, X, ImageIcon, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { useNotificationActions } from "@/providers/notification-provider"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { storageService } from "@/lib/supabase/storage"
import { createClient } from "@/lib/supabase/client"

interface PaymentMethodFormSimplifiedProps {
  initialData?: PaymentMethod
  onSuccess?: () => void
}

interface ConfiguredCountry {
  code: string
  name: string
  type: 'manual' | 'payment-link'
  fields: CustomField[]
  url?: string
  instructions?: string
}

export function PaymentMethodFormSimplified({ initialData, onSuccess }: PaymentMethodFormSimplifiedProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image_url || '')
  const [countries, setCountries] = useState<Country[]>([])
  const [configuredCountries, setConfiguredCountries] = useState<ConfiguredCountry[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [countryType, setCountryType] = useState<'manual' | 'payment-link'>('manual')
  const [countryFields, setCountryFields] = useState<CustomField[]>([])
  const [countryUrl, setCountryUrl] = useState<string>("")
  const [countryInstructions, setCountryInstructions] = useState<string>("")
  const [editingCountry, setEditingCountry] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const router = useRouter()
  const closeModal = useAdminStore((state) => state.closeModal)
  const setRefreshFlag = useAdminStore((state) => state.setRefreshFlag)
  const { showSuccess, showError } = useNotificationActions()
  
  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countriesList = await countriesApi.getAll()
        setCountries(countriesList)
      } catch (error) {
        console.error("Error fetching countries:", error)
        toast({
          title: "Error",
          description: "Failed to fetch countries list",
          variant: "destructive",
        })
      }
    }
    
    fetchCountries()
  }, [])

  // Initialize form with existing data
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "manual", // Use existing type or default to manual
      countries: [],
      status: initialData?.status || "inactive",
      description: initialData?.description || "",
      custom_fields: [],
      country_specific_details: {},
      display_order: initialData?.display_order || 0,
      icon: initialData?.icon || null,
      url: initialData?.url || "",
      instructions: "",
      instructions_for_checkout: "",
      image_url: initialData?.image_url || "",
    },
  })

  // Load existing country configurations
  useEffect(() => {
    if (initialData?.country_specific_details) {
      const configured: ConfiguredCountry[] = []
      Object.entries(initialData.country_specific_details).forEach(([code, details]) => {
        const country = countries.find(c => c.code === code)
        if (country) {
          configured.push({
            code,
            name: country.name,
            type: details.url ? 'payment-link' : 'manual',
            fields: details.custom_fields || [],
            url: details.url || "",
            instructions: details.instructions || ""
          })
        }
      })
      setConfiguredCountries(configured)
    }
  }, [initialData, countries])

  // Update form countries field whenever configuredCountries changes
  useEffect(() => {
    const countryCodes = configuredCountries.map(country => country.code)
    form.setValue('countries', countryCodes)
  }, [configuredCountries, form])

  // Get country name by code
  const getCountryName = (code: string) => {
    const country = countries.find(c => c.code === code)
    return country ? country.name : code
  }

  // Add a new custom field
  const addCustomField = () => {
    const newField: CustomField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: "",
      type: "text",
      placeholder: "",
      required: false,
      value: ""
    }
    setCountryFields([...countryFields, newField])
  }

  // Remove a custom field
  const removeCustomField = (index: number) => {
    setCountryFields(countryFields.filter((_, i) => i !== index))
  }

  // Update custom field
  const updateCustomField = (index: number, field: Partial<CustomField>) => {
    const updatedFields = [...countryFields]
    updatedFields[index] = { ...updatedFields[index], ...field }
    setCountryFields(updatedFields)
  }

  // Save country configuration
  const saveCountryConfiguration = () => {
    if (!selectedCountry) {
      toast({
        title: "Error",
        description: "Please select a country",
        variant: "destructive",
      })
      return
    }

    // Enhanced validation for payment-link URLs
    if (countryType === 'payment-link') {
      if (!countryUrl || countryUrl.trim().length === 0) {
        toast({
          title: "Error",
          description: "Payment URL is required for payment links",
          variant: "destructive",
        })
        return
      }

      const url = countryUrl.trim()
      
      // Check if URL starts with http:// or https://
      if (!url.match(/^https?:\/\//i)) {
        toast({
          title: "Error",
          description: "Payment URL must start with http:// or https://",
          variant: "destructive",
        })
        return
      }

      // Check if it's a valid URL format with domain
      const domainPattern = /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/
      if (!domainPattern.test(url)) {
        toast({
          title: "Error",
          description: "Please enter a complete and valid URL (e.g., https://paypal.com/checkout)",
          variant: "destructive",
        })
        return
      }
    }

    if (countryType === 'manual' && countryFields.length === 0) {
      toast({
        title: "Error", 
        description: "Please add at least one payment field for manual payment method",
        variant: "destructive",
      })
      return
    }

    const newCountryConfig: ConfiguredCountry = {
      code: selectedCountry,
      name: getCountryName(selectedCountry),
      type: countryType,
      fields: countryFields,
      url: countryType === 'payment-link' ? countryUrl : "",
      instructions: countryInstructions
    }

    // Update or add country configuration
    const existingIndex = configuredCountries.findIndex(c => c.code === selectedCountry)
    let updatedCountries: ConfiguredCountry[]
    
    if (existingIndex >= 0) {
      updatedCountries = [...configuredCountries]
      updatedCountries[existingIndex] = newCountryConfig
    } else {
      updatedCountries = [...configuredCountries, newCountryConfig]
    }
    
    setConfiguredCountries(updatedCountries)

    // Reset form
    setSelectedCountry("")
    setCountryType('manual')
    setCountryFields([])
    setCountryUrl("")
    setCountryInstructions("")
    setEditingCountry(null)

    // Trigger form validation
    form.trigger('countries')

    toast({
      title: "Success",
      description: `${newCountryConfig.name} configuration saved`,
    })
  }

  // Edit country configuration
  const editCountryConfiguration = (country: ConfiguredCountry) => {
    setSelectedCountry(country.code)
    setCountryType(country.type)
    setCountryFields(country.fields)
    setCountryUrl(country.url || "")
    setCountryInstructions(country.instructions || "")
    setEditingCountry(country.code)
  }

  // Remove country configuration
  const removeCountryConfiguration = (countryCode: string) => {
    setConfiguredCountries(configuredCountries.filter(c => c.code !== countryCode))
  }

  // Cancel editing
  const cancelEditing = () => {
    setSelectedCountry("")
    setCountryType('manual')
    setCountryFields([])
    setCountryUrl("")
    setCountryInstructions("")
    setEditingCountry(null)
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 2MB",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingImage(true)
      
      // Get current user
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Upload to Supabase Storage
      const result = await storageService.uploadPaymentMethodImage(file, user.id)
      
      setImagePreview(result.url)
      form.setValue('image_url', result.url)
      
      toast({
        title: "Image Uploaded",
        description: "Payment method image uploaded successfully",
      })
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast({
        title: "Error",
        description: error.message || 'Failed to upload image',
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle image removal
  const handleImageRemove = () => {
    setImagePreview('')
    form.setValue('image_url', "")
    toast({
      title: "Image Removed",
      description: "Payment method image has been removed",
    })
  }

  // Submit form
  async function onSubmit(values: PaymentMethodFormValues) {
    if (configuredCountries.length === 0) {
      toast({
        title: "Error",
        description: "Please configure at least one country",
        variant: "destructive",
      })
      return
    }

    // Additional validation for payment-link URLs in configured countries
    for (const country of configuredCountries) {
      if (country.type === 'payment-link') {
        if (!country.url || country.url.trim().length === 0) {
          toast({
            title: "Error",
            description: `Payment URL is required for ${country.name} (payment-link type)`,
            variant: "destructive",
          })
          return
        }

        const url = country.url.trim()
        if (!url.match(/^https?:\/\//i)) {
          toast({
            title: "Error",
            description: `Invalid URL for ${country.name}. URL must start with http:// or https://`,
            variant: "destructive",
          })
          return
        }

        // Check if it's a valid URL format with domain
        const domainPattern = /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/
        if (!domainPattern.test(url)) {
          toast({
            title: "Error",
            description: `Invalid URL format for ${country.name}. Please enter a complete and valid URL.`,
            variant: "destructive",
          })
          return
        }
      }
    }

    try {
      setIsLoading(true)
      
      // Determine the overall payment method type based on configured countries
      const hasPaymentLinkCountries = configuredCountries.some(country => country.type === 'payment-link')
      const hasManualCountries = configuredCountries.some(country => country.type === 'manual')
      
      // If all countries are payment-link, set type to payment-link
      // If mixed or all manual, we'll set it to manual but include country-specific URLs
      const overallType: 'manual' | 'payment-link' = hasPaymentLinkCountries && !hasManualCountries ? 'payment-link' : 'manual'
      
      // For payment-link type, try to use a common URL if all countries have the same URL
      let mainUrl = null
      if (overallType === 'payment-link') {
        const paymentLinkCountries = configuredCountries.filter(c => c.type === 'payment-link')
        const firstUrl = paymentLinkCountries[0]?.url
        const allSameUrl = paymentLinkCountries.every(c => c.url === firstUrl)
        if (allSameUrl && firstUrl) {
          mainUrl = firstUrl
        }
      }
      
      // Build country-specific details and extract main custom_fields
      const countryCodes: string[] = []
      let mainCustomFields: CustomField[] = []
      let mainInstructions = ''
      
      configuredCountries.forEach(country => {
        countryCodes.push(country.code)
        
        // Use the first country's fields as the main custom_fields
        // This works for most cases where users create single-country payment methods
        if (mainCustomFields.length === 0 && country.fields.length > 0) {
          mainCustomFields = country.fields
          mainInstructions = country.instructions || ''
        }
      })

      const paymentMethodData = {
        ...values,
        type: overallType,
        url: mainUrl,
        countries: countryCodes,
        custom_fields: mainCustomFields, // Set the main custom_fields for the API
        instructions: mainInstructions || values.instructions, // Use country instructions or form instructions
        display_order: 0
      }

      console.log('Saving payment method with data:', paymentMethodData)

      if (initialData?.id) {
        await paymentMethodsApi.update(initialData.id, paymentMethodData)
        toast({
          title: "Payment Method Updated",
          description: `${values.name} has been updated successfully. Changes are now live.`,
        })
      } else {
        await paymentMethodsApi.create(paymentMethodData)
        toast({
          title: "Payment Method Created",
          description: `${values.name} has been created successfully and is now available for checkout.`,
        })
      }
      
      setRefreshFlag()
      onSuccess?.()
      
      // Navigate back to payment methods list
      router.push('/payment-methods')
    } catch (error) {
      console.error("Error saving payment method:", error)
      const action = initialData?.id ? "update" : "create"
      toast({
        title: `Failed to ${action} payment method`,
        description: error instanceof Error ? error.message : `Unable to ${action} payment method. Please check your connection and try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get available countries (not yet configured)
  const availableCountries = countries.filter(country => 
    !configuredCountries.some(configured => configured.code === country.code) ||
    editingCountry === country.code
  )

  return (
    <div className="p-6 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Bank Transfer" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of this payment method..."
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Payment Method Image
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {/* Image Upload Area */}
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {imagePreview ? (
                            <div className="space-y-3">
                              <div className="relative inline-block">
                                <img
                                  src={imagePreview}
                                  alt="Payment method preview"
                                  className="h-32 w-32 object-cover rounded-lg mx-auto"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setImagePreview('')
                                    form.setValue('image_url', '')
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Click to change image
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                                {uploadingImage ? (
                                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                                ) : (
                                  <Upload className="h-6 w-6 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG, WebP up to 2MB
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Hidden file input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />

                        {/* Image URL Input */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Or enter image URL</label>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            value={imagePreview}
                            onChange={(e) => {
                              setImagePreview(e.target.value)
                              form.setValue('image_url', e.target.value)
                            }}
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload an image to display alongside this payment method on checkout pages. Recommended size: 200x200px.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Country Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Country Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure payment details for each country where this method will be available
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Country Selection and Configuration */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">
                  {editingCountry ? `Edit ${getCountryName(editingCountry)}` : "Add New Country"}
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Select Country</label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCountries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name} ({country.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Payment Type</label>
                    <Select value={countryType} onValueChange={(value: 'manual' | 'payment-link') => setCountryType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Payment</SelectItem>
                        <SelectItem value="payment-link">Payment Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Manual Payment Fields - Simplified */}
                {countryType === 'manual' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Payment Information</label>
                      <Button type="button" variant="outline" size="sm" onClick={addCustomField}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Field
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {countryFields.map((field, index) => (
                        <div key={field.id} className="border rounded p-3 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Label</label>
                              <Input
                                placeholder="Account Number"
                                value={field.label}
                                onChange={(e) => updateCustomField(index, { label: e.target.value })}
                              />
                            </div>

                            <div className="relative">
                              <label className="text-sm font-medium mb-1 block">Value</label>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="1234567890"
                                  value={field.value || ""}
                                  onChange={(e) => updateCustomField(index, { value: e.target.value })}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCustomField(index)}
                                  className="h-10 w-10 p-0 flex-shrink-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.required}
                              onCheckedChange={(checked) => updateCustomField(index, { required: !!checked })}
                            />
                            <label className="text-sm">Required field</label>
                          </div>
                        </div>
                      ))}

                      {countryFields.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed rounded">
                          <p className="text-sm text-muted-foreground mb-2">
                            No payment information configured
                          </p>
                          <Button type="button" variant="outline" size="sm" onClick={addCustomField}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add First Field
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Link URL */}
                {countryType === 'payment-link' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment URL</label>
                    <Input
                      placeholder="https://paypal.me/yourname or https://stripe.com/checkout/..."
                      value={countryUrl}
                      onChange={(e) => setCountryUrl(e.target.value)}
                      className={`${countryUrl && !countryUrl.match(/^https?:\/\//i) ? 'border-red-300 focus:border-red-500' : ''}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the complete URL where customers will be redirected to complete payment. 
                      Must start with http:// or https://
                    </p>
                    {countryUrl && !countryUrl.match(/^https?:\/\//i) && (
                      <p className="text-xs text-red-600">
                        ⚠️ URL must start with http:// or https://
                      </p>
                    )}
                  </div>
                )}

                {/* Instructions */}
                <div>
                  <label className="text-sm font-medium">Instructions</label>
                  <Textarea
                    placeholder="Enter specific instructions for this country..."
                    value={countryInstructions}
                    onChange={(e) => setCountryInstructions(e.target.value)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button type="button" onClick={saveCountryConfiguration}>
                    {editingCountry ? "Update Country" : "Save Country"}
                  </Button>
                  {editingCountry && (
                    <Button type="button" variant="outline" onClick={cancelEditing}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {/* Configured Countries */}
              {configuredCountries.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Configured Countries</h4>
                  <div className="grid gap-3">
                    {configuredCountries.map((country) => (
                      <div key={country.code} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">{country.code}</Badge>
                            <div>
                              <p className="font-medium">{country.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {country.type === 'manual' 
                                  ? `${country.fields.length} payment fields` 
                                  : 'Payment link'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => editCountryConfiguration(country)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCountryConfiguration(country.code)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push('/payment-methods')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : initialData ? "Update Payment Method" : "Create Payment Method"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 