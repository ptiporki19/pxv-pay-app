"use client"

import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/solid"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MobileInput } from "./MobileInput"

interface FilterOption {
  id: string
  label: string
}

interface MobileSearchProps {
  searchValue: string
  onSearchChange: (value: string) => void
  placeholder?: string
  filterOptions: FilterOption[]
  activeFilter?: string
  onFilterChange?: (value: string) => void
}

export function MobileSearch({
  searchValue,
  onSearchChange,
  placeholder = "Search...",
  filterOptions,
  activeFilter,
  onFilterChange
}: MobileSearchProps) {
  return (
    <div className="mb-4">
      <div className="flex gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
          </div>
          <MobileInput
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all font-lato"
          />
        </div>

        {/* Filter Select */}
        {filterOptions.length > 0 && (
          <div className="flex-shrink-0 w-32">
            <Select value={activeFilter} onValueChange={onFilterChange}>
              <SelectTrigger className="h-[42px] text-sm bg-background border border-border font-lato">
                <div className="flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="size-4 text-muted-foreground" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id} className="text-sm font-lato">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  )
} 
 