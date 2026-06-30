import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../utils/api'
import PostCard from '../components/blog/PostCard'
import PostCardSkeleton from '../components/blog/PostCardSkeleton'

export default function SavedPosts() {
  const { user } = useSelector(s => s.auth)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    api.get(`/users/${user._id}/saved`).then(res => setPosts(res.data.posts)).finally(() => setLoading(false))
  }, [user])

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-extrabold mb-1">Saved Posts</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Posts you've bookmarked to read later.</p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <div className="text-4xl mb-3">🔖</div>
          <h3 className="font-bold mb-1" style={{ color: 'var(--text)' }}>No saved posts</h3>
          <p>Save posts you want to read later by clicking the save button.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => <PostCard key={post._id} post={post} />)}
        </div>
      )}
    </div>
  )
}
