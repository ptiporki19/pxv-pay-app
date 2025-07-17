"use client"

import { MobileEditProductForm } from "@/components/mobile/features/MobileEditProductForm"

interface MobileEditProductPageProps {
  params: {
    id: string
  }
}

export default function MobileEditProductPage({ params }: MobileEditProductPageProps) {
  return <MobileEditProductForm productId={params.id} />
} 