import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mail, Lock, Shield, Moon, Sun, Bell, Smartphone,
  Globe, DollarSign, Clock, Download, Trash2, FileText,
  AlertTriangle, ChevronRight, Send, MessageCircle, X, Check, Camera, Loader2,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import { useIsMobile } from '../hooks/useIsMobile'
import { api } from '../lib/api'
import { userApi } from '../lib/userApi'
import { compressImage } from '../lib/compressImage'
import type { AuthUser } from '../store/authStore'

/* ─── Toggle Switch ─── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 48,
        height: 28,
        borderRadius: 999,
        background: checked ? '#22c55e' : '#e5e5ea',
        position: 'relative',
        cursor: 'pointer',
        border: 'none',
        padding: 0,
        transition: 'background 0.2s ease',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 22 : 2,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          transition: 'left 0.2s ease',
        }}
      />
    </button>
  )
}

/* ─── Section Title ─── */
function SectionTitle({ children }: { children: string }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 8px' }}>
      {children}
    </p>
  )
}

/* ─── Setting Row ─── */
function SettingRow({
  icon: Icon,
  label,
  description,
  right,
  onClick,
}: {
  icon?: React.ElementType
  label: string
  description?: string
  right?: React.ReactNode
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 0',
        borderBottom: '1px solid #f0f0f0',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {Icon && <Icon size={20} color="#6b7280" />}
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#000000' }}>{label}</div>
          {description && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{description}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {right}
      </div>
    </div>
  )
}

/* ─── Card ─── */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 16,
      padding: '0 16px',
      marginBottom: 16,
    }}>
      {children}
    </div>
  )
}

