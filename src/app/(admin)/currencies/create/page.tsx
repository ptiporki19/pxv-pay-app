"use client"

import { CurrencyFormSimple } from "@/components/forms/currency-form-simple"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateCurrencyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Create Currency</h1>
        </div>

        {/* Form Container */}
        <div className="bg-card rounded-lg shadow-sm border">
          <CurrencyFormSimple />
        </div>
      </div>
    </div>
  )
} 