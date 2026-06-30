import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="text-center py-32 px-6">
      <h1 className="text-8xl font-black text-primary-500 leading-none">404</h1>
      <h2 className="text-2xl font-bold mt-4 mb-3">Page not found</h2>
      <p className="mb-8" style={{ color: 'var(--text-muted)' }}>The page you're looking for doesn't exist or was moved.</p>
      <Link to="/" className="inline-block px-8 py-3 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition">← Back to home</Link>
    </div>
  )
}
