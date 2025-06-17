import { Metadata } from 'next'
import { TransactionsContent } from "@/components/admin/transactions-content"

export const metadata: Metadata = {
  title: 'Transactions - PXV Pay',
  description: 'View and manage all payment transactions',
}

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <TransactionsContent />
    </div>
  )
} 