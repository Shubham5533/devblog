import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createPost } from '../store/slices/postsSlice'
import { addToast } from '../store/slices/uiSlice'
import Editor from '../components/editor/Editor'
import api from '../utils/api'
import { CATEGORIES } from '../utils/helpers'

export default function WritePost() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Technology')
  const [tags, setTags] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (status) => {
    setError('')
    if (!title.trim()) return setError('Title is required.')
    if (!content || content === '<p><br></p>') return setError('Content cannot be empty.')

    setSubmitting(true)
    try {
      let coverImage = '', coverImagePublicId = ''
      if (coverFile) {
        setUploading(true)
        const formData = new FormData()
        formData.append('image', coverFile)
        const res = await api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        coverImage = res.data.url
        coverImagePublicId = res.data.publicId
        setUploading(false)
      }

      const result = await dispatch(createPost({
        title, content, category, tags, status, coverImage, coverImagePublicId,
      }))

      if (createPost.fulfilled.match(result)) {
        dispatch(addToast({ type: 'success', message: status === 'draft' ? 'Saved as draft!' : 'Post published!' }))
        navigate(`/post/${result.payload.post.slug}`)
      } else {
        setError(result.payload || 'Failed to create post.')
      }
    } catch (err) {
      setError('Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-extrabold mb-1">Write a new post</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Share your thoughts with the world. Be authentic.</p>

      {error && <div className="text-sm text-red-400 bg-red-500/10 border-l-2 border-red-500 px-4 py-3 rounded mb-5">{error}</div>}

      <div className="rounded-2xl border p-8" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="mb-5">
          <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Title *</label>
          <input
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Give your post a great title..."
            className="w-full px-3.5 py-2.5 rounded-lg border text-base font-medium outline-none focus:border-primary-500"
            style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Category *</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none cursor-pointer" style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Tags</label>
            <input
              value={tags} onChange={e => setTags(e.target.value)}
              placeholder="javascript, webdev, tips"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:border-primary-500"
              style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Cover Image</label>
          {coverPreview && <img src={coverPreview} alt="preview" className="h-32 rounded-lg object-cover mb-2" />}
          <label htmlFor="cover" className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-dashed cursor-pointer text-sm" style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            📷 {coverFile ? coverFile.name : 'Choose image...'}
          </label>
          <input id="cover" type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-faint)' }}>Max 5MB · JPG, PNG, WebP</p>
        </div>

        <div className="mb-6">
          <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>Content *</label>
          <Editor value={content} onChange={setContent} />
        </div>

        <div className="flex gap-3 flex-wrap">
          <button onClick={() => handleSubmit('published')} disabled={submitting} className="px-6 py-2.5 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition disabled:opacity-60">
            {uploading ? 'Uploading image...' : submitting ? 'Publishing...' : 'Publish post →'}
          </button>
          <button onClick={() => handleSubmit('draft')} disabled={submitting} className="px-6 py-2.5 rounded-lg border font-semibold transition disabled:opacity-60" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            Save as draft
          </button>
        </div>
      </div>
    </div>
  )
}
