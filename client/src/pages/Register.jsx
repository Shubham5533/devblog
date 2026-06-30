import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser, clearError } from '../store/slices/authSlice'
import { addToast } from '../store/slices/uiSlice'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [localError, setLocalError] = useState('')
  const { loading, error, user } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  useEffect(() => () => dispatch(clearError()), [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords don't match.")
      return
    }
    const res = await dispatch(registerUser(form))
    if (registerUser.fulfilled.match(res)) {
      dispatch(addToast({ type: 'success', message: `Welcome, ${res.payload.user.name}!` }))
      navigate('/')
    }
  }

  const handleGoogleSignup = () => {
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border p-9 shadow-2xl" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <h1 className="text-2xl font-extrabold mb-1">Create account ✨</h1>
        <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>Join thousands of writers and readers</p>

        {(error || localError) && <div className="text-sm text-red-400 bg-red-500/10 border-l-2 border-red-500 px-4 py-3 rounded mb-5">{localError || error}</div>}

        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border font-medium text-sm mb-5 transition hover:bg-dark-700/30"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33C2.44 15.98 5.48 18 9 18z"/>
            <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 013.68 9c0-.59.1-1.17.29-1.71V4.96H.96A8.997 8.997 0 000 9c0 1.45.35 2.83.96 4.04l3.01-2.33z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>OR</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Full Name</label>
            <input
              type="text" required autoFocus
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:border-primary-500"
              style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input
              type="email" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:border-primary-500"
              style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Password</label>
            <input
              type="password" required minLength={6}
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Min 6 characters"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:border-primary-500"
              style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Confirm Password</label>
            <input
              type="password" required
              value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Repeat password"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:border-primary-500"
              style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" className="text-primary-500 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
