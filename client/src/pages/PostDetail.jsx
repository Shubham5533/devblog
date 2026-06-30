import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPost, toggleLike, addComment, deleteComment, clearCurrentPost } from '../store/slices/postsSlice'
import { addToast } from '../store/slices/uiSlice'
import { getInitials, timeAgo, formatDate } from '../utils/helpers'
import PostCard from '../components/blog/PostCard'
import api from '../utils/api'

export default function PostDetail() {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentPost: post, postLoading, liked } = useSelector(s => s.posts)
  const { user } = useSelector(s => s.auth)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [related, setRelated] = useState([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    dispatch(fetchPost(slug))
    return () => dispatch(clearCurrentPost())
  }, [dispatch, slug])

  useEffect(() => {
    if (post?._id) {
      api.get(`/posts/${post._id}/related`).then(res => setRelated(res.data.posts)).catch(() => {})
    }
  }, [post?._id])

  const handleLike = () => {
    if (!user) return navigate('/login')
    dispatch(toggleLike(post._id))
  }

  const handleSave = async () => {
    if (!user) return navigate('/login')
    try {
      const res = await api.post(`/posts/${post._id}/save`)
      setSaved(res.data.saved)
      dispatch(addToast({ type: 'success', message: res.data.saved ? 'Saved!' : 'Removed from saved' }))
    } catch {}
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmittingComment(true)
    const res = await dispatch(addComment({ postId: post._id, content: commentText }))
    if (addComment.fulfilled.match(res)) {
      setCommentText('')
      dispatch(addToast({ type: 'success', message: 'Comment added!' }))
    }
    setSubmittingComment(false)
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    await dispatch(deleteComment({ postId: post._id, commentId }))
  }

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return
    try {
      await api.delete(`/posts/${post._id}`)
      dispatch(addToast({ type: 'success', message: 'Post deleted.' }))
      navigate('/dashboard')
    } catch {
      dispatch(addToast({ type: 'error', message: 'Delete failed.' }))
    }
  }

  if (postLoading) return <div className="flex justify-center py-32"><div className="spinner w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>
  if (!post) return <div className="text-center py-32" style={{ color: 'var(--text-muted)' }}>Post not found.</div>

  const isOwner = user && post.author._id === user._id

  return (
    <div className="pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <div className="py-14">
          <Link to={`/?category=${post.category}`} className="text-xs font-bold uppercase tracking-wide text-primary-500 mb-4 inline-block">{post.category}</Link>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-6">{post.title}</h1>
          <div className="flex items-center gap-6 flex-wrap">
            <Link to={`/profile/${post.author._id}`} className="flex items-center gap-2.5">
              {post.author.avatar ? (
                <img src={post.author.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <span className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold">{getInitials(post.author.name)}</span>
              )}
              <div>
                <p className="text-sm font-bold">{post.author.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(post.createdAt)} · {post.readTime} min read</p>
              </div>
            </Link>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>👁 {post.views} views</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>💬 {post.comments.length} comments</span>
          </div>
        </div>

        {post.coverImage && (
          <img src={post.coverImage} alt={post.title} className="w-full max-h-[480px] object-cover rounded-2xl mb-8 border" style={{ borderColor: 'var(--border)' }} />
        )}

        <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {post.tags.map(tag => (
              <Link key={tag} to={`/?tag=${tag}`} className="px-3 py-1 rounded-full text-xs border" style={{ background: 'var(--bg3)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>#{tag}</Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap my-7">
          <button onClick={handleLike} className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition ${liked ? 'bg-red-500/10 border-red-500 text-red-400' : ''}`} style={!liked ? { background: 'var(--bg3)', borderColor: 'var(--border)', color: 'var(--text-muted)' } : {}}>
            <span>{liked ? '❤️' : '🤍'}</span> {post.likes?.length || 0} likes
          </button>
          <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition ${saved ? 'bg-primary-500/10 border-primary-500 text-primary-500' : ''}`} style={!saved ? { background: 'var(--bg3)', borderColor: 'var(--border)', color: 'var(--text-muted)' } : {}}>
            {saved ? '🔖' : '📑'} {saved ? 'Saved' : 'Save'}
          </button>
          {isOwner && (
            <>
              <Link to={`/edit/${post._id}`} className="px-4 py-2.5 rounded-lg border text-sm font-semibold transition" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>✏️ Edit</Link>
              <button onClick={handleDeletePost} className="px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">🗑 Delete</button>
            </>
          )}
        </div>

        {/* Author box */}
        <Link to={`/profile/${post.author._id}`} className="flex gap-5 items-start p-6 rounded-2xl border mb-8" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          {post.author.avatar ? (
            <img src={post.author.avatar} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <span className="w-14 h-14 rounded-full bg-primary-500 text-white flex items-center justify-center text-lg font-bold">{getInitials(post.author.name)}</span>
          )}
          <div>
            <h4 className="font-bold mb-1">{post.author.name}</h4>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{post.author.bio || 'No bio yet.'}</p>
          </div>
        </Link>

        {/* Comments */}
        <div className="pt-10 border-t" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-lg font-bold mb-6">Comments ({post.comments.length})</h3>

          {user ? (
            <form onSubmit={handleComment} className="mb-7">
              <textarea
                value={commentText} onChange={e => setCommentText(e.target.value)}
                placeholder="Share your thoughts..." rows={3}
                className="w-full px-4 py-3 rounded-lg border text-sm outline-none resize-y focus:border-primary-500"
                style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <button type="submit" disabled={submittingComment} className="mt-3 px-5 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition disabled:opacity-60">
                {submittingComment ? 'Posting...' : 'Post comment'}
              </button>
            </form>
          ) : (
            <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>
              <Link to="/login" className="text-primary-500 font-medium">Sign in</Link> to leave a comment.
            </p>
          )}

          <div className="flex flex-col gap-4">
            {post.comments.slice().reverse().map(comment => (
              <div key={comment._id} className="flex gap-3.5 p-4 rounded-xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                {comment.user?.avatar ? (
                  <img src={comment.user.avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{getInitials(comment.user?.name || '?')}</span>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold">{comment.user?.name || 'Unknown'}</span>
                      <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{timeAgo(comment.createdAt)}</span>
                    </div>
                    {user && comment.user?._id === user._id && (
                      <button onClick={() => handleDeleteComment(comment._id)} className="text-xs hover:text-red-400 transition" style={{ color: 'var(--text-faint)' }}>✕ delete</button>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{comment.content}</p>
                </div>
              </div>
            ))}
            {post.comments.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 mt-14 pt-10 border-t" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-lg font-bold mb-6">More in {post.category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map(r => <PostCard key={r._id} post={r} />)}
          </div>
        </div>
      )}
    </div>
  )
}
