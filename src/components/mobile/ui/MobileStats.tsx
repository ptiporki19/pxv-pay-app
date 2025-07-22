"use client"

interface StatCard {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color?: 'purple' | 'green' | 'blue' | 'yellow' | 'red' // Made optional since we're using outline style
}

interface MobileStatsProps {
  stats: StatCard[]
}

export function MobileStats({ stats }: MobileStatsProps) {
  const getCardColor = (title: string) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('total')) {
      return 'bg-violet-100 dark:bg-violet-900/30'
    } else if (lowerTitle.includes('active')) {
      return 'bg-green-100 dark:bg-green-900/30'
    } else if (lowerTitle.includes('pending')) {
      return 'bg-yellow-100 dark:bg-yellow-900/30'
    } else if (lowerTitle.includes('approve') || lowerTitle.includes('approved')) {
      return 'bg-green-100 dark:bg-green-900/30'
    }
    return 'bg-violet-100 dark:bg-violet-900/30' // default
  }

  const getIconColor = (title: string) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('total')) {
      return 'text-violet-600 dark:text-violet-400'
    } else if (lowerTitle.includes('active')) {
      return 'text-green-600 dark:text-green-400'
    } else if (lowerTitle.includes('pending')) {
      return 'text-yellow-600 dark:text-yellow-400'
    } else if (lowerTitle.includes('approve') || lowerTitle.includes('approved')) {
      return 'text-green-600 dark:text-green-400'
    }
    return 'text-violet-600 dark:text-violet-400' // default
  }

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg ${getCardColor(stat.title)} shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 font-roboto truncate">
                {stat.title}
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white font-roboto mt-1 truncate">
                {stat.value}
              </p>
            </div>
            <stat.icon className={`h-5 w-5 ${getIconColor(stat.title)} flex-shrink-0 ml-2`} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default MobileStats