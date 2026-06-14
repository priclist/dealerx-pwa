import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useStore } from '../../store/useStore'

const data = [
  { name: 'Trucks', value: 120, pct: '48%' },
  { name: 'Trailers', value: 80, pct: '32%' },
  { name: 'Equipment', value: 28, pct: '11%' },
  { name: 'Other', value: 20, pct: '8%' },
]

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981']

export default function InventoryChart() {
  const { darkMode } = useStore()

  return (
    <div className={`rounded-2xl p-5 border ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
      <h3 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Inventory by Type</h3>
      <div className="flex items-center gap-4">
        <div className="relative">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie data={data} cx={75} cy={75} innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: darkMode ? '#1c1c20' : '#fff', border: 'none', borderRadius: 12, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>248</span>
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Total</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}</span>
                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>({item.pct})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
