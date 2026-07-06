import { useState } from 'react'
import { Send, Mic, TrendingUp, Package, Handshake, BarChart2 } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/authStore'
import { api } from '../lib/api'

function RedXLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <polygon points="0,20 35,50 0,80" fill="#dc2626" />
      <polygon points="30,0 65,30 100,0" fill="#ef4444" />
      <polygon points="35,50 65,80 30,100" fill="#b91c1c" />
      <polygon points="65,30 100,60 65,80" fill="#f87171" />
    </svg>
  )
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const suggestions = [
  { icon: TrendingUp, text: 'What is my most profitable vehicle category?' },
  { icon: Package, text: 'Which vehicles have been in stock the longest?' },
  { icon: Handshake, text: 'What is my lead conversion rate this month?' },
  { icon: BarChart2, text: 'Generate a performance summary for May' },
]

export default function AIAssistant() {
  const { user } = useAuthStore()
  const { darkMode } = useStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: now }])
    setInput('')
    setLoading(true)
    try {
      const data = await api.post<{ response: string; mode?: string }>('/ai/query', { query: text })
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I could not process your request. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    }
    setLoading(false)
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <style>{`
        @keyframes carx-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <TopBar title="AI Assistant" subtitle="Your intelligent dealership advisor" />
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-6 gap-4">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mb-4 shadow-lg">
              <img src={`${import.meta.env.BASE_URL}carsx-logo.png`} alt="carsX" style={{ height: 40, width: 'auto', display: 'block' }} />
            </div>
            <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Hi {user?.name?.split(' ')[0]}, I'm carsX
            </h2>
            <p className={`text-sm mb-8 max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Ask me anything about your business — sales performance, inventory insights, lead analysis, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {suggestions.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  onClick={() => send(text)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] ${darkMode ? 'bg-[#111114] border-[#2a2a2e] text-gray-300 hover:border-[#3a3a3e]' : 'bg-white border-gray-100 text-gray-700 hover:shadow-md'}`}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-violet-500" />
                  </div>
                  <span className="text-sm">{text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="flex-1 space-y-4 overflow-y-auto pb-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[75%] flex flex-col items-end gap-1">
                    <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed bg-black text-white rounded-br-sm">
                      {msg.content}
                    </div>
                    <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{msg.timestamp}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '80%' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#8e8e93', marginBottom: '4px', marginLeft: '12px' }}>
                      carx
                    </div>
                    <div style={{
                      background: '#e5e5ea',
                      color: '#000000',
                      padding: '14px 18px',
                      borderRadius: '22px',
                      borderBottomLeftRadius: '6px',
                      fontSize: '16px',
                      lineHeight: 1.4,
                      fontWeight: 500,
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', marginLeft: '4px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <RedXLogo size={20} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '4px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <RedXLogo size={20} />
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#a1a1aa',
                        animation: 'carx-bounce 1.4s infinite ease-in-out',
                        animationDelay: `${i * 0.16}s`,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={`flex items-center gap-3 p-3 rounded-2xl border ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-200 shadow-sm'}`}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask DealerX Brain anything..."
            className={`flex-1 bg-transparent text-sm outline-none ${darkMode ? 'text-gray-200 placeholder-gray-600' : 'text-gray-800 placeholder-gray-400'}`}
          />
          <button className={`p-2 rounded-xl ${darkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-[#1c1c20]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} transition-colors`}>
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="p-2 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
