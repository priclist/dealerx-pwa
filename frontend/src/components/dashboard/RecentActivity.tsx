import { UserPlus, Handshake, Package, Wrench } from 'lucide-react'
import { useStore } from '../../store/useStore'

const activities = [
  { icon: UserPlus, color: '#3b82f6', title: 'New lead: ABC Logistics', sub: 'Freightliner Cascadia', time: '2 min ago', type: 'lead' },
  { icon: Handshake, color: '#10b981', title: 'Deal closed: Nathan Miller', sub: '$125,000', time: '1 hour ago', type: 'deal' },
  { icon: Package, color: '#8b5cf6', title: 'New vehicle added', sub: '2024 Freightliner Cascadia', time: '3 hours ago', type: 'vehicle' },
  { icon: Wrench, color: '#f59e0b', title: 'Service scheduled', sub: 'Unit #1023', time: '5 hours ago', type: 'service' },
]

export default function RecentActivity() {
  const { darkMode } = useStore()

  return (
    <div className={`rounded-2xl p-5 border ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
        <button className="text-xs text-blue-500 hover:text-blue-600 font-medium">View All</button>
      </div>
      <div className="space-y-4">
        {activities.map((item, i) => {
          const Icon = item.icon
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15` }}>
                <Icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium leading-tight ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.title}</p>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{item.sub}</p>
              </div>
              <span className={`text-xs flex-shrink-0 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{item.time}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
