"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Country, countriesApi } from "@/lib/supabase/client-api"
import { useAdminStore } from "@/lib/store/admin-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

export function CountriesList() {
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { openModal, searchQuery, setSearchQuery, refreshFlag } = useAdminStore()

  // Fetch countries from the API
  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true)
      try {
        let data
        if (searchQuery.trim()) {
          data = await countriesApi.search(searchQuery)
        } else {
          data = await countriesApi.getAll()
        }
        setCountries(data)
      } catch (error) {
        console.error("Error fetching countries:", error)
        toast({ 
          title: "Error", 
          description: "Failed to fetch countries", 
          variant: "destructive" 
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCountries()
  }, [searchQuery, refreshFlag])

  // Handle delete country
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this country?")) return
    
    setIsLoading(true)
    try {
      await countriesApi.delete(id)
      toast({ title: "Success", description: "Country deleted successfully" })
      // Refresh the list
      const data = await countriesApi.getAll()
      setCountries(data)
    } catch (error) {
      console.error("Error deleting country:", error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to delete country", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Status badge style helper
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Countries</h1>
          <p className="text-muted-foreground">Manage supported countries for payments.</p>
        </div>
        <Button onClick={() => openModal('country', 'create')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Country
        </Button>
      </div>

      <div className="flex items-center py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search countries..."
            className="w-full bg-white pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="flex items-center justify-between border-b px-4 py-3 font-medium">
          <div className="w-1/3">Country Name</div>
          <div className="w-1/3">Country Code</div>
          <div className="w-1/4 text-center">Status</div>
          <div className="w-1/12 text-right">Actions</div>
        </div>
        
        {isLoading ? (
          <div className="px-4 py-3 text-center text-muted-foreground">
            Loading countries...
          </div>
        ) : countries.length > 0 ? (
          countries.map((country) => (
            <div key={country.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-1/3">{country.name}</div>
              <div className="w-1/3">{country.code}</div>
              <div className="w-1/4 text-center">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(country.status)}`}>
                  {country.status === 'active' ? 'Active' : 
                   country.status === 'pending' ? 'Pending' : 'Inactive'}
                </span>
              </div>
              <div className="w-1/12 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openModal('country', 'edit', country)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => country.id && handleDelete(country.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-3 text-center text-muted-foreground">
            No countries found. Add one to get started.
          </div>
        )}
      </div>
    </>
  )
} 