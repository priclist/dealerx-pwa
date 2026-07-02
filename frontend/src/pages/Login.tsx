import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Loader2, ArrowLeft, Plus, Key } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../lib/authApi'
import { api } from '../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setSession } = useAuthStore()
  const [view, setView] = useState<'home' | 'login' | 'register'>('home')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [logo, setLogo] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await authApi.login(email, password)
      setSession(data)
      const next = searchParams.get('next')
      navigate(next ? decodeURIComponent(next) : '/')
    } catch (err: unknown) {
      let msg = 'Invalid email or password'
      if (err instanceof Error) {
        msg = err.message
        if (msg.includes('fetch') || msg.includes('Network') || msg.includes('Failed to fetch')) {
          msg = 'Cannot connect to server. Please check your internet connection and try again.'
        }
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await api.post<{ accessToken: string; refreshToken: string; user: import('../store/authStore').AuthUser }>('/auth/register', {
        name,
        email,
        password,
        businessName,
        logo,
        adminPassword,
      })
      setSession(data)
      const next = searchParams.get('next')
      navigate(next ? decodeURIComponent(next) : '/')
    } catch (err: unknown) {
      let msg = 'Registration failed'
      if (err instanceof Error) {
        msg = err.message
        if (msg.includes('fetch') || msg.includes('Network') || msg.includes('Failed to fetch')) {
          msg = 'Cannot connect to server. Please check your internet connection and try again.'
        }
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be under 2MB')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => setLogo(reader.result as string)
    reader.readAsDataURL(file)
  }

  const logoMark = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 'inherit', fontWeight: 900, color: '#000', letterSpacing: -0.5 }}>car</span>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: '#e5e5ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    </div>
  )

  if (view === 'register') {
    const canSubmit = email.trim().length > 0 && password.length > 0 && name.trim().length > 0 && businessName.trim().length > 0 && adminPassword.length > 0

    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '16px' }}>
          <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <ArrowLeft size={24} color="#000" />
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 28px 32px', maxWidth: 420, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 28 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{logoMark()}</div>
            <p style={{ fontSize: 14, color: '#888', fontWeight: 500, margin: 0 }}>Empowering the next generation of car sales</p>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#000', letterSpacing: -1, lineHeight: 1.1, margin: 0 }}>Let's get started</h1>
            <p style={{ fontSize: 15, color: '#888', fontWeight: 400, marginTop: 8, marginBottom: 0, lineHeight: 1.4 }}>
              Create your carx account to get started.
            </p>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <Key size={18} color="#888" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                required
                autoFocus
                style={{ padding: '16px 48px 16px 48px', fontSize: 15, background: '#fff', border: '1.5px solid #e5e5e5', borderRadius: 18, outline: 'none', color: '#000', width: '100%', boxSizing: 'border-box' }}
              />
              <svg width="22" height="17" viewBox="0 0 24 18" fill="none" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', flexShrink: 0 }}>
                <rect x="1" y="1" width="22" height="16" rx="2" fill="#fff" stroke="#e0e0e0"/>
                <path d="M2 2.5L12 10L22 2.5" stroke="#EA4335" strokeWidth="2" fill="none"/>
                <path d="M2 16V3l4 3.2" stroke="#4285F4" strokeWidth="2" fill="none" strokeLinejoin="round"/>
                <path d="M22 16V3l-4 3.2" stroke="#34A853" strokeWidth="2" fill="none" strokeLinejoin="round"/>
              </svg>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{ padding: '16px 48px 16px 18px', fontSize: 15, background: '#fff', border: '1.5px solid #e5e5e5', borderRadius: 18, outline: 'none', color: '#000', width: '100%', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, display: 'flex' }}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
              required
              style={{ padding: '16px 18px', fontSize: 15, background: '#fff', border: '1.5px solid #e5e5e5', borderRadius: 18, outline: 'none', color: '#000', width: '100%', boxSizing: 'border-box' }}
            />

            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="Business name"
              required
              style={{ padding: '16px 18px', fontSize: 15, background: '#fff', border: '1.5px solid #e5e5e5', borderRadius: 18, outline: 'none', color: '#000', width: '100%', boxSizing: 'border-box' }}
            />

            <div style={{ position: 'relative' }}>
              <input
                type={showAdminPassword ? 'text' : 'password'}
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="Admin password"
                required
                style={{ padding: '16px 48px 16px 18px', fontSize: 15, background: '#fff', border: '1.5px solid #e5e5e5', borderRadius: 18, outline: 'none', color: '#000', width: '100%', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShowAdminPassword(v => !v)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, display: 'flex' }}>
                {showAdminPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && <p style={{ fontSize: 12, color: '#ff3b30', margin: 0 }}>{error}</p>}

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              style={{ display: 'none' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  border: logo ? 'none' : '2px dashed #ccc',
                  background: logo ? 'transparent' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  padding: 0,
                }}
              >
                {logo ? (
                  <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Plus size={28} color="#888" />
                )}
              </button>
              <span style={{ fontSize: 12, color: '#888' }}>{logo ? 'Logo uploaded' : 'Upload a logo'}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: 18, borderRadius: 50, border: 'none', cursor: canSubmit ? 'pointer' : 'default', background: canSubmit ? '#000' : '#f2f2f2', color: canSubmit ? '#fff' : '#999', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', marginTop: 8 }}
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Subscribing…</> : 'Subscribe to Continue'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (view === 'login') {
    const canSubmit = email.trim().length > 0 && password.length > 0

    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '16px' }}>
          <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <ArrowLeft size={24} color="#000" />
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 28px 32px', maxWidth: 420, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 32 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{logoMark()}</div>
            <p style={{ fontSize: 14, color: '#888', fontWeight: 500, margin: 0 }}>Empowering the next generation of car sales</p>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 34, fontWeight: 800, color: '#000', letterSpacing: -1, lineHeight: 1.1, margin: 0 }}>Welcome back</h1>
            <p style={{ fontSize: 16, color: '#888', fontWeight: 400, marginTop: 8, marginBottom: 0, lineHeight: 1.4 }}>
              We're excited to see you again.
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                required
                autoFocus
                style={{ padding: '16px 48px 16px 18px', fontSize: 15, background: '#fff', border: '1.5px solid #e5e5e5', borderRadius: 18, outline: 'none', color: '#000', width: '100%', boxSizing: 'border-box' }}
              />
              <svg width="22" height="17" viewBox="0 0 24 18" fill="none" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', flexShrink: 0 }}>
                <rect x="1" y="1" width="22" height="16" rx="2" fill="#fff" stroke="#e0e0e0"/>
                <path d="M2 2.5L12 10L22 2.5" stroke="#EA4335" strokeWidth="2" fill="none"/>
                <path d="M2 16V3l4 3.2" stroke="#4285F4" strokeWidth="2" fill="none" strokeLinejoin="round"/>
                <path d="M22 16V3l-4 3.2" stroke="#34A853" strokeWidth="2" fill="none" strokeLinejoin="round"/>
              </svg>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{ padding: '16px 48px 16px 18px', fontSize: 15, background: '#fff', border: '1.5px solid #e5e5e5', borderRadius: 18, outline: 'none', color: '#000', width: '100%', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, display: 'flex' }}>
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            {error && <p style={{ fontSize: 12, color: '#ff3b30', margin: 0 }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: 18, borderRadius: 50, border: 'none', cursor: canSubmit ? 'pointer' : 'default', background: canSubmit ? '#000' : '#f2f2f2', color: canSubmit ? '#fff' : '#888', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', marginTop: 8 }}
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in…</> : 'Log in'}
            </button>
          </form>

        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#ffffff', overflow: 'hidden', position: 'fixed', top: 0, left: 0 }}>
      <div style={{ maxWidth: 500, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100vh', padding: '0 24px', boxSizing: 'border-box', overflow: 'hidden' }}>

        {/* Top — chat */}
        <div style={{ paddingTop: 36, display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ background: '#000', color: '#fff', padding: '12px 18px', borderRadius: 22, borderBottomRightRadius: 6, fontSize: 14, fontWeight: 600, maxWidth: '78%', lineHeight: 1.4 }}>
              what cars are selling the best?
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: '#555', marginTop: 14, marginLeft: 4 }}>carx</div>

          <div style={{ background: '#e5e5ea', color: '#000', padding: '12px 18px', borderRadius: 22, borderBottomLeftRadius: 6, fontSize: 14, fontWeight: 500, maxWidth: '78%', lineHeight: 1.4, marginTop: 6 }}>
            Here's the full breakdown: VW Polo, Toyota Corolla, and BMW 3 Series are your top-selling cars this week. Want me to pull current pricing and inventory?
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, marginLeft: 2 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="2" width="13" height="13" rx="2.5" fill="white" />
                <rect x="17" y="2" width="13" height="13" rx="2.5" fill="white" fillOpacity="0.6" />
                <rect x="2" y="17" width="13" height="13" rx="2.5" fill="white" fillOpacity="0.6" />
                <rect x="17" y="17" width="13" height="13" rx="2.5" fill="white" fillOpacity="0.3" />
              </svg>
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 150, 300].map(d => (
                <span key={d} className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#bbb', display: 'inline-block', animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Center branding */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 14 }}>
          <img src="/logo-x.png" alt="CarX" style={{ width: 180, height: 180, objectFit: 'contain' }} />
          <p style={{ fontSize: 18, fontWeight: 600, color: '#555', lineHeight: 1.3, margin: 0 }}>
            Empowering the next generation of car sales
          </p>
        </div>

        {/* Bottom buttons */}
        <div style={{ paddingBottom: 32, display: 'flex', gap: 12 }}>
          <button
            onClick={() => setView('register')}
            style={{ flex: 1, padding: '16px 0', borderRadius: 50, border: 'none', background: '#000', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
          >
            Register
          </button>
          <button
            onClick={() => setView('login')}
            style={{ flex: 1, padding: '16px 0', borderRadius: 50, border: 'none', background: '#e5e5ea', color: '#000', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
          >
            Log in
          </button>
        </div>

      </div>
    </div>
  )
}
