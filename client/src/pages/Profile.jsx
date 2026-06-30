import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import api from '../utils/api'
import { getInitials } from '../utils/helpers'
import PostCard from '../components/blog/PostCard'
import PostCardSkeleton from '../components/blog/PostCardSkeleton'
import { updateProfile } from '../store/slices/authSlice'
import { addToast } from '../store/slices/uiSlice'

export default function Profile() {
  const { id } = useParams()
  const { user: currentUser } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [profileUser, setProfileUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', bio: '', website: '', twitter: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [saving, setSaving] = useState(false)

  const isOwn = currentUser && currentUser._id === id

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/users/${id}`)
        setProfileUser(res.data.user)
        setPosts(res.data.posts)
        setStats(res.data.stats)
        setForm({
          name: res.data.user.name,
          bio: res.data.user.bio || '',
          website: res.data.user.website || '',
          twitter: res.data.user.twitter || '',
        })
        setAvatarPreview(res.data.user.avatar)
      } catch {
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setSaving(true)
    const formData = new FormData()
    Object.entries(form).forEach(([k, v]) => formData.append(k, v))
    if (avatarFile) formData.append('avatar', avatarFile)

    const res = await dispatch(updateProfile({ id, formData }))
    if (updateProfile.fulfilled.match(res)) {
      setProfileUser(res.payload.user)
      dispatch(addToast({ type: 'success', message: 'Profile updated!' }))
      setEditing(false)
    } else {
      dispatch(addToast({ type: 'error', message: res.payload || 'Update failed' }))
    }
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center py-32"><div className="spinner w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>
  if (!profileUser) return null

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="rounded-2xl border p-8 flex flex-col sm:flex-row gap-7 items-start mb-10" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        {editing ? (
          <div>
            {avatarPreview ? (
              <img src={avatarPreview} alt="" className="w-24 h-24 rounded-full object-cover border-2 mb-2" style={{ borderColor: 'var(--border)' }} />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-500 text-white flex items-center justify-center text-3xl font-bold mb-2">{getInitials(form.name)}</div>
            )}
            <label htmlFor="avatar" className="block text-xs text-center px-2 py-1 rounded border cursor-pointer" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Change photo</label>
            <input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
        ) : profileUser.avatar ? (
          <img src={profileUser.avatar} alt={profileUser.name} className="w-24 h-24 rounded-full object-cover border-2 flex-shrink-0" style={{ borderColor: 'var(--border)' }} />
        ) : (
          <div className="w-24 h-24 rounded-full bg-primary-500 text-white flex items-center justify-center text-3xl font-bold flex-shrink-0">{getInitials(profileUser.name)}</div>
        )}

        <div className="flex-1 w-full">
          {editing ? (
            <div className="flex flex-col gap-3 max-w-md">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="px-3.5 py-2 rounded-lg border text-sm outline-none focus:border-primary-500" style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Bio" rows={3} maxLength={400} className="px-3.5 py-2 rounded-lg border text-sm outline-none resize-none focus:border-primary-500" style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="Website URL" className="px-3.5 py-2 rounded-lg border text-sm outline-none focus:border-primary-500" style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              <input value={form.twitter} onChange={e => setForm({ ...form, twitter: e.target.value })} placeholder="Twitter handle" className="px-3.5 py-2 rounded-lg border text-sm outline-none focus:border-primary-500" style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg border text-sm font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold mb-1.5">{profileUser.name}</h1>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{profileUser.bio || 'No bio added yet.'}</p>
              <div className="flex gap-6 mb-4">
                <div className="text-center"><strong className="block text-xl font-extrabold">{stats.posts || 0}</strong><span className="text-xs" style={{ color: 'var(--text-faint)' }}>Posts</span></div>
                <div className="text-center"><strong className="block text-xl font-extrabold">{stats.totalViews || 0}</strong><span className="text-xs" style={{ color: 'var(--text-faint)' }}>Total Views</span></div>
                <div className="text-center"><strong className="block text-xl font-extrabold">{stats.totalLikes || 0}</strong><span className="text-xs" style={{ color: 'var(--text-faint)' }}>Total Likes</span></div>
              </div>
              {isOwn && (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-lg border text-sm font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Edit profile</button>
                  <Link to="/dashboard" className="px-4 py-2 rounded-lg border text-sm font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Manage posts</Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Posts by {profileUser.name}</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <div className="text-4xl mb-3">📝</div>
          <h3 className="font-bold mb-1" style={{ color: 'var(--text)' }}>No posts yet</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => <PostCard key={post._id} post={post} />)}
        </div>
      )}
    </div>
  )
}
