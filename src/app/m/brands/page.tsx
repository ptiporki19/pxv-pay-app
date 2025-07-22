"use client"

import { useState, useEffect } from "react"
import { PlusIcon, BuildingStorefrontIcon, CheckCircleIcon } from "@heroicons/react/24/solid"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { MobileStats } from "@/components/mobile/ui/MobileStats"
import { MobileSearch } from "@/components/mobile/ui/MobileSearch"
import { BrandCard } from "@/components/mobile/features/BrandCard"
import { brandsApi, type Brand } from "@/lib/supabase/client-api"
import { mobileToastMessages } from "@/lib/mobile-toast"

export default function MobileBrandsPage() {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filterOptions = [
    { id: "all", label: "All Status" },
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
  ]

  useEffect(() => {
    loadBrands()
  }, [])

  useEffect(() => {
    filterBrands()
  }, [brands, searchQuery, statusFilter])

  const loadBrands = async () => {
    try {
      setIsLoading(true)
      const data = await brandsApi.getAll()
      setBrands(data)
    } catch (error) {
      console.error("Failed to load brands:", error)
      mobileToastMessages.general.loadError("brands")
    } finally {
      setIsLoading(false)
    }
  }

  const filterBrands = () => {
    let filtered = brands

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((brand) =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((brand) => {
        switch (statusFilter) {
          case "active":
            return brand.is_active === true
          case "inactive":
            return brand.is_active === false
          default:
            return true
        }
      })
    }

    setFilteredBrands(filtered)
  }

  const handleDelete = async (id: string) => {
    try {
      await brandsApi.delete(id)
      mobileToastMessages.brand.deleted()
      await loadBrands()
    } catch (error) {
      console.error("Failed to delete brand:", error)
      mobileToastMessages.brand.deleteError(error instanceof Error ? error.message : undefined)
    }
  }

  const handleStatusChange = async (id: string, isActive: boolean) => {
    try {
      await brandsApi.update(id, { is_active: isActive })
      mobileToastMessages.brand.updated()
      await loadBrands()
    } catch (error) {
      console.error("Failed to update brand status:", error)
      mobileToastMessages.brand.updateError(error instanceof Error ? error.message : undefined)
    }
  }

  const totalBrands = brands.length
  const activeBrands = brands.filter(b => b.is_active).length

  return (
    <div className="px-4 py-3 pb-20 pt-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-normal text-foreground font-roboto">
            Brands
          </h1>
          <p className="text-sm text-muted-foreground font-roboto">
            Manage brands for your business
          </p>
        </div>
        <Button
          onClick={() => router.push('/m/brands/create')}
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
            title: "Total Brands",
            value: totalBrands.toString(),
            icon: BuildingStorefrontIcon,
            color: "purple"
          },
          {
            title: "Active Brands", 
            value: activeBrands.toString(),
            icon: CheckCircleIcon,
            color: "green"
          }
        ]}
      />

      {/* Search and Filter */}
      <MobileSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search brands..."
        filterOptions={filterOptions}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      {/* Brands List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-8">
            <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-muted-foreground">No brands</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new brand.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => router.push('/m/brands/create')}
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                <PlusIcon className="size-4 mr-2" />
                Create Brand
              </Button>
            </div>
          </div>
        ) : (
          filteredBrands.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  )
} 