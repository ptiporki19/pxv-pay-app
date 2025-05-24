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
import { Card, CardContent } from "@/components/ui/card"
import { Country, PaymentMethod, CustomField, countriesApi, paymentMethodsApi } from "@/lib/supabase/client-api"
import { useAdminStore } from "@/lib/store/admin-store"
import { 
  paymentMethodFormSchema, 
  PaymentMethodFormValues,
  CustomFieldType
} from "@/lib/validations/admin-forms"
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react"
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

interface PaymentMethodFormProps {
  initialData?: PaymentMethod
  onSuccess?: () => void
}

export function PaymentMethodFormProfessional({ initialData, onSuccess }: PaymentMethodFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const closeModal = useAdminStore((state) => state.closeModal)
  const setRefreshFlag = useAdminStore((state) => state.setRefreshFlag)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { showSuccess, showError } = useNotificationActions()
  
  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countriesList = await countriesApi.getAll()
        setCountries(countriesList)
      } catch (error) {
        console.error("Error fetching countries:", error)
        showError("Failed to fetch countries list")
      }
    }
    
    fetchCountries()
  }, [showError])

  // Initialize the form
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      type: initialData.type,
      countries: initialData.countries,
      status: initialData.status,
      instructions: initialData.instructions || "",
      description: initialData.description || "",
      custom_fields: initialData.custom_fields || [],
      icon: initialData.icon || null,
      url: initialData.url || "",
    } : {
      name: "",
      type: "manual",
      countries: [],
      status: "inactive",
      instructions: "",
      description: "",
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
    // Clear custom fields when type is not 'manual'
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

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreviewUrl(result)
      form.setValue("icon", result)
    }
    reader.readAsDataURL(file)
  }

  // Add new custom field
  const addCustomField = () => {
    const newField: CustomFieldType = {
      id: `field_${Date.now()}`,
      label: "",
      type: "text",
      placeholder: "",
      required: false,
      value: ""
    }
    append(newField)
  }

  // Handle form submission
  async function onSubmit(values: PaymentMethodFormValues) {
    try {
      setIsLoading(true)
      
      let submissionData = { ...values }

      // If there's a new file to upload, set the base64 string to the icon field
      if (previewUrl && previewUrl !== initialData?.icon) {
        submissionData.icon = previewUrl;
      }

      // Ensure URL is null if not a payment-link
      if (submissionData.type !== 'payment-link') {
        submissionData.url = null;
      }

      // Ensure custom_fields is null if not a manual payment method
      if (submissionData.type !== 'manual') {
        submissionData.custom_fields = undefined;
      }
      
      if (initialData?.id) {
        // Update existing payment method
        await paymentMethodsApi.update(initialData.id, submissionData as PaymentMethod)
        showSuccess(`Payment method "${submissionData.name}" updated successfully`)
      } else {
        // Create new payment method
        await paymentMethodsApi.create(submissionData as PaymentMethod)
        showSuccess(`Payment method "${submissionData.name}" created successfully`)
      }
      
      // Trigger refresh and close the modal
      setRefreshFlag()
      closeModal()
      
      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error saving payment method:", error)
      let errorMessage = "There was an error processing your request";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Check for Zod validation errors specifically for the URL field
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
    <div className="w-full max-w-none p-8 space-y-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          {/* Header Section - Name and Type */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border-2 border-blue-200">
            <div className="grid grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl font-bold text-gray-900 mb-3 block">
                      Payment Method Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={
                          selectedType === 'payment-link' ? 'PayPal Checkout' : 
                          selectedType === 'manual' ? 'Orange Money' :
                          'Payment Method Name'
                        } 
                        {...field} 
                        className="h-14 text-lg border-2 border-gray-300 focus:border-blue-500"
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
                    <FormLabel className="text-xl font-bold text-gray-900 mb-3 block">
                      Payment Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 text-lg border-2 border-gray-300 focus:border-blue-500">
                          <SelectValue placeholder="Select payment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manual">Manual Payment</SelectItem>
                        <SelectItem value="payment-link">Payment Link</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="mobile">Mobile Money</SelectItem>
                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-base text-gray-700 mt-3 font-medium">
                      {selectedType === 'manual' && "✨ Create a custom payment method with your own fields"}
                      {selectedType === 'payment-link' && "🔗 Redirect customers to an external payment URL"}
                      {selectedType === 'bank' && "🏦 Traditional bank transfer method"}
                      {selectedType === 'mobile' && "📱 Mobile money payment method"}
                      {selectedType === 'crypto' && "₿ Cryptocurrency payment method"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Main Content - 3 Column Professional Layout */}
          <div className="grid grid-cols-3 gap-10">
            
            {/* LEFT COLUMN - Basic Information */}
            <div className="bg-white p-8 rounded-xl border-2 border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">
                📋 Basic Information
              </h2>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-800">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this payment method is for..."
                          className="min-h-28 text-base border-2 border-gray-300 focus:border-blue-500 resize-none"
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-600">
                        Brief description for your reference
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-800">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-base border-2 border-gray-300 focus:border-blue-500">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">🟢 Active</SelectItem>
                          <SelectItem value="pending">🟡 Pending</SelectItem>
                          <SelectItem value="inactive">🔴 Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-800">Payment Icon</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleIconChange}
                            className="cursor-pointer text-base py-4 border-2 border-gray-300 focus:border-blue-500"
                          />
                          {previewUrl && (
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2">
                              <img
                                src={previewUrl}
                                alt="Icon preview"
                                className="w-20 h-20 object-contain border-2 rounded"
                              />
                              <span className="text-base text-gray-700 font-medium">Preview</span>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription className="text-sm text-gray-600">
                        Upload icon (64x64px recommended)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* MIDDLE COLUMN - Configuration */}
            <div className="bg-white p-8 rounded-xl border-2 border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">
                ⚙️ Configuration
              </h2>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="countries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-800">Supported Countries</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between h-12 text-base border-2 border-gray-300 hover:border-blue-500",
                                !(field.value && field.value.length) && "text-muted-foreground"
                              )}
                            >
                              {(field.value && field.value.length)
                                ? `${field.value.length} countries selected`
                                : "Select countries"}
                              <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search countries..." />
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {countries.map((country) => (
                                <CommandItem
                                  key={country.code}
                                  value={country.code}
                                  onSelect={() => {
                                    const currentValue = field.value || [];
                                    const updatedValue = currentValue.includes(country.code)
                                      ? currentValue.filter((code) => code !== country.code)
                                      : [...currentValue, country.code]
                                    field.onChange(updatedValue)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      (field.value && field.value.includes(country.code)) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {country.name} ({country.code})
                                </CommandItem>
                              ))}
                              <CommandItem
                                value="Global"
                                onSelect={() => {
                                  const currentValue = field.value || [];
                                  const updatedValue = currentValue.includes("Global")
                                    ? currentValue.filter((code) => code !== "Global")
                                    : ["Global"]
                                  field.onChange(updatedValue)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    (field.value && field.value.includes("Global")) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                🌍 Global (Available Everywhere)
                              </CommandItem>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription className="text-sm text-gray-600">
                        Select countries or "Global" for everywhere
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Link URL - Only show when type is payment-link */}
                {selectedType === 'payment-link' && (
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-gray-800">Payment URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://paypal.me/yourlink" 
                            {...field} 
                            value={field.value || ''}
                            className="h-12 text-base border-2 border-gray-300 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-600">
                          Customer redirect URL for payment
                        </FormDescription>
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
                      <FormLabel className="text-lg font-semibold text-gray-800">Payment Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={
                            selectedType === 'payment-link' 
                              ? 'Click the link above to complete payment...'
                              : selectedType === 'manual'
                              ? 'Fill in the required fields below...'
                              : 'Enter payment instructions...'
                          }
                          className="min-h-28 text-base border-2 border-gray-300 focus:border-blue-500 resize-none"
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-gray-600">
                        Instructions for customers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* RIGHT COLUMN - Custom Fields */}
            <div className="bg-white p-8 rounded-xl border-2 border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  🔧 Custom Payment Fields
                </h2>
                {selectedType === 'manual' && (
                  <Button
                    type="button"
                    variant="default"
                    size="lg"
                    onClick={addCustomField}
                    className="h-12 px-6 text-base bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Field
                  </Button>
                )}
              </div>
              
              {selectedType === 'manual' ? (
                <div className="space-y-5 max-h-96 overflow-y-auto">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-6 border-2 border-gray-300">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">Field {index + 1}</span>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(index)}
                            className="h-10 w-10 p-0"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={form.control}
                            name={`custom_fields.${index}.label`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-semibold">Field Label</FormLabel>
                                <FormControl>
                                  <Input placeholder="Account Number" {...field} className="h-11 text-base border-2" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`custom_fields.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-semibold">Field Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-11 text-base border-2">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="text">📝 Text</SelectItem>
                                    <SelectItem value="number">🔢 Number</SelectItem>
                                    <SelectItem value="email">📧 Email</SelectItem>
                                    <SelectItem value="tel">📞 Phone</SelectItem>
                                    <SelectItem value="textarea">📄 Long Text</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`custom_fields.${index}.placeholder`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-semibold">Placeholder</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter placeholder text..." {...field} className="h-11 text-base border-2" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`custom_fields.${index}.required`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 bg-gray-50 rounded">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="h-5 w-5"
                                  />
                                </FormControl>
                                <FormLabel className="text-base font-semibold cursor-pointer">
                                  Required field
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {fields.length === 0 && (
                    <div className="text-center text-gray-500 py-16 border-4 border-dashed border-gray-300 rounded-xl">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-xl font-semibold mb-2">No custom fields added yet</p>
                      <p className="text-lg">Click "Add Field" to create fields for customers to fill</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-16">
                  <div className="text-6xl mb-4">⚡</div>
                  <p className="text-xl font-semibold mb-2">Custom fields are only available for manual payment methods</p>
                  <p className="text-lg">Select "Manual Payment" to add custom fields</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-6 pt-8 border-t-4 border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeModal}
              disabled={isLoading}
              className="px-10 py-4 text-lg font-semibold h-14 border-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="px-10 py-4 text-lg font-semibold h-14 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Saving..." : initialData ? "Update Payment Method" : "Create Payment Method"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 