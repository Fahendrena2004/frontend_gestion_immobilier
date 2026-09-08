import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { notificationService } from '@/services/notificationService'
import { formatDateTime, cn } from '@/lib/utils'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    notificationService.list().then(setNotifications)
  }, [])

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const unreadCount = notifications.filter((n) => !n.lu).length

  async function handleOpen() {
    setOpen((o) => !o)
  }

  async function handleMarkAll() {
    await notificationService.markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brick-500 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-lg border border-ink-100 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <span className="text-sm font-semibold text-ink-900">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} className="text-xs font-medium text-brand-600 hover:underline">
                Tout marquer comme lu
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-ink-500">Aucune notification</p>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn('border-b border-ink-50 px-4 py-3 last:border-0', !n.lu && 'bg-brand-50/40')}
              >
                <p className="text-sm font-medium text-ink-900">{n.titre}</p>
                <p className="mt-0.5 text-xs text-ink-500">{n.message}</p>
                <p className="mt-1 text-[11px] text-ink-300">{formatDateTime(n.date)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
