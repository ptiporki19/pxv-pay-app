import { Metadata } from 'next'
import { UsersList } from "@/components/admin/users-list"

export const metadata: Metadata = {
  title: 'User Management - PXV Pay',
  description: 'Manage platform users and their permissions',
}

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-5">
      <UsersList />
    </div>
  )
} 