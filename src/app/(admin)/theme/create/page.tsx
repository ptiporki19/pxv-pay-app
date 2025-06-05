"use client"

import { ThemeFormSimple } from "@/components/forms/theme-form-simple"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateThemePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/theme">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Themes
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Theme</h1>
        </div>

        {/* Form Container */}
        <div className="bg-card rounded-lg shadow-sm border">
          <ThemeFormSimple />
        </div>
      </div>
    </div>
  )
} 