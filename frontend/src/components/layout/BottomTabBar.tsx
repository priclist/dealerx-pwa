import { useLocation, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

function TrendingIcon({ active }: { active: boolean }) {
  const color = active ? '#000000' : '#9ca3af'
  const stroke = active ? 2.5 : 2
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

export default function BottomTabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const isTrendingActive = location.pathname === '/'

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '0.5px solid #E5E5EA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
        gap: 12,
      }}
    >
      {/* Trending tab */}
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textDecoration: 'none',
          fontSize: 11,
          fontWeight: isTrendingActive ? 700 : 500,
          color: '#000000',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          flexShrink: 0,
        }}
      >
        <TrendingIcon active={isTrendingActive} />
        Trending
      </button>

      {/* AI Search bar */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          height: 40,
          background: '#ffffff',
          border: '1.5px solid #111111',
          borderRadius: 20,
          padding: '0 14px',
        }}
      >
        <Search size={18} color="#C7C7CC" strokeWidth={2.5} />
        <input
          type="text"
          placeholder="Ask AI anything..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 14,
            color: '#111111',
            fontWeight: 500,
            padding: 0,
            fontFamily: 'inherit',
          }}
        />
      </div>
    </nav>
  )
}
