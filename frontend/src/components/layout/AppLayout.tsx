import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import CarSpySidebar from './CarSpySidebar'
import BottomTabBar from './BottomTabBar'
import { useSidebarStore } from '../../store/sidebarStore'
import { useAuthStore } from '../../store/authStore'
import { useIsMobile } from '../../hooks/useIsMobile'

export default function AppLayout() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { open, toggle, setOpen } = useSidebarStore()
  const { user } = useAuthStore()

  /* Lock body scroll when mobile drawer is open */
  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobile, open])

  const showHamburger = isMobile || !open

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', flexDirection: 'column', fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif` }}>
      {/* ═══ HEADER BAR (56px) ═══ */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          background: '#ffffff',
          borderBottom: '1px solid #f0f0f0',
          flexShrink: 0,
        }}
      >
        {/* Left: Hamburger + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {showHamburger && (
            <button
              onClick={toggle}
              style={{
                background: 'none',
                border: 'none',
                padding: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                color: '#374151',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          )}

          <img
            src="/carsx-logo.png"
            alt="CarsX"
            style={{ height: '32px', width: 'auto', display: 'block' }}
          />
        </div>

        {/* Right: Profile avatar */}
        <button
          onClick={() => navigate('/settings')}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            fontSize: 14,
            fontWeight: 700,
            color: '#374151',
            cursor: 'pointer',
            userSelect: 'none',
            border: 'none',
            padding: 0,
          }}
          title={user?.name ?? 'Profile'}
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user?.name?.charAt(0).toUpperCase() ?? 'U'
          )}
        </button>
      </header>

      {/* ═══ BODY ═══ */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* ── Sidebar overlay drawer ── */}
        <>
          {/* Backdrop */}
          {open && (
            <div
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                zIndex: 48,
              }}
            />
          )}
          {/* Drawer */}
          <aside
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '80%',
              minWidth: 260,
              maxWidth: 320,
              background: '#ffffff',
              zIndex: 50,
              transform: open ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              boxShadow: open ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            <CarSpySidebar onClose={() => setOpen(false)} />
          </aside>
        </>

        {/* Main content */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            minWidth: 0,
            background: '#f8f9fa',
            paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Bottom tab bar — hide when mobile sidebar is open */}
      {!(isMobile && open) && <BottomTabBar />}
    </div>
  )
}
