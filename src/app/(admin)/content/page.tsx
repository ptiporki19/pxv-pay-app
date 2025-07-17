'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal, Copy, Star, StarOff, ToggleLeft, ToggleRight, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNotificationActions } from '@/providers/notification-provider'
import { productTemplatesApi } from '@/lib/supabase/product-templates-api'
import type { ProductTemplate } from '@/types/content'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function ProductManagementPage() {
  const [products, setProducts] = useState<ProductTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { showSuccess, showError } = useNotificationActions()

  useEffect(() => {
    loadProducts()
  }, [searchQuery, statusFilter])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      
      const filters = searchQuery ? { search: searchQuery } : {}
      let productsData = await productTemplatesApi.getAll(filters)
      
      // Apply status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'active') {
          productsData = productsData.filter(product => product.is_active === true)
        } else if (statusFilter === 'inactive') {
          productsData = productsData.filter(product => product.is_active === false)
        }
      }
      
      setProducts(productsData)
    } catch (error) {
      console.error('Error loading products:', error)
      showError('Error', 'Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (product: ProductTemplate) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await productTemplatesApi.delete(product.id)
      await loadProducts()
      showSuccess('Success', `Product "${product.name}" deleted successfully`)
    } catch (error: any) {
      console.error('Error deleting product:', error)
      showError('Error', error.message || 'Failed to delete product')
    }
  }

  const handleToggleActive = async (product: ProductTemplate) => {
    try {
      await productTemplatesApi.toggleActive(product.id, !product.is_active)
      await loadProducts()
      showSuccess('Success', `Product ${!product.is_active ? 'activated' : 'deactivated'} successfully`)
    } catch (error: any) {
      console.error('Error toggling product status:', error)
      showError('Error', error.message || 'Failed to update product status')
    }
  }

  const handleToggleFeatured = async (product: ProductTemplate) => {
    try {
      await productTemplatesApi.toggleFeatured(product.id, !product.is_featured)
      await loadProducts()
      showSuccess('Success', `Product ${!product.is_featured ? 'featured' : 'unfeatured'} successfully`)
    } catch (error: any) {
      console.error('Error toggling featured status:', error)
      showError('Error', error.message || 'Failed to update featured status')
    }
  }

  const handleDuplicate = async (product: ProductTemplate) => {
    const newName = prompt('Enter name for the duplicate product:', `${product.name} (Copy)`)
    if (!newName) return

    const newKey = newName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')

    try {
      await productTemplatesApi.duplicate(product.id, newKey, newName)
      await loadProducts()
      showSuccess('Success', `Product duplicated as "${newName}"`)
    } catch (error: any) {
      console.error('Error duplicating product:', error)
      showError('Error', error.message || 'Failed to duplicate product')
    }
  }

  // Helper function to strip HTML and truncate text
  const stripHtmlAndTruncate = (html: string, maxLength: number = 60) => {
    const div = document.createElement('div')
    div.innerHTML = html
    const text = div.textContent || div.innerText || ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  // Status badge style helper - same as payment methods
  const getStatusBadgeClass = (status: boolean) => {
    return status 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
  }

  return (
    <>
      {/* Header - Same structure as payment methods */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-roboto">Product Management</h1>
          <p className="text-muted-foreground">Manage products for your checkout.</p>
        </div>
      </div>

      {/* Search Bar - Same as payment methods */}
      <div className="flex items-center py-4 gap-4 justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="w-full bg-background pl-8 h-11 font-roboto"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] h-11 font-roboto">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-roboto">All Status</SelectItem>
              <SelectItem value="active" className="font-roboto">Active</SelectItem>
              <SelectItem value="inactive" className="font-roboto">Inactive</SelectItem>
              <SelectItem value="draft" className="font-roboto">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/content/create">
          <Button className="h-11 font-roboto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Table - Same structure as payment methods */}
      <div className="border rounded-lg">
        <div className="flex items-center justify-between bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 font-medium px-4 py-3 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200 font-roboto">
          <div className="w-1/3">Product Name</div>
          <div className="w-1/3">Description</div>
          <div className="w-1/6">Category</div>
          <div className="w-1/6 text-center">Status</div>
          <div className="w-1/12 text-right">Actions</div>
        </div>
        
        {isLoading ? (
          <div className="px-4 py-3 text-center text-muted-foreground">
            Loading products...
          </div>
        ) : products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200">
              <div className="w-1/3 flex items-center space-x-3">
                {product.featured_image && (
                  <img 
                    src={product.featured_image} 
                    alt={product.name}
                    className="w-6 h-6 rounded object-cover"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-roboto">{product.name}</span>
                    {product.is_featured && (
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{product.product_key}</div>
                </div>
              </div>
              <div className="w-1/3">{stripHtmlAndTruncate(product.description)}</div>
              <div className="w-1/6 capitalize">{product.category}</div>
              <div className="w-1/6 text-center">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "font-roboto",
                    product.is_active && 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400',
                    !product.is_active && 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400'
                  )}
                >
                  {product.is_active ? 'Active' : 'Inactive'}
                </Badge>
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
                      <Link href={`/content/edit/${product.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(product)}>
                      <Copy className="mr-2 h-4 w-4" />
                      <span>Duplicate</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleFeatured(product)}>
                      {product.is_featured ? <StarOff className="mr-2 h-4 w-4" /> : <Star className="mr-2 h-4 w-4" />}
                      <span>{product.is_featured ? 'Unfeature' : 'Feature'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleActive(product)}>
                      {product.is_active ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                      <span>{product.is_active ? 'Deactivate' : 'Activate'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(product)} 
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
            {searchQuery ? (
              <>
                No products found matching "{searchQuery}". 
                <Link href="/content/create" className="text-blue-600 hover:underline ml-1">
                  Create a new product
                </Link>
              </>
            ) : (
              <>
                No products found. Add one to get started.
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
} 