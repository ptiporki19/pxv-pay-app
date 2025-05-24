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
import { countryFormSchema, CountryFormValues } from "@/lib/validations/admin-forms"
import { useRouter } from "next/navigation"

interface CountryFormProps {
  initialData?: Country
}

export function CountryFormSimple({ initialData }: CountryFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
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
        toast({ title: "Success", description: "Country updated successfully" })
      } else {
        // Create new country
        await countriesApi.create(values)
        toast({ title: "Success", description: "Country created successfully" })
      }
      
      // Navigate back to countries list
      router.push('/countries')
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
    <div className="max-w-2xl mx-auto p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          
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
                    maxLength={2}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/countries')}
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
    </div>
  )
} 