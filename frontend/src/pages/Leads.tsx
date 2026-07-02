import { useState, useEffect } from 'react'
import { Plus, Phone, Mail, MoreHorizontal } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import { useStore } from '../store/useStore'
import api from '../lib/api'

type LeadStatus = 'New' | 'Contacted' | 'Negotiation' | 'Won' | 'Lost'

interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  vehicleInterest: string | null
  status: string
  notes: string | null
  assignedToName: string | null
}

const columns: LeadStatus[] = ['New', 'Contacted', 'Negotiation', 'Won', 'Lost']

const colColors: Record<LeadStatus, string> = {
  New: '#3b82f6',
  Contacted: '#8b5cf6',
  Negotiation: '#f59e0b',
  Won: '#10b981',
  Lost: '#ef4444',
}

function toTitleCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export default function Leads() {
  const { darkMode } = useStore()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Lead[]>('/leads')
      .then((data) => {
        setLeads(data)
        setLoading(false)
      })
      .catch((err: any) => {
        setError(err instanceof Error ? err.message : 'Failed to load leads')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <TopBar title="Leads" subtitle="Track and manage your sales pipeline" />
      <div className="p-6">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex justify-end mb-5">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>

        <div className="grid grid-cols-5 gap-4 overflow-x-auto">
          {columns.map((col) => {
            const colLeads = leads.filter(l => toTitleCase(l.status) === col)
            return (
              <div key={col} className="min-w-[220px]">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: colColors[col] }} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{col}</span>
                  <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${darkMode ? 'bg-[#1c1c20] text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{colLeads.length}</span>
                </div>
                <div className="space-y-3">
                  {colLeads.map(lead => (
                    <div key={lead.id} className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#111114] border-[#2a2a2e] hover:border-[#3a3a3e]' : 'bg-white border-gray-100 hover:shadow-md'} transition-all cursor-pointer`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{lead.name}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{lead.assignedToName || 'Unassigned'}</p>
                        </div>
                        <button className={`p-1 rounded-lg ${darkMode ? 'hover:bg-[#2a2a2e] text-gray-600' : 'hover:bg-gray-100 text-gray-400'}`}>
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className={`text-xs mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{lead.vehicleInterest || 'No vehicle specified'}</p>
                      <div className="flex gap-2">
                        {lead.phone && (
                          <button className={`p-1.5 rounded-lg flex-1 flex items-center justify-center gap-1 text-xs ${darkMode ? 'bg-[#1c1c20] text-gray-400 hover:bg-[#2a2a2e]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                            <Phone className="w-3 h-3" /> Call
                          </button>
                        )}
                        {lead.email && (
                          <button className={`p-1.5 rounded-lg flex-1 flex items-center justify-center gap-1 text-xs ${darkMode ? 'bg-[#1c1c20] text-gray-400 hover:bg-[#2a2a2e]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                            <Mail className="w-3 h-3" /> Email
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
