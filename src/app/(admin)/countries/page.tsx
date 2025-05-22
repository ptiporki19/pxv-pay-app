import { Metadata } from 'next'
import { CountriesList } from "@/components/admin/countries-list"
import { FormModal } from "@/components/admin/form-modal"

export const metadata: Metadata = {
  title: 'Countries - PXV Pay',
  description: 'Manage countries in your payment system',
}

export default function CountriesPage() {
  return (
    <div className="flex flex-col gap-5">
      <CountriesList />
      <FormModal />
    </div>
  )
} 