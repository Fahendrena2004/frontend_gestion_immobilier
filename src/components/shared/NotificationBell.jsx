import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { notificationService } from '@/services/notificationService'
import { formatDateTime, cn } from '@/lib/utils'

/** Rafraîchissement périodique du compteur (aucun temps réel côté API). */
const INTERVALLE_RAFRAICHISSEMENT = 60_000

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [erreur, setErreur] = useState(null)
  const ref = useRef(null)

  const charger = useCallback(async () => {
    try {
      const { items, unreadCount: nonLues } = await notificationService.list()
      setNotifications(items)
      setUnreadCount(nonLues)
      setErreur(null)
    } catch (err) {
      setErreur(err.message)
    }
  }, [])

  useEffect(() => {
    charger()
    const intervalle = setInterval(charger, INTERVALLE_RAFRAICHISSEMENT)
    return () => clearInterval(intervalle)
  }, [charger])

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function marquerCommeLue(notification) {
    if (notification.lu) return
    // Mise à jour optimiste : l'état est recalculé si l'appel échoue.
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, lu: true } : n)))
    setUnreadCount((n) => Math.max(0, n - 1))
    try {
      await notificationService.markAsRead(notification.id)
    } catch {
      charger()
    }
  }

  async function marquerToutCommeLu() {
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })))
    setUnreadCount(0)
    try {
      await notificationService.markAllAsRead()
    } catch {
      charger()
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={
          unreadCount > 0 ? `Notifications (${unreadCount} non lues)` : 'Notifications'
        }
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brick-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-lg border border-ink-100 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <span className="text-sm font-semibold text-ink-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={marquerToutCommeLu}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {erreur && (
              <p className="px-4 py-6 text-center text-sm text-brick-600">{erreur}</p>
            )}
            {!erreur && notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-ink-500">Aucune notification</p>
            )}
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => marquerCommeLue(n)}
                className={cn(
                  'block w-full border-b border-ink-50 px-4 py-3 text-left last:border-0 hover:bg-ink-50',
                  !n.lu && 'bg-brand-50/40'
                )}
              >
                <p className="text-sm font-medium text-ink-900">{n.titre}</p>
                {n.message && <p className="mt-0.5 text-xs text-ink-500">{n.message}</p>}
                <p className="mt-1 text-[11px] text-ink-300">{formatDateTime(n.date)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
