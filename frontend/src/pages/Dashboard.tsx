import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Eye, Heart, Send, ArrowUpRight, Clock, Trophy } from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'

/* ─── Types ─── */
interface Listing {
  id: string
  name: string
  sub: string
  price: string
  views: number
  saves: number
  source: string
  sourceColor: string
  category: string
}

/* ─── Data ─── */
const categories = ['All', 'SUV', 'Sedan', 'Bakkie', 'Hatchback']

const listings: Listing[] = [
  { id: '1', name: 'Toyota Fortuner 2.8 GD-6', sub: '2022 · Automatic · Diesel', price: 'R 589,000', views: 4231, saves: 312, source: 'Cars.co.za', sourceColor: '#22c55e', category: 'SUV' },
  { id: '2', name: 'VW Polo Vivo 1.4 Trendline', sub: '2021 · Manual · Petrol', price: 'R 189,900', views: 3876, saves: 208, source: 'WeBuyCars', sourceColor: '#3b82f6', category: 'Hatchback' },
  { id: '3', name: 'Ford Ranger 2.0 XLT 4x4', sub: '2023 · Automatic · Diesel', price: 'R 649,000', views: 3451, saves: 267, source: 'CarFind', sourceColor: '#f59e0b', category: 'Bakkie' },
  { id: '4', name: 'Toyota Hilux 2.8 GD-6 Raider', sub: '2022 · Automatic · Diesel', price: 'R 720,000', views: 3102, saves: 198, source: 'Weeli', sourceColor: '#8b5cf6', category: 'Bakkie' },
  { id: '5', name: 'Suzuki Swift 1.2 GL', sub: '2023 · Manual · Petrol', price: 'R 215,000', views: 2890, saves: 156, source: 'Cars.co.za', sourceColor: '#22c55e', category: 'Hatchback' },
  { id: '6', name: 'BMW 3 Series 320i', sub: '2021 · Automatic · Petrol', price: 'R 520,000', views: 2450, saves: 134, source: 'WeBuyCars', sourceColor: '#3b82f6', category: 'Sedan' },
]

const stats = [
  { label: 'Listings tracked', value: '2,841', sub: '+134 today', subColor: '#22c55e' },
  { label: 'Top click today', value: '4,231', sub: 'Fortuner 2.8', subColor: '#9ca3af' },
  { label: 'Briefing sent', value: '07:02', sub: 'via Telegram', subColor: '#9ca3af' },
  { label: 'Sources live', value: '4 / 5', sub: 'FB offline', subColor: '#ef4444' },
]

const popularModels = [
  { rank: 1, name: 'Toyota Fortuner', views: 18441 },
  { rank: 2, name: 'Ford Ranger', views: 15112 },
  { rank: 3, name: 'VW Polo Vivo', views: 13677 },
  { rank: 4, name: 'Toyota Hilux', views: 12204 },
  { rank: 5, name: 'Suzuki Swift', views: 9388 },
]

const schedules = [
  { name: 'Morning briefing', time: 'Every day · 07:00 AM', status: 'Active', color: '#22c55e' },
  { name: 'Midday scan', time: 'Every day · 12:00 PM', status: 'Active', color: '#22c55e' },
  { name: 'Evening report', time: 'Every day · 06:00 PM', status: 'Paused', color: '#f59e0b' },
]

/* ─── Constants ─── */
const CARD_BG = '#ffffff'
const BORDER = '1px solid #f0f0f0'
const SHADOW = '0 2px 12px rgba(0,0,0,0.04)'

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchParams] = useSearchParams()
  const isMobile = useIsMobile()

  const sourceFilter = searchParams.get('source')

  let filtered = activeCategory === 'All'
    ? listings
    : listings.filter(l => l.category === activeCategory)

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

  return (
    <div style={{ padding: `${pagePad} ${pagePad} 32px` }}>
      {/* ═══ SUBHEADER ═══ */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: titleSize, fontWeight: 800, color: '#000000', letterSpacing: -0.5, margin: 0 }}>
          Today's trending cars
        </h1>
        <p style={{ fontSize: subtitleSize, color: '#9ca3af', fontWeight: 500, margin: '4px 0 0' }}>
          Last scanned · 07:02 AM · 1 Jul 2026
        </p>
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

      {/* ═══ STAT CARDS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: statGridCols, gap: 16, marginBottom: sectionGap }}>
        {stats.map(s => (
          <div
            key={s.label}
            style={{
              background: CARD_BG,
              borderRadius: 16,
              border: BORDER,
              boxShadow: SHADOW,
              padding: statPadding,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              minWidth: 0,
            }}
          >
            <span style={{ fontSize: statLabelSize, fontWeight: 600, color: '#6b7280' }}>{s.label}</span>
            <span style={{ fontSize: statValueSize, fontWeight: 800, color: '#000000', lineHeight: 1.1 }}>{s.value}</span>
            <span style={{ fontSize: statSubSize, fontWeight: 500, color: s.subColor, marginTop: 4 }}>{s.sub}</span>
          </div>
        ))}
      </div>

      {/* ═══ HOT LISTINGS ═══ */}
      <div style={{ marginBottom: sectionGap }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#000000', margin: 0 }}>Hot listings</h2>
          <div
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
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
                {c}
              </button>
            ))}
          </div>
        </div>

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
              {/* Image placeholder */}
              <div
                style={{
                  width: '100%',
                  height: imgHeight,
                  background: '#f3f4f6',
                  borderRadius: '16px 16px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c1c1c1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 16H9m10 0h3v-3.15a3 3 0 0 0-3-3h-2m-6 0H7a3 3 0 0 0-3 3V16h.5m10 0V8m-6 8V8" />
                  <circle cx="12" cy="11" r="2" />
                  <path d="M6 18h12" />
                </svg>
              </div>

              {/* Text content */}
              <div style={{ padding: textPad }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#000000', margin: 0, lineHeight: 1.3 }}>{l.name}</h3>
                <p style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', margin: '2px 0 0' }}>{l.sub}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#000000', margin: '8px 0 0' }}>{l.price}</p>

                {/* Metadata row */}
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Eye size={14} color="#9ca3af" />
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{l.views.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Heart size={14} color="#9ca3af" />
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{l.saves}</span>
                  </div>
                </div>

                {/* Footer: source + action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.sourceColor }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>{l.source}</span>
                  </div>
                  <button
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
                    Send
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ BOTTOM CARDS ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: bottomCols, gap: 16 }}>
        {/* Agent Schedule */}
        <div style={{ background: CARD_BG, borderRadius: 16, border: BORDER, boxShadow: SHADOW, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Clock size={16} color="#6b7280" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#000000', margin: 0 }}>Agent schedule</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {schedules.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#374151', margin: '0 0 2px' }}>{s.name}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{s.time}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Models */}
        <div style={{ background: CARD_BG, borderRadius: 16, border: BORDER, boxShadow: SHADOW, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Trophy size={16} color="#6b7280" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#000000', margin: 0 }}>Most popular this week</h3>
          </div>
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
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#000000', width: 50, textAlign: 'right' }}>{m.views.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
