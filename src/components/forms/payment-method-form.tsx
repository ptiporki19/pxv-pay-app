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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Country, PaymentMethod, countriesApi, paymentMethodsApi } from "@/lib/supabase/client-api"
import { useAdminStore } from "@/lib/store/admin-store"
import { 
  paymentMethodFormSchema, 
  PaymentMethodFormValues,
} from "@/lib/validations/admin-forms" // Only import the refined schema
import { Check, ChevronsUpDown } from "lucide-react"
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

interface PaymentMethodFormProps {
  initialData?: PaymentMethod
  onSuccess?: () => void
}

// The form will now consistently use PaymentMethodFormValues

export function PaymentMethodForm({ initialData, onSuccess }: PaymentMethodFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const closeModal = useAdminStore((state) => state.closeModal)
  const setRefreshFlag = useAdminStore((state) => state.setRefreshFlag)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
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
          variant: "destructive"
        })
      }
    }
    
    fetchCountries()
  }, [])

  // Initialize the form using the single refined schema
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      type: initialData.type,
      countries: initialData.countries,
      status: initialData.status,
      instructions: initialData.instructions || "",
      icon: initialData.icon || null,
      url: initialData.url || "", // url is now part of PaymentMethod and PaymentMethodFormValues
    } : {
      name: "",
      type: "bank", // Default type
      countries: [],
      status: "inactive",
      instructions: "",
      icon: null,
      url: "",
    },
  })

  // Watch the 'type' field to conditionally render the URL input
  const selectedType = form.watch("type")

  // Effect to clear URL when type is not 'payment-link'
  useEffect(() => {
    if (selectedType !== 'payment-link') {
      form.setValue('url', '') // Clear the URL field
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
      toast({ 
        title: "Error", 
        description: "Icon must be less than 2MB", 
        variant: "destructive" 
      })
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

  // Handle form submission
  async function onSubmit(values: PaymentMethodFormValues) {
    try {
      setIsLoading(true)
      
      let submissionData = { ...values }

      // If there's a new file to upload, set the base64 string to the icon field
      if (previewUrl && previewUrl !== initialData?.icon) {
        submissionData.icon = previewUrl;
      }

      // Ensure URL is null if not a payment-link (schema handles if it's required for payment-link)
      if (submissionData.type !== 'payment-link') {
        submissionData.url = null;
      }
      
      if (initialData?.id) {
        // Update existing payment method
        await paymentMethodsApi.update(initialData.id, submissionData as PaymentMethod)
        toast({ title: "Payment method updated", description: "The payment method was updated successfully" })
      } else {
        // Create new payment method
        await paymentMethodsApi.create(submissionData as PaymentMethod)
        toast({ title: "Payment method created", description: "The payment method was created successfully" })
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{selectedType === 'payment-link' ? 'Payment Link Name' : 'Method Name'}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={selectedType === 'payment-link' ? 'PayPal Checkout' : 'Bank Transfer (USD)'} 
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
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  // No need to call setSelectedType, form.watch handles it
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="mobile">Mobile Money</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="payment-link">Payment Link</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* URL field for payment links */}
        {selectedType === 'payment-link' && (
          <FormField
            control={form.control}
            name="url" // URL field is always present in PaymentMethodFormValues
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://paypal.me/yourlink" 
                    {...field} 
                    value={field.value || ''} // Ensure value is not null/undefined for input
                  />
                </FormControl>
                <FormDescription>
                  Enter the URL where customers will be redirected to complete payment.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
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
              <FormLabel>
                {selectedType === 'payment-link' ? 'Instructions for Customers' : 'Payment Instructions'}
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={
                    selectedType === 'payment-link' 
                      ? 'Click the link above to complete your payment securely...'
                      : 'Enter payment instructions here...'
                  }
                  className="min-h-24"
                  {...field} 
                  value={field.value || ''} // Ensure value is not null/undefined for textarea
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