export function relativeTime(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function stampLabel(source: 'ON_DEVICE' | 'IN_CLOUD' | 'RULES_ONLY'): string {
  if (source === 'ON_DEVICE') return 'Answered on device'
  if (source === 'IN_CLOUD') return 'Answered in cloud'
  return 'Rules only, no model'
}

export function scrubLabel(source: 'ON_DEVICE' | 'IN_CLOUD' | 'RULES_ONLY', ms: number): string {
  const where = source === 'ON_DEVICE' ? 'NANO' : source === 'IN_CLOUD' ? 'CLOUD' : 'RULES'
  return `SCRUBBED ON ${where} · ${Math.round(ms)} MS`
}
