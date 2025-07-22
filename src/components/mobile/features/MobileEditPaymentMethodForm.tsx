"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ArrowLeftIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid"
import { Upload, Trash2, X } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { mobileToastMessages } from "@/lib/mobile-toast"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { paymentMethodsApi, countriesApi, CustomField, PaymentMethod } from "@/lib/supabase/client-api"
import { storageService } from "@/lib/supabase/storage"
import { createClient } from "@/lib/supabase/client"
import { useRef } from "react"

// Schema matching create form
const mobileEditPaymentMethodSchema = z.object({
  name: z.string().min(1, "Payment method name is required"),
  type: z.enum(["manual", "payment-link"]),
  description: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]),
  instructions: z.string().optional(),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  image_url: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
  countries: z.array(z.string()).min(1, "At least one country must be selected"),
  custom_fields: z.array(z.object({
    id: z.string(),
    label: z.string().min(1, "Field name is required"),
    value: z.string().min(1, "Field value is required"),
    required: z.boolean(),
    type: z.string(),
    placeholder: z.string(),
  })).optional(),
})

type MobileEditPaymentMethodValues = z.infer<typeof mobileEditPaymentMethodSchema>

interface Country {
  id: string
  name: string
  code: string
}

interface MobileEditPaymentMethodFormProps {
  initialData: PaymentMethod
}

