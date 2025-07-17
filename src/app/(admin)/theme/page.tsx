'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useNotificationActions } from '@/providers/notification-provider'
import { Brand, brandsApi } from '@/lib/supabase/client-api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function BrandManagementPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Use notification actions hook
  const { showSuccess, showError } = useNotificationActions()

  useEffect(() => {
    loadBrands()
  }, [searchQuery, statusFilter])

  const loadBrands = async () => {
    try {
      setLoading(true)
      const brandsData = await brandsApi.getAll()
      
      // Filter by search query and status if provided
      let filteredData = brandsData
      
      if (searchQuery.trim()) {
        filteredData = filteredData.filter(brand => 
          brand.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      if (statusFilter !== "all") {
        filteredData = filteredData.filter(brand => 
          statusFilter === "active" ? brand.is_active : !brand.is_active
        )
      }

      setBrands(filteredData)
    } catch (error) {
      console.error('Error loading brands:', error)
      showError('Error', 'Failed to load brands')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (brand: Brand) => {
    if (!brand.id || !confirm(`Are you sure you want to delete the brand "${brand.name}"?`)) {
      return
    }

    try {
      await brandsApi.delete(brand.id)
      setBrands(brands.filter(b => b.id !== brand.id))
      showSuccess('Success', `Brand "${brand.name}" deleted successfully`)
    } catch (error: any) {
      console.error('Error deleting brand:', error)
      showError('Error', error.message || 'Failed to delete brand')
    }
  }

  const formatCreatedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-roboto">Brand Management</h1>
          <p className="text-muted-foreground">Manage brands for your checkout pages.</p>
        </div>
      </div>

      <div className="flex items-center py-4 gap-4 justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search brands..."
              className="w-full bg-background pl-8 h-11 font-roboto"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-11 font-roboto">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-roboto">All Status</SelectItem>
              <SelectItem value="active" className="font-roboto">Active</SelectItem>
              <SelectItem value="inactive" className="font-roboto">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/theme/create">
          <Button className="h-11 font-roboto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg">
        {/* Table Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200 font-roboto font-semibold text-sm">
          <div className="w-[250px]">Brand Name</div>
          <div className="w-[120px]">Logo</div>
          <div className="w-[120px]">Created</div>
          <div className="w-[100px] text-center">Status</div>
          <div className="w-[100px] text-right">Actions</div>
        </div>
        
        {/* Table Body */}
        {loading ? (
          <div className="px-4 py-12 text-center text-muted-foreground">
            <div className="text-base font-medium font-roboto">Loading brands...</div>
          </div>
        ) : brands.length > 0 ? (
          brands.map((brand) => (
            <div key={brand.id} className="flex items-center justify-between px-4 py-3 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
              <div className="w-[250px] flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 font-roboto">{brand.name}</span>
              </div>
              <div className="w-[120px]">
                <img 
                  src={brand.logo_url} 
                  alt={brand.name}
                  className="w-8 h-8 rounded-full object-cover border"
                />
              </div>
              <div className="w-[120px]">
                <span className="text-sm text-gray-900 dark:text-gray-100 font-roboto">{formatCreatedDate(brand.created_at)}</span>
              </div>
              <div className="w-[100px] text-center">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "font-roboto",
                    brand.is_active && 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400',
                    !brand.is_active && 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400'
                  )}
                >
                  {brand.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="w-[100px] text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/theme/edit/${brand.id || ''}`} className="font-roboto">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(brand)}
                      className="text-red-600 font-roboto"
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
          <div className="px-4 py-12 text-center text-muted-foreground">
            <div className="text-base font-medium font-roboto">No brands found. Add one to get started.</div>
          </div>
        )}
      </div>
    </>
  )
} 