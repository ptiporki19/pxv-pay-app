import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile - PXV Pay Mobile',
  description: 'Manage your personal profile information',
}

export default function MobileProfilePage() {
  return (
    <div className="px-4 py-3 pb-20 pt-16">
      <MobileProfileContent />
    </div>
  )
}

// Import the content component
import { MobileProfileContent } from '@/components/mobile/features/MobileProfileContent'