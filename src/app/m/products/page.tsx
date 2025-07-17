"use client"

import { useState, useEffect } from "react"
import { PlusIcon, CubeIcon as PackageIcon, CheckCircleIcon } from "@heroicons/react/24/solid"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { MobileStats } from "@/components/mobile/ui/MobileStats"
import { MobileSearch } from "@/components/mobile/ui/MobileSearch"
import { ProductCard } from "@/components/mobile/features/ProductCard"
import { productTemplatesApi } from "@/lib/supabase/product-templates-api"
import type { ProductTemplate } from "@/types/content"

export default function MobileProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<ProductTemplate[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filterOptions = [
    { id: "all", label: "All Status" },
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
  ]

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, statusFilter])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const data = await productTemplatesApi.getAll()
      setProducts(data)
    } catch (error) {
      console.error("Failed to load products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((product) => {
        switch (statusFilter) {
          case "active":
            return product.is_active === true
          case "inactive":
            return product.is_active === false
          default:
            return true
        }
      })
    }

    setFilteredProducts(filtered)
  }

  const handleDelete = async (id: string) => {
    try {
      await productTemplatesApi.delete(id)
      await loadProducts()
    } catch (error) {
      console.error("Failed to delete product:", error)
    }
  }

  const handleStatusChange = async (id: string, field: 'is_active' | 'is_featured', value: boolean) => {
    try {
      if (field === 'is_active') {
        await productTemplatesApi.toggleActive(id)
      }
      await loadProducts()
    } catch (error) {
      console.error("Failed to update product status:", error)
    }
  }

  const totalProducts = products.length
  const activeProducts = products.filter(p => p.is_active).length

  return (
    <div className="px-4 py-3 pb-20 pt-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground font-roboto">
            Products
          </h1>
          <p className="text-sm text-muted-foreground font-roboto">
            Manage products for your store
          </p>
        </div>
        <Button
          onClick={() => router.push('/m/products/create')}
          size="sm"
          className="bg-violet-600 hover:bg-violet-700 text-white h-8"
        >
          <PlusIcon className="size-3 mr-1" />
          Create
        </Button>
      </div>

      {/* Stats Cards */}
      <MobileStats
        stats={[
          {
            title: "Total Products",
            value: totalProducts.toString(),
            icon: PackageIcon,
            color: "purple"
          },
          {
            title: "Active Products", 
            value: activeProducts.toString(),
            icon: CheckCircleIcon,
            color: "green"
          }
        ]}
      />

      {/* Search and Filter */}
      <MobileSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search products..."
        filterOptions={filterOptions}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      {/* Products List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <PackageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-muted-foreground">No products</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new product.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => router.push('/m/products/create')}
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                <PlusIcon className="size-4 mr-2" />
                Create Product
              </Button>
            </div>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  )
} 