import { useEffect, useState } from 'react'
import { Plus, Search, Filter, Truck } from 'lucide-react'
import api from '../lib/api'

interface Vehicle {
  id: string
  name: string
  brand: string
  price: number
  condition: string
  hoursKm: number
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED'
  category: 'TRUCK' | 'TRAILER' | 'EQUIPMENT'
}

const statusColor: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  SOLD: 'bg-gray-100 text-gray-500',
  RESERVED: 'bg-orange-100 text-orange-600',
}

export default function Inventory() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/vehicles').then((r) => setVehicles(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = vehicles.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">{vehicles.length} vehicles</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Vehicle
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search vehicles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
        />
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-12">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Truck size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No vehicles found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <div key={v.id} className="card hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{v.name}</p>
                  <p className="text-gray-500 text-sm">{v.brand}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[v.status]}`}>
                  {v.status}
                </span>
              </div>
              <p className="text-xl font-bold">R {v.price.toLocaleString()}</p>
              <div className="flex gap-3 mt-2 text-xs text-gray-400">
                <span>{v.category}</span>
                <span>·</span>
                <span>{v.condition}</span>
                <span>·</span>
                <span>{v.hoursKm.toLocaleString()} hrs/km</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