/* ─── Main Component ─── */
export default function Settings() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { user, logout, setUser, clearSession } = useAuthStore()
  const {
    emailNotif, twoFa, pushNotif, emailAlerts, dailyBrief, offlineAlerts,
    darkTheme, language, currency, timezone, telegram, whatsapp, discord,
    loaded, loadSettings, updateSetting,
  } = useSettingsStore()

  /* UI state for modals & feedback */
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [showLanguage, setShowLanguage] = useState(false)
  const [showCurrency, setShowCurrency] = useState(false)
  const [showTimezone, setShowTimezone] = useState(false)
  const [toast, setToast] = useState('')
  const didLoad = useRef(false)

  useEffect(() => {
    if (didLoad.current) return
    didLoad.current = true
    loadSettings()
  }, [loadSettings])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleExportData = async () => {
    try {
      const data = await api.get('/users/me/export')
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dealerx-export-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Data exported successfully')
    } catch {
      showToast('Failed to export data')
    }
  }

  const handleClearCache = () => {
    localStorage.removeItem('dealerx-settings')
    localStorage.removeItem('dealerx-auth')
    showToast('Cache cleared. Reloading...')
    setTimeout(() => window.location.reload(), 1000)
  }

  const handleDeleteAccount = async () => {
    try {
      await api.del('/users/me')
      clearSession()
      navigate('/login')
    } catch {
      showToast('Failed to delete account')
    }
  }

  const gridCols = isMobile ? '1fr' : 'repeat(2, 1fr)'
  const pagePad = isMobile ? '16px' : '24px'

  return (
    <div style={{ padding: `${pagePad} ${pagePad} 32px` }}>
      {/* Title */}
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#000000', margin: '0 0 24px' }}>Settings</h1>

      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 16 }}>
        {/* ═══ 1. PROFILE ═══ */}
        <div>
          <SectionTitle>Profile</SectionTitle>
          <Card>
            <div style={{ padding: '16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#374151',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  {user?.avatarUrl
                    ? <img src={user.avatarUrl} alt="avatar" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span>{user?.name?.charAt(0).toUpperCase() ?? 'U'}</span>}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#000000' }}>{user?.name ?? 'User'}</div>
                  <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{user?.email ?? 'user@example.com'}</div>
                </div>
              </div>
              <button
                onClick={() => setShowEditProfile(true)}
                style={{
                  width: '100%',
                  padding: '10px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: '#000000',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}>
                Edit profile
              </button>
            </div>
          </Card>
        </div>

        {/* ═══ 2. ACCOUNT ═══ */}
        <div>
          <SectionTitle>Account</SectionTitle>
          <Card>
            <SettingRow icon={Lock} label="Change password" description="Update your account password" right={<ChevronRight size={18} color="#9ca3af" />} onClick={() => setShowChangePassword(true)} />
            <SettingRow icon={Mail} label="Email notifications" description="Receive updates via email" right={<Toggle checked={emailNotif} onChange={(v) => updateSetting('emailNotif', v)} />} />
            <SettingRow icon={Shield} label="Two-factor authentication" description="Add an extra layer of security" right={<Toggle checked={twoFa} onChange={(v) => updateSetting('twoFa', v)} />} />
            <SettingRow icon={AlertTriangle} label="Delete account" description="Permanently remove your account" right={<span style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>Delete</span>} onClick={() => setShowDeleteAccount(true)} />
          </Card>
        </div>

        {/* ═══ 3. NOTIFICATIONS ═══ */}
        <div>
          <SectionTitle>Notifications</SectionTitle>
          <Card>
            <SettingRow icon={Smartphone} label="Push notifications" description="Alerts on your device" right={<Toggle checked={pushNotif} onChange={(v) => updateSetting('pushNotif', v)} />} />
            <SettingRow icon={Bell} label="Email alerts" description="Lead and deal updates" right={<Toggle checked={emailAlerts} onChange={(v) => updateSetting('emailAlerts', v)} />} />
            <SettingRow icon={Mail} label="Daily briefing" description="Morning summary at 7:00 AM" right={<Toggle checked={dailyBrief} onChange={(v) => updateSetting('dailyBrief', v)} />} />
            <SettingRow icon={AlertTriangle} label="Source offline alerts" description="When a scraper goes down" right={<Toggle checked={offlineAlerts} onChange={(v) => updateSetting('offlineAlerts', v)} />} />
          </Card>
        </div>

        {/* ═══ 4. PREFERENCES ═══ */}
        <div>
          <SectionTitle>Preferences</SectionTitle>
          <Card>
            <SettingRow icon={darkTheme ? Moon : Sun} label="Theme" description={darkTheme ? 'Dark mode' : 'Light mode'} right={<Toggle checked={darkTheme} onChange={(v) => updateSetting('darkTheme', v)} />} />
            <SettingRow icon={Globe} label="Language" description={language === 'en-US' ? 'English (US)' : language} right={<ChevronRight size={18} color="#9ca3af" />} onClick={() => setShowLanguage(true)} />
            <SettingRow icon={DollarSign} label="Currency" description={currency} right={<ChevronRight size={18} color="#9ca3af" />} onClick={() => setShowCurrency(true)} />
            <SettingRow icon={Clock} label="Time zone" description={timezone} right={<ChevronRight size={18} color="#9ca3af" />} onClick={() => setShowTimezone(true)} />
          </Card>
        </div>

        {/* ═══ 5. CONNECTED SERVICES ═══ */}
        <div>
          <SectionTitle>Connected services</SectionTitle>
          <Card>
            <SettingRow icon={Send} label="Telegram" description={telegram ? 'Connected' : 'Not connected'} right={<Toggle checked={telegram} onChange={(v) => updateSetting('telegram', v)} />} />
            <SettingRow icon={MessageCircle} label="WhatsApp" description={whatsapp ? 'Connected' : 'Not connected'} right={<Toggle checked={whatsapp} onChange={(v) => updateSetting('whatsapp', v)} />} />
            <SettingRow icon={MessageCircle} label="Discord" description={discord ? 'Connected' : 'Not connected'} right={<Toggle checked={discord} onChange={(v) => updateSetting('discord', v)} />} />
          </Card>
        </div>

        {/* ═══ 6. DATA & PRIVACY ═══ */}
        <div>
          <SectionTitle>Data & privacy</SectionTitle>
          <Card>
            <SettingRow icon={Download} label="Download my data" description="Export all your data as JSON" right={<ChevronRight size={18} color="#9ca3af" />} onClick={handleExportData} />
            <SettingRow icon={Trash2} label="Clear cache" description="Reset local storage and cache" right={<ChevronRight size={18} color="#9ca3af" />} onClick={handleClearCache} />
            <SettingRow icon={FileText} label="Privacy policy" description="How we handle your data" right={<ChevronRight size={18} color="#9ca3af" />} onClick={() => showToast('Privacy policy is not yet available')} />
          </Card>
        </div>

        {/* ═══ 7. DANGER ZONE ═══ */}
        <div style={{ gridColumn: isMobile ? '1 / -1' : '1 / -1' }}>
          <SectionTitle>Danger zone</SectionTitle>
          <Card>
            <div style={{ padding: '16px 0' }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  borderRadius: 999,
                  border: 'none',
                  background: '#000000',
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginBottom: 12,
                }}
              >
                Log out
              </button>
              <button
                onClick={() => setShowDeleteAccount(true)}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  borderRadius: 12,
                  border: '1px solid #ef4444',
                  background: 'transparent',
                  color: '#ef4444',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Delete account
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* ═══ EDIT PROFILE MODAL ═══ */}
      {showEditProfile && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditProfile(false)}
          onSave={async (updates) => {
            try {
              const updated = await userApi.updateProfile(updates)
              setUser(updated)
              setShowEditProfile(false)
              showToast('Profile updated successfully')
            } catch (err) {
              console.error('[profile] save failed:', err)
              showToast('Failed to update profile')
            }
          }}
          onAvatarUpload={async (file) => {
            console.log('[avatar] onAvatarUpload called with file:', file.name, file.size, file.type)
            const formData = new FormData()
            formData.append('avatar', file)
            console.log('[avatar] FormData constructed, calling userApi.uploadAvatar')
            const updated = await userApi.uploadAvatar(formData)
            console.log('[avatar] userApi.uploadAvatar returned:', updated)
            setUser(updated)
            return updated
          }}
        />
      )}

      {/* ═══ CHANGE PASSWORD MODAL ═══ */}
      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onSave={async (currentPassword, newPassword) => {
            try {
              await api.put('/users/me/password', { currentPassword, newPassword })
              setShowChangePassword(false)
              showToast('Password changed successfully')
            } catch (err) {
              throw err
            }
          }}
        />
      )}

      {/* ═══ DELETE ACCOUNT MODAL ═══ */}
      {showDeleteAccount && (
        <ConfirmModal
          title="Delete account"
          message="This will permanently delete your account and all associated data. This action cannot be undone."
          confirmLabel="Delete permanently"
          danger
          onClose={() => setShowDeleteAccount(false)}
          onConfirm={handleDeleteAccount}
        />
      )}

      {/* ═══ LANGUAGE PICKER ═══ */}
      {showLanguage && (
        <PickerModal
          title="Select language"
          options={['en-US', 'en-GB', 'af-ZA', 'fr-FR', 'de-DE']}
          labels={['English (US)', 'English (UK)', 'Afrikaans', 'French', 'German']}
          selected={language}
          onClose={() => setShowLanguage(false)}
          onSelect={(val) => { updateSetting('language', val); setShowLanguage(false); showToast('Language updated') }}
        />
      )}

      {/* ═══ CURRENCY PICKER ═══ */}
      {showCurrency && (
        <PickerModal
          title="Select currency"
          options={['ZAR', 'USD', 'EUR', 'GBP', 'AUD']}
          labels={['South African Rand (ZAR)', 'US Dollar (USD)', 'Euro (EUR)', 'British Pound (GBP)', 'Australian Dollar (AUD)']}
          selected={currency}
          onClose={() => setShowCurrency(false)}
          onSelect={(val) => { updateSetting('currency', val); setShowCurrency(false); showToast('Currency updated') }}
        />
      )}

      {/* ═══ TIMEZONE PICKER ═══ */}
      {showTimezone && (
        <PickerModal
          title="Select time zone"
          options={['Africa/Johannesburg', 'Europe/London', 'America/New_York', 'Asia/Dubai', 'Australia/Sydney']}
          labels={['Africa/Johannesburg (SAST)', 'Europe/London (GMT)', 'America/New_York (EST)', 'Asia/Dubai (GST)', 'Australia/Sydney (AEST)']}
          selected={timezone}
          onClose={() => setShowTimezone(false)}
          onSelect={(val) => { updateSetting('timezone', val); setShowTimezone(false); showToast('Time zone updated') }}
        />
      )}

      {/* ═══ TOAST ═══ */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#000000',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toast}
        </div>
      )}

      {/* Loading overlay */}
      {!loaded && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e5e5ea', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}
    </div>
  )
}

