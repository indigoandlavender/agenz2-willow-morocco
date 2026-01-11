/**
 * TIFORT-CORE Market Data Ingestion Engine
 * Scraper logic for Agenz, Mubawab, and Sarouty
 *
 * NOTE: This module provides the logic structure for market data collection.
 * Actual scraping should be done server-side (API routes or cron jobs)
 * with proper rate limiting and respect for robots.txt.
 */

import type { AssetType, MarketListing } from '@/types'

// ============================================
// TYPES
// ============================================

export interface ScrapedListing {
  source_portal: 'agenz' | 'mubawab' | 'sarouty'
  source_url: string
  source_listing_id?: string
  title?: string
  asset_type?: AssetType
  city?: string
  neighborhood?: string
  asking_price?: number
  terrain_size_m2?: number
  built_size_m2?: number
  rooms?: number
  bathrooms?: number
  description?: string
  images?: string[]
  contact_phone?: string
  gps_latitude?: number
  gps_longitude?: number
  raw_html?: string
  scraped_at: string
}

export interface ScraperConfig {
  portal: 'agenz' | 'mubawab' | 'sarouty'
  baseUrl: string
  searchPath: string
  selectors: {
    listingCard: string
    title: string
    price: string
    size: string
    location: string
    link: string
  }
  rateLimit: {
    requestsPerMinute: number
    delayBetweenRequests: number
  }
}

// ============================================
// PORTAL CONFIGURATIONS
// ============================================

export const PORTAL_CONFIGS: Record<string, ScraperConfig> = {
  agenz: {
    portal: 'agenz',
    baseUrl: 'https://www.agenz.ma',
    searchPath: '/immobilier/marrakech',
    selectors: {
      listingCard: '.listing-card',
      title: '.listing-title',
      price: '.listing-price',
      size: '.listing-size',
      location: '.listing-location',
      link: 'a.listing-link',
    },
    rateLimit: {
      requestsPerMinute: 10,
      delayBetweenRequests: 6000,
    },
  },
  mubawab: {
    portal: 'mubawab',
    baseUrl: 'https://www.mubawab.ma',
    searchPath: '/fr/st/marrakech',
    selectors: {
      listingCard: '.listingBox',
      title: '.listingTit',
      price: '.priceTag',
      size: '.listingDetails li:first-child',
      location: '.listingH3',
      link: 'a.linkListing',
    },
    rateLimit: {
      requestsPerMinute: 8,
      delayBetweenRequests: 7500,
    },
  },
  sarouty: {
    portal: 'sarouty',
    baseUrl: 'https://www.sarouty.ma',
    searchPath: '/fr/marrakech/immobilier',
    selectors: {
      listingCard: '.property-card',
      title: '.property-title',
      price: '.property-price',
      size: '.property-area',
      location: '.property-address',
      link: 'a.property-link',
    },
    rateLimit: {
      requestsPerMinute: 10,
      delayBetweenRequests: 6000,
    },
  },
}

// ============================================
// PRICE PARSING
// ============================================

/**
 * Parse Moroccan price strings to numbers
 * Handles: "2,500,000 DH", "2.5M MAD", "2 500 000", etc.
 */
