import { Metadata } from 'next'
import { SettingsContent } from "@/components/admin/settings-content"

export const metadata: Metadata = {
  title: 'Settings - PXV Pay',
  description: 'Manage your application settings and preferences',
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <SettingsContent />
    </div>
  )
} 