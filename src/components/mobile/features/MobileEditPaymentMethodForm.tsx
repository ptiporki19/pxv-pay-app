"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { ArrowLeftIcon, PlusIcon, CreditCardIcon, TrashIcon } from "@heroicons/react/24/solid"
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
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { z } from "zod"
import { 
  paymentMethodsApi, 
  countriesApi, 
  Country,
  PaymentMethod 
} from "@/lib/supabase/client-api"
import { 
  paymentMethodFormSchema, 
  PaymentMethodFormValues 
} from "@/lib/validations/admin-forms"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileEditPaymentMethodFormProps {
  initialData: PaymentMethod
}

export function MobileEditPaymentMethodForm({ initialData }: MobileEditPaymentMethodFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [countriesLoading, setCountriesLoading] = useState(true)
  const [countriesOpen, setCountriesOpen] = useState(false)
  const router = useRouter()

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setCountriesLoading(true)
        const countriesList = await countriesApi.getAll()
        setCountries(countriesList)
      } catch (error) {
        console.error("Error fetching countries:", error)
        toast({ 
          title: "Error", 
          description: "Failed to fetch countries list", 
          variant: "destructive" 
        })
      } finally {
        setCountriesLoading(false)
      }
    }
    
    fetchCountries()
  }, [])

  // Initialize the form with existing data
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodFormSchema),
    defaultValues: {
      name: initialData.name || "",
      type: initialData.type || "manual",
      countries: initialData.countries || [],
      status: initialData.status || "active",
      instructions: initialData.instructions || "",
      description: initialData.description || "",
      custom_fields: initialData.custom_fields || [],
      icon: initialData.icon || null,
      url: initialData.url || "",
    },
  })

  // Custom fields array management
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "custom_fields"
  })

  // Watch the 'type' field to conditionally render sections
  const selectedType = form.watch("type")

  // Add custom field
  const addCustomField = () => {
    append({
      label: "",
      type: "text",
      required: false,
      placeholder: ""
    })
  }

  // Submit handler
  const onSubmit = async (values: PaymentMethodFormValues) => {
    setIsLoading(true)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !user.email) {
        toast({
          title: "Error",
          description: "You must be logged in to edit payment methods",
          variant: "destructive"
        })
        return
      }

      // Update payment method
      if (initialData.id) {
        await paymentMethodsApi.update(initialData.id, values)
      }
      
      toast({
        title: "Success",
        description: "Payment method updated successfully"
      })
      
      router.push('/m/payment-methods')
    } catch (error) {
      console.error("Payment method update error:", error)
      
      let errorMessage = "There was an error updating the payment method"
      
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
            Edit Payment Method
          </h1>
          <p className="text-xs text-muted-foreground font-roboto">
            Update payment method settings
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          
          {/* Payment Method Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium font-roboto">Payment Method Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      selectedType === 'payment-link' ? 'PayPal Checkout' : 
                      'Bank Transfer / Mobile Money / Crypto'
                    }
                    className="bg-background border border-border h-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium font-roboto">Payment Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background border border-border h-10">
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

          {/* Payment Link URL (only for payment-link type) */}
          {selectedType === 'payment-link' && (
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium font-roboto">Payment URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://paypal.me/youraccount"
                      className="bg-background border border-border h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    The URL where customers will be redirected to complete payment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium font-roboto">Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe this payment method..."
                    className="bg-background border border-border min-h-16 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Countries Selection */}
          <FormField
            control={form.control}
            name="countries"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs font-medium font-roboto">Supported Countries</FormLabel>
                <Popover open={countriesOpen} onOpenChange={setCountriesOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={countriesOpen}
                        className="bg-background border border-border h-10 justify-between"
                        disabled={countriesLoading}
                      >
                        {field.value.length > 0
                          ? `${field.value.length} countries selected`
                          : "Select countries..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search countries..." />
                      <CommandEmpty>No countries found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {countries.map((country) => (
                          <CommandItem
                            key={country.code}
                            onSelect={() => {
                              const currentValue = field.value || []
                              const newValue = currentValue.includes(country.code)
                                ? currentValue.filter((code) => code !== country.code)
                                : [...currentValue, country.code]
                              field.onChange(newValue)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value?.includes(country.code) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {country.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription className="text-xs">
                  Select the countries where this payment method is available
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Custom Fields (only for manual type) */}
          {selectedType === 'manual' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-xs font-medium font-roboto">Account Details Fields</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomField}
                  className="h-8"
                >
                  <PlusIcon className="size-3 mr-1" />
                  Add Field
                </Button>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-2 p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Field {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="size-3" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name={`custom_fields.${index}.label`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Field label"
                              className="bg-background border border-border h-8 text-xs"
                              {...field}
                            />
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
                              <SelectTrigger className="bg-background border border-border h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
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
                          <Input
                            placeholder="Placeholder text"
                            className="bg-background border border-border h-8 text-xs"
                            {...field}
                          />
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
                          <FormLabel className="text-xs font-normal">
                            Required field
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium font-roboto">Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background border border-border h-10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Instructions */}
          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium font-roboto">Instructions for Customers</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Instructions for customers on how to use this payment method..."
                    className="bg-background border border-border min-h-20 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  These instructions will be shown to customers during checkout
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white h-10"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="text-xs">Updating Payment Method...</span>
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