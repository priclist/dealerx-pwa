import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, TrendingUp, Zap, Bell, ExternalLink, Car } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { api } from '../../lib/api'

interface Listing {
  id: string
  title: string
  source: string
  price: number
  year: number | null
  mileage: number | null
  imageUrl: string | null
  isGoodDeal: boolean
  dealScore: number | null
  sourceUrl: string | null
}

interface Alert {
  id: string
  type: string
  message: string
  createdAt: string
}

const sourceIcons: Record<string, string> = { CARS_CO_ZA: '🚗', WEBUYCARS: '🛒', CARFIND: '🔍', WEELI: '📱', FACEBOOK_MARKETPLACE: '📘' }

export default function CarSpyWidget() {
  const navigate = useNavigate()
  const { darkMode } = useStore()
  const [listings, setListings] = useState<Listing[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)

  const fetchData = async () => {
    try {
      const [listingsData, alertsData] = await Promise.all([
        api.get<{ listings: Listing[] }>('/carspy/listings?limit=8&sort=lastSeenAt&order=desc'),
        api.get<Alert[]>('/carspy/alerts?unread=true'),
      ])
      setListings(listingsData.listings)
      setAlerts(alertsData)
    } catch { /* silent */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const triggerScrape = async () => {
    setScraping(true)
    try {
      await api.post('/carspy/run', {})
      await fetchData()
    } catch { /* silent */ }
    setScraping(false)
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
            <Search className="w-3.5 h-3.5 text-white" />
          </div>
          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>CarSpy Market Intel</span>
          {alerts.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-medium">
              {alerts.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={triggerScrape}
            disabled={scraping}
            className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
              darkMode ? 'bg-[#1c1c20] text-gray-400 hover:text-gray-200' : 'bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            {scraping ? '...' : 'Scrape'}
          </button>
          <button
            onClick={() => navigate('/carspy')}
            className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
          >
            View all
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-16 rounded-xl animate-pulse ${darkMode ? 'bg-[#1c1c20]' : 'bg-gray-100'}`} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <Car className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-medium">No listings yet</p>
            <button
              onClick={triggerScrape}
              className="mt-2 text-xs text-blue-500 hover:text-blue-600"
            >
              Run first scrape →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 3).map(alert => (
              <div
                key={alert.id}
                className={`flex items-start gap-2 p-2.5 rounded-xl text-xs border ${
                  alert.type === 'good_deal'
                    ? darkMode ? 'border-amber-500/30 bg-amber-500/5' : 'border-amber-200 bg-amber-50'
                    : alert.type === 'price_drop'
                    ? darkMode ? 'border-green-500/30 bg-green-500/5' : 'border-green-200 bg-green-50'
                    : darkMode ? 'border-blue-500/30 bg-blue-500/5' : 'border-blue-200 bg-blue-50'
                }`}>
                <span className="flex-shrink-0 mt-0.5">
                  {alert.type === 'good_deal' ? '🔥' : alert.type === 'price_drop' ? '💰' : '🆕'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{alert.message}</p>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {listings.slice(0, 5).map(listing => (
              <div key={listing.id} className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                darkMode ? 'hover:bg-[#1c1c20]' : 'hover:bg-gray-50'
              }`}>
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {listing.imageUrl ? (
                    <img src={listing.imageUrl} alt="" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <span className="text-sm">{sourceIcons[listing.source] || '🚗'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-xs font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {listing.title}
                    </p>
                    {listing.isGoodDeal && <Zap className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold">R{listing.price.toLocaleString()}</span>
                    {listing.year && <span className="text-gray-400">· {listing.year}</span>}
                    {listing.mileage !== null && <span className="text-gray-400">· {listing.mileage.toLocaleString()}km</span>}
                  </div>
                </div>
                {listing.sourceUrl && (
                  <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className={`p-1 rounded ${darkMode ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
