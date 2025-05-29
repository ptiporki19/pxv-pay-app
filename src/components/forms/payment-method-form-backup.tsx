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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Country, PaymentMethod, CustomField, countriesApi, paymentMethodsApi } from "@/lib/supabase/client-api"
import { useAdminStore } from "@/lib/store/admin-store"
import { 
  paymentMethodFormSchema, 
  PaymentMethodFormValues,
  CustomFieldType
} from "@/lib/validations/admin-forms"
import { Check, ChevronsUpDown, Plus, Trash2, GripVertical } from "lucide-react"
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

export function PaymentMethodForm({ initialData, onSuccess }: PaymentMethodFormProps) {
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
  const { fields, append, remove, move } = useFieldArray({
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
      
      const submissionData = { ...values }

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={
                        selectedType === 'payment-link' ? 'PayPal Checkout' : 
                        selectedType === 'manual' ? 'Bank Transfer (USD)' :
                        'Payment Method Name'
                      } 
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
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="mobile">Mobile Money</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {selectedType === 'manual' && "Create a custom payment method with your own fields"}
                    {selectedType === 'payment-link' && "Redirect customers to an external payment URL"}
                    {selectedType === 'bank' && "Traditional bank transfer method"}
                    {selectedType === 'mobile' && "Mobile money payment method"}
                    {selectedType === 'crypto' && "Cryptocurrency payment method"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this payment method is for..."
                      className="min-h-20"
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of this payment method for your reference.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Payment Link Configuration */}
        {selectedType === 'payment-link' && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Link Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://paypal.me/yourlink or https://stripe.com/payment-link" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the URL where customers will be redirected to complete payment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Manual Payment Custom Fields */}
        {selectedType === 'manual' && (
          <Card>
            <CardHeader>
              <CardTitle>Custom Payment Fields</CardTitle>
              <FormDescription>
                Create custom fields that customers will fill out when using this payment method.
              </FormDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`custom_fields.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Field Label</FormLabel>
                            <FormControl>
                              <Input placeholder="Account Number" {...field} />
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
                            <FormLabel>Field Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="tel">Phone</SelectItem>
                                <SelectItem value="textarea">Long Text</SelectItem>
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
                            <FormLabel>Placeholder</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your account number..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`custom_fields.${index}.required`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Required Field</FormLabel>
                              <FormDescription>
                                Customer must fill this field
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      className="mt-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addCustomField}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Field
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="countries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supported Countries</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !(field.value && field.value.length) && "text-muted-foreground"
                          )}
                        >
                          {(field.value && field.value.length)
                            ? `${field.value.length} countries selected`
                            : "Select countries"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                            Global (Available Everywhere)
                          </CommandItem>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select the countries where this payment method is available, or select "Global" if available everywhere.
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
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          : selectedType === 'manual'
                          ? 'Please fill in all the required fields and follow the payment instructions...'
                          : 'Enter payment instructions here...'
                      }
                      className="min-h-24"
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide instructions for customers on how to complete this payment method.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method Icon</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleIconChange}
                        className="cursor-pointer"
                      />
                      {previewUrl && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-2">Preview:</p>
                          <img
                            src={previewUrl}
                            alt="Icon preview"
                            className="w-16 h-16 object-contain border rounded"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload an icon for this payment method. Recommended size: 64x64px.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={closeModal}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update Payment Method" : "Create Payment Method"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 