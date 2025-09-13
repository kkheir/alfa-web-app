import { User, Shield, BarChart3, Database, Send, Settings } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface DashboardStatsProps {
  userCount: number
  adminCount: number
  dataCount?: number
  distributionCount?: number
}

export default function DashboardStats({ 
  userCount, 
  adminCount, 
  dataCount = 0, 
  distributionCount = 0 
}: DashboardStatsProps) {
  const stats = [
    {
      name: 'Total Users',
      value: userCount,
      icon: User,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      name: 'Administrators',
      value: adminCount,
      icon: Shield,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      name: 'Data Records',
      value: dataCount,
      icon: Database,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      name: 'Distributions',
      value: distributionCount,
      icon: Send,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center p-4">
            <div className={`flex-shrink-0 ${stat.bgColor} rounded-lg p-3`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
