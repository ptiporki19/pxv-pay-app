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
import { Country, PaymentMethod, countriesApi, paymentMethodsApi } from "@/lib/supabase/client-api"
import { 
  paymentMethodFormSchema, 
  PaymentMethodFormValues,
  CustomFieldType
} from "@/lib/validations/admin-forms"
import { Plus, Trash2, Check, ChevronsUpDown } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
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
import { Badge } from "@/components/ui/badge"

interface PaymentMethodFormProps {
  initialData?: PaymentMethod
}

export function PaymentMethodFormSimple({ initialData }: PaymentMethodFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [countriesLoading, setCountriesLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
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
      toast({ 
        title: "Error", 
        description: "Icon must be less than 2MB", 
        variant: "destructive" 
      })
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
      
      const submissionData = { ...values }

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
        toast({ title: "Success", description: `Payment method "${submissionData.name}" updated successfully` })
      } else {
        await paymentMethodsApi.create(submissionData as PaymentMethod)
        toast({ title: "Success", description: `Payment method "${submissionData.name}" created successfully` })
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
    <div className="max-w-2xl mx-auto p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Orange Money" 
                      {...field} 
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
          </div>

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

          <FormField
            control={form.control}
            name="countries"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supported Countries</FormLabel>
                <Popover open={countriesOpen} onOpenChange={setCountriesOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={countriesOpen}
                        className={cn(
                          "w-full justify-between h-auto min-h-10",
                          !(field.value && field.value.length) && "text-muted-foreground"
                        )}
                      >
                        {(field.value && field.value.length) ? (
                          <div className="flex flex-wrap gap-1">
                            {field.value.slice(0, 3).map((code: string) => {
                              const country = countries.find(c => c.code === code)
                              return (
                                <Badge key={code} variant="secondary" className="text-xs">
                                  {code === "Global" ? "Global" : country ? `${country.name} (${code})` : code}
                                </Badge>
                              )
                            })}
                            {field.value.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{field.value.length - 3} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span>{countriesLoading ? "Loading countries..." : "Select supported countries"}</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search countries..." />
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        <CommandItem
                          value="Global"
                          onSelect={() => {
                            const currentValue = field.value || [];
                            const updatedValue = currentValue.includes("Global")
                              ? currentValue.filter((code: string) => code !== "Global")
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
                        {countries.map((country) => (
                          <CommandItem
                            key={country.code}
                            value={country.code}
                            onSelect={(selectedValue: string) => {
                              const currentValue = field.value || [];
                              // If Global is selected, clear everything and add the new country
                              // If a country is being selected, remove Global first
                              let updatedValue;
                              if (selectedValue === "Global") {
                                updatedValue = ["Global"];
                    } else {
                                const filteredValue = currentValue.filter((code: string) => code !== "Global");
                                updatedValue = filteredValue.includes(selectedValue)
                                  ? filteredValue.filter((code: string) => code !== selectedValue)
                                  : [...filteredValue, selectedValue];
                              }
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
                            {country.user_id === null && (
                              <Badge variant="outline" className="ml-auto text-xs">
                                Global
                              </Badge>
                            )}
                          </CommandItem>
                    ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
                
                {/* Display all selected countries */}
                {field.value && field.value.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Selected Countries ({field.value.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((code: string) => {
                        const country = countries.find(c => c.code === code)
                        return (
                          <Badge key={code} variant="secondary" className="text-sm">
                            {code === "Global" ? "🌍 Global" : country ? `${country.name} (${code})` : code}
                            {country?.user_id === null && code !== "Global" && (
                              <span className="ml-1 text-xs opacity-75">• Global</span>
                            )}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
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
                    placeholder="Provide instructions for customers on how to use this payment method..."
                    className="min-h-24 resize-none"
                    {...field} 
                    value={field.value || ''}
                  />
                </FormControl>
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
                      <div className="flex items-center gap-3 p-3 bg-background rounded border">
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

          {/* Payment Details Section - Only for Manual Payments */}
          {selectedType === 'manual' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel className="text-base font-semibold">Payment Details</FormLabel>
                  <p className="text-sm text-gray-600">Add the account details customers need for payment</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomField}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Detail
                </Button>
              </div>
              
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-2 gap-3 p-3 bg-background rounded border">
                    <FormField
                      control={form.control}
                      name={`custom_fields.${index}.label`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Detail Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Account Number" 
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
                            <FormLabel className="text-sm">Detail Value</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="1234567890" 
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
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded bg-background">
                    <p className="text-gray-600 mb-3">No payment details added</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCustomField}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Payment Detail
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