import { Plus, Phone, Mail, MoreHorizontal } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import { useStore } from '../store/useStore'

type LeadStatus = 'New' | 'Contacted' | 'Negotiation' | 'Won' | 'Lost'

interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone: string
  vehicle: string
  value: number
  status: LeadStatus
  agent: string
}

const mockLeads: Lead[] = [
  { id: '1', name: 'James Wilson', company: 'ABC Logistics', email: 'james@abc.com', phone: '+1 555-0101', vehicle: 'Freightliner Cascadia', value: 145000, status: 'New', agent: 'John Carter' },
  { id: '2', name: 'Nathan Miller', company: 'Global Freight', email: 'nathan@gf.com', phone: '+1 555-0102', vehicle: 'Peterbilt 579', value: 135000, status: 'Contacted', agent: 'John Carter' },
  { id: '3', name: 'Sarah Chen', company: 'LogiCorp', email: 'sarah@logicorp.com', phone: '+1 555-0103', vehicle: '5 Units', value: 300000, status: 'Negotiation', agent: 'John Carter' },
  { id: '4', name: 'Mike Johnson', company: 'Swift Haulers', email: 'mike@swift.com', phone: '+1 555-0104', vehicle: 'Volvo VNL 860', value: 160000, status: 'Won', agent: 'John Carter' },
  { id: '5', name: 'Lisa Davis', company: 'Blue Sky Transport', email: 'lisa@bst.com', phone: '+1 555-0105', vehicle: 'Reefer Trailer', value: 65000, status: 'Lost', agent: 'John Carter' },
]

const columns: LeadStatus[] = ['New', 'Contacted', 'Negotiation', 'Won', 'Lost']

const colColors: Record<LeadStatus, string> = {
  New: '#3b82f6',
  Contacted: '#8b5cf6',
  Negotiation: '#f59e0b',
  Won: '#10b981',
  Lost: '#ef4444',
}

export default function Leads() {
  const { darkMode } = useStore()

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <TopBar title="Leads" subtitle="Track and manage your sales pipeline" />
      <div className="p-6">
        <div className="flex justify-end mb-5">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>

        <div className="grid grid-cols-5 gap-4 overflow-x-auto">
          {columns.map((col) => {
            const leads = mockLeads.filter(l => l.status === col)
            return (
              <div key={col} className="min-w-[220px]">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: colColors[col] }} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{col}</span>
                  <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${darkMode ? 'bg-[#1c1c20] text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{leads.length}</span>
                </div>
                <div className="space-y-3">
                  {leads.map(lead => (
                    <div key={lead.id} className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#111114] border-[#2a2a2e] hover:border-[#3a3a3e]' : 'bg-white border-gray-100 hover:shadow-md'} transition-all cursor-pointer`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{lead.name}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{lead.company}</p>
                        </div>
                        <button className={`p-1 rounded-lg ${darkMode ? 'hover:bg-[#2a2a2e] text-gray-600' : 'hover:bg-gray-100 text-gray-400'}`}>
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className={`text-xs mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{lead.vehicle}</p>
                      <p className={`text-sm font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>${lead.value.toLocaleString()}</p>
                      <div className="flex gap-2">
                        <button className={`p-1.5 rounded-lg flex-1 flex items-center justify-center gap-1 text-xs ${darkMode ? 'bg-[#1c1c20] text-gray-400 hover:bg-[#2a2a2e]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                          <Phone className="w-3 h-3" /> Call
                        </button>
                        <button className={`p-1.5 rounded-lg flex-1 flex items-center justify-center gap-1 text-xs ${darkMode ? 'bg-[#1c1c20] text-gray-400 hover:bg-[#2a2a2e]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                          <Mail className="w-3 h-3" /> Email
                        </button>
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
