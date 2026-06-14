import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useStore } from '../../store/useStore'

const data = [
  { day: 'May 1', revenue: 180000 },
  { day: 'May 7', revenue: 220000 },
  { day: 'May 14', revenue: 195000 },
  { day: 'May 21', revenue: 310000 },
  { day: 'May 28', revenue: 480000 },
]

export default function SalesChart() {
  const { darkMode } = useStore()

  return (
    <div className={`rounded-2xl p-5 border ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sales Overview</h3>
          <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>$2,480,000</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-xs text-emerald-500 font-semibold">+12.5%</span>
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>vs last month</span>
          </div>
        </div>
        <select className={`text-xs px-3 py-1.5 rounded-lg border ${darkMode ? 'bg-[#1c1c20] border-[#2a2a2e] text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1f1f23' : '#f3f4f6'} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: darkMode ? '#555' : '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: darkMode ? '#555' : '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: darkMode ? '#1c1c20' : '#fff', border: 'none', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#salesGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
