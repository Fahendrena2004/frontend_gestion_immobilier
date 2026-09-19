import api from '@/lib/axios'

/**
 * Module Notifications de l'API.
 *   GET   /notifications          (renvoie aussi unread_count)
 *   PATCH /notifications/{id}/read
 *   PATCH /notifications/read-all
 */

function mapNotification(n) {
  return {
    id: n.id,
    titre: n.titre,
    message: n.contenu,
    lu: !!n.lu,
    type: n.type,
    date: n.created_at,
  }
}

export const notificationService = {
  /** @returns {{ items: Array, unreadCount: number, meta: object|null }} */
  async list() {
    const response = await api.get('/notifications')
    return {
      items: (response.data || []).map(mapNotification),
      unreadCount: response.extra?.unread_count ?? 0,
      meta: response.meta || null,
    }
  },

  async markAsRead(id) {
    const { data } = await api.patch(`/notifications/${id}/read`)
    return mapNotification(data)
  },

  /** @returns {number} nombre de notifications marquées comme lues */
  async markAllAsRead() {
    const { data } = await api.patch('/notifications/read-all')
    return data?.updated ?? 0
  },
}
