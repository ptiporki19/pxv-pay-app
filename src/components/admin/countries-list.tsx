"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Country, countriesApi } from "@/lib/supabase/client-api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export function CountriesList() {
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch countries from the API
  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true)
      try {
        const data = await countriesApi.getAll()
        // Filter by search query if provided
        const filteredData = searchQuery.trim() 
          ? data.filter(country => 
              country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              country.code.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : data
        setCountries(filteredData)
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
  }, [searchQuery])

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
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-geist">Countries</h1>
          <p className="text-muted-foreground">Manage supported countries for payments.</p>
        </div>
        <Link href="/countries/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Country
          </Button>
        </Link>
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

      <div className="border rounded-lg border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 font-medium px-4 py-3 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200 font-geist">
          <div className="w-1/4">Country Name</div>
          <div className="w-1/4">Country Code</div>
          <div className="w-1/4">Currency</div>
          <div className="w-1/6 text-center">Status</div>
          <div className="w-1/12 text-right">Actions</div>
        </div>
        
        {isLoading ? (
          <div className="px-4 py-3 text-center text-muted-foreground">
            Loading countries...
          </div>
        ) : countries.length > 0 ? (
          countries.map((country) => (
            <div key={country.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200">
              <div className="w-1/4 font-geist">{country.name}</div>
              <div className="w-1/4">{country.code}</div>
              <div className="w-1/4">
                {country.currency ? (
                  <span className="text-sm">
                    {country.currency.name} ({country.currency.code})
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">No currency</span>
                )}
              </div>
              <div className="w-1/6 text-center">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  country.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : country.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                }`}>
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
                    <DropdownMenuItem asChild>
                      <Link href={`/countries/edit/${country.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </Link>
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