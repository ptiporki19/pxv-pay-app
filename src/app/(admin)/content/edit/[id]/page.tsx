"use client"

import { ContentFormSimple } from "@/components/forms/content-form-simple"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { contentTemplatesApi, ContentTemplate } from "@/lib/supabase/client-api"
import { useParams } from "next/navigation"

export default function EditContentPage() {
  const params = useParams()
  const [template, setTemplate] = useState<ContentTemplate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        if (params?.id) {
          const templateData = await contentTemplatesApi.getById(params.id as string)
          setTemplate(templateData)
        }
      } catch (error) {
        console.error("Error fetching content template:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplate()
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
          <Link href="/content">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Content Templates
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Content Template</h1>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border">
          <ContentFormSimple initialData={template || undefined} />
        </div>
      </div>
    </div>
  )
} 