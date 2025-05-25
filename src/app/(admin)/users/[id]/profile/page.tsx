import { Metadata } from 'next'
import { UserProfile } from "@/components/admin/user-profile"

interface UserProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `User Profile - PXV Pay`,
    description: 'View detailed user information and manage account',
  }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params
  
  return (
    <div className="flex flex-col gap-6">
      <UserProfile userId={id} />
    </div>
  )
} 