"use client"

import { MobileEditBrandForm } from "@/components/mobile/features/MobileEditBrandForm"

interface MobileEditBrandPageProps {
  params: {
    id: string
  }
}

export default function MobileEditBrandPage({ params }: MobileEditBrandPageProps) {
  return <MobileEditBrandForm brandId={params.id} />
} 