"use client"

import { CurrencyFormSimple } from "@/components/forms/currency-form-simple"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { currenciesApi, Currency } from "@/lib/supabase/client-api"
import { useParams } from "next/navigation"

export default function EditCurrencyPage() {
  const params = useParams()
  const [currency, setCurrency] = useState<Currency | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        if (params?.id) {
          const currencyData = await currenciesApi.getById(params.id as string)
          setCurrency(currencyData)
        }
      } catch (error) {
        console.error("Error fetching currency:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrency()
  }, [params?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/currencies">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Currencies
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Currency</h1>
        </div>

        {/* Form Container */}
        <div className="bg-card rounded-lg shadow-sm border">
          <CurrencyFormSimple initialData={currency || undefined} />
        </div>
      </div>
    </div>
  )
} 