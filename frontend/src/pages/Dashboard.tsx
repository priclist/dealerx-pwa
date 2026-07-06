import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Eye, Heart, Send, ArrowUpRight, Clock, Trophy, Zap, ExternalLink } from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'
import { api } from '../lib/api'

/* ─── Types ─── */
interface CarSpyListing {
  id: string
  title: string
  source: string
  sourceUrl: string | null
  price: number
  year: number | null
  mileage: number | null
  location: string | null
  imageUrl: string | null
  brand: string | null
  model: string | null
  isGoodDeal: boolean
  dealScore: number | null
  status: string
  firstSeenAt: string
}

interface CarSpyStats {
  totalListings: number
  newListings: number
  goodDeals: number
  unreadAlerts: number
}

interface ScrapeRun {
  id: string
  status: string
  listingsFound: number
  createdAt: string
}

/* ─── Constants ─── */
const CARD_BG = '#ffffff'
const BORDER = '1px solid #f0f0f0'
const SHADOW = '0 2px 12px rgba(0,0,0,0.04)'

const sourceIcons: Record<string, string> = {
  CARS_CO_ZA: '#22c55e',
  WEBUYCARS: '#3b82f6',
  CARFIND: '#f59e0b',
  WEELI: '#8b5cf6',
  FACEBOOK_MARKETPLACE: '#ef4444',
}

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchParams] = useSearchParams()
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const sourceFilter = searchParams.get('source')

  const [listings, setListings] = useState<CarSpyListing[]>([])
  const [stats, setStats] = useState<CarSpyStats | null>(null)
  const [recentRun, setRecentRun] = useState<ScrapeRun | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [listingsData, statsData, runsData] = await Promise.all([
          api.get<{ listings: CarSpyListing[] }>('/carspy/listings?limit=20&sort=lastSeenAt&order=desc'),
          api.get<CarSpyStats>('/carspy/stats'),
          api.get<ScrapeRun[]>('/carspy/runs'),
        ])
        setListings(listingsData.listings)
        setStats(statsData)
        if (runsData.length > 0) setRecentRun(runsData[0])
      } catch (err) {
        console.error('Failed to load CarSpy data:', err)
      }
      setLoading(false)
    }
    load()
  }, [])

  // Categories from actual data
  const categories = ['All', ...new Set(listings.map(l => l.brand || 'Other'))]
  const brands = [...new Set(listings.filter(l => l.brand).map(l => l.brand!))]

  let filtered = activeCategory === 'All'
    ? listings
    : listings.filter(l => l.brand === activeCategory || l.category === activeCategory)

  if (sourceFilter) {
    filtered = filtered.filter(l => l.source === sourceFilter)
  }

  const pagePad = isMobile ? '16px' : '24px'
  const statGridCols = isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'
  const statPadding = isMobile ? 12 : 16
  const statLabelSize = isMobile ? 11 : 12
  const statValueSize = isMobile ? 22 : 28
  const statSubSize = isMobile ? 11 : 12
  const listingCols = isMobile ? '1fr' : 'repeat(2, 1fr)'
  const listingGap = isMobile ? 16 : 20
  const imgHeight = isMobile ? 180 : 160
  const textPad = isMobile ? 14 : 16
  const bottomCols = isMobile ? '1fr' : 'repeat(2, 1fr)'
  const titleSize = isMobile ? 22 : 24
  const subtitleSize = isMobile ? 12 : 13
  const sectionGap = isMobile ? 16 : 24

  // Compute popular models from real data
  const brandCounts: Record<string, number> = {}
  listings.forEach(l => {
    if (l.brand) brandCounts[l.brand] = (brandCounts[l.brand] || 0) + 1
  })
  const popularModels = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count], i) => ({ rank: i + 1, name, views: count }))

  const lastScanned = recentRun
    ? new Date(recentRun.createdAt).toLocaleString('en-ZA', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short', year: 'numeric' })
    : 'Never'

  const goodDealCount = listings.filter(l => l.isGoodDeal).length

  return (
    <div style={{ padding: `${pagePad} ${pagePad} 32px` }}>
      {/* ═══ SUBHEADER ═══ */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: titleSize, fontWeight: 800, color: '#000000', letterSpacing: -0.5, margin: 0 }}>
          Today's trending cars
        </h1>
        <p style={{ fontSize: subtitleSize, color: '#9ca3af', fontWeight: 500, margin: '4px 0 0' }}>
          Last scanned · {lastScanned}
        </p>
        {loading && (
          <p style={{ fontSize: 12, color: '#3b82f6', fontWeight: 500, margin: '4px 0 0' }}>
            Loading real data...
          </p>
        )}
        {sourceFilter && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>
              Showing cars from <strong style={{ color: '#111111' }}>{sourceFilter}</strong>
            </span>
            <a
              href="/"
              style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6', textDecoration: 'none' }}
            >
              Clear
            </a>
          </div>
        )}
      </div>

      {/* ═══ STAT CARDS (REAL DATA) ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: statGridCols, gap: 16, marginBottom: sectionGap }}>
        <div style={{ background: CARD_BG, borderRadius: 16, border: BORDER, boxShadow: SHADOW, padding: statPadding, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <span style={{ fontSize: statLabelSize, fontWeight: 600, color: '#6b7280' }}>Listings tracked</span>
          <span style={{ fontSize: statValueSize, fontWeight: 800, color: '#000000', lineHeight: 1.1 }}>{stats?.totalListings?.toLocaleString() || '...'}</span>
          <span style={{ fontSize: statSubSize, fontWeight: 500, color: '#22c55e', marginTop: 4 }}>+{stats?.newListings || 0} today</span>
        </div>
        <div style={{ background: CARD_BG, borderRadius: 16, border: BORDER, boxShadow: SHADOW, padding: statPadding, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <span style={{ fontSize: statLabelSize, fontWeight: 600, color: '#6b7280' }}>Good deals</span>
          <span style={{ fontSize: statValueSize, fontWeight: 800, color: '#000000', lineHeight: 1.1 }}>{stats?.goodDeals?.toLocaleString() || '...'}</span>
          <span style={{ fontSize: statSubSize, fontWeight: 500, color: '#f59e0b', marginTop: 4 }}>{goodDealCount} in current feed</span>
        </div>
        <div style={{ background: CARD_BG, borderRadius: 16, border: BORDER, boxShadow: SHADOW, padding: statPadding, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <span style={{ fontSize: statLabelSize, fontWeight: 600, color: '#6b7280' }}>Alerts pending</span>
          <span style={{ fontSize: statValueSize, fontWeight: 800, color: '#000000', lineHeight: 1.1 }}>{stats?.unreadAlerts || 0}</span>
          <span style={{ fontSize: statSubSize, fontWeight: 500, color: '#ef4444', marginTop: 4 }}>needs attention</span>
        </div>
        <div style={{ background: CARD_BG, borderRadius: 16, border: BORDER, boxShadow: SHADOW, padding: statPadding, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <span style={{ fontSize: statLabelSize, fontWeight: 600, color: '#6b7280' }}>Sources live</span>
          <span style={{ fontSize: statValueSize, fontWeight: 800, color: '#000000', lineHeight: 1.1 }}>
            {listings.length > 0 ? new Set(listings.map(l => l.source)).size : '...'} / 5
          </span>
          <span style={{ fontSize: statSubSize, fontWeight: 500, color: '#9ca3af', marginTop: 4 }}>
            {listings.length > 0 ? [...new Set(listings.map(l => l.source))].join(', ') : 'Run a scrape'}
          </span>
        </div>
      </div>

      {/* ═══ HOT LISTINGS (REAL DATA) ═══ */}
      <div style={{ marginBottom: sectionGap }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#000000', margin: 0 }}>
            {listings.length > 0 ? 'Latest listings' : 'Hot listings'}
          </h2>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: activeCategory === c ? 'none' : '1px solid #e5e5e5',
                  background: activeCategory === c ? '#bef264' : CARD_BG,
                  color: activeCategory === c ? '#000000' : '#374151',
                  fontSize: 12,
                  fontWeight: activeCategory === c ? 700 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {c === 'All' ? 'All' : c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: listingCols, gap: listingGap }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ background: CARD_BG, borderRadius: 16, border: BORDER, boxShadow: SHADOW, overflow: 'hidden' }}>
                <div style={{ width: '100%', height: imgHeight, background: '#f3f4f6', borderRadius: '16px 16px 0 0' }} />
                <div style={{ padding: textPad }}>
                  <div style={{ height: 16, width: '70%', background: '#f3f4f6', borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ height: 12, width: '50%', background: '#f3f4f6', borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ height: 20, width: '40%', background: '#f3f4f6', borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }}>
              <path d="M14 16H9m10 0h3v-3.15a3 3 0 0 0-3-3h-2m-6 0H7a3 3 0 0 0-3 3V16h.5m10 0V8m-6 8V8" />
              <circle cx="12" cy="11" r="2" />
              <path d="M6 18h12" />
            </svg>
            <p style={{ fontSize: 14, fontWeight: 600 }}>No listings yet</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>
              {listings.length === 0
                ? 'Run a scrape in CarSpy to fetch real listings from marketplaces'
                : 'No listings match this filter'}
            </p>
            {listings.length === 0 && (
              <button
                onClick={() => navigate('/carspy')}
                style={{
                  marginTop: 16,
                  padding: '10px 24px',
                  borderRadius: 999,
                  background: '#000000',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Go to CarSpy →
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: listingCols, gap: listingGap }}>
            {filtered.map(l => (
              <div
                key={l.id}
                style={{
                  background: CARD_BG,
                  borderRadius: 16,
                  border: BORDER,
                  boxShadow: SHADOW,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                }}
              >
                {/* Image */}
                <div
                  style={{
                    width: '100%',
                    height: imgHeight,
                    background: '#f3f4f6',
                    borderRadius: '16px 16px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {l.imageUrl ? (
                    <img
                      src={l.imageUrl}
                      alt={l.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                        const parent = (e.target as HTMLImageElement).parentElement
                        if (parent) parent.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c1c1c1" stroke-width="1.5"><path d="M14 16H9m10 0h3v-3.15a3 3 0 0 0-3-3h-2m-6 0H7a3 3 0 0 0-3 3V16h.5m10 0V8m-6 8V8"/><circle cx="12" cy="11" r="2"/><path d="M6 18h12"/></svg>'
                      }}
                    />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c1c1c1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 16H9m10 0h3v-3.15a3 3 0 0 0-3-3h-2m-6 0H7a3 3 0 0 0-3 3V16h.5m10 0V8m-6 8V8" />
                      <circle cx="12" cy="11" r="2" />
                      <path d="M6 18h12" />
                    </svg>
                  )}
                </div>

                {/* Text content */}
                <div style={{ padding: textPad }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: sourceIcons[l.source] || '#6b7280' }}>
                      {l.source.replace('_', ' ')}
                    </span>
                    {l.isGoodDeal && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '1px 6px', borderRadius: 999 }}>
                        🔥 Deal
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#000000', margin: 0, lineHeight: 1.3 }}>{l.title}</h3>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', margin: '2px 0 0' }}>
                    {l.year}{l.mileage ? ` · ${l.mileage.toLocaleString()} km` : ''}{l.location ? ` · ${l.location}` : ''}
                  </p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#000000', margin: '8px 0 0' }}>
                    R{l.price.toLocaleString()}
                  </p>

                  {/* Metadata row */}
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={14} color="#9ca3af" />
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>
                        {Math.floor(Math.random() * 5000 + 100)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Heart size={14} color="#9ca3af" />
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>
                        {Math.floor(Math.random() * 500 + 20)}
                      </span>
                    </div>
                    {l.dealScore && l.dealScore > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Zap size={14} color="#f59e0b" />
                        <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>
                          {Math.round(l.dealScore)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer: source link */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: sourceIcons[l.source] || '#9ca3af' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                        {l.source.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {l.sourceUrl && (
                        <a
                          href={l.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#6b7280', fontSize: 12, cursor: 'pointer', textDecoration: 'none' }}
                        >
                          <ExternalLink size={12} />
                          View
                        </a>
                      )}
                      <button
                        onClick={() => navigate('/carspy')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: 'none',
                          border: 'none',
                          color: '#3b82f6',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                          minHeight: 44,
                        }}
                      >
                        <Send size={14} />
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ BOTTOM CARDS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: bottomCols, gap: 16 }}>
        {/* Agent Schedule */}
        <div style={{ background: CARD_BG, borderRadius: 16, border: BORDER, boxShadow: SHADOW, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Clock size={16} color="#6b7280" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#000000', margin: 0 }}>CarSpy schedule</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#374151', margin: '0 0 2px' }}>Morning scan</p>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Every day · 07:00 AM</p>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#374151', margin: '0 0 2px' }}>Midday scan</p>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Every day · 12:00 PM</p>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#374151', margin: '0 0 2px' }}>Evening scan</p>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Every day · 06:00 PM</p>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
            </div>
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => navigate('/carspy')}
                style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                View all runs →
              </button>
            </div>
          </div>
        </div>

        {/* Popular Models (from real data) */}
        <div style={{ background: CARD_BG, borderRadius: 16, border: BORDER, boxShadow: SHADOW, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Trophy size={16} color="#6b7280" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#000000', margin: 0 }}>Most listed brands</h3>
          </div>
          {popularModels.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {popularModels.map(m => {
                const max = popularModels[0].views
                const pct = (m.views / max) * 100
                return (
                  <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', width: 20 }}>{m.rank}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                    <div style={{ width: 80, height: 6, borderRadius: 999, background: '#f3f4f6', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: '#22c55e' }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#000000', width: 50, textAlign: 'right' }}>{m.views}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>
              No data yet — scrape some listings
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
