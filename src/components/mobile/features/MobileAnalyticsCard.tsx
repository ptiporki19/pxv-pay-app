"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowPathIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

interface TimeInterval {
  value: string
  label: string
}

interface MobileAnalyticsCardProps {
  title: string
  icon: React.ReactNode
  data: any[]
  loading: boolean
  error?: string | null
  timeInterval?: string
  onTimeIntervalChange?: (interval: string) => void
  timeIntervals?: TimeInterval[]
  selectedCountry?: string
  onCountryChange?: (country: string) => void
  countries?: string[]
  bestPerformer?: string
  className?: string
  children?: React.ReactNode
}

const defaultTimeIntervals: TimeInterval[] = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 3 months" }
]

export function MobileAnalyticsCard({
  title,
  icon,
  data,
  loading,
  error,
  timeInterval = "30",
  onTimeIntervalChange,
  timeIntervals = defaultTimeIntervals,
  selectedCountry = "All Countries",
  onCountryChange,
  countries = [],
  bestPerformer,
  className,
  children
}: MobileAnalyticsCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleTimeIntervalChange = async (newInterval: string) => {
    if (onTimeIntervalChange) {
      setIsRefreshing(true)
      try {
        await onTimeIntervalChange(newInterval)
      } finally {
        setIsRefreshing(false)
      }
    }
  }

  const handleCountryChange = async (newCountry: string) => {
    if (onCountryChange) {
      setIsRefreshing(true)
      try {
        await onCountryChange(newCountry)
      } finally {
        setIsRefreshing(false)
      }
    }
  }

  return (
    <Card className={cn(
      "border border-border rounded-lg bg-card shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200",
      className
    )}>
      <CardHeader className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-normal text-card-foreground">
              {title}
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            {onCountryChange && countries.length > 0 && (
              <Select value={selectedCountry} onValueChange={handleCountryChange}>
                <SelectTrigger className="w-[110px] h-7 text-xs font-normal">
                  <SelectValue className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country} className="text-xs font-normal truncate">
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {onTimeIntervalChange && (
              <Select value={timeInterval} onValueChange={handleTimeIntervalChange}>
                <SelectTrigger className="w-[90px] h-7 text-xs font-normal">
                  <SelectValue className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  {timeIntervals.map((interval) => (
                    <SelectItem key={interval.value} value={interval.value} className="text-xs font-normal truncate">
                      {interval.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3">
        {(loading || isRefreshing) ? (
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2">
              <ArrowPathIcon className="h-4 w-4 animate-spin text-violet-600" />
              <span className="text-sm font-normal text-muted-foreground">
                {isRefreshing ? "Updating..." : `Loading ${title.toLowerCase()}...`}
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <p className="text-sm font-normal text-destructive">{error}</p>
              <p className="text-xs font-normal text-muted-foreground mt-1">Please try again</p>
            </div>
          </div>
        ) : (
          <>
            {children}
            
            {bestPerformer && (
              <div className="mt-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-normal text-muted-foreground">Best Performing:</span>
                  <span className="text-sm font-normal text-card-foreground truncate max-w-[60%]">
                    {bestPerformer}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}