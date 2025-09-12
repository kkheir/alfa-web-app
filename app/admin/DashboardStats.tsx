import { User, Shield, BarChart3, Database, Send, Settings } from 'lucide-react'

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
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Administrators',
      value: adminCount,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Data Records',
      value: dataCount,
      icon: Database,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Distributions',
      value: distributionCount,
      icon: Send,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${stat.bgColor} rounded-lg p-3`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