/* ─── Edit Profile Modal ─── */
function EditProfileModal({ user, onClose, onSave, onAvatarUpload }: {
  user: AuthUser | null
  onClose: () => void
  onSave: (updates: { name?: string; email?: string; businessName?: string; phone?: string; preferredName?: string }) => void
  onAvatarUpload: (file: File) => Promise<AuthUser>
}) {
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [businessName, setBusinessName] = useState(user?.businessName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')

  const [preferredName, setPreferredName] = useState(user?.preferredName ?? '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      console.log('[avatar] No file selected')
      return
    }

    console.log('[avatar] Selected file:', { name: file.name, type: file.type, size: file.size })

    if (!file.type.startsWith('image/')) {
      console.error('[avatar] Invalid file type:', file.type)
      alert('Please select an image file')
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      console.error('[avatar] File too large:', file.size)
      alert('Image must be smaller than 100MB')
      return
    }

    const localUrl = URL.createObjectURL(file)
    setAvatarPreview(localUrl)
    console.log('[avatar] Preview URL:', localUrl)
    setUploading(true)

    try {
      const compressed = await compressImage(file, { maxWidth: 512, maxHeight: 512, quality: 0.8 })
      console.log('[avatar] Compressed size:', compressed.size)

      const compressedFile = new File([compressed], 'avatar.jpg', { type: 'image/jpeg' })
      console.log('[avatar] Uploading compressed file:', { name: compressedFile.name, size: compressedFile.size, type: compressedFile.type })

      const updated = await onAvatarUpload(compressedFile)
      console.log('[avatar] Upload success, avatarUrl:', updated.avatarUrl)
      setAvatarUrl(updated.avatarUrl ?? null)
      // Keep the local preview visible so the user immediately sees the image
      // The backend URL will take over once the image loads
    } catch (err) {
      console.error('[avatar] Upload failed:', err)
      setAvatarPreview(null)
      alert('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({ name, email, businessName, phone: phone || undefined, preferredName: preferredName || undefined })
    } finally {
      setSaving(false)
    }
  }

  const displayAvatar = avatarPreview || avatarUrl

  return (
    <ModalShell title="Edit profile" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            style={{
              width: 72, height: 72, borderRadius: '50%', background: '#e5e7eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: uploading ? 'default' : 'pointer', flexShrink: 0,
              position: 'relative',
            }}
          >
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {displayAvatar
                ? <img src={displayAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 26, fontWeight: 700, color: '#374151' }}>{name?.charAt(0).toUpperCase() ?? 'U'}</span>}
            </div>
            {uploading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={20} color="#fff" className="animate-spin" />
              </div>
            )}
            {!uploading && !displayAvatar && (
              <div style={{ position: 'absolute', bottom: 2, right: 2, width: 22, height: 22, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
                <Camera size={12} color="#fff" />
              </div>
            )}
          </div>
          <div>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ fontSize: 13, fontWeight: 600, color: uploading ? '#9ca3af' : '#3b82f6', background: 'none', border: 'none', cursor: uploading ? 'default' : 'pointer', padding: 0 }}>
              {uploading ? 'Uploading...' : 'Change photo'}
            </button>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>Max 5MB · Auto-compressed to 512px</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
        </div>
        <Field label="Full name" value={name} onChange={setName} />
        <Field label="Preferred name" value={preferredName} onChange={setPreferredName} />
        <Field label="Email" value={email} onChange={setEmail} />
        <Field label="Phone" value={phone} onChange={setPhone} />
        <Field label="Business name" value={businessName} onChange={setBusinessName} />
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: saving || uploading ? '#9ca3af' : '#000', color: '#fff', fontSize: 15, fontWeight: 700, cursor: saving || uploading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </ModalShell>
  )
}

