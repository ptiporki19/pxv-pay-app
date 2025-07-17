"use client"

interface StatCard {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: 'purple' | 'green' | 'blue' | 'yellow' | 'red'
}

interface MobileStatsProps {
  stats: StatCard[]
}

export function MobileStats({ stats }: MobileStatsProps) {
  const getCardClasses = (color: string) => {
    switch (color) {
      case 'purple':
        return 'bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/30'
      case 'green':
        return 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30'
      case 'blue':
        return 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30'
      case 'yellow':
        return 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/30'
      case 'red':
        return 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30'
      default:
        return 'bg-gradient-to-br from-muted to-muted/70'
    }
  }

  const getTextClasses = (color: string) => {
    switch (color) {
      case 'purple':
        return 'text-violet-700 dark:text-violet-300'
      case 'green':
        return 'text-emerald-700 dark:text-emerald-300'
      case 'blue':
        return 'text-blue-700 dark:text-blue-300'
      case 'yellow':
        return 'text-yellow-700 dark:text-yellow-300'
      case 'red':
        return 'text-red-700 dark:text-red-300'
      default:
        return 'text-foreground'
    }
  }

  const getIconClasses = (color: string) => {
    switch (color) {
      case 'purple':
        return 'text-violet-600 dark:text-violet-400'
      case 'green':
        return 'text-emerald-600 dark:text-emerald-400'
      case 'blue':
        return 'text-blue-600 dark:text-blue-400'
      case 'yellow':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'red':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className={`p-3 rounded-lg ${getCardClasses(stat.color)}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-medium font-lato ${getTextClasses(stat.color)}`}>
                {stat.title}
              </p>
              <p className={`text-xl font-bold font-lato ${getTextClasses(stat.color)}`}>
                {stat.value}
              </p>
            </div>
            <stat.icon className={`size-6 ${getIconClasses(stat.color)}`} />
          </div>
        </div>
      ))}
    </div>
  )
} 