"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Currency, currenciesApi } from "@/lib/supabase/client-api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export function CurrenciesList() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch currencies from the API
  useEffect(() => {
    const fetchCurrencies = async () => {
      setIsLoading(true)
      try {
        const data = await currenciesApi.getAll()
        // Filter by search query if provided
        const filteredData = searchQuery.trim() 
          ? data.filter(currency => 
              currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              currency.code.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : data
        setCurrencies(filteredData)
      } catch (error) {
        console.error("Error fetching currencies:", error)
        toast({ 
          title: "Error", 
          description: "Failed to fetch currencies", 
          variant: "destructive" 
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrencies()
  }, [searchQuery])

  // Handle delete currency
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this currency?")) return
    
    setIsLoading(true)
    try {
      await currenciesApi.delete(id)
      toast({ title: "Success", description: "Currency deleted successfully" })
      // Refresh the list
      const data = await currenciesApi.getAll()
      setCurrencies(data)
    } catch (error) {
      console.error("Error deleting currency:", error)
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to delete currency", 
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
          <h1 className="text-3xl font-bold tracking-tight font-geist">Currencies</h1>
          <p className="text-muted-foreground">Manage supported currencies for payments.</p>
        </div>
        <Link href="/currencies/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Currency
          </Button>
        </Link>
      </div>

      <div className="flex items-center py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search currencies..."
            className="w-full bg-white pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 font-medium px-4 py-3 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200 font-geist">
          <div className="w-1/4">Currency Name</div>
          <div className="w-1/4">Currency Code</div>
          <div className="w-1/4">Symbol</div>
          <div className="w-1/6 text-center">Status</div>
          <div className="w-1/12 text-right">Actions</div>
        </div>
        
        {isLoading ? (
          <div className="px-4 py-3 text-center text-muted-foreground">
            Loading currencies...
          </div>
        ) : currencies.length > 0 ? (
          currencies.map((currency) => (
            <div key={currency.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200">
              <div className="w-1/4 font-geist">{currency.name}</div>
              <div className="w-1/4">{currency.code}</div>
              <div className="w-1/4">{currency.symbol}</div>
              <div className="w-1/6 text-center">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  currency.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : currency.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                }`}>
                  {currency.status === 'active' ? 'Active' : 
                   currency.status === 'pending' ? 'Pending' : 'Inactive'}
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
                      <Link href={`/currencies/edit/${currency.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => currency.id && handleDelete(currency.id)}
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
            No currencies found. Add one to get started.
          </div>
        )}
      </div>
    </>
  )
} 