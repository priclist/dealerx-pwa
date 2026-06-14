import { useState } from 'react'
import { Plus, Search, Truck, Edit, Trash2 } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import { useStore } from '../store/useStore'

type Status = 'Available' | 'Sold' | 'Reserved'
type Category = 'Truck' | 'Trailer' | 'Equipment'

interface Vehicle {
  id: string
  name: string
  brand: string
  category: Category
  price: number
  condition: 'New' | 'Used'
  km: number
  status: Status
  year: number
}

const mockVehicles: Vehicle[] = [
  { id: '1', name: 'Cascadia', brand: 'Freightliner', category: 'Truck', price: 145000, condition: 'New', km: 0, status: 'Available', year: 2024 },
  { id: '2', name: 'Peterbilt 579', brand: 'Peterbilt', category: 'Truck', price: 135000, condition: 'Used', km: 120000, status: 'Available', year: 2022 },
  { id: '3', name: '53\' Dry Van', brand: 'Utility', category: 'Trailer', price: 48000, condition: 'New', km: 0, status: 'Reserved', year: 2024 },
  { id: '4', name: 'Reefer Trailer', brand: 'Great Dane', category: 'Trailer', price: 65000, condition: 'Used', km: 80000, status: 'Sold', year: 2021 },
  { id: '5', name: 'Volvo VNL 860', brand: 'Volvo', category: 'Truck', price: 160000, condition: 'New', km: 0, status: 'Available', year: 2024 },
  { id: '6', name: 'CAT 320', brand: 'Caterpillar', category: 'Equipment', price: 280000, condition: 'Used', km: 4500, status: 'Available', year: 2020 },
]

const statusColors: Record<Status, string> = {
  Available: 'bg-emerald-100 text-emerald-700',
  Sold: 'bg-gray-100 text-gray-500',
  Reserved: 'bg-amber-100 text-amber-700',
}

export default function Inventory() {
  const { darkMode } = useStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('All')

  const categories = ['All', 'Truck', 'Trailer', 'Equipment']
  const filtered = mockVehicles.filter(v =>
    (filter === 'All' || v.category === filter) &&
    (v.name.toLowerCase().includes(search.toLowerCase()) || v.brand.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <TopBar title="Inventory" subtitle="Manage your vehicle stock" />
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className={`flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl border ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-200'}`}>
            <Search className="w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vehicles..." className={`flex-1 bg-transparent text-sm outline-none ${darkMode ? 'text-white placeholder-gray-600' : 'text-gray-800 placeholder-gray-400'}`} />
          </div>
          <div className="flex gap-2">
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)} className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${filter === c ? 'bg-black text-white' : darkMode ? 'bg-[#111114] border border-[#2a2a2e] text-gray-300' : 'bg-white border border-gray-200 text-gray-600'}`}>{c}</button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs font-semibold uppercase tracking-wider border-b ${darkMode ? 'border-[#2a2a2e] text-gray-500' : 'border-gray-100 text-gray-400'}`}>
                <th className="px-5 py-3">Vehicle</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Year</th>
                <th className="px-5 py-3">Condition</th>
                <th className="px-5 py-3">KM/Hours</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className={`border-b last:border-0 ${darkMode ? 'border-[#2a2a2e] hover:bg-[#1c1c20]' : 'border-gray-50 hover:bg-gray-50'} transition-colors`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? 'bg-[#1c1c20]' : 'bg-gray-100'}`}>
                        <Truck className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{v.brand} {v.name}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>#{v.id.padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{v.category}</span></td>
                  <td className="px-5 py-3.5"><span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{v.year}</span></td>
                  <td className="px-5 py-3.5"><span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{v.condition}</span></td>
                  <td className="px-5 py-3.5"><span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{v.km.toLocaleString()}</span></td>
                  <td className="px-5 py-3.5"><span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>${v.price.toLocaleString()}</span></td>
                  <td className="px-5 py-3.5"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[v.status]}`}>{v.status}</span></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-[#2a2a2e] text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}><Edit className="w-3.5 h-3.5" /></button>
                      <button className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-[#2a2a2e] text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
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
