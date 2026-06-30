import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboard, deletePost } from '../store/slices/postsSlice'
import { addToast } from '../store/slices/uiSlice'
import { formatDate } from '../utils/helpers'

export default function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { dashboard, loading } = useSelector(s => s.posts)

  useEffect(() => {
    if (user) dispatch(fetchDashboard(user._id))
  }, [dispatch, user])

  const handleDelete = async (id) => {
    if (!confirm('Delete this post permanently?')) return
    const res = await dispatch(deletePost(id))
    if (deletePost.fulfilled.match(res)) dispatch(addToast({ type: 'success', message: 'Post deleted.' }))
  }

  if (loading || !dashboard) return <div className="flex justify-center py-32"><div className="spinner w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>

  const { posts, stats } = dashboard

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold">Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{stats.total} total posts</p>
        </div>
        <Link to="/write" className="px-5 py-2.5 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition">+ New Post</Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {[
          ['Published', stats.published], ['Drafts', stats.drafts], ['Views', stats.totalViews],
          ['Likes', stats.totalLikes], ['Comments', stats.totalComments], ['Total', stats.total],
        ].map(([label, val]) => (
          <div key={label} className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <strong className="block text-2xl font-extrabold">{val}</strong>
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{label}</span>
          </div>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <div className="text-4xl mb-3">📭</div>
          <h3 className="font-bold mb-1" style={{ color: 'var(--text)' }}>No posts yet</h3>
          <p className="mb-4">You haven't written anything yet. Start now!</p>
          <Link to="/write" className="inline-block px-5 py-2 rounded-lg bg-primary-500 text-white font-semibold">Write your first post</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map(post => (
            <div key={post._id} className="flex items-center justify-between gap-4 flex-wrap p-5 rounded-xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${post.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>{post.status}</span>
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{post.category}</span>
                </div>
                <h3 className="font-bold mb-1">
                  {post.status === 'published' ? (
                    <Link to={`/post/${post.slug}`} target="_blank" className="hover:text-primary-500 transition">{post.title}</Link>
                  ) : post.title}
                </h3>
                <div className="flex gap-4 text-xs flex-wrap" style={{ color: 'var(--text-faint)' }}>
                  <span>📅 {formatDate(post.createdAt)}</span>
                  <span>👁 {post.views}</span>
                  <span>❤️ {post.likes.length}</span>
                  <span>💬 {post.comments.length}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/edit/${post._id}`} className="px-3.5 py-2 rounded-lg border text-sm font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Edit</Link>
                <button onClick={() => handleDelete(post._id)} className="px-3.5 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
