import { api } from './api'
import type { LoginResponse, AuthUser, DeviceBrief } from '../store/authStore'

function getFingerprint(): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('fingerprint', 2, 2)
  }
  const canvasData = canvas.toDataURL()

  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    canvasData,
  ].join('::')

  // Simple hash
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i)
    hash = ((hash << 5) - hash + chr) | 0
  }
  return Math.abs(hash).toString(16).padStart(16, '0')
}

export function getDevice(): DeviceBrief {
  return {
    fingerprint: getFingerprint(),
    label: `${navigator.platform} Browser`,
    platform: 'web',
    userAgent: navigator.userAgent,
  }
}

export const authApi = {
  login: (identifier: string, password: string) => {
    const device = getDevice()
    return api.post<LoginResponse>('/auth/login', {
      identifier,
      password,
      device,
    })
  },

  refresh: (refreshToken: string) =>
    api.post<LoginResponse>('/auth/refresh', { refreshToken }),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<AuthUser>('/users/me'),
}
