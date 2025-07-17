"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ArrowLeftIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid"
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
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { paymentMethodsApi, countriesApi, CustomField } from "@/lib/supabase/client-api"

// Schema matching desktop functionality
const mobilePaymentMethodSchema = z.object({
  name: z.string().min(1, "Payment method name is required"),
  type: z.enum(["manual", "payment-link"]),
  description: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]),
  instructions: z.string().optional(),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
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

type MobilePaymentMethodValues = z.infer<typeof mobilePaymentMethodSchema>

interface Country {
  id: string
  name: string
  code: string
}

export function MobileCreatePaymentMethodForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingCountries, setLoadingCountries] = useState(false)
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const router = useRouter()

  const form = useForm<MobilePaymentMethodValues>({
    resolver: zodResolver(mobilePaymentMethodSchema),
    defaultValues: {
      name: "",
      type: "manual",
      description: "",
      status: "active",
      instructions: "",
      url: "",
      countries: [],
      custom_fields: [],
    },
  })

  const paymentType = form.watch("type")

  useEffect(() => {
    loadCountries()
  }, [])

  // Update form when custom fields change
  useEffect(() => {
    form.setValue("custom_fields", customFields)
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
      toast({
        title: "Error",
        description: "Failed to load countries. Please refresh the page.",
        variant: "destructive"
      })
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

  async function onSubmit(values: MobilePaymentMethodValues) {
    try {
      setIsLoading(true)

      const payload = {
        name: values.name,
        type: values.type,
        description: values.description || null,
        status: values.status,
        instructions: values.instructions || null,
        url: values.type === "payment-link" ? values.url || null : null,
        countries: values.countries,
        custom_fields: customFields.length > 0 ? customFields : null,
      }

      await paymentMethodsApi.create(payload)

      toast({
        title: "Success",
        description: "Payment method created successfully",
      })

      router.push('/m/payment-methods')
    } catch (error) {
      console.error("Payment method creation error:", error)
      
      let errorMessage = "There was an error creating the payment method"
      if (error instanceof Error) {
        errorMessage = error.message
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
            Create Payment Method
          </h1>
          <p className="text-xs text-muted-foreground font-roboto">
            Set up a new payment option
          </p>
        </div>
      </div>

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

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
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
                  <span className="text-xs">Create Payment Method</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 