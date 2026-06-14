import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import api from '../lib/api'

interface Sale {
  id: string
  vehicleName: string
  buyPrice: number
  sellPrice: number
  profit: number
  soldAt: string
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/sales').then((r) => setSales(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const totalRevenue = sales.reduce((s, x) => s + x.sellPrice, 0)
  const totalProfit = sales.reduce((s, x) => s + x.profit, 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Sales</h1>
        <p className="text-gray-500 text-sm mt-1">{sales.length} transactions</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold mt-1">R {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-gray-500 text-sm">Total Profit</p>
          <p className="text-2xl font-bold mt-1 text-green-600">R {totalProfit.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-12">Loading…</p>
      ) : sales.length === 0 ? (
        <div className="card text-center py-12">
          <TrendingUp size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No sales recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sales.map((s) => (
            <div key={s.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">{s.vehicleName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(s.soldAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">R {s.sellPrice.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-0.5">+R {s.profit.toLocaleString()} profit</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
