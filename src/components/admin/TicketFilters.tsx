'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

interface TicketFiltersProps {
  categories: string[]
  currentSearch?: string
  currentStatus?: string
  currentCategory?: string
}

export function TicketFilters({ 
  categories, 
  currentSearch, 
  currentStatus, 
  currentCategory 
}: TicketFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateSearchParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tickets..."
          className="pl-10"
          defaultValue={currentSearch}
          onChange={(e) => {
            updateSearchParams('search', e.target.value || null)
          }}
        />
      </div>
      
      <div className="flex gap-2">
        <Select 
          defaultValue={currentStatus || 'all'}
          onValueChange={(value) => updateSearchParams('status', value)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          defaultValue={currentCategory || 'all'}
          onValueChange={(value) => updateSearchParams('category', value)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 
 
 
 
 