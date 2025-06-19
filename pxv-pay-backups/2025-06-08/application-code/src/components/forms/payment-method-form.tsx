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
        {/* Primary Fields - Name and Type */}
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Payment Method Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={
                      selectedType === 'payment-link' ? 'PayPal Checkout' : 
                      selectedType === 'manual' ? 'Bank Transfer / Mobile Money / Crypto' :
                      'Payment Method Name'
                    } 
                    {...field} 
                    className="h-11"
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
                <FormLabel className="text-base font-semibold">Payment Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="manual">Manual Payment</SelectItem>
                    <SelectItem value="payment-link">Payment Link</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs">
                  {selectedType === 'manual' && "Create a custom payment method with your own fields"}
                  {selectedType === 'payment-link' && "Redirect customers to an external payment URL"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Main Content Area - 3 Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this payment method is for..."
                      className="min-h-20 resize-none"
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Brief description for your reference.
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
                        className="cursor-pointer text-xs"
                      />
                      {previewUrl && (
                        <div className="flex items-center gap-2">
                          <img
                            src={previewUrl}
                            alt="Icon preview"
                            className="w-12 h-12 object-contain border rounded"
                          />
                          <span className="text-xs text-muted-foreground">Preview</span>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Upload icon (64x64px recommended)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Middle Column */}
          <div className="space-y-4">
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
                  <FormDescription className="text-xs">
                    Select countries or "Global" for everywhere.
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
                    <FormLabel>Payment URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://paypal.me/yourlink" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Customer redirect URL for payment.
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
                  <FormLabel>Payment Instructions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={
                        selectedType === 'payment-link' 
                          ? 'Click the link above to complete payment...'
                          : selectedType === 'manual'
                          ? 'Fill in the required fields below...'
                          : 'Enter payment instructions...'
                      }
                      className="min-h-20 resize-none"
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Instructions for customers.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right Column - Custom Fields for Manual Payments */}
          <div className="space-y-4">
            {selectedType === 'manual' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base font-medium">Custom Payment Fields</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomField}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Field
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Field {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name={`custom_fields.${index}.label`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Field Label" {...field} className="text-xs" />
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="text-xs">
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
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`custom_fields.${index}.placeholder`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Placeholder text..." {...field} className="text-xs" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`custom_fields.${index}.required`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-xs">Required field</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                  
                  {fields.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed rounded-lg">
                      <p>No custom fields added yet.</p>
                      <p className="text-xs">Click "Add Field" to create fields for customers to fill.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {selectedType !== 'manual' && (
              <div className="text-center text-muted-foreground text-sm py-8">
                <p>Custom fields are only available for manual payment methods.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
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