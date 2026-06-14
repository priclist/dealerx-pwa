import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../../store/useStore'

const events = [
  { time: '10:00 AM', title: 'Team Standup', duration: '30 min', color: '#3b82f6' },
  { time: '11:00 AM', title: 'Client Meeting: ABC Logistics', duration: '1h', color: '#10b981' },
  { time: '2:00 PM', title: 'Vehicle Delivery: Unit #1023', duration: '1h', color: '#f59e0b' },
  { time: '4:00 PM', title: 'Follow up: Nathan Miller', duration: '30 min', color: '#8b5cf6' },
]

export default function CalendarWidget() {
  const { darkMode } = useStore()

  return (
    <div className={`rounded-2xl border ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
      <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
        <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>May 28, 2024</h3>
        <div className="flex items-center gap-1">
          <button className={`p-1 rounded-lg ${darkMode ? 'hover:bg-[#1c1c20] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><ChevronLeft className="w-4 h-4" /></button>
          <button className={`p-1 rounded-lg ${darkMode ? 'hover:bg-[#1c1c20] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><ChevronRight className="w-4 h-4" /></button>
          <button className={`px-2.5 py-1 text-xs font-medium rounded-lg ${darkMode ? 'bg-[#1c1c20] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>Today</button>
        </div>
      </div>
      <div className="px-4 py-3 space-y-2">
        {events.map((ev, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className={`text-xs w-16 flex-shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{ev.time}</span>
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: `${ev.color}15` }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ev.color }} />
              <span className="text-xs font-medium flex-1" style={{ color: ev.color }}>{ev.title}</span>
              <span className="text-xs" style={{ color: ev.color, opacity: 0.7 }}>{ev.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
