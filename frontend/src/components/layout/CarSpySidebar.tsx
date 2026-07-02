import { NavLink, useNavigate } from 'react-router-dom'
import { Flame, Settings, ArrowLeft, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const monitorItems = [
  { icon: Flame, label: 'Trending cars', path: '/' },
]

const sources = [
  { label: 'Cars.co.za', status: 'active' as const },
  { label: 'WeBuyCars', status: 'active' as const },
  { label: 'CarFind', status: 'active' as const },
  { label: 'Weeli', status: 'active' as const },
  { label: 'FB Marketplace', status: 'offline' as const },
]

const statusColors = {
  active: '#22c55e',
  paused: '#f59e0b',
  offline: '#9ca3af',
}

const agentItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
]

interface Props {
  onClose: () => void
}

export default function CarSpySidebar({ onClose }: Props) {
  const navigate = useNavigate()
  const logout = useAuthStore(state => state.logout)

  const handleSourceClick = (source: string) => {
    navigate(`/?source=${encodeURIComponent(source)}`)
    onClose()
  }

  const handleLogout = async () => {
    await logout()
    onClose()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Drawer header: logo + close */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 16px 12px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src={`${import.meta.env.BASE_URL}carsx-logo.png`}
            alt="CarsX"
            style={{ height: 32, width: 'auto', display: 'block' }}
          />
        </div>

        <button
          onClick={onClose}
          style={{
            width: 32,
            height: 32,
            background: '#000000',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
          }}
          aria-label="Close menu"
        >
          <ArrowLeft size={20} color="#ffffff" strokeWidth={2.5} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
        {/* Monitor section */}
        <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 8px' }}>Monitor</p>
        {monitorItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              marginBottom: 2,
              color: isActive ? '#000000' : '#374151',
              background: isActive ? '#f3f4f6' : 'transparent',
            })}
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Sources section */}
        <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '24px 0 8px' }}>Sources</p>
        {sources.map(({ label, status }) => (
          <div
            key={label}
            onClick={() => handleSourceClick(label)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              color: '#374151',
              marginBottom: 2,
              cursor: 'pointer',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[status], flexShrink: 0 }} />
            <span>{label}</span>
          </div>
        ))}

        {/* Agent section */}
        <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '24px 0 8px' }}>Agent</p>
        {agentItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              marginBottom: 2,
              color: isActive ? '#000000' : '#374151',
              background: isActive ? '#f3f4f6' : 'transparent',
            })}
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <div style={{ padding: '12px 16px 16px', flexShrink: 0 }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            color: '#ef4444',
            background: 'transparent',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
          }}
        >
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
}