export function MobileEditPaymentMethodForm({ initialData }: MobileEditPaymentMethodFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingCountries, setLoadingCountries] = useState(false)
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image_url || '')
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const form = useForm<MobileEditPaymentMethodValues>({
    resolver: zodResolver(mobileEditPaymentMethodSchema),
    defaultValues: {
      name: initialData.name || "",
      type: initialData.type || "manual",
      description: initialData.description || "",
      status: initialData.status || "active",
      instructions: initialData.instructions || "",
      url: initialData.url || "",
      image_url: initialData.image_url || "",
      countries: initialData.countries || [],
      custom_fields: [],
    },
  })

  const paymentType = form.watch("type")

  useEffect(() => {
    loadCountries()
    // Initialize custom fields from existing data
    if (initialData.custom_fields && Array.isArray(initialData.custom_fields)) {
      setCustomFields(initialData.custom_fields)
    }
  }, [])

  // Update form when custom fields change
  useEffect(() => {
    const formattedFields = customFields.map(field => ({
      id: field.id,
      label: field.label || "",
      value: field.value || "",
      required: field.required || false,
      type: field.type || "text",
      placeholder: field.placeholder || "",
    }))
    form.setValue("custom_fields", formattedFields)
  }, [customFields, form])

  const loadCountries = async () => {
    try {
      setLoadingCountries(true)
      const countriesData = await countriesApi.getAll()
      const formattedCountries = countriesData
        .filter(country => country.id && country.name && country.code)
        .map(country => ({
          id: country.id!,
          name: country.name!,
          code: country.code!,
        }))
      setCountries(formattedCountries)
    } catch (error) {
      console.error('Error loading countries:', error)
      mobileToastMessages.general.loadError("countries")
    } finally {
      setLoadingCountries(false)
    }
  }

  const addCustomField = () => {
    const newField: CustomField = {
      id: Math.random().toString(36).substr(2, 9),
      label: "",
      value: "",
      required: false,
      type: "text",
      placeholder: "",
    }
    setCustomFields([...customFields, newField])
  }

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields(customFields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ))
  }

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter(field => field.id !== id))
  }

  // Handle image upload - Using desktop working implementation
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      mobileToastMessages.paymentMethod.uploadError("Please select a valid image file")
      return
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      mobileToastMessages.paymentMethod.uploadError("Image size must be less than 2MB")
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

      // Upload to Supabase Storage using the working desktop method
      const result = await storageService.uploadPaymentMethodImage(file, user.id)
      
      setImagePreview(result.url)
      form.setValue('image_url', result.url)
      
      mobileToastMessages.paymentMethod.imageUploaded()
    } catch (error: any) {
      console.error('Error uploading image:', error)
      mobileToastMessages.paymentMethod.uploadError(error.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle image removal
  const handleImageRemove = () => {
    setImagePreview('')
    form.setValue('image_url', "")
    mobileToastMessages.paymentMethod.imageRemoved()
  }

  async function onSubmit(values: MobileEditPaymentMethodValues) {
    try {
      setIsLoading(true)

      const payload = {
        name: values.name,
        type: values.type,
        description: values.description || null,
        status: values.status,
        instructions: values.instructions || null,
        url: values.type === "payment-link" ? values.url || null : null,
        image_url: values.image_url || null,
        countries: values.countries,
        custom_fields: customFields.length > 0 ? customFields : null,
      }

      if (initialData.id) {
        await paymentMethodsApi.update(initialData.id, payload)
      }

      mobileToastMessages.paymentMethod.updated()

      router.push('/m/payment-methods')
    } catch (error) {
      console.error("Payment method update error:", error)
      
      let errorMessage = "Failed to update payment method. Please check your connection and try again."
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      mobileToastMessages.paymentMethod.updateError(errorMessage)
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
            Edit Payment Method
          </h1>
          <p className="text-xs text-muted-foreground font-roboto">
            Update payment method settings
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            <span className="text-sm text-muted-foreground">Updating...</span>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          
          {/* Basic Information */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium font-roboto">Payment Method Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Bank Transfer, PayPal, etc."
                    {...field}
                    className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium font-roboto">Payment Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="manual" className="text-xs">Manual Payment</SelectItem>
                    <SelectItem value="payment-link" className="text-xs">Payment Link</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment URL for payment-link type */}
          {paymentType === "payment-link" && (
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium font-roboto">Payment URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://payment-processor.com/pay"
                      {...field}
                      className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
                    <SelectItem value="active" className="text-xs">Active</SelectItem>
                    <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
                    <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium font-roboto">Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description of this payment method"
                    {...field}
                    className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Countries */}
          <FormField
            control={form.control}
            name="countries"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium font-roboto">Countries</FormLabel>
                
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
                        {country.name} ({country.code})
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
                
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Information (Custom Fields) */}
          {paymentType === "manual" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-foreground font-roboto">Payment Information</h3>
                <Button
                  type="button"
                  onClick={addCustomField}
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                >
                  <PlusIcon className="size-3 mr-1" />
                  Add Field
                </Button>
              </div>

              {customFields.length === 0 ? (
                <div className="text-center py-4 border border-dashed rounded-lg">
                  <p className="text-xs text-muted-foreground font-roboto">
                    No payment information configured
                  </p>
                  <Button
                    type="button"
                    onClick={addCustomField}
                    size="sm"
                    variant="ghost"
                    className="mt-2 text-xs"
                  >
                    <PlusIcon className="size-3 mr-1" />
                    Add First Field
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {customFields.map((field) => (
                    <div key={field.id} className="border border-border rounded-lg p-3">
                      {/* Field Name and Value on same line */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="block text-xs font-medium text-foreground font-roboto mb-1">
                            Field Name
                          </label>
                          <Input
                            placeholder="Account Number"
                            value={field.label}
                            onChange={(e) => updateCustomField(field.id, { label: e.target.value })}
                            className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-foreground font-roboto mb-1">
                            Field Value
                          </label>
                          <Input
                            placeholder="1234567890"
                            value={field.value}
                            onChange={(e) => updateCustomField(field.id, { value: e.target.value })}
                            className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`required-${field.id}`}
                            checked={field.required}
                            onCheckedChange={(checked) => 
                              updateCustomField(field.id, { required: checked as boolean })
                            }
                          />
                          <label htmlFor={`required-${field.id}`} className="text-xs font-roboto">
                            Required field
                          </label>
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeCustomField(field.id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <TrashIcon className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium font-roboto">Instructions for Users</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter specific instructions for customers using this payment method..."
                    {...field}
                    className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image Upload - Working Desktop Implementation */}
          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium font-roboto">Payment Method Image</FormLabel>
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
                                handleImageRemove()
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
                        className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-violet-600 hover:bg-violet-700 text-white font-roboto font-normal"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span className="text-xs">Updating...</span>
                </div>
              ) : (
                <span className="text-xs">Update Payment Method</span>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}