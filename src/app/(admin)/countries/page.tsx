import { Metadata } from 'next'
import { CountriesList } from "@/components/admin/countries-list"

export const metadata: Metadata = {
  title: 'Countries - PXV Pay',
  description: 'Manage countries in your payment system',
}

export default function CountriesPage() {
  return (
    <div className="flex flex-col gap-5">
      <CountriesList />
    </div>
  )
} 