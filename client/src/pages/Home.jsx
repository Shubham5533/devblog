import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, Link } from 'react-router-dom'
import { fetchPosts, fetchFeatured } from '../store/slices/postsSlice'
import PostCard from '../components/blog/PostCard'
import PostCardSkeleton from '../components/blog/PostCardSkeleton'
import { CATEGORIES } from '../utils/helpers'

export default function Home() {
  const dispatch = useDispatch()
  const { list, loading, pages, currentPage, featured } = useSelector(s => s.posts)
  const { user } = useSelector(s => s.auth)
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  const category = searchParams.get('category')
  const tag = searchParams.get('tag')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page')) || 1

  useEffect(() => {
    dispatch(fetchPosts({ category, tag, search, page, limit: 9 }))
  }, [dispatch, category, tag, search, page])

  useEffect(() => {
    dispatch(fetchFeatured())
  }, [dispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = {}
    if (searchInput) params.search = searchInput
    setSearchParams(params)
  }

  const goToPage = (p) => {
    const params = Object.fromEntries(searchParams)
    params.page = p
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const noFilters = !category && !search && !tag && page === 1

  return (
    <div>
      {noFilters && (
        <>
          <section className="text-center py-16 px-6" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,106,247,.12) 0%, transparent 70%)' }}>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
              Ideas worth <span className="text-primary-500">reading</span>.<br />Stories worth sharing.
            </h1>
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              Explore articles on tech, lifestyle, travel and more — written by real people.
            </p>
            <Link to={user ? '/write' : '/register'} className="inline-block px-8 py-3 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition">
              {user ? 'Write a post ✍️' : 'Start reading →'}
            </Link>
          </section>

          {featured.length > 0 && (
            <section className="max-w-6xl mx-auto px-6 mb-12">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Trending</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {featured.slice(0, 3).map(p => (
                  <Link to={`/post/${p.slug}`} key={p._id} className="relative h-56 rounded-2xl overflow-hidden block group">
                    {p.coverImage ? (
                      <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl" style={{ background: 'linear-gradient(135deg, var(--bg3), var(--bg2))' }}>📝</div>
                    )}
                    <div className="absolute inset-0 flex flex-col justify-end p-5" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.85), transparent 60%)' }}>
                      <h3 className="text-white font-bold text-sm leading-snug">{p.title}</h3>
                      <span className="text-white/60 text-xs mt-1">{p.author?.name} · {p.views} views</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <main className="max-w-6xl mx-auto px-6 pb-16">
        {(category || search || tag) && (
          <div className="flex items-center gap-3 flex-wrap pt-8 mb-2">
            <h2 className="text-xl font-bold">
              {search ? `Results for "${search}"` : category ? `Category: ${category}` : `Tag: #${tag}`}
            </h2>
            <Link to="/" className="text-sm px-3 py-1 rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Clear ×</Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 items-start mt-8">
          <section>
            {!category && !search && !tag && (
              <div className="flex items-center gap-3 mb-5">
                <span className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Latest posts</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)}
              </div>
            ) : list.length === 0 ? (
              <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Nothing here yet</h3>
                <p>Be the first to write something.</p>
                {user && <Link to="/write" className="inline-block mt-4 px-5 py-2 rounded-lg bg-primary-500 text-white font-semibold">Write a post</Link>}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {list.map(post => <PostCard key={post._id} post={post} />)}
              </div>
            )}

            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {currentPage > 1 && <button onClick={() => goToPage(currentPage - 1)} className="px-3 py-2 text-sm rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>← Prev</button>}
                {Array.from({ length: pages }).map((_, i) => (
                  <button key={i} onClick={() => goToPage(i + 1)} className={`px-3 py-2 text-sm rounded-lg border ${currentPage === i + 1 ? 'bg-primary-500 text-white border-primary-500' : ''}`} style={currentPage !== i + 1 ? { borderColor: 'var(--border)', color: 'var(--text-muted)' } : {}}>
                    {i + 1}
                  </button>
                ))}
                {currentPage < pages && <button onClick={() => goToPage(currentPage + 1)} className="px-3 py-2 text-sm rounded-lg border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Next →</button>}
              </div>
            )}
          </section>

          <aside className="sticky top-20 flex flex-col gap-5">
            <div className="rounded-2xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Search</h3>
              <form onSubmit={handleSearch}>
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  type="text"
                  placeholder="Search posts..."
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-primary-500"
                  style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
                <button type="submit" className="w-full mt-2 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition">Search</button>
              </form>
            </div>

            <div className="rounded-2xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Categories</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <Link
                    key={cat}
                    to={`/?category=${cat}`}
                    className={`px-3 py-1 text-xs rounded-full border transition ${category === cat ? 'bg-primary-500 text-white border-primary-500' : ''}`}
                    style={category !== cat ? { borderColor: 'var(--border)', color: 'var(--text-muted)' } : {}}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            {user && (
              <div className="rounded-2xl border p-5" style={{ background: 'linear-gradient(135deg, rgba(124,106,247,.15), rgba(124,106,247,.05))', borderColor: 'rgba(124,106,247,.3)' }}>
                <h3 className="text-sm font-bold mb-2">Your space</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Share what's on your mind.</p>
                <Link to="/write" className="block text-center py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition">+ Write a post</Link>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
