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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Country, PaymentMethod, CustomField, countriesApi, paymentMethodsApi } from "@/lib/supabase/client-api"
import { useAdminStore } from "@/lib/store/admin-store"
import { 
  paymentMethodFormSchema, 
  PaymentMethodFormValues,
  CustomFieldType
} from "@/lib/validations/admin-forms"
import { Check, ChevronsUpDown, Plus, Trash2, Settings, Globe, MapPin } from "lucide-react"
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

interface PaymentMethodFormEnhancedProps {
  initialData?: PaymentMethod
  onSuccess?: () => void
}

export function PaymentMethodFormEnhanced({ initialData, onSuccess }: PaymentMethodFormEnhancedProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [activeCountryTab, setActiveCountryTab] = useState<string>("")
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
      instructions_for_checkout: initialData.instructions_for_checkout || "",
      description: initialData.description || "",
      custom_fields: initialData.custom_fields || [],
      country_specific_details: initialData.country_specific_details || {},
      display_order: initialData.display_order || 0,
      icon: initialData.icon || null,
      url: initialData.url || "",
    } : {
      name: "",
      type: "manual",
      countries: [],
      status: "inactive",
      instructions: "",
      instructions_for_checkout: "",
      description: "",
      custom_fields: [],
      country_specific_details: {},
      display_order: 0,
      icon: null,
      url: "",
    },
  })

  // Watch form values
  const selectedType = form.watch("type")
  const watchedCountries = form.watch("countries")
  const countrySpecificDetails = form.watch("country_specific_details") || {}

  // Update selected countries when form countries change
  useEffect(() => {
    setSelectedCountries(watchedCountries || [])
    if (watchedCountries && watchedCountries.length > 0 && !activeCountryTab) {
      setActiveCountryTab(watchedCountries[0])
    }
  }, [watchedCountries, activeCountryTab])

  // Initialize country-specific details when countries are selected
  useEffect(() => {
    const currentDetails = form.getValues("country_specific_details") || {}
    const newDetails = { ...currentDetails }
    let hasChanges = false

    // Add details for new countries
    selectedCountries.forEach(countryCode => {
      if (!newDetails[countryCode]) {
        newDetails[countryCode] = {
          custom_fields: [],
          instructions: "",
          url: selectedType === 'payment-link' ? "" : undefined,
          additional_info: ""
        }
        hasChanges = true
      }
    })

    // Remove details for unselected countries
    Object.keys(newDetails).forEach(countryCode => {
      if (!selectedCountries.includes(countryCode)) {
        delete newDetails[countryCode]
        hasChanges = true
      }
    })

    if (hasChanges) {
      form.setValue("country_specific_details", newDetails)
    }
  }, [selectedCountries, selectedType, form])

  // Helper function to add custom field for a specific country
  const addCustomFieldForCountry = (countryCode: string) => {
    const currentDetails = form.getValues("country_specific_details") || {}
    const countryDetails = currentDetails[countryCode] || { custom_fields: [] }
    const newField: CustomField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: "",
      type: "text",
      placeholder: "",
      required: false,
      value: ""
    }
    
    const updatedFields = [...(countryDetails.custom_fields || []), newField]
    const updatedDetails = {
      ...currentDetails,
      [countryCode]: {
        ...countryDetails,
        custom_fields: updatedFields
      }
    }
    
    form.setValue("country_specific_details", updatedDetails)
  }

  // Helper function to remove custom field for a specific country
  const removeCustomFieldForCountry = (countryCode: string, fieldIndex: number) => {
    const currentDetails = form.getValues("country_specific_details") || {}
    const countryDetails = currentDetails[countryCode] || { custom_fields: [] }
    const updatedFields = (countryDetails.custom_fields || []).filter((_, index) => index !== fieldIndex)
    
    const updatedDetails = {
      ...currentDetails,
      [countryCode]: {
        ...countryDetails,
        custom_fields: updatedFields
      }
    }
    
    form.setValue("country_specific_details", updatedDetails)
  }

  // Handle form submission
  async function onSubmit(values: PaymentMethodFormValues) {
    try {
      setIsLoading(true)
      
      if (initialData?.id) {
        await paymentMethodsApi.update(initialData.id, values)
        showSuccess("Payment method updated successfully")
      } else {
        await paymentMethodsApi.create(values)
        showSuccess("Payment method created successfully")
      }
      
      setRefreshFlag()
      onSuccess?.()
      closeModal()
    } catch (error) {
      console.error("Error saving payment method:", error)
      showError(error instanceof Error ? error.message : "Failed to save payment method")
    } finally {
      setIsLoading(false)
    }
  }

  // Get country name by code
  const getCountryName = (code: string) => {
    const country = countries.find(c => c.code === code)
    return country ? country.name : code
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {initialData ? "Edit Payment Method" : "Create Payment Method"}
          </h1>
          <p className="text-muted-foreground">
            Configure payment method with country-specific details
          </p>
        </div>
      </div>

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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <FormField
                  control={form.control}
                  name="display_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Lower numbers appear first
                      </FormDescription>
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
            </CardContent>
          </Card>

          {/* Countries Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Supported Countries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="countries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Countries</FormLabel>
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
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Select all countries where this payment method will be available
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Selected Countries Display */}
              {selectedCountries.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Selected Countries:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCountries.map((countryCode) => (
                      <Badge key={countryCode} variant="secondary">
                        {getCountryName(countryCode)} ({countryCode})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Country-Specific Configuration */}
          {selectedCountries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Country-Specific Configuration
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure specific details for each country
                </p>
              </CardHeader>
              <CardContent>
                <Tabs value={activeCountryTab} onValueChange={setActiveCountryTab}>
                  <TabsList className="grid w-full grid-cols-auto">
                    {selectedCountries.map((countryCode) => (
                      <TabsTrigger key={countryCode} value={countryCode}>
                        {getCountryName(countryCode)}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {selectedCountries.map((countryCode) => (
                    <TabsContent key={countryCode} value={countryCode} className="space-y-4">
                      <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-medium">
                          Configuration for {getCountryName(countryCode)}
                        </h4>

                        {/* Country-specific instructions */}
                        <div>
                          <label className="text-sm font-medium">Instructions for {getCountryName(countryCode)}</label>
                          <Textarea
                            placeholder={`Enter specific instructions for ${getCountryName(countryCode)}...`}
                            value={countrySpecificDetails[countryCode]?.instructions || ""}
                            onChange={(e) => {
                              const currentDetails = form.getValues("country_specific_details") || {}
                              const updatedDetails = {
                                ...currentDetails,
                                [countryCode]: {
                                  ...currentDetails[countryCode],
                                  instructions: e.target.value
                                }
                              }
                              form.setValue("country_specific_details", updatedDetails)
                            }}
                            className="mt-1"
                          />
                        </div>

                        {/* Payment Link URL for payment-link type */}
                        {selectedType === 'payment-link' && (
                          <div>
                            <label className="text-sm font-medium">Payment URL for {getCountryName(countryCode)}</label>
                            <Input
                              placeholder={`https://payment-provider.com/${countryCode.toLowerCase()}`}
                              value={countrySpecificDetails[countryCode]?.url || ""}
                              onChange={(e) => {
                                const currentDetails = form.getValues("country_specific_details") || {}
                                const updatedDetails = {
                                  ...currentDetails,
                                  [countryCode]: {
                                    ...currentDetails[countryCode],
                                    url: e.target.value
                                  }
                                }
                                form.setValue("country_specific_details", updatedDetails)
                              }}
                              className="mt-1"
                            />
                          </div>
                        )}

                        {/* Custom Fields for manual type */}
                        {selectedType === 'manual' && (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-sm font-medium">
                                Payment Details for {getCountryName(countryCode)}
                              </label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addCustomFieldForCountry(countryCode)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Field
                              </Button>
                            </div>

                            <div className="space-y-3">
                              {(countrySpecificDetails[countryCode]?.custom_fields || []).map((field, fieldIndex) => (
                                <div key={field.id} className="border rounded p-3 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-sm font-medium">Field {fieldIndex + 1}</h5>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeCustomFieldForCountry(countryCode, fieldIndex)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs font-medium">Field Label</label>
                                      <Input
                                        placeholder="Account Number"
                                        value={field.label}
                                        onChange={(e) => {
                                          const currentDetails = form.getValues("country_specific_details") || {}
                                          const countryDetails = currentDetails[countryCode] || { custom_fields: [] }
                                          const updatedFields = [...(countryDetails.custom_fields || [])]
                                          updatedFields[fieldIndex] = { ...field, label: e.target.value }
                                          
                                          const updatedDetails = {
                                            ...currentDetails,
                                            [countryCode]: {
                                              ...countryDetails,
                                              custom_fields: updatedFields
                                            }
                                          }
                                          form.setValue("country_specific_details", updatedDetails)
                                        }}
                                      />
                                    </div>

                                    <div>
                                      <label className="text-xs font-medium">Field Type</label>
                                      <Select
                                        value={field.type}
                                        onValueChange={(value) => {
                                          const currentDetails = form.getValues("country_specific_details") || {}
                                          const countryDetails = currentDetails[countryCode] || { custom_fields: [] }
                                          const updatedFields = [...(countryDetails.custom_fields || [])]
                                          updatedFields[fieldIndex] = { ...field, type: value as any }
                                          
                                          const updatedDetails = {
                                            ...currentDetails,
                                            [countryCode]: {
                                              ...countryDetails,
                                              custom_fields: updatedFields
                                            }
                                          }
                                          form.setValue("country_specific_details", updatedDetails)
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="text">Text</SelectItem>
                                          <SelectItem value="number">Number</SelectItem>
                                          <SelectItem value="email">Email</SelectItem>
                                          <SelectItem value="tel">Phone</SelectItem>
                                          <SelectItem value="textarea">Long Text</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs font-medium">Placeholder</label>
                                      <Input
                                        placeholder="Enter placeholder..."
                                        value={field.placeholder || ""}
                                        onChange={(e) => {
                                          const currentDetails = form.getValues("country_specific_details") || {}
                                          const countryDetails = currentDetails[countryCode] || { custom_fields: [] }
                                          const updatedFields = [...(countryDetails.custom_fields || [])]
                                          updatedFields[fieldIndex] = { ...field, placeholder: e.target.value }
                                          
                                          const updatedDetails = {
                                            ...currentDetails,
                                            [countryCode]: {
                                              ...countryDetails,
                                              custom_fields: updatedFields
                                            }
                                          }
                                          form.setValue("country_specific_details", updatedDetails)
                                        }}
                                      />
                                    </div>

                                    <div>
                                      <label className="text-xs font-medium">Value</label>
                                      <Input
                                        placeholder="Default value..."
                                        value={field.value || ""}
                                        onChange={(e) => {
                                          const currentDetails = form.getValues("country_specific_details") || {}
                                          const countryDetails = currentDetails[countryCode] || { custom_fields: [] }
                                          const updatedFields = [...(countryDetails.custom_fields || [])]
                                          updatedFields[fieldIndex] = { ...field, value: e.target.value }
                                          
                                          const updatedDetails = {
                                            ...currentDetails,
                                            [countryCode]: {
                                              ...countryDetails,
                                              custom_fields: updatedFields
                                            }
                                          }
                                          form.setValue("country_specific_details", updatedDetails)
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={field.required}
                                      onCheckedChange={(checked) => {
                                        const currentDetails = form.getValues("country_specific_details") || {}
                                        const countryDetails = currentDetails[countryCode] || { custom_fields: [] }
                                        const updatedFields = [...(countryDetails.custom_fields || [])]
                                        updatedFields[fieldIndex] = { ...field, required: !!checked }
                                        
                                        const updatedDetails = {
                                          ...currentDetails,
                                          [countryCode]: {
                                            ...countryDetails,
                                            custom_fields: updatedFields
                                          }
                                        }
                                        form.setValue("country_specific_details", updatedDetails)
                                      }}
                                    />
                                    <label className="text-xs font-medium">Required field</label>
                                  </div>
                                </div>
                              ))}

                              {(!countrySpecificDetails[countryCode]?.custom_fields || countrySpecificDetails[countryCode]?.custom_fields?.length === 0) && (
                                <div className="text-center py-8 border-2 border-dashed rounded">
                                  <p className="text-sm text-muted-foreground mb-2">
                                    No payment details configured for {getCountryName(countryCode)}
                                  </p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addCustomFieldForCountry(countryCode)}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add First Field
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Additional Info */}
                        <div>
                          <label className="text-sm font-medium">Additional Information</label>
                          <Textarea
                            placeholder={`Any additional notes for ${getCountryName(countryCode)}...`}
                            value={countrySpecificDetails[countryCode]?.additional_info || ""}
                            onChange={(e) => {
                              const currentDetails = form.getValues("country_specific_details") || {}
                              const updatedDetails = {
                                ...currentDetails,
                                [countryCode]: {
                                  ...currentDetails[countryCode],
                                  additional_info: e.target.value
                                }
                              }
                              form.setValue("country_specific_details", updatedDetails)
                            }}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* General Fallback Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings (Fallback)</CardTitle>
              <p className="text-sm text-muted-foreground">
                These settings will be used when country-specific details are not available
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>General Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="General payment instructions..."
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
                name="instructions_for_checkout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Checkout Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Instructions shown during checkout..."
                        className="min-h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedType === 'payment-link' && (
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>General Payment URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://payment-provider.com" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Fallback URL when country-specific URL is not available
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={closeModal}>
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