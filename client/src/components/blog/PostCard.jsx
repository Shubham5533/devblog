import { Link } from 'react-router-dom'
import { getInitials, timeAgo } from '../../utils/helpers'

export default function PostCard({ post }) {
  return (
    <article
      className="rounded-2xl overflow-hidden border flex flex-col transition hover:-translate-y-1 hover:shadow-xl group"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <Link to={`/post/${post.slug}`} className="h-48 overflow-hidden block" style={{ background: 'var(--bg3)' }}>
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl" style={{ background: 'linear-gradient(135deg, var(--bg3), var(--bg2))' }}>
            📄
          </div>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <Link to={`/?category=${post.category}`} className="text-xs font-bold uppercase tracking-wide text-primary-500 mb-2">
          {post.category}
        </Link>
        <h3 className="font-bold text-base leading-snug mb-2">
          <Link to={`/post/${post.slug}`} className="hover:text-primary-500 transition">{post.title}</Link>
        </h3>
        <p className="text-sm flex-1 mb-4 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between pt-3 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}>
          <Link to={`/profile/${post.author._id}`} className="flex items-center gap-2">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <span className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-[10px] font-bold">
                {getInitials(post.author.name)}
              </span>
            )}
            <span style={{ color: 'var(--text-muted)' }}>{post.author.name}</span>
          </Link>
          <div className="flex gap-3">
            <span>❤️ {post.likes?.length || 0}</span>
            <span>👁 {post.views || 0}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
