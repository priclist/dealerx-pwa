import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import { useStore } from '../store/useStore'

const events = [
  { id: '1', time: '10:00 AM', title: 'Team Standup', duration: '30 min', color: '#3b82f6', day: 28 },
  { id: '2', time: '11:00 AM', title: 'Client Meeting: ABC Logistics', duration: '1h', color: '#10b981', day: 28 },
  { id: '3', time: '2:00 PM', title: 'Vehicle Delivery: Unit #1023', duration: '1h', color: '#f59e0b', day: 28 },
  { id: '4', time: '4:00 PM', title: 'Follow up: Nathan Miller', duration: '30 min', color: '#8b5cf6', day: 28 },
  { id: '5', time: '9:00 AM', title: 'Inventory Review', duration: '2h', color: '#ef4444', day: 29 },
  { id: '6', time: '3:00 PM', title: 'Sales Team Meeting', duration: '1h', color: '#3b82f6', day: 29 },
]

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const dates = Array.from({ length: 35 }, (_, i) => {
  const d = i - 2
  return d > 0 && d <= 31 ? d : null
})

export default function Calendar() {
  const { darkMode } = useStore()
  const todayEvents = events.filter(e => e.day === 28)

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <TopBar title="Calendar" subtitle="Schedule and manage appointments" />
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>May 2024</h3>
              <div className="flex items-center gap-1">
                <button className={`p-1 rounded-lg ${darkMode ? 'hover:bg-[#1c1c20] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><ChevronLeft className="w-4 h-4" /></button>
                <button className={`p-1 rounded-lg ${darkMode ? 'hover:bg-[#1c1c20] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {days.map(d => (
                <div key={d} className={`text-center text-xs font-semibold py-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {dates.map((d, i) => (
                <button key={i} className={`text-center text-xs py-2 rounded-lg transition-colors ${
                  d === 28
                    ? 'bg-black text-white font-semibold'
                    : d
                      ? darkMode ? 'text-gray-300 hover:bg-[#1c1c20]' : 'text-gray-700 hover:bg-gray-100'
                      : ''
                }`}>
                  {d || ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>May 28, 2024</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-xl text-xs font-medium hover:bg-gray-800">
              <Plus className="w-3.5 h-3.5" /> Add Event
            </button>
          </div>
          <div className="space-y-3">
            {todayEvents.map(ev => (
              <div key={ev.id} className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${darkMode ? 'bg-[#111114] border-[#2a2a2e] hover:border-[#3a3a3e]' : 'bg-white border-gray-100 hover:shadow-md'}`}>
                <span className={`text-xs font-medium w-16 flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{ev.time}</span>
                <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: ev.color }} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{ev.title}</p>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{ev.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
