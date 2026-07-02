import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import TopBar from '../components/layout/TopBar'
import { useStore } from '../store/useStore'

const monthlyData = [
  { month: 'Jan', revenue: 1200000, units: 18 },
  { month: 'Feb', revenue: 1450000, units: 22 },
  { month: 'Mar', revenue: 1100000, units: 16 },
  { month: 'Apr', revenue: 1800000, units: 27 },
  { month: 'May', revenue: 2480000, units: 32 },
]

const recentSales = [
  { id: '1', vehicle: 'Freightliner Cascadia', customer: 'ABC Logistics', amount: 145000, date: 'May 28', agent: 'John Carter' },
  { id: '2', vehicle: 'Peterbilt 579', customer: 'Nathan Miller', amount: 135000, date: 'May 27', agent: 'John Carter' },
  { id: '3', vehicle: 'Volvo VNL 860', customer: 'Prime Transport', amount: 160000, date: 'May 25', agent: 'John Carter' },
  { id: '4', vehicle: 'CAT 320 Excavator', customer: 'Swift Haulers', amount: 280000, date: 'May 22', agent: 'John Carter' },
]

export default function Sales() {
  const { darkMode } = useStore()

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <TopBar title="Sales" subtitle="Monthly sales performance" />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1f1f23' : '#f3f4f6'} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: darkMode ? '#555' : '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: darkMode ? '#555' : '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: darkMode ? '#1c1c20' : '#fff', border: 'none', borderRadius: 12, fontSize: 12 }} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Units Sold</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1f1f23' : '#f3f4f6'} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: darkMode ? '#555' : '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: darkMode ? '#555' : '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: darkMode ? '#1c1c20' : '#fff', border: 'none', borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="units" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
          <div className={`px-5 py-4 border-b ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Sales</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs font-semibold uppercase tracking-wider border-b ${darkMode ? 'border-[#2a2a2e] text-gray-500' : 'border-gray-100 text-gray-400'}`}>
                <th className="px-5 py-3">Vehicle</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Agent</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map(s => (
                <tr key={s.id} className={`border-b last:border-0 ${darkMode ? 'border-[#2a2a2e] hover:bg-[#1c1c20]' : 'border-gray-50 hover:bg-gray-50'} transition-colors`}>
                  <td className="px-5 py-3.5"><span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{s.vehicle}</span></td>
                  <td className="px-5 py-3.5"><span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{s.customer}</span></td>
                  <td className="px-5 py-3.5"><span className={`text-sm font-semibold text-emerald-500`}>${s.amount.toLocaleString()}</span></td>
                  <td className="px-5 py-3.5"><span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{s.date}</span></td>
                  <td className="px-5 py-3.5"><span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{s.agent}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
