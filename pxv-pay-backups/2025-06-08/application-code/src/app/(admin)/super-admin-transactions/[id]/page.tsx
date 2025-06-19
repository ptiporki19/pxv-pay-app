import { Metadata } from 'next'
import { TransactionDetailContent } from "@/components/admin/transaction-detail-content"

export const metadata: Metadata = {
  title: 'Transaction Details - PXV Pay',
  description: 'View detailed transaction information',
}

interface SuperAdminTransactionDetailProps {
  params: { id: string }
}

export default async function SuperAdminTransactionDetailPage({ params }: SuperAdminTransactionDetailProps) {
  const { id } = await params

  return (
    <div className="flex flex-col gap-6">
      <TransactionDetailContent transactionId={id} backUrl="/super-admin-transactions" />
    </div>
  )
} 