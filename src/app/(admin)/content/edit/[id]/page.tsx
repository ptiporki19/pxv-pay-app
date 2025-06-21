"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { SimpleProductForm } from '@/components/forms/simple-product-form'
import { productTemplatesApi } from '@/lib/supabase/product-templates-api'
import type { ProductTemplate } from '@/types/content'
import { useNotificationActions } from '@/providers/notification-provider'
import { Card, CardContent } from '@/components/ui/card'
import { Package, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { showError } = useNotificationActions()
  const [product, setProduct] = useState<ProductTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const productId = params?.id as string

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
      try {
      setLoading(true)
      const productData = await productTemplatesApi.getById(productId)
      
      if (productData) {
        setProduct(productData)
      } else {
        setNotFound(true)
        }
      } catch (error) {
      console.error('Error loading product:', error)
      showError('Error', 'Failed to load product template')
      setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

  const handleSuccess = () => {
    router.push('/content')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/content">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Products
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="text-3xl font-bold">Loading Product...</h1>
            </div>
            <div className="w-24" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="animate-pulse">
              <CardContent className="p-8 space-y-6">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
            <Card className="animate-pulse">
              <CardContent className="p-8">
                <div className="h-64 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (notFound) {
  return (
    <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
          <Link href="/content">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
                Back to Products
            </Button>
          </Link>
        </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Product Not Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                The product you're looking for doesn't exist or has been deleted.
              </p>
              <Link href="/content">
                <Button>
                  Return to Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <SimpleProductForm 
      initialData={product || undefined} 
      onSuccess={handleSuccess}
    />
  )
} 