/* ─── Change Password Modal ─── */
function ChangePasswordModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (current: string, next: string) => Promise<void>
}) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const handleSave = async () => {
    setError('')
    if (!current || !next) { setError('All fields are required'); return }
    if (next.length < 6) { setError('New password must be at least 6 characters'); return }
    if (next !== confirm) { setError('Passwords do not match'); return }
    try {
      await onSave(current, next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
    }
  }

  return (
    <ModalShell title="Change password" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>{error}</div>}
        <Field label="Current password" value={current} onChange={setCurrent} type="password" />
        <Field label="New password" value={next} onChange={setNext} type="password" />
        <Field label="Confirm new password" value={confirm} onChange={setConfirm} type="password" />
        <button onClick={handleSave} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: '#000', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Update password</button>
      </div>
    </ModalShell>
  )
}

/* ─── Confirm Modal ─── */
function ConfirmModal({ title, message, confirmLabel, danger, onClose, onConfirm }: {
  title: string
  message: string
  confirmLabel: string
  danger?: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <ModalShell title={title} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '1px solid #e5e5ea', background: 'transparent', color: '#000', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', background: danger ? '#ef4444' : '#000', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>{confirmLabel}</button>
        </div>
      </div>
    </ModalShell>
  )
}

/* ─── Picker Modal ─── */
function PickerModal({ title, options, labels, selected, onClose, onSelect }: {
  title: string
  options: string[]
  labels: string[]
  selected: string
  onClose: () => void
  onSelect: (val: string) => void
}) {
  return (
    <ModalShell title={title} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 0', borderBottom: '1px solid #f0f0f0',
              border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 500, color: '#000' }}>{labels[i]}</span>
            {selected === opt && <Check size={18} color="#22c55e" />}
          </button>
        ))}
      </div>
    </ModalShell>
  )
}

/* ─── Modal Shell ─── */
function ModalShell({ title, onClose, children }: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, maxHeight: '85vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#000', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}><X size={20} color="#9ca3af" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ─── Field Input ─── */
function Field({ label, value, onChange, type }: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        type={type || 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e5ea', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  )
}
