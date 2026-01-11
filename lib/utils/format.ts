/**
 * Formatting utilities for TIFORT-CORE
 */

/**
 * Format price in MAD (Moroccan Dirham)
 */
export function formatPrice(amount: number, options?: { compact?: boolean }): string {
  if (options?.compact && amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M MAD`
  }
  if (options?.compact && amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K MAD`
  }
  return new Intl.NumberFormat('fr-MA', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' MAD'
}

/**
 * Format area in m²
 */
export function formatArea(m2: number): string {
  return new Intl.NumberFormat('fr-MA', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(m2) + ' m²'
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return value.toFixed(decimals) + '%'
}

/**
 * Format distance in km
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}

/**
 * Format date
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

/**
 * Format GPS coordinates
 */
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

/**
 * Get risk grade color class
 */
export function getRiskGradeClass(grade: string): string {
  const classes: Record<string, string> = {
    A: 'badge-risk-a',
    B: 'badge-risk-b',
    C: 'badge-risk-c',
    D: 'badge-risk-d',
    E: 'badge-risk-e',
    F: 'badge-risk-f',
  }
  return classes[grade] || 'badge-risk-c'
}

/**
 * Get asset type display name
 */
export function getAssetTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    Apartment: 'Apartment',
    Villa: 'Villa',
    Land: 'Empty Land',
  }
  return labels[type] || type
}

/**
 * Get zoning code description
 */
export function getZoningLabel(code: string): string {
  const labels: Record<string, string> = {
    SD1: 'SD1 - Villa Zone',
    GH2: 'GH2 - Apartment Zone',
    SA1: 'SA1 - Tourism/Mixed',
    S1: 'S1 - Tourism',
    ZI: 'ZI - Industrial',
    ZA: 'ZA - Agricultural',
  }
  return labels[code] || code
}
