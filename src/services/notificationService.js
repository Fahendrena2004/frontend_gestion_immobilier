import api from '@/lib/axios'
import { USE_MOCK, mockResolve } from '@/lib/mock'
import { mockNotifications } from '@/data/mockData'

/**
 * Client du module Notifications.
 * Routes réelles (PATCH, pas PUT) : GET /notifications,
 * PATCH /notifications/{id}/read, PATCH /notifications/read-all.
 */

function mapNotification(n) {
  return {
    id: n.id,
    titre: n.titre,
    message: n.contenu,
    lu: n.lu,
    type: n.type,
    date: n.created_at,
  }
}

export const notificationService = {
  async list() {
    if (USE_MOCK) return mockResolve(mockNotifications)
    const { data } = await api.get('/notifications')
    return (Array.isArray(data) ? data : data?.data || []).map(mapNotification)
  },

  async markAsRead(id) {
    if (USE_MOCK) return mockResolve({ id, lu: true })
    const { data } = await api.patch(`/notifications/${id}/read`)
    return mapNotification(data)
  },

  async markAllAsRead() {
    if (USE_MOCK) return mockResolve({ success: true })
    const { data } = await api.patch('/notifications/read-all')
    return data
  },
}