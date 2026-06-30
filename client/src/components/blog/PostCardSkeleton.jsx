export default function PostCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="h-48 skeleton" />
      <div className="p-5">
        <div className="h-3 w-20 skeleton mb-3 rounded" />
        <div className="h-4 w-full skeleton mb-2 rounded" />
        <div className="h-4 w-3/4 skeleton mb-4 rounded" />
        <div className="h-3 w-full skeleton mb-1 rounded" />
        <div className="h-3 w-2/3 skeleton mb-4 rounded" />
        <div className="flex justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="h-3 w-20 skeleton rounded" />
          <div className="h-3 w-16 skeleton rounded" />
        </div>
      </div>
    </div>
  )
}
