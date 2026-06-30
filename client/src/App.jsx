import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentUser } from './store/slices/authSlice'
import Navbar from './components/common/Navbar'
import ToastContainer from './components/common/ToastContainer'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import WritePost from './pages/WritePost'
import EditPost from './pages/EditPost'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import SavedPosts from './pages/SavedPosts'
import NotFound from './pages/NotFound'

function PrivateRoute({ children }) {
  const { user, initializing } = useSelector(s => s.auth)
  if (initializing) return <div className="flex items-center justify-center min-h-screen"><div className="spinner w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const dispatch = useDispatch()
  const { theme } = useSelector(s => s.ui)

  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light' : ''
  }, [theme])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <BrowserRouter>
        <Navbar />
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/write" element={<PrivateRoute><WritePost /></PrivateRoute>} />
          <Route path="/edit/:id" element={<PrivateRoute><EditPost /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/saved" element={<PrivateRoute><SavedPosts /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
