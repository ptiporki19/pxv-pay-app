import { Metadata } from 'next'
import { CurrenciesList } from "@/components/admin/currencies-list"

export const metadata: Metadata = {
  title: 'Currencies - PXV Pay',
  description: 'Manage currencies in your payment system',
}

export default function CurrenciesPage() {
  return (
    <div className="flex flex-col gap-5">
      <CurrenciesList />
    </div>
  )
} 