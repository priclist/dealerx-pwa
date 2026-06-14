import { useEffect, useState } from 'react'
import { Truck, Users, DollarSign, TrendingUp, Activity } from 'lucide-react'
import api from '../lib/api'

interface Stats {
  totalVehicles: number
  activeLeads: number
  monthlyRevenue: number
  profitMargin: number
}

interface Activity {
  id: string
  type: string
  description: string
  createdAt: string
}

const mockStats: Stats = {
  totalVehicles: 0,
  activeLeads: 0,
  monthlyRevenue: 0,
  profitMargin: 0,
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>(mockStats)
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    api.get('/dashboard/stats').then((r) => setStats(r.data)).catch(() => {})
    api.get('/dashboard/activity').then((r) => setActivities(r.data)).catch(() => {})
  }, [])

  const widgets = [
    { label: 'Total Inventory', value: stats.totalVehicles, icon: Truck, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Leads', value: stats.activeLeads, icon: Users, color: 'bg-green-50 text-green-600' },
    { label: 'Monthly Revenue', value: `R ${stats.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
    { label: 'Profit Margin', value: `${stats.profitMargin}%`, icon: TrendingUp, color: 'bg-orange-50 text-orange-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back — here's what's happening</p>
      </div>

      {/* Stat widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-gray-500 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-gray-500" />
          <h2 className="font-semibold">Recent Activity</h2>
        </div>
        {activities.length === 0 ? (
          <p className="text-gray-400 text-sm py-6 text-center">No recent activity yet</p>
        ) : (
          <ul className="space-y-3">
            {activities.map((a) => (
              <li key={a.id} className="flex items-start gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-black mt-1.5 flex-shrink-0" />
                <div>
                  <p>{a.description}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
