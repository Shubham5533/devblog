import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useState, useRef, useEffect } from 'react'
import { logoutUser } from '../../store/slices/authSlice'
import { toggleTheme, toggleMobileMenu, closeMobileMenu } from '../../store/slices/uiSlice'
import { getInitials } from '../../utils/helpers'

export default function Navbar() {
  const { user } = useSelector(s => s.auth)
  const { theme, mobileMenuOpen } = useSelector(s => s.ui)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    setDropdownOpen(false)
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)', borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-extrabold tracking-tight flex items-center gap-1">
          Dev<span className="text-primary-500">Blog</span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/" className="px-3 py-2 text-sm rounded-lg hover:bg-dark-700/50 transition" style={{ color: 'var(--text-muted)' }}>
            Explore
          </Link>

          <button
            onClick={() => dispatch(toggleTheme())}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition hover:bg-dark-700/50"
            style={{ color: 'var(--text-muted)' }}
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user ? (
            <>
              <Link to="/write" className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition">
                + Write
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2" style={{ borderColor: 'var(--border)' }} />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold">
                      {getInitials(user.name)}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border overflow-hidden fade-in" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>{user.email}</p>
                    </div>
                    <Link to={`/profile/${user._id}`} onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-dark-700/30 transition" style={{ color: 'var(--text-muted)' }}>
                      👤 My Profile
                    </Link>
                    <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-dark-700/30 transition" style={{ color: 'var(--text-muted)' }}>
                      📊 Dashboard
                    </Link>
                    <Link to="/saved" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-dark-700/30 transition" style={{ color: 'var(--text-muted)' }}>
                      🔖 Saved Posts
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-500/10 text-red-400 transition border-t" style={{ borderColor: 'var(--border)' }}>
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm rounded-lg" style={{ color: 'var(--text-muted)' }}>Sign in</Link>
              <Link to="/register" className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-xl" onClick={() => dispatch(toggleMobileMenu())}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t px-6 py-4 flex flex-col gap-3 fade-in" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
          <Link to="/" onClick={() => dispatch(closeMobileMenu())} style={{ color: 'var(--text-muted)' }}>Explore</Link>
          <button onClick={() => dispatch(toggleTheme())} className="text-left" style={{ color: 'var(--text-muted)' }}>
            {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
          </button>
          {user ? (
            <>
              <Link to="/write" onClick={() => dispatch(closeMobileMenu())} className="text-primary-500 font-semibold">+ Write</Link>
              <Link to={`/profile/${user._id}`} onClick={() => dispatch(closeMobileMenu())} style={{ color: 'var(--text-muted)' }}>My Profile</Link>
              <Link to="/dashboard" onClick={() => dispatch(closeMobileMenu())} style={{ color: 'var(--text-muted)' }}>Dashboard</Link>
              <Link to="/saved" onClick={() => dispatch(closeMobileMenu())} style={{ color: 'var(--text-muted)' }}>Saved Posts</Link>
              <button onClick={handleLogout} className="text-left text-red-400">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => dispatch(closeMobileMenu())} style={{ color: 'var(--text-muted)' }}>Sign in</Link>
              <Link to="/register" onClick={() => dispatch(closeMobileMenu())} className="text-primary-500 font-semibold">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
