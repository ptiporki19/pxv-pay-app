import { Metadata } from 'next'
import { ProfileContent } from "@/components/admin/profile-content"

export const metadata: Metadata = {
  title: 'Profile - PXV Pay',
  description: 'Manage your personal profile information',
}

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <ProfileContent />
    </div>
  )
} 