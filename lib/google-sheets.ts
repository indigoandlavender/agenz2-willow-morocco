/**
 * WILLOW 2.0 Google Sheets Connector
 * Wili-Style with 60-second caching
 */

import { google, sheets_v4 } from 'googleapis'
import { JWT } from 'google-auth-library'

// ============================================
// CACHE LAYER (60-second TTL)
// ============================================

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<unknown>>()
const CACHE_TTL = 60 * 1000 // 60 seconds

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }

  return entry.data
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export function invalidateCache(key?: string): void {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

// ============================================
// SHEETS CLIENT
// ============================================

let sheetsClient: sheets_v4.Sheets | null = null

async function getSheets(): Promise<sheets_v4.Sheets> {
  if (sheetsClient) return sheetsClient

  const credentials = JSON.parse(
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'
  )

  const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  sheetsClient = google.sheets({ version: 'v4', auth })
  return sheetsClient
}

function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SPREADSHEET_ID
  if (!id) throw new Error('GOOGLE_SPREADSHEET_ID required')
  return id
}

// Sheet tab name - matches your "Data Morocco" tab
const SHEET_TAB = 'Data Morocco'

// ============================================
// TYPES (matching your sheet structure)
// ============================================

export interface Property {
  id: string
  created_at: string
  title: string
  asset_type: 'Riad' | 'Villa' | 'Land' | 'Melkia' | 'Titre Foncier' | string
  address: string
  neighborhood: string
  gps_lat: number
  gps_lng: number
  terrain_m2: number
  built_m2: number
  market_price: number
  forensic_price: number
  price_per_m2: number
  zoning_code: string
  zoning_potential: number
  alpha_gap: number
  alpha_value: number
  risk_grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  shs_score: number
  heir_count: number
  legal_notes: string
  is_verified: boolean
  compliance_status: 'clean' | 'risky' | 'blocked'
  // Additional fields from your sheet
  legal_status: string
  structural_health: number
  days_on_market: number
  suites: number
  render_url: string
}

export interface AuditSubmission {
  asset_type: string
  address: string
  neighborhood: string
  gps_lat: number
  gps_lng: number
  terrain_m2: number
  built_m2: number
  asking_price: number
  shs_score: number
  heir_count: number
  legal_notes: string
}

// ============================================
// READ OPERATIONS (Cached)
// ============================================

export async function getProperties(): Promise<Property[]> {
  const cacheKey = 'properties'
  const cached = getCached<Property[]>(cacheKey)
  if (cached) return cached

  try {
    const sheets = await getSheets()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: getSpreadsheetId(),
      range: `'${SHEET_TAB}'!A2:L`,
    })

    const rows = response.data.values || []
    const properties: Property[] = rows
      .filter(row => row[0]) // Has Property_Name
      .map((row, index) => {
        // Your columns:
        // A: Property_Name, B: Address, C: Neighborhood, D: Price_MAD
        // E: Size_Sqm, F: Price_Per_Sqm, G: Legal_Status, H: Structural_Health
        // I: Days_On_Market, J: Suites, K: Render_URL, L: Notes

        const propertyName = row[0] || 'Untitled'
        const address = row[1] || ''
        const neighborhood = row[2] || ''
        const priceMad = parseFloat(row[3]) || 0
        const sizeSqm = parseFloat(row[4]) || 1
        const pricePerSqm = parseFloat(row[5]) || 0
        const legalStatus = row[6] || ''
        const structuralHealth = parseFloat(row[7]) || 50
        const daysOnMarket = parseFloat(row[8]) || 0
        const suites = parseFloat(row[9]) || 0
        const renderUrl = row[10] || ''
        const notes = row[11] || ''

        // Determine asset type from legal status or name
        let assetType = legalStatus || 'Land'
        if (propertyName.toLowerCase().includes('riad')) assetType = 'Riad'
        else if (propertyName.toLowerCase().includes('villa')) assetType = 'Villa'
        else if (propertyName.toLowerCase().includes('dar')) assetType = 'Riad'

        // Calculate alpha (potential upside based on structural health and location)
        // Higher structural health = lower renovation cost = higher alpha
        const structuralFactor = structuralHealth / 100
        const estimatedPotential = priceMad * (1 + (1 - structuralFactor) * 0.5 + 0.2)
        const alphaValue = Math.round(estimatedPotential - priceMad)
        const alphaGap = priceMad > 0 ? Math.round((alphaValue / priceMad) * 100) : 0

        // Risk grade based on structural health and days on market
        let riskGrade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'C'
        if (structuralHealth >= 90 && daysOnMarket < 30) riskGrade = 'A'
        else if (structuralHealth >= 80 && daysOnMarket < 60) riskGrade = 'B'
        else if (structuralHealth >= 70) riskGrade = 'C'
        else if (structuralHealth >= 50) riskGrade = 'D'
        else if (structuralHealth >= 30) riskGrade = 'E'
        else riskGrade = 'F'

        // Compliance based on legal status
        let compliance: 'clean' | 'risky' | 'blocked' = 'risky'
        if (legalStatus === 'Titre Foncier') compliance = 'clean'
        else if (legalStatus === 'Melkia') compliance = 'risky'

        return {
          id: `prop-${index + 1}`,
          created_at: new Date().toISOString(),
          title: propertyName,
          asset_type: assetType,
          address,
          neighborhood,
          gps_lat: 31.63 + (Math.random() * 0.1 - 0.05), // Marrakech area
          gps_lng: -8.0 + (Math.random() * 0.1 - 0.05),
          terrain_m2: sizeSqm,
          built_m2: sizeSqm,
          market_price: priceMad,
          forensic_price: Math.round(priceMad * 0.9),
          price_per_m2: pricePerSqm,
          zoning_code: '',
          zoning_potential: Math.round(estimatedPotential),
          alpha_gap: alphaGap,
          alpha_value: alphaValue,
          risk_grade: riskGrade,
          shs_score: Math.round(structuralHealth / 10),
          heir_count: 0,
          legal_notes: notes,
          is_verified: legalStatus === 'Titre Foncier',
          compliance_status: compliance,
          // Additional fields
          legal_status: legalStatus,
          structural_health: structuralHealth,
          days_on_market: daysOnMarket,
          suites,
          render_url: renderUrl,
        }
      })

    setCache(cacheKey, properties)
    return properties
  } catch (error) {
    console.error('Failed to fetch properties:', error)
    return []
  }
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const properties = await getProperties()
  return properties.find(p => p.id === id) || null
}

