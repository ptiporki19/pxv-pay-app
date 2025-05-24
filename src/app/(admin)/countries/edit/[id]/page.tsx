"use client"

import { CountryFormSimple } from "@/components/forms/country-form-simple"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { countriesApi, Country } from "@/lib/supabase/client-api"
import { useParams } from "next/navigation"

export default function EditCountryPage() {
  const params = useParams()
  const [country, setCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        if (params?.id) {
          const countryData = await countriesApi.getById(params.id as string)
          setCountry(countryData)
        }
      } catch (error) {
        console.error("Error fetching country:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCountry()
  }, [params?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/countries">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Countries
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Country</h1>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border">
          <CountryFormSimple initialData={country || undefined} />
        </div>
      </div>
    </div>
  )
} 