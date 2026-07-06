import { useState, useEffect } from 'react'
import {
  Search, RefreshCw, TrendingUp, AlertTriangle, Car, Globe,
  Filter, ExternalLink, ChevronDown, Clock, Zap, Bell
} from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import { useStore } from '../store/useStore'
import { api } from '../lib/api'

interface Listing {
  id: string
  title: string
  source: string
  sourceUrl: string | null
  price: number
  originalPrice: number | null
  year: number | null
  mileage: number | null
  location: string | null
  imageUrl: string | null
  description: string | null
  brand: string | null
  model: string | null
  status: string
  isGoodDeal: boolean
  dealScore: number | null
  firstSeenAt: string
  lastSeenAt: string
}

interface Alert {
  id: string
  type: string
  message: string
  read: boolean
  createdAt: string
  listing: { id: string; title: string; price: number; sourceUrl: string | null }
}

interface Stats {
  totalListings: number
  newListings: number
  goodDeals: number
  unreadAlerts: number
}

interface ScrapeRun {
  id: string
  status: string
  listingsFound: number
  listingsNew: number
  listingsUpdated: number
  error: string | null
  startedAt: string
  completedAt: string | null
  source: { label: string } | null
}

interface FilterConfig {
  id: string
  name: string
  enabled: boolean
  minYear: number | null
  maxPrice: number | null
  maxMileage: number | null
  brands: string | null
  minDealScore: number | null
}

const sourceIcons: Record<string, string> = {
  CARS_CO_ZA: '🚗',
  WEBUYCARS: '🛒',
  CARFIND: '🔍',
  WEELI: '📱',
  FACEBOOK_MARKETPLACE: '📘',
}

const sourceNames: Record<string, string> = {
  CARS_CO_ZA: 'Cars.co.za',
  WEBUYCARS: 'WeBuyCars',
  CARFIND: 'CarFind',
  WEELI: 'Weeli',
  FACEBOOK_MARKETPLACE: 'Facebook',
}

const statusBadge: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  SEEN: 'bg-gray-100 text-gray-600',
  PRICE_DROPPED: 'bg-green-100 text-green-700',
  SOLD: 'bg-red-100 text-red-700',
  IGNORED: 'bg-gray-200 text-gray-400',
}

function RedXLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <polygon points="0,20 35,50 0,80" fill="#dc2626" />
      <polygon points="30,0 65,30 100,0" fill="#ef4444" />
      <polygon points="35,50 65,80 30,100" fill="#b91c1c" />
      <polygon points="65,30 100,60 65,80" fill="#f87171" />
    </svg>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  const { darkMode } = useStore()
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  )
}

