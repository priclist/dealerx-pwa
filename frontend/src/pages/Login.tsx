import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import { useStore } from '../store/useStore'
import api from '../lib/api'


export default function Login() {
  const navigate = useNavigate()
  const { setUser, setToken } = useStore()
  const [view, setView] = useState<'home' | 'login'>('home')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Demo credentials
    if (email === 'Renaldo008' && password === 'mila008') {
      setToken('demo-token')
      setUser({ id: '1', name: 'Renaldo', email: 'Renaldo008', role: 'ADMIN' })
      navigate('/')
      setLoading(false)
      return
    }

    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('dealerx_token', data.token)
      setToken(data.token)
      setUser({ id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role })
      navigate('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  if (view === 'login') {
    const canSubmit = email.trim().length > 0 && password.length > 0

    return (
      <div style={{ height: '100vh', overflow: 'hidden', background: '#fff', display: 'flex', flexDirection: 'column' }}>

        {/* Nav Bar */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 16px', flexShrink: 0 }}>
          <button onClick={() => setView('home')} style={{ position: 'absolute', left: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <ArrowLeft size={20} color="#000" />
          </button>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <span style={{ fontSize: 17, fontWeight: 900, color: '#000', letterSpacing: -0.5 }}>Dealer</span>
            <span style={{ fontSize: 17, fontWeight: 900, letterSpacing: -0.5, background: 'linear-gradient(135deg, #60a5fa, #8b5cf6, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>X</span>
          </div>
        </div>

        {/* Scrollable content — flex-1, no overflow */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0 20px 20px', maxWidth: 400, margin: '0 auto', width: '100%', overflow: 'hidden' }}>

          {/* Welcome Block */}
          <div style={{ paddingTop: 6 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#000', letterSpacing: -1, lineHeight: 1.1, margin: 0 }}>Welcome back</h1>
            <p style={{ fontSize: 14, color: '#999', fontWeight: 400, marginTop: 4, marginBottom: 0 }}>Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Username or email"
              required
              autoFocus
              style={{ padding: '12px 15px', fontSize: 14, background: '#fafafa', border: '1.5px solid #e5e5e5', borderRadius: 14, outline: 'none', color: '#000', width: '100%', boxSizing: 'border-box' }}
            />
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{ padding: '12px 44px 12px 15px', fontSize: 14, background: '#fafafa', border: '1.5px solid #e5e5e5', borderRadius: 14, outline: 'none', color: '#000', width: '100%', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0, display: 'flex' }}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && <p style={{ fontSize: 12, color: '#ff3b30', margin: 0 }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: 15, borderRadius: 50, border: 'none', cursor: canSubmit ? 'pointer' : 'default', background: canSubmit ? '#000' : '#f2f2f2', color: canSubmit ? '#fff' : '#999', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in…</> : 'Log in'}
            </button>
          </form>

          {/* Promo Card */}
          <div style={{ background: 'linear-gradient(135deg, #f5f7ff 0%, #e8ecff 50%, #f0f0ff 100%)', borderRadius: 18, padding: '14px 16px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ maxWidth: '58%' }}>
              <p style={{ fontSize: 17, fontWeight: 800, color: '#000', margin: 0, lineHeight: 1.2 }}>Sell smarter.</p>
              <p style={{ fontSize: 17, fontWeight: 800, color: '#000', margin: 0, lineHeight: 1.2 }}>Close more.</p>
              <p style={{ fontSize: 11, color: '#666', marginTop: 5, lineHeight: 1.4, marginBottom: 0 }}>AI-powered insights for every deal, lead, and vehicle.</p>
            </div>
            <div style={{ position: 'absolute', right: -6, bottom: -6 }}>
              {[{ rotate: -15, bg: '#c7d2fe' }, { rotate: -8, bg: '#a5b4fc' }, { rotate: 0, bg: '#818cf8' }].map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: 64, height: 64, borderRadius: 16, background: s.bg, transform: `rotate(${s.rotate}deg)`, bottom: i * 4, right: i * 4, zIndex: i + 1 }} />
              ))}
            </div>
          </div>

        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#ffffff', overflow: 'hidden', position: 'fixed', top: 0, left: 0 }}>
      <div style={{ maxWidth: 500, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100vh', padding: '0 24px', boxSizing: 'border-box', overflow: 'hidden' }}>

        {/* Top — chat */}
        <div style={{ paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* User bubble */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ background: '#000', color: '#fff', padding: '10px 16px', borderRadius: 18, borderBottomRightRadius: 4, fontSize: 13, fontWeight: 600, maxWidth: '75%' }}>
              How many trucks do I have available?
            </div>
          </div>
          {/* AI label */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#555', marginTop: 10, marginLeft: 2 }}>DealerX AI</div>
          {/* AI bubble */}
          <div style={{ background: '#e5e5ea', color: '#000', padding: '10px 16px', borderRadius: 18, borderBottomLeftRadius: 4, fontSize: 13, fontWeight: 500, maxWidth: '75%', lineHeight: 1.4, marginTop: 5 }}>
            12 trucks available. 3 Freightliner Cascadias just came in. Want me to pull the pricing?
          </div>
          {/* Typing indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 7 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="11" height="11" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="2" width="13" height="13" rx="2.5" fill="white" />
                <rect x="17" y="2" width="13" height="13" rx="2.5" fill="white" fillOpacity="0.6" />
                <rect x="2" y="17" width="13" height="13" rx="2.5" fill="white" fillOpacity="0.6" />
                <rect x="17" y="17" width="13" height="13" rx="2.5" fill="white" fillOpacity="0.3" />
              </svg>
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              {[0, 150, 300].map(d => (
                <span key={d} className="typing-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#bbb', display: 'inline-block', animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Middle + Bottom — branding and buttons together, pushed up */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 32, textAlign: 'center', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1, marginBottom: 12 }}>
              <span style={{ fontSize: 42, fontWeight: 900, color: '#000', letterSpacing: -1.5 }}>Dealer</span>
              <span style={{ fontSize: 42, fontWeight: 900, letterSpacing: -1.5, background: 'linear-gradient(135deg, #60a5fa, #8b5cf6, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>X</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#000', lineHeight: 1.2, margin: 0 }}>
              Your dealership,<br />upgraded with intelligence.
            </p>
          </div>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setView('login')}
              style={{ padding: '16px 54px', borderRadius: 50, border: 'none', background: '#000', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}
            >
              Log in
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
