import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { removeToast } from '../../store/slices/uiSlice'

function Toast({ toast }) {
  const dispatch = useDispatch()
  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), 3500)
    return () => clearTimeout(timer)
  }, [toast.id, dispatch])

  const styles = {
    success: { border: '#22c55e', icon: '✓' },
    error: { border: '#ef4444', icon: '✕' },
    info: { border: '#7c6af7', icon: 'ℹ' },
  }
  const s = styles[toast.type] || styles.info

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl fade-in min-w-[260px]"
      style={{ background: 'var(--card)', borderLeft: `3px solid ${s.border}`, color: 'var(--text)' }}
    >
      <span style={{ color: s.border }} className="font-bold">{s.icon}</span>
      <span className="text-sm">{toast.message}</span>
    </div>
  )
}

export default function ToastContainer() {
  const toasts = useSelector(s => s.ui.toasts)
  return (
    <div className="fixed top-20 right-6 z-[200] flex flex-col gap-2">
      {toasts.map(t => <Toast key={t.id} toast={t} />)}
    </div>
  )
}
