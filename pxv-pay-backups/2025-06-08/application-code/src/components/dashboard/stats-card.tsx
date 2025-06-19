import Link from 'next/link'
import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  description: string
  icon: ReactNode
  href: string
  color?: string
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  href,
  color,
  className = ""
}: StatsCardProps) {
  return (
    <Link href={href}>
      <Card className={`shadow-sm hover:shadow-md transition-shadow cursor-pointer ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={color ? `text-${color}-500` : "text-gray-500"}>
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${color ? `text-${color}-600` : ""}`}>
            {value}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
} 