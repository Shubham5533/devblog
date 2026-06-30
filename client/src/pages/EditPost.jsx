import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { updatePost, deletePost } from '../store/slices/postsSlice'
import { addToast } from '../store/slices/uiSlice'
import Editor from '../components/editor/Editor'
import api from '../utils/api'
import { CATEGORIES } from '../utils/helpers'

export default function EditPost() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Technology')
  const [tags, setTags] = useState('')
  const [status, setStatus] = useState('published')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)

  useEffect(() => {
    const fetchPostById = async () => {
      try {
        const res = await api.get(`/posts/edit/${id}`)
        const p = res.data.post
        setPost(p)
        setTitle(p.title)
        setContent(p.content)
        setCategory(p.category)
        setTags(p.tags.join(', '))
        setStatus(p.status)
        setCoverPreview(p.coverImage)
      } catch {
        setError('Failed to load post.')
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchPostById()
  }, [id, user])

  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    setError('')
    if (!title.trim()) return setError('Title is required.')
    setSubmitting(true)
    try {
      let coverImage = post.coverImage
      if (coverFile) {
        const formData = new FormData()
        formData.append('image', coverFile)
        const res = await api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        coverImage = res.data.url
      }
      const result = await dispatch(updatePost({ id, data: { title, content, category, tags, status, coverImage } }))
      if (updatePost.fulfilled.match(result)) {
        dispatch(addToast({ type: 'success', message: 'Post updated!' }))
        navigate(`/post/${result.payload.post.slug}`)
      } else {
        setError(result.payload || 'Update failed.')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return
    const result = await dispatch(deletePost(id))
    if (deletePost.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', message: 'Post deleted.' }))
      navigate('/dashboard')
    }
  }

  if (loading) return <div className="flex justify-center py-32"><div className="spinner w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>
  if (error && !post) return <div className="text-center py-32" style={{ color: 'var(--text-muted)' }}>{error}</div>

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-extrabold mb-1">Edit post</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Make your changes below and republish.</p>

      {error && <div className="text-sm text-red-400 bg-red-500/10 border-l-2 border-red-500 px-4 py-3 rounded mb-5">{error}</div>}

      <div className="rounded-2xl border p-8" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="mb-5">
          <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border text-base font-medium outline-none focus:border-primary-500" style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none cursor-pointer" style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Tags</label>
            <input value={tags} onChange={e => setTags(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:border-primary-500" style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }} />
          </div>
        </div>

        <div className="mb-5">
          <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Cover Image</label>
          {coverPreview && <img src={coverPreview} alt="preview" className="h-32 rounded-lg object-cover mb-2" />}
          <label htmlFor="cover" className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-dashed cursor-pointer text-sm" style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            📷 {coverFile ? coverFile.name : 'Replace image...'}
          </label>
          <input id="cover" type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
        </div>

        <div className="mb-5">
          <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Content *</label>
          <Editor value={content} onChange={setContent} />
        </div>

        <div className="mb-6">
          <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none cursor-pointer" style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition disabled:opacity-60">
            {submitting ? 'Saving...' : 'Save changes →'}
          </button>
          <button onClick={handleDelete} className="px-6 py-2.5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition">
            Delete post
          </button>
        </div>
      </div>
    </div>
  )
}