export function parsePrice(priceString: string): number | null {
  if (!priceString) return null

  // Clean the string
  let cleaned = priceString
    .replace(/[^\d.,MK]/gi, '')
    .replace(/\s/g, '')
    .trim()

  // Handle millions shorthand
  if (/M/i.test(priceString)) {
    const num = parseFloat(cleaned.replace(/[MK]/gi, ''))
    return num * 1000000
  }

  // Handle thousands shorthand
  if (/K/i.test(priceString)) {
    const num = parseFloat(cleaned.replace(/[MK]/gi, ''))
    return num * 1000
  }

  // Handle comma as thousands separator (Moroccan format)
  cleaned = cleaned.replace(/,/g, '')

  // Handle period as thousands separator (alternative format)
  if (cleaned.includes('.') && cleaned.split('.')[1]?.length === 3) {
    cleaned = cleaned.replace(/\./g, '')
  }

  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

/**
 * Parse area strings to square meters
 * Handles: "250 m²", "250m2", "250 m2", etc.
 */
export function parseArea(areaString: string): number | null {
  if (!areaString) return null

  const match = areaString.match(/[\d.,]+/)
  if (!match) return null

  const cleaned = match[0].replace(',', '.')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

// ============================================
// ASSET TYPE DETECTION
// ============================================

/**
 * Detect asset type from listing title/description
 */
export function detectAssetType(text: string): AssetType | undefined {
  const normalized = text.toLowerCase()

  // Apartment indicators
  if (
    /appartement|apartment|appart|studio|duplex|triplex|flat/i.test(normalized)
  ) {
    return 'Apartment'
  }

  // Villa indicators
  if (
    /villa|maison|house|riad|dar|palais|mansion/i.test(normalized)
  ) {
    return 'Villa'
  }

  // Land indicators
  if (
    /terrain|land|lot|parcelle|foncier|plot/i.test(normalized)
  ) {
    return 'Land'
  }

  return undefined
}

// ============================================
// NEIGHBORHOOD EXTRACTION
// ============================================

const MARRAKECH_NEIGHBORHOODS = [
  'hivernage',
  'gueliz',
  'medina',
  'palmeraie',
  'targa',
  'mellah',
  'agdal',
  'semlalia',
  'massira',
  'daoudiate',
  'amerchich',
  'route de fes',
  'route de casablanca',
  'route de ouarzazate',
]

/**
 * Extract neighborhood from location string
 */
export function extractNeighborhood(location: string): string | undefined {
  const normalized = location.toLowerCase()

  for (const neighborhood of MARRAKECH_NEIGHBORHOODS) {
    if (normalized.includes(neighborhood)) {
      return neighborhood.charAt(0).toUpperCase() + neighborhood.slice(1)
    }
  }

  return undefined
}

// ============================================
// MARKET BASELINE CALCULATOR
// ============================================

export interface MarketBaseline {
  asset_type: AssetType
  neighborhood?: string
  avg_price: number
  avg_price_per_m2: number
  min_price: number
  max_price: number
  sample_size: number
  calculated_at: string
}

/**
 * Calculate market baseline from scraped listings
 */
export function calculateMarketBaseline(
  listings: ScrapedListing[],
  filters?: {
    asset_type?: AssetType
    neighborhood?: string
  }
): MarketBaseline | null {
  let filtered = listings.filter(l => l.asking_price && l.asking_price > 0)

  if (filters?.asset_type) {
    filtered = filtered.filter(l => l.asset_type === filters.asset_type)
  }

  if (filters?.neighborhood) {
    filtered = filtered.filter(l =>
      l.neighborhood?.toLowerCase() === filters.neighborhood?.toLowerCase()
    )
  }

  if (filtered.length === 0) {
    return null
  }

  const prices = filtered.map(l => l.asking_price!)
  const pricesPerM2 = filtered
    .filter(l => l.built_size_m2 || l.terrain_size_m2)
    .map(l => l.asking_price! / (l.built_size_m2 || l.terrain_size_m2!))

  return {
    asset_type: filters?.asset_type || 'Apartment',
    neighborhood: filters?.neighborhood,
    avg_price: prices.reduce((a, b) => a + b, 0) / prices.length,
    avg_price_per_m2: pricesPerM2.length > 0
      ? pricesPerM2.reduce((a, b) => a + b, 0) / pricesPerM2.length
      : 0,
    min_price: Math.min(...prices),
    max_price: Math.max(...prices),
    sample_size: filtered.length,
    calculated_at: new Date().toISOString(),
  }
}

// ============================================
// GAP ANALYSIS
// ============================================

export interface GapAnalysis {
  listing: ScrapedListing
  forensic_price: number
  gap_value: number
  gap_percent: number
  verdict: 'severely_overpriced' | 'overpriced' | 'fair' | 'underpriced' | 'severely_underpriced'
  opportunity_score: number // 0-100
}

/**
 * Analyze the gap between market asking price and forensic valuation
 */
export function analyzeGap(
  listing: ScrapedListing,
  forensicPrice: number
): GapAnalysis {
  const askingPrice = listing.asking_price || 0
  const gapValue = askingPrice - forensicPrice
  const gapPercent = (gapValue / forensicPrice) * 100

  let verdict: GapAnalysis['verdict']
  let opportunityScore: number

  if (gapPercent > 30) {
    verdict = 'severely_overpriced'
    opportunityScore = 10
  } else if (gapPercent > 10) {
    verdict = 'overpriced'
    opportunityScore = 30
  } else if (gapPercent >= -10) {
    verdict = 'fair'
    opportunityScore = 50
  } else if (gapPercent >= -25) {
    verdict = 'underpriced'
    opportunityScore = 75
  } else {
    verdict = 'severely_underpriced'
    opportunityScore = 95
  }

  return {
    listing,
    forensic_price: forensicPrice,
    gap_value: gapValue,
    gap_percent: Math.round(gapPercent * 100) / 100,
    verdict,
    opportunity_score: opportunityScore,
  }
}

// ============================================
// BATCH PROCESSING
// ============================================

export interface BatchResult {
  total_scraped: number
  total_processed: number
  total_errors: number
  opportunities_found: number
  baselines: MarketBaseline[]
  top_opportunities: GapAnalysis[]
  processed_at: string
}

/**
 * Process a batch of scraped listings
 */
export async function processBatch(
  listings: ScrapedListing[],
  getForensicPrice: (listing: ScrapedListing) => Promise<number>
): Promise<BatchResult> {
  const gaps: GapAnalysis[] = []
  let errors = 0

  for (const listing of listings) {
    try {
      const forensicPrice = await getForensicPrice(listing)
      const gap = analyzeGap(listing, forensicPrice)
      gaps.push(gap)
    } catch {
      errors++
    }
  }

  // Calculate baselines by asset type
  const baselines: MarketBaseline[] = []
  for (const assetType of ['Apartment', 'Villa', 'Land'] as AssetType[]) {
    const baseline = calculateMarketBaseline(listings, { asset_type: assetType })
    if (baseline) {
      baselines.push(baseline)
    }
  }

  // Find top opportunities (underpriced properties)
  const opportunities = gaps
    .filter(g => g.opportunity_score >= 70)
    .sort((a, b) => b.opportunity_score - a.opportunity_score)
    .slice(0, 20)

  return {
    total_scraped: listings.length,
    total_processed: gaps.length,
    total_errors: errors,
    opportunities_found: opportunities.length,
    baselines,
    top_opportunities: opportunities,
    processed_at: new Date().toISOString(),
  }
}

// ============================================
// DEDUPLICATION
// ============================================

/**
 * Deduplicate listings based on URL and similarity
 */
export function deduplicateListings(listings: ScrapedListing[]): ScrapedListing[] {
  const seen = new Map<string, ScrapedListing>()

  for (const listing of listings) {
    // First, dedupe by exact URL
    const urlKey = listing.source_url
    if (seen.has(urlKey)) continue

    // Then, check for similar listings (same price, size, location)
    const similarityKey = `${listing.asking_price}-${listing.terrain_size_m2 || listing.built_size_m2}-${listing.neighborhood}`

    // Keep the most recent scrape
    const existing = seen.get(similarityKey)
    if (!existing || new Date(listing.scraped_at) > new Date(existing.scraped_at)) {
      seen.set(urlKey, listing)
      seen.set(similarityKey, listing)
    }
  }

  // Return unique by URL
  const uniqueUrls = new Set<string>()
  return Array.from(seen.values()).filter(l => {
    if (uniqueUrls.has(l.source_url)) return false
    uniqueUrls.add(l.source_url)
    return true
  })
}

// ============================================
// EXPORT FOR API ROUTES
// ============================================

export const scraperUtils = {
  parsePrice,
  parseArea,
  detectAssetType,
  extractNeighborhood,
  calculateMarketBaseline,
  analyzeGap,
  processBatch,
  deduplicateListings,
  PORTAL_CONFIGS,
}
