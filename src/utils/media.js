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

  if (normalized.startsWith('/')) return normalized
  if (normalized.includes('/')) return `/${normalized}`

  return `/uploads/${normalized}`
}

export const resolveServiceImageUrl = (service = {}) =>
  resolveImageUrl(service.image || service.image_url || service.imageUrl)
