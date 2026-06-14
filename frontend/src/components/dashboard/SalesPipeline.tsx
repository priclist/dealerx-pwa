import { useStore } from '../../store/useStore'

const stages = [
  {
    label: 'New Lead', count: 12, value: '$525,000', color: '#3b82f6',
    deals: [
      { name: 'ABC Logistics', product: 'Freightliner Cascadia', time: 'Today' },
      { name: 'Fast Lane Co.', product: 'Utility S3\' Dry Van', time: 'Yesterday' },
    ]
  },
  {
    label: 'Contacted', count: 8, value: '$760,000', color: '#8b5cf6',
    deals: [
      { name: 'Global Freight', product: '5 Units', time: 'Today' },
      { name: 'Prime Transport', product: 'Volvo VNL 860', time: 'May 29' },
    ]
  },
  {
    label: 'Proposal', count: 6, value: '$300,000', color: '#f59e0b',
    deals: [
      { name: 'LogiCorp', product: '10 Units', time: 'May 29' },
      { name: 'Swift Haulers', product: '3 Units', time: 'Yesterday' },
    ]
  },
  {
    label: 'Negotiation', count: 4, value: '$350,000', color: '#ef4444',
    deals: [
      { name: 'ShipFlight', product: 'Reefer Trailer', time: 'May 28' },
      { name: 'Next Level Inc.', product: 'Peterbilt 579', time: 'May 21' },
    ]
  },
  {
    label: 'Closed Won', count: 3, value: '$180,000', color: '#10b981',
    deals: [
      { name: 'Blue Sky Transport', product: '3 Units', time: 'May 25' },
      { name: 'Haul Masters', product: '2 Units', time: 'May 18' },
    ]
  },
]

export default function SalesPipeline() {
  const { darkMode } = useStore()

  return (
    <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
      <div className={`px-5 py-4 border-b ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
        <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sales Pipeline</h3>
      </div>
      <div className="grid grid-cols-5 divide-x overflow-x-auto" style={{ borderColor: darkMode ? '#2a2a2e' : '#f3f4f6' }}>
        {stages.map((stage) => (
          <div key={stage.label} className={`p-4 min-w-[140px] ${darkMode ? 'divide-[#2a2a2e]' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stage.color }} />
              <span className={`text-xs font-medium truncate ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {stage.label} ({stage.count})
              </span>
            </div>
            <p className={`text-sm font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stage.value}</p>
            <div className="space-y-2">
              {stage.deals.map((deal) => (
                <div key={deal.name} className={`p-2.5 rounded-xl border ${darkMode ? 'bg-[#1c1c20] border-[#2a2a2e]' : 'bg-gray-50 border-gray-100'}`}>
                  <p className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{deal.name}</p>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{deal.product}</p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{deal.time}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
