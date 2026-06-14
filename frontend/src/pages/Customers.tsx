import { Plus, Search, Mail, Phone } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import { useStore } from '../store/useStore'
import { useState } from 'react'

const customers = [
  { id: '1', name: 'James Wilson', company: 'ABC Logistics', email: 'james@abc.com', phone: '+1 555-0101', deals: 3, totalSpent: 435000, lastContact: '2 days ago' },
  { id: '2', name: 'Nathan Miller', company: 'Global Freight', email: 'nathan@gf.com', phone: '+1 555-0102', deals: 5, totalSpent: 760000, lastContact: '1 day ago' },
  { id: '3', name: 'Sarah Chen', company: 'LogiCorp', email: 'sarah@logicorp.com', phone: '+1 555-0103', deals: 10, totalSpent: 1200000, lastContact: 'Today' },
  { id: '4', name: 'Mike Johnson', company: 'Swift Haulers', email: 'mike@swift.com', phone: '+1 555-0104', deals: 2, totalSpent: 300000, lastContact: '5 days ago' },
  { id: '5', name: 'Lisa Davis', company: 'Blue Sky Transport', email: 'lisa@bst.com', phone: '+1 555-0105', deals: 4, totalSpent: 580000, lastContact: '3 days ago' },
]

export default function Customers() {
  const { darkMode } = useStore()
  const [search, setSearch] = useState('')

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <TopBar title="Customers" subtitle="Manage your customer relationships" />
      <div className="p-6">
        <div className="flex gap-3 mb-5">
          <div className={`flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl border ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-200'}`}>
            <Search className="w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className={`flex-1 bg-transparent text-sm outline-none ${darkMode ? 'text-white placeholder-gray-600' : 'text-gray-800 placeholder-gray-400'}`} />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800">
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className={`p-5 rounded-2xl border cursor-pointer transition-all ${darkMode ? 'bg-[#111114] border-[#2a2a2e] hover:border-[#3a3a3e]' : 'bg-white border-gray-100 hover:shadow-md'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{c.name}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{c.company}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-[#1c1c20]' : 'bg-gray-50'}`}>
                  <p className={`text-xs mb-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Total Deals</p>
                  <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{c.deals}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-[#1c1c20]' : 'bg-gray-50'}`}>
                  <p className={`text-xs mb-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Total Spent</p>
                  <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>${(c.totalSpent / 1000).toFixed(0)}k</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors ${darkMode ? 'bg-[#1c1c20] text-gray-300 hover:bg-[#2a2a2e]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  <Phone className="w-3.5 h-3.5" /> Call
                </button>
                <button className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors ${darkMode ? 'bg-[#1c1c20] text-gray-300 hover:bg-[#2a2a2e]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  <Mail className="w-3.5 h-3.5" /> Email
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
