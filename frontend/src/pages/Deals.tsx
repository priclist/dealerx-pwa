import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import { useStore } from '../store/useStore'

const deals = [
  { id: '1', vehicle: 'Freightliner Cascadia', customer: 'ABC Logistics', buyPrice: 110000, sellPrice: 145000, margin: 35000, date: 'May 28, 2024', status: 'Closed' },
  { id: '2', vehicle: 'Peterbilt 579', customer: 'Nathan Miller', buyPrice: 95000, sellPrice: 135000, margin: 40000, date: 'May 27, 2024', status: 'Closed' },
  { id: '3', vehicle: '5x Utility 53\' Dry Van', customer: 'LogiCorp', buyPrice: 180000, sellPrice: 240000, margin: 60000, date: 'May 25, 2024', status: 'Pending' },
  { id: '4', vehicle: 'Volvo VNL 860', customer: 'Prime Transport', buyPrice: 125000, sellPrice: 160000, margin: 35000, date: 'May 22, 2024', status: 'Pending' },
  { id: '5', vehicle: 'CAT 320', customer: 'Swift Haulers', buyPrice: 220000, sellPrice: 280000, margin: 60000, date: 'May 20, 2024', status: 'Closed' },
]

export default function Deals() {
  const { darkMode } = useStore()
  const totalRevenue = deals.reduce((s, d) => s + d.sellPrice, 0)
  const totalMargin = deals.reduce((s, d) => s + d.margin, 0)
  const avgMarginPct = Math.round((totalMargin / totalRevenue) * 100)

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <TopBar title="Deals" subtitle="Track your deals and profitability" />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, positive: true },
            { label: 'Total Profit', value: `$${totalMargin.toLocaleString()}`, positive: true },
            { label: 'Avg Margin', value: `${avgMarginPct}%`, positive: avgMarginPct > 20 },
          ].map(s => (
            <div key={s.label} className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
              <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{s.label}</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{s.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {s.positive ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                <span className={`text-xs font-medium ${s.positive ? 'text-emerald-500' : 'text-red-500'}`}>Strong performance</span>
              </div>
            </div>
          ))}
        </div>

        <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>All Deals</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800">
              <Plus className="w-3.5 h-3.5" /> New Deal
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs font-semibold uppercase tracking-wider border-b ${darkMode ? 'border-[#2a2a2e] text-gray-500' : 'border-gray-100 text-gray-400'}`}>
                <th className="px-5 py-3">Vehicle</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Buy Price</th>
                <th className="px-5 py-3">Sell Price</th>
                <th className="px-5 py-3">Margin</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {deals.map(d => (
                <tr key={d.id} className={`border-b last:border-0 ${darkMode ? 'border-[#2a2a2e] hover:bg-[#1c1c20]' : 'border-gray-50 hover:bg-gray-50'} transition-colors`}>
                  <td className="px-5 py-3.5"><span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{d.vehicle}</span></td>
                  <td className="px-5 py-3.5"><span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{d.customer}</span></td>
                  <td className="px-5 py-3.5"><span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>${d.buyPrice.toLocaleString()}</span></td>
                  <td className="px-5 py-3.5"><span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>${d.sellPrice.toLocaleString()}</span></td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold text-emerald-500">+${d.margin.toLocaleString()}</span>
                    <span className={`text-xs ml-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>({Math.round(d.margin / d.sellPrice * 100)}%)</span>
                  </td>
                  <td className="px-5 py-3.5"><span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{d.date}</span></td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${d.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{d.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