export async function getAlphaOpportunities(): Promise<Property[]> {
  const properties = await getProperties()
  return properties
    .filter(p => p.alpha_gap > 15) // 15%+ alpha
    .sort((a, b) => b.alpha_gap - a.alpha_gap)
}

export async function getStats() {
  const properties = await getProperties()

  const totalAlpha = properties.reduce((sum, p) => sum + Math.max(0, p.alpha_value), 0)
  const avgAlphaGap = properties.length > 0
    ? properties.reduce((sum, p) => sum + p.alpha_gap, 0) / properties.length
    : 0
  const riskyCount = properties.filter(p => p.compliance_status === 'risky').length

  return {
    total_properties: properties.length,
    total_alpha_value: totalAlpha,
    avg_alpha_gap: Math.round(avgAlphaGap),
    risky_properties: riskyCount,
    by_type: {
      Riad: properties.filter(p => p.asset_type === 'Riad' || p.title.toLowerCase().includes('riad')).length,
      Villa: properties.filter(p => p.asset_type === 'Villa').length,
      Land: properties.filter(p => p.asset_type === 'Land').length,
      Other: properties.filter(p => !['Riad', 'Villa', 'Land'].includes(p.asset_type)).length,
    },
    by_risk: {
      A: properties.filter(p => p.risk_grade === 'A').length,
      B: properties.filter(p => p.risk_grade === 'B').length,
      C: properties.filter(p => p.risk_grade === 'C').length,
      D: properties.filter(p => p.risk_grade === 'D').length,
      E: properties.filter(p => p.risk_grade === 'E').length,
      F: properties.filter(p => p.risk_grade === 'F').length,
    },
  }
}

// ============================================
// WRITE OPERATIONS
// ============================================

export async function appendAudit(audit: AuditSubmission): Promise<string> {
  const sheets = await getSheets()
  const pricePerM2 = audit.built_m2 > 0
    ? Math.round(audit.asking_price / audit.built_m2)
    : Math.round(audit.asking_price / audit.terrain_m2)

  // Map to your sheet columns:
  // A: Property_Name, B: Address, C: Neighborhood, D: Price_MAD
  // E: Size_Sqm, F: Price_Per_Sqm, G: Legal_Status, H: Structural_Health
  // I: Days_On_Market, J: Suites, K: Render_URL, L: Notes

  const row = [
    `${audit.asset_type} - ${audit.neighborhood}`, // Property_Name
    audit.address,                                   // Address
    audit.neighborhood,                              // Neighborhood
    audit.asking_price,                              // Price_MAD
    audit.terrain_m2 || audit.built_m2,             // Size_Sqm
    pricePerM2,                                      // Price_Per_Sqm
    audit.asset_type,                                // Legal_Status
    audit.shs_score * 10,                           // Structural_Health (convert 1-10 to 10-100)
    0,                                               // Days_On_Market
    0,                                               // Suites
    '',                                              // Render_URL
    audit.legal_notes,                               // Notes
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: `'${SHEET_TAB}'!A:L`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  })

  // Invalidate cache
  invalidateCache('properties')

  return `audit-${Date.now()}`
}
