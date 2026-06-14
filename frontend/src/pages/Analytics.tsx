import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import TopBar from '../components/layout/TopBar'
import { useStore } from '../store/useStore'

const revenueData = [
  { month: 'Jan', revenue: 1200000, profit: 240000 },
  { month: 'Feb', revenue: 1450000, profit: 290000 },
  { month: 'Mar', revenue: 1100000, profit: 198000 },
  { month: 'Apr', revenue: 1800000, profit: 378000 },
  { month: 'May', revenue: 2480000, profit: 496000 },
]

const categoryData = [
  { name: 'Trucks', revenue: 1800000 },
  { name: 'Trailers', revenue: 850000 },
  { name: 'Equipment', revenue: 430000 },
  { name: 'Other', revenue: 200000 },
]

const conversionData = [
  { subject: 'New Leads', A: 85 },
  { subject: 'Contacted', A: 70 },
  { subject: 'Proposal', A: 55 },
  { subject: 'Negotiation', A: 40 },
  { subject: 'Won', A: 28 },
]

export default function Analytics() {
  const { darkMode } = useStore()
  const tick = { fontSize: 11, fill: darkMode ? '#555' : '#9ca3af' }
  const grid = darkMode ? '#1f1f23' : '#f3f4f6'
  const cardCls = `rounded-2xl border p-5 ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <TopBar title="Analytics" subtitle="Business intelligence and performance metrics" />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: '$8.03M', change: '+18.4%', color: 'text-emerald-500' },
            { label: 'Total Profit', value: '$1.6M', change: '+22.1%', color: 'text-emerald-500' },
            { label: 'Avg Deal Size', value: '$138k', change: '+5.3%', color: 'text-emerald-500' },
            { label: 'Conversion Rate', value: '28%', change: '+3.2%', color: 'text-emerald-500' },
          ].map(s => (
            <div key={s.label} className={cardCls}>
              <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{s.label}</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{s.value}</p>
              <p className={`text-xs font-semibold mt-1 ${s.color}`}>{s.change} YTD</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={cardCls}>
            <h3 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Revenue vs Profit</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="month" tick={tick} axisLine={false} tickLine={false} />
                <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: darkMode ? '#1c1c20' : '#fff', border: 'none', borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="url(#profGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={cardCls}>
            <h3 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Revenue by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis type="number" tick={tick} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" tick={tick} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={{ background: darkMode ? '#1c1c20' : '#fff', border: 'none', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardCls}>
          <h3 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sales Funnel Conversion</h3>
          <div className="grid grid-cols-5 gap-3">
            {conversionData.map((s, i) => (
              <div key={s.subject} className="text-center">
                <div className={`rounded-xl p-3 mb-2 ${darkMode ? 'bg-[#1c1c20]' : 'bg-gray-50'}`}>
                  <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{s.A}%</p>
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{s.subject}</p>
                {i < conversionData.length - 1 && (
                  <div className="mt-2 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 opacity-30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
