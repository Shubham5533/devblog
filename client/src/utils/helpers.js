export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  const intervals = [
    [31536000, 'year'], [2592000, 'month'], [604800, 'week'],
    [86400, 'day'], [3600, 'hour'], [60, 'minute'],
  ]
  for (const [s, label] of intervals) {
    const n = Math.floor(seconds / s)
    if (n >= 1) return `${n} ${label}${n > 1 ? 's' : ''} ago`
  }
}

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

export const truncate = (str = '', len = 160) =>
  str.length > len ? str.slice(0, len) + '...' : str

export const CATEGORIES = [
  'Technology', 'Lifestyle', 'Travel', 'Food', 'Health',
  'Business', 'Education', 'Science', 'Politics', 'Entertainment', 'Other'
]

export const CATEGORY_ICONS = {
  Technology: '💻', Lifestyle: '🌿', Travel: '✈️', Food: '🍜',
  Health: '💊', Business: '📈', Education: '🎓', Science: '🔬',
  Politics: '🏛️', Entertainment: '🎬', Other: '📝'
}
