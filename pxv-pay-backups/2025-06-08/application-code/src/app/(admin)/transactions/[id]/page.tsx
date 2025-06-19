import { Metadata } from 'next'
import { TransactionDetailContent } from "@/components/admin/transaction-detail-content"

export const metadata: Metadata = {
  title: 'Transaction Details - PXV Pay',
  description: 'View detailed transaction information',
}

interface TransactionDetailPageProps {
  params: {
    id: string
  }
}

export default function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <TransactionDetailContent transactionId={params.id} />
    </div>
  )
} 