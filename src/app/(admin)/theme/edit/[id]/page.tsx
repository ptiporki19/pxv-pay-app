"use client"

import { ThemeFormSimple } from "@/components/forms/theme-form-simple"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { themesApi, Theme } from "@/lib/supabase/client-api"
import { useParams } from "next/navigation"

export default function EditThemePage() {
  const params = useParams()
  const [theme, setTheme] = useState<Theme | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        if (params?.id) {
          const themeData = await themesApi.getById(params.id as string)
          setTheme(themeData)
        }
      } catch (error) {
        console.error("Error fetching theme:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTheme()
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
          <Link href="/theme">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Themes
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Theme</h1>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border">
          <ThemeFormSimple initialData={theme || undefined} />
        </div>
      </div>
    </div>
  )
} 