function ListingCard({ listing, darkMode }: { listing: Listing; darkMode: boolean }) {
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all hover:shadow-lg ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
      <div className="flex flex-col sm:flex-row">
        {listing.imageUrl ? (
          <div className="w-full sm:w-48 h-40 sm:h-auto bg-gray-100 flex-shrink-0">
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        ) : (
          <div className={`w-full sm:w-48 h-40 flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-[#1c1c20]' : 'bg-gray-50'}`}>
            <Car className="w-10 h-10 text-gray-300" />
          </div>
        )}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{sourceIcons[listing.source] || '🌍'}</span>
                <span className="text-xs text-gray-500">{sourceNames[listing.source] || listing.source}</span>
                {listing.isGoodDeal && (
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">🔥 Good Deal</span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs ${statusBadge[listing.status] || 'bg-gray-100'}`}>
                  {listing.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className={`font-semibold text-sm mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {listing.title}
              </h3>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                {listing.year && <span>📅 {listing.year}</span>}
                {listing.mileage !== null && <span>📍 {listing.mileage.toLocaleString()} km</span>}
                {listing.location && <span>🗺️ {listing.location}</span>}
              </div>
              {listing.description && (
                <p className={`text-xs mb-2 line-clamp-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {listing.description}
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                R{listing.price.toLocaleString()}
              </p>
              {listing.originalPrice && listing.originalPrice > listing.price && (
                <p className="text-xs text-red-500 line-through">R{listing.originalPrice.toLocaleString()}</p>
              )}
              {listing.dealScore !== null && listing.dealScore > 0 && (
                <div className="mt-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span className="text-xs text-amber-600 font-medium">{Math.round(listing.dealScore)}%</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-[#2a2a2e]">
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <Clock className="w-3 h-3 inline mr-1" />
              Seen {new Date(listing.lastSeenAt).toLocaleDateString()}
            </span>
            {listing.sourceUrl && (
              <a
                href={listing.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CarSpy() {
  const { darkMode } = useStore()
  const [activeTab, setActiveTab] = useState<'listings' | 'alerts' | 'filters' | 'runs'>('listings')
  const [stats, setStats] = useState<Stats | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [runs, setRuns] = useState<ScrapeRun[]>([])
  const [filters, setFilters] = useState<FilterConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [scraping, setScraping] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [newFilter, setNewFilter] = useState({ name: '', maxPrice: 350000, maxMileage: 80000, minYear: 2019, minDealScore: 70, brands: '' })

  const fetchData = async () => {
    try {
      const [statsData, listingsData, alertsData, runsData, filtersData] = await Promise.all([
        api.get<Stats>('/carspy/stats'),
        api.get<{ listings: Listing[] }>('/carspy/listings?limit=100'),
        api.get<Alert[]>('/carspy/alerts'),
        api.get<ScrapeRun[]>('/carspy/runs'),
        api.get<FilterConfig[]>('/carspy/filters'),
      ])
      setStats(statsData)
      setListings(listingsData.listings)
      setAlerts(alertsData)
      setRuns(runsData)
      setFilters(filtersData)
    } catch (err) {
      console.error('Failed to fetch CarSpy data:', err)
    }
  }

  useEffect(() => { fetchData() }, [])

  const triggerScrape = async () => {
    setScraping(true)
    try {
      await api.post('/carspy/run', {})
      await fetchData()
    } catch (err) {
      console.error('Scrape failed:', err)
    }
    setScraping(false)
  }

  const applyFilters = async () => {
    setLoading(true)
    try {
      await api.post('/carspy/apply-filters', {})
      await fetchData()
    } catch (err) {
      console.error('Apply filters failed:', err)
    }
    setLoading(false)
  }

  const createFilter = async () => {
    try {
      await api.post('/carspy/filters', newFilter)
      setShowFilterModal(false)
      setNewFilter({ name: '', maxPrice: 350000, maxMileage: 80000, minYear: 2019, minDealScore: 70, brands: '' })
      const data = await api.get<FilterConfig[]>('/carspy/filters')
      setFilters(data)
    } catch (err) {
      console.error('Create filter failed:', err)
    }
  }

  const markAlertRead = async (id: string) => {
    try {
      await api.patch(`/carspy/alerts/${id}/read`, {})
      const data = await api.get<Alert[]>('/carspy/alerts')
      setAlerts(data)
    } catch (err) {
      console.error('Mark alert read failed:', err)
    }
  }

  const filteredListings = listings.filter(l =>
    !search || l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.brand?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <TopBar title="CarSpy" subtitle="Market intelligence — scrape, find, and track good deals" />

      <div className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard icon={Car} label="Total Listings" value={stats.totalListings} color="bg-blue-600" />
            <StatCard icon={TrendingUp} label="New" value={stats.newListings} color="bg-emerald-600" />
            <StatCard icon={Zap} label="Good Deals" value={stats.goodDeals} color="bg-amber-600" />
            <StatCard icon={Bell} label="Unread Alerts" value={stats.unreadAlerts} color="bg-red-600" />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={triggerScrape}
            disabled={scraping}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              darkMode ? 'bg-[#1c1c20] text-gray-200 hover:bg-[#2a2a2e] border border-[#2a2a2e]' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${scraping ? 'animate-spin' : ''}`} />
            {scraping ? 'Scraping...' : 'Scrape All'}
          </button>
          <button
            onClick={applyFilters}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-black text-white hover:bg-gray-800 transition-all"
          >
            <Filter className="w-4 h-4" />
            {loading ? 'Analyzing...' : 'Find Good Deals'}
          </button>
          <button
            onClick={() => setShowFilterModal(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              darkMode ? 'bg-[#1c1c20] text-gray-200 hover:bg-[#2a2a2e] border border-[#2a2a2e]' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Add Filter
          </button>
        </div>

        {/* Tab bar */}
        <div className={`flex gap-1 p-1 rounded-xl ${darkMode ? 'bg-[#1c1c20]' : 'bg-white border border-gray-100'}`}>
          {(['listings', 'alerts', 'filters', 'runs'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-black text-white shadow-sm'
                  : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {tab === 'alerts' && alerts.filter(a => !a.read).length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs">
                  {alerts.filter(a => !a.read).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search (listings only) */}
        {activeTab === 'listings' && (
          <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
            darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-200'
          }`}>
            <Search className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or brand..."
              className={`flex-1 bg-transparent text-sm outline-none ${
                darkMode ? 'text-gray-200 placeholder-gray-600' : 'text-gray-700 placeholder-gray-400'
              }`}
            />
            <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {filteredListings.length} results
            </span>
          </div>
        )}

        {/* Listings tab */}
        {activeTab === 'listings' && (
          <div className="space-y-3">
            {filteredListings.length === 0 ? (
              <div className={`text-center py-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No listings yet</p>
                <p className="text-xs mt-1">Run a scrape to fetch car listings from marketplaces</p>
              </div>
            ) : (
              <>
                {/* Source filter pills */}
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(sourceNames).map(([key, name]) => {
                    const count = listings.filter(l => l.source === key).length
                    return (
                      <span key={key} className={`px-3 py-1 rounded-full text-xs border ${
                        darkMode ? 'border-[#2a2a2e] text-gray-400' : 'border-gray-200 text-gray-500'
                      }`}>
                        {sourceIcons[key]} {name} {count}
                      </span>
                    )
                  })}
                </div>
                {filteredListings.map(l => (
                  <ListingCard key={l.id} listing={l} darkMode={darkMode} />
                ))}
              </>
            )}
          </div>
        )}

        {/* Alerts tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-2">
            {alerts.length === 0 ? (
              <div className={`text-center py-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No alerts yet</p>
                <p className="text-xs mt-1">Alerts appear when new listings or price drops are found</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  onClick={() => !alert.read && markAlertRead(alert.id)}
                  className={`rounded-xl border p-4 cursor-pointer transition-all ${
                    alert.read
                      ? darkMode ? 'bg-[#111114] border-[#2a2a2e] opacity-60' : 'bg-white border-gray-100 opacity-60'
                      : darkMode ? 'bg-[#111114] border-[#3a3a3e]' : 'bg-white border-gray-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {alert.message}
                      </p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      alert.type === 'good_deal' ? 'bg-amber-100 text-amber-700' :
                      alert.type === 'price_drop' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {alert.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Filters tab */}
        {activeTab === 'filters' && (
          <div className="space-y-3">
            {filters.length === 0 ? (
              <div className={`text-center py-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No filters configured</p>
                <p className="text-xs mt-1">Add filters to automatically find good deals</p>
              </div>
            ) : (
              filters.map(f => (
                <div key={f.id} className={`rounded-2xl border p-5 ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${f.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{f.name}</h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-[#1c1c20] text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                      Min score: {f.minDealScore ?? 70}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    {f.maxPrice && <div><span className="text-gray-500">Max price: </span><span className={darkMode ? 'text-gray-200' : ''}>R{f.maxPrice.toLocaleString()}</span></div>}
                    {f.minYear && <div><span className="text-gray-500">Min year: </span><span className={darkMode ? 'text-gray-200' : ''}>{f.minYear}</span></div>}
                    {f.maxMileage && <div><span className="text-gray-500">Max km: </span><span className={darkMode ? 'text-gray-200' : ''}>{f.maxMileage.toLocaleString()}</span></div>}
                    {f.brands && <div><span className="text-gray-500">Brands: </span><span className={darkMode ? 'text-gray-200' : ''}>{f.brands}</span></div>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Runs tab */}
        {activeTab === 'runs' && (
          <div className="space-y-2">
            {runs.length === 0 ? (
              <div className={`text-center py-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No scrape runs yet</p>
                <p className="text-xs mt-1">Click "Scrape All" to start your first run</p>
              </div>
            ) : (
              runs.map(run => (
                <div key={run.id} className={`rounded-xl border p-4 ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        run.status === 'completed' ? 'bg-green-500' :
                        run.status === 'running' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {run.source?.label || 'All sources'}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {new Date(run.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-gray-500">{run.listingsFound} found</span>
                      <span className="text-blue-500">{run.listingsNew} new</span>
                      {run.listingsUpdated > 0 && <span className="text-green-500">{run.listingsUpdated} updated</span>}
                    </div>
                    {run.error && <p className="text-xs text-red-500 mt-1">{run.error}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowFilterModal(false)}>
          <div
            className={`w-full max-w-md rounded-2xl border p-6 ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}
            onClick={e => e.stopPropagation()}
          >
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>New Filter</h3>
            <div className="space-y-4">
              <div>
                <label className={`text-xs font-medium mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</label>
                <input value={newFilter.name} onChange={e => setNewFilter({ ...newFilter, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                    darkMode ? 'bg-[#1c1c20] border-[#2a2a2e] text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`} placeholder="Good deals" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-medium mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Max Price (R)</label>
                  <input type="number" value={newFilter.maxPrice} onChange={e => setNewFilter({ ...newFilter, maxPrice: +e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                      darkMode ? 'bg-[#1c1c20] border-[#2a2a2e] text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`} />
                </div>
                <div>
                  <label className={`text-xs font-medium mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Min Year</label>
                  <input type="number" value={newFilter.minYear} onChange={e => setNewFilter({ ...newFilter, minYear: +e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                      darkMode ? 'bg-[#1c1c20] border-[#2a2a2e] text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`} />
                </div>
                <div>
                  <label className={`text-xs font-medium mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Max Mileage</label>
                  <input type="number" value={newFilter.maxMileage} onChange={e => setNewFilter({ ...newFilter, maxMileage: +e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                      darkMode ? 'bg-[#1c1c20] border-[#2a2a2e] text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`} />
                </div>
                <div>
                  <label className={`text-xs font-medium mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Min Score</label>
                  <input type="number" value={newFilter.minDealScore} onChange={e => setNewFilter({ ...newFilter, minDealScore: +e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                      darkMode ? 'bg-[#1c1c20] border-[#2a2a2e] text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`} />
                </div>
              </div>
              <div>
                <label className={`text-xs font-medium mb-1 block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Brands (comma separated)</label>
                <input value={newFilter.brands} onChange={e => setNewFilter({ ...newFilter, brands: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${
                    darkMode ? 'bg-[#1c1c20] border-[#2a2a2e] text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`} placeholder="Toyota, BMW, Volkswagen" />
              </div>
              <button onClick={createFilter}
                disabled={!newFilter.name}
                className="w-full py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
              >
                Create Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
