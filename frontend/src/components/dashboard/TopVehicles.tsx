import { Truck } from 'lucide-react'
import { useStore } from '../../store/useStore'

const vehicles = [
  { name: 'Freightliner Cascadia', type: 'Truck', sold: 32, revenue: '$4,160,000' },
  { name: 'Peterbilt 579', type: 'Truck', sold: 28, revenue: '$3,780,000' },
  { name: 'Utility 53\' Dry Van', type: 'Trailer', sold: 21, revenue: '$1,050,000' },
  { name: 'Great Dane Reefer', type: 'Trailer', sold: 18, revenue: '$1,260,000' },
]

export default function TopVehicles() {
  const { darkMode } = useStore()

  return (
    <div className={`rounded-2xl border ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
      <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
        <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Top Performing Vehicles</h3>
        <button className="text-xs text-blue-500 hover:text-blue-600 font-medium">View All</button>
      </div>
      <div className="px-5 py-3">
        <div className={`grid grid-cols-4 text-xs font-medium mb-2 px-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          <span className="col-span-2">Vehicle</span>
          <span>Sold</span>
          <span className="text-right">Revenue</span>
        </div>
        <div className="space-y-1">
          {vehicles.map((v, i) => (
            <div key={i} className={`grid grid-cols-4 items-center px-1 py-2 rounded-xl ${darkMode ? 'hover:bg-[#1c1c20]' : 'hover:bg-gray-50'} transition-colors`}>
              <div className="col-span-2 flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-[#1c1c20]' : 'bg-gray-100'}`}>
                  <Truck className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{v.name}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{v.type}</p>
                </div>
              </div>
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{v.sold}</span>
              <span className={`text-xs font-semibold text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>{v.revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
