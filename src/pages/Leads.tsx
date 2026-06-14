import { useEffect, useState } from 'react'
import { Plus, Users } from 'lucide-react'
import api from '../lib/api'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  status: 'NEW' | 'CONTACTED' | 'NEGOTIATION' | 'WON' | 'LOST'
  vehicleInterest: string
  createdAt: string
}

const statusColor: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-yellow-100 text-yellow-700',
  NEGOTIATION: 'bg-purple-100 text-purple-700',
  WON: 'bg-green-100 text-green-700',
  LOST: 'bg-red-100 text-red-600',
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/leads').then((r) => setLeads(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">{leads.length} leads</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Lead
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm text-center py-12">Loading…</p>
      ) : leads.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No leads yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((l) => (
            <div key={l.id} className="card flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm">
                  {l.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{l.name}</p>
                  <p className="text-gray-400 text-sm">{l.vehicleInterest}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[l.status]}`}>
                  {l.status}
                </span>
                <p className="text-xs text-gray-400 mt-1">{new Date(l.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
