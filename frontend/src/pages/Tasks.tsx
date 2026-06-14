import { useState } from 'react'
import { Plus, CheckCircle2, Circle, Clock } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import { useStore } from '../store/useStore'

interface Task {
  id: string
  title: string
  done: boolean
  priority: 'high' | 'medium' | 'low'
  due: string
  category: string
}

const initialTasks: Task[] = [
  { id: '1', title: 'Follow up with ABC Logistics', done: false, priority: 'high', due: 'Today', category: 'Leads' },
  { id: '2', title: 'Send proposal to Nathan Miller', done: true, priority: 'medium', due: 'Today', category: 'Deals' },
  { id: '3', title: 'Check inventory for Cascadia', done: true, priority: 'low', due: 'Today', category: 'Inventory' },
  { id: '4', title: 'Monthly sales report', done: false, priority: 'medium', due: 'Tomorrow', category: 'Reports' },
  { id: '5', title: 'Schedule service for Unit #1023', done: false, priority: 'high', due: 'May 30', category: 'Service' },
  { id: '6', title: 'Update pricing for Volvo VNL 860', done: false, priority: 'low', due: 'Jun 1', category: 'Inventory' },
]

const priorityBg = { high: 'bg-red-100 text-red-600', medium: 'bg-amber-100 text-amber-600', low: 'bg-gray-100 text-gray-500' }

export default function Tasks() {
  const { darkMode } = useStore()
  const [tasks, setTasks] = useState(initialTasks)

  const toggle = (id: string) => setTasks(t => t.map(task => task.id === id ? { ...task, done: !task.done } : task))

  const pending = tasks.filter(t => !t.done)
  const done = tasks.filter(t => t.done)

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <TopBar title="Tasks" subtitle="Manage your to-do list" />
      <div className="p-6 max-w-2xl space-y-5">
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
          <div className={`px-5 py-3 border-b ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
            <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Pending ({pending.length})</span>
          </div>
          {pending.map(task => (
            <div key={task.id} onClick={() => toggle(task.id)} className={`flex items-center gap-3 px-5 py-3.5 border-b last:border-0 cursor-pointer transition-colors ${darkMode ? 'border-[#2a2a2e] hover:bg-[#1c1c20]' : 'border-gray-50 hover:bg-gray-50'}`}>
              <Circle className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{task.title}</p>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{task.category}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${priorityBg[task.priority]}`}>{task.priority}</span>
              <div className={`flex items-center gap-1 text-xs flex-shrink-0 ${task.due === 'Today' ? 'text-red-500' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <Clock className="w-3 h-3" /> {task.due}
              </div>
            </div>
          ))}
        </div>

        {done.length > 0 && (
          <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
            <div className={`px-5 py-3 border-b ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
              <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Completed ({done.length})</span>
            </div>
            {done.map(task => (
              <div key={task.id} onClick={() => toggle(task.id)} className={`flex items-center gap-3 px-5 py-3.5 border-b last:border-0 cursor-pointer transition-colors ${darkMode ? 'border-[#2a2a2e] hover:bg-[#1c1c20]' : 'border-gray-50 hover:bg-gray-50'}`}>
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-blue-500" />
                <p className={`flex-1 text-sm line-through ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{task.title}</p>
                <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{task.category}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
