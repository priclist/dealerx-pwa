import { CheckCircle2, Circle, Clock } from 'lucide-react'
import { useStore } from '../../store/useStore'

const tasks = [
  { label: 'Follow up with ABC Logistics', done: false, due: 'Due in 30m', urgent: true },
  { label: 'Send proposal to Nathan Miller', done: true, due: 'Due in 3h', urgent: false },
  { label: 'Check inventory for Cascadia', done: true, due: 'Due today', urgent: false },
  { label: 'Monthly sales report', done: false, due: 'Due tomorrow', urgent: false },
]

export default function TasksWidget() {
  const { darkMode } = useStore()

  return (
    <div className={`rounded-2xl border ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
      <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
        <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tasks</h3>
        <button className="text-xs text-blue-500 hover:text-blue-600 font-medium">View All</button>
      </div>
      <div className="px-4 py-3 space-y-2">
        {tasks.map((task, i) => (
          <div key={i} className={`flex items-start gap-3 p-2.5 rounded-xl ${darkMode ? 'hover:bg-[#1c1c20]' : 'hover:bg-gray-50'} transition-colors cursor-pointer`}>
            {task.done
              ? <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              : <Circle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            }
            <div className="flex-1 min-w-0">
              <p className={`text-xs ${task.done ? 'line-through' : ''} ${darkMode ? task.done ? 'text-gray-600' : 'text-gray-200' : task.done ? 'text-gray-400' : 'text-gray-700'}`}>
                {task.label}
              </p>
            </div>
            <div className={`flex items-center gap-1 flex-shrink-0 text-xs ${task.urgent ? 'text-red-500' : darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              <Clock className="w-3 h-3" />
              {task.due}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
