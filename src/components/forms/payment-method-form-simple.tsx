"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Country, PaymentMethod, countriesApi, paymentMethodsApi } from "@/lib/supabase/client-api"
import { 
  paymentMethodFormSchema, 
  PaymentMethodFormValues,
  CustomFieldType
} from "@/lib/validations/admin-forms"
import { Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNotificationActions } from "@/providers/notification-provider"
import { useRouter } from "next/navigation"

interface PaymentMethodFormProps {
  initialData?: PaymentMethod
}

export function PaymentMethodFormSimple({ initialData }: PaymentMethodFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [countriesLoading, setCountriesLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { showSuccess, showError } = useNotificationActions()
  const router = useRouter()
  
  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setCountriesLoading(true)
        console.log("Starting to fetch countries...")
        const countriesList = await countriesApi.getAll()
        setCountries(countriesList)
        console.log("Countries loaded:", countriesList.length)
        console.log("Countries data:", countriesList)
      } catch (error) {
        console.error("Error fetching countries:", error)
        showError("Failed to fetch countries list")
      } finally {
        setCountriesLoading(false)
      }
    }
    
    fetchCountries()
  }, [])

  // Initialize the form
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      type: initialData.type,
      countries: initialData.countries,
      status: initialData.status,
      instructions: initialData.instructions || "",
      custom_fields: initialData.custom_fields || [],
      icon: initialData.icon || null,
      url: initialData.url || "",
    } : {
      name: "",
      type: "manual",
      countries: [],
      status: "active",
      instructions: "",
      custom_fields: [],
      icon: null,
      url: "",
    },
  })

  // Custom fields array management
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "custom_fields"
  })

  // Watch the 'type' field to conditionally render sections
  const selectedType = form.watch("type")

  // Effect to clear URL when type is not 'payment-link'
  useEffect(() => {
    if (selectedType !== 'payment-link') {
      form.setValue('url', '')
    }
    if (selectedType !== 'manual') {
      form.setValue('custom_fields', [])
    }
  }, [selectedType, form])

  // Show icon preview if it exists
  useEffect(() => {
    if (initialData?.icon) {
      setPreviewUrl(initialData.icon)
    }
  }, [initialData])

  // Handle icon upload
  const handleIconChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      showError("Icon must be less than 2MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreviewUrl(result)
      form.setValue("icon", result)
    }
    reader.readAsDataURL(file)
  }

  // Add new custom field with simplified structure
  const addCustomField = () => {
    const newField: CustomFieldType = {
      id: `field_${Date.now()}`,
      label: "",
      type: "text",
      placeholder: "",
      required: true,
      value: ""
    }
    append(newField)
  }

  // Handle form submission
  async function onSubmit(values: PaymentMethodFormValues) {
    try {
      setIsLoading(true)
      
      let submissionData = { ...values }

      if (previewUrl && previewUrl !== initialData?.icon) {
        submissionData.icon = previewUrl;
      }

      if (submissionData.type !== 'payment-link') {
        submissionData.url = null;
      }

      if (submissionData.type !== 'manual') {
        submissionData.custom_fields = undefined;
      }
      
      if (initialData?.id) {
        await paymentMethodsApi.update(initialData.id, submissionData as PaymentMethod)
        showSuccess(`Payment method "${submissionData.name}" updated successfully`)
      } else {
        await paymentMethodsApi.create(submissionData as PaymentMethod)
        showSuccess(`Payment method "${submissionData.name}" created successfully`)
      }
      
      router.push('/payment-methods')
    } catch (error) {
      console.error("Error saving payment method:", error)
      let errorMessage = "There was an error processing your request";
      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes("'url'") && error.message.toLowerCase().includes("invalid_string")){
            errorMessage = "Please enter a valid URL for the payment link."
        }
      }
      showError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Header Section - Name and Type */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Payment Method Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={selectedType === 'payment-link' ? 'PayPal Checkout' : 'Orange Money'} 
                        {...field} 
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
                    <FormLabel>Payment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manual">Manual Payment</SelectItem>
                        <SelectItem value="payment-link">Payment Link</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Configuration Section */}
          <div className="grid grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
              
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="countries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supported Countries</FormLabel>
                    <FormDescription>
                      Select the countries where this payment method is available
                    </FormDescription>
                    
                    {/* Debug info in development */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs text-gray-500 space-y-1 p-2 bg-gray-50 rounded">
                        <p>Debug: {countries.length} countries loaded, Loading: {countriesLoading.toString()}</p>
                        <p>Selected: {field.value?.join(', ') || 'None'}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Global Option */}
                      <div className="flex items-center space-x-3 p-3 border rounded-lg bg-blue-50">
                        <Checkbox
                          id="country-global"
                          checked={field.value?.includes("Global") || false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange(["Global"])
                            } else {
                              field.onChange([])
                            }
                          }}
                        />
                        <div className="flex-1">
                          <label htmlFor="country-global" className="font-medium cursor-pointer">
                            Global (Available Everywhere)
                          </label>
                          <p className="text-sm text-gray-600">This payment method will be available in all countries</p>
                        </div>
                      </div>

                      {/* Individual Countries */}
                      {countriesLoading ? (
                        <div className="text-center py-4 text-gray-500">
                          Loading countries...
                        </div>
                      ) : countries.length === 0 ? (
                        <div className="text-center py-4 text-red-600">
                          No countries found. Please add countries first.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Specific Countries:</p>
                          {countries.map((country) => (
                            <div key={country.code} className="flex items-center space-x-3">
                              <Checkbox
                                id={`country-${country.code}`}
                                checked={field.value?.includes(country.code) || false}
                                disabled={field.value?.includes("Global") || false}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || []
                                  const withoutGlobal = currentValue.filter(code => code !== "Global")
                                  
                                  if (checked) {
                                    field.onChange([...withoutGlobal, country.code])
                                  } else {
                                    field.onChange(withoutGlobal.filter(code => code !== country.code))
                                  }
                                }}
                              />
                              <label 
                                htmlFor={`country-${country.code}`} 
                                className={cn(
                                  "flex-1 cursor-pointer text-sm",
                                  field.value?.includes("Global") && "text-gray-400"
                                )}
                              >
                                {country.name} ({country.code})
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Icon</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleIconChange}
                          className="cursor-pointer"
                        />
                        {previewUrl && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                            <img
                              src={previewUrl}
                              alt="Icon preview"
                              className="w-12 h-12 object-contain border rounded"
                            />
                            <span className="text-sm text-gray-600">Preview</span>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Instructions & Settings</h3>
              
              {/* Payment Link URL - Only show when type is payment-link */}
              {selectedType === 'payment-link' && (
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://paypal.me/yourlink" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={
                          selectedType === 'payment-link' 
                            ? 'Click the link above to complete your payment securely...'
                            : 'Provide general instructions for customers on how to use this payment method...'
                        }
                        className="min-h-24 resize-none"
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Payment Details Section - Only for Manual Payments */}
          {selectedType === 'manual' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
                  <p className="text-sm text-gray-600 mt-1">Add the specific account details customers need to complete payment</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomField}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Payment Detail
                </Button>
              </div>
              
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded border">
                    <FormField
                      control={form.control}
                      name={`custom_fields.${index}.label`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Detail Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Account Number, Bitcoin Address" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`custom_fields.${index}.placeholder`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Detail Value</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., 1234567890, bc1q..." 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                          className="p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {fields.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded bg-gray-50">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No payment details added</h4>
                    <p className="text-gray-600 mb-4">Add account details that customers need to complete payment</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addCustomField}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Payment Detail
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/payment-methods')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : initialData ? "Update Payment Method" : "Create Payment Method"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 