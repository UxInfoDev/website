export const resolveImageUrl = (rawValue) => {
  if (!rawValue) return ''

  const raw = String(rawValue).trim()
  if (!raw) return ''

  const normalized = raw.replace(/\\/g, '/')
  const lower = normalized.toLowerCase()

  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('data:') ||
    lower.startsWith('blob:')
  ) {
    return normalized
  }

  if (lower.startsWith('/uploads/')) return normalized
  if (lower.startsWith('uploads/')) return `/${normalized}`
  if (lower.startsWith('public/uploads/')) return `/${normalized.replace(/^public\//i, '')}`

  const uploadsSegmentIndex = lower.indexOf('/uploads/')
  if (uploadsSegmentIndex >= 0) {
    return normalized.slice(uploadsSegmentIndex)
  }

  // If it's already an absolute path from the root, trust it
  if (normalized.startsWith('/')) return normalized

  // Otherwise, it's a relative path from the uploads directory
  return `/uploads/${normalized.startsWith('./') ? normalized.slice(2) : normalized}`
}

export const resolveServiceImageUrl = (service = {}) =>
  resolveImageUrl(service.image || service.image_url || service.imageUrl)
