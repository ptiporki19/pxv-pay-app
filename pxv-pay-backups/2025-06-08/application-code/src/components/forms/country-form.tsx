"use client"

import { useState } from "react"
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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Country, countriesApi } from "@/lib/supabase/client-api"
import { useAdminStore } from "@/lib/store/admin-store"
import { countryFormSchema, CountryFormValues } from "@/lib/validations/admin-forms"

interface CountryFormProps {
  initialData?: Country
  onSuccess?: () => void
}

export function CountryForm({ initialData, onSuccess }: CountryFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const closeModal = useAdminStore((state) => state.closeModal)
  const setRefreshFlag = useAdminStore((state) => state.setRefreshFlag)
  
  // Initialize the form with default values or existing data
  const form = useForm<CountryFormValues>({
    resolver: zodResolver(countryFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      code: initialData.code,
      status: initialData.status,
    } : {
      name: "",
      code: "",
      status: "inactive",
    },
  })

  // Handle form submission
  async function onSubmit(values: CountryFormValues) {
    try {
      setIsLoading(true)
      
      if (initialData?.id) {
        // Update existing country
        await countriesApi.update(initialData.id, values)
        toast({ title: "Country updated", description: "The country was updated successfully" })
      } else {
        // Create new country
        await countriesApi.create(values)
        toast({ title: "Country created", description: "The country was created successfully" })
      }
      
      // Trigger refresh and close the modal
      setRefreshFlag()
      closeModal()
      
      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error saving country:", error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "There was an error processing your request", 
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
              <FormLabel>Country Name</FormLabel>
              <FormControl>
                <Input placeholder="United States" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="US" 
                  {...field} 
                  maxLength={5}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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
            {isLoading ? "Saving..." : initialData ? "Update Country" : "Create Country"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 