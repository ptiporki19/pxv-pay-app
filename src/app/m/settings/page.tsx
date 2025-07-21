import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings - PXV Pay Mobile',
  description: 'Manage your account settings and preferences',
}

export default function MobileSettingsPage() {
  return (
    <div className="px-4 py-3 pb-20 pt-16">
      <MobileSettingsContent />
    </div>
  )
}

// Import the content component
import { MobileSettingsContent } from '@/components/mobile/features/MobileSettingsContent'