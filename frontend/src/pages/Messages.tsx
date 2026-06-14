import { useState } from 'react'
import { Send, Search } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import { useStore } from '../store/useStore'

const contacts = [
  { id: '1', name: 'James Wilson', company: 'ABC Logistics', lastMsg: 'Interested in 2 Cascadias', time: '2m', unread: 2 },
  { id: '2', name: 'Nathan Miller', company: 'Global Freight', lastMsg: 'Can we negotiate the price?', time: '1h', unread: 0 },
  { id: '3', name: 'Sarah Chen', company: 'LogiCorp', lastMsg: 'Please send the proposal', time: '3h', unread: 1 },
  { id: '4', name: 'Mike Johnson', company: 'Swift Haulers', lastMsg: 'Deal confirmed!', time: 'Yesterday', unread: 0 },
]

const mockMessages = [
  { role: 'them', content: 'Hi, I\'m interested in the Freightliner Cascadia', time: '10:00 AM' },
  { role: 'me', content: 'Great! We have 3 available. What configuration are you looking for?', time: '10:05 AM' },
  { role: 'them', content: 'Interested in 2 Cascadias. What\'s your best price?', time: '10:10 AM' },
]

export default function Messages() {
  const { darkMode } = useStore()
  const [selected, setSelected] = useState(contacts[0])
  const [input, setInput] = useState('')

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0f]' : 'bg-[#f5f5f7]'}`}>
      <TopBar title="Messages" subtitle="Customer communications" />
      <div className="p-6">
        <div className={`rounded-2xl border overflow-hidden flex h-[calc(100vh-160px)] ${darkMode ? 'bg-[#111114] border-[#2a2a2e]' : 'bg-white border-gray-100'}`}>
          <div className={`w-72 flex-shrink-0 border-r flex flex-col ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
            <div className={`p-3 border-b ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${darkMode ? 'bg-[#1c1c20]' : 'bg-gray-50'}`}>
                <Search className="w-4 h-4 text-gray-400" />
                <input placeholder="Search..." className={`flex-1 bg-transparent text-sm outline-none ${darkMode ? 'text-gray-300 placeholder-gray-600' : 'text-gray-700 placeholder-gray-400'}`} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {contacts.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-b ${
                    selected.id === c.id
                      ? darkMode ? 'bg-[#1c1c20] border-[#2a2a2e]' : 'bg-blue-50 border-gray-100'
                      : darkMode ? 'hover:bg-[#1c1c20] border-[#2a2a2e]' : 'hover:bg-gray-50 border-gray-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{c.name}</p>
                      <span className={`text-xs flex-shrink-0 ml-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{c.time}</span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{c.lastMsg}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-5 h-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0">{c.unread}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className={`flex items-center gap-3 px-5 py-4 border-b ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                {selected.name.charAt(0)}
              </div>
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selected.name}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{selected.company}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {mockMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[60%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.role === 'me'
                      ? 'bg-black text-white rounded-br-sm'
                      : darkMode ? 'bg-[#1c1c20] text-gray-200 rounded-bl-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.role === 'me' ? 'text-gray-400' : darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={`p-4 border-t ${darkMode ? 'border-[#2a2a2e]' : 'border-gray-100'}`}>
              <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${darkMode ? 'bg-[#1c1c20] border-[#2a2a2e]' : 'bg-gray-50 border-gray-200'}`}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className={`flex-1 bg-transparent text-sm outline-none ${darkMode ? 'text-gray-200 placeholder-gray-600' : 'text-gray-800 placeholder-gray-400'}`}
                />
                <button className="p-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
