/**
 * TIFORT-CORE Google Sheets Connector
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

// ============================================
// TYPES
// ============================================

export interface Property {
  id: string
  created_at: string
  title: string
  asset_type: 'Apartment' | 'Villa' | 'Land' | 'Melkia'
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
  alpha_gap: number // (zoning_potential - market_price) / market_price * 100
  alpha_value: number // zoning_potential - market_price
  risk_grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  shs_score: number // 1-10
  heir_count: number
  legal_notes: string
  is_verified: boolean
  compliance_status: 'clean' | 'risky' | 'blocked'
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
      range: 'Properties!A2:Z',
    })

    const rows = response.data.values || []
    const properties: Property[] = rows
      .filter(row => row[0]) // Has ID
      .map(row => {
        const marketPrice = parseFloat(row[10]) || 0
        const forensicPrice = parseFloat(row[11]) || 0
        const zoningPotential = parseFloat(row[14]) || 0
        const builtM2 = parseFloat(row[9]) || parseFloat(row[8]) || 1

        return {
          id: row[0],
          created_at: row[1],
          title: row[2] || 'Untitled',
          asset_type: row[3] || 'Land',
          address: row[4] || '',
          neighborhood: row[5] || '',
          gps_lat: parseFloat(row[6]) || 0,
          gps_lng: parseFloat(row[7]) || 0,
          terrain_m2: parseFloat(row[8]) || 0,
          built_m2: parseFloat(row[9]) || 0,
          market_price: marketPrice,
          forensic_price: forensicPrice,
          price_per_m2: Math.round(marketPrice / builtM2),
          zoning_code: row[13] || '',
          zoning_potential: zoningPotential,
          alpha_gap: marketPrice > 0 ? Math.round((zoningPotential - marketPrice) / marketPrice * 100) : 0,
          alpha_value: zoningPotential - marketPrice,
          risk_grade: row[15] || 'C',
          shs_score: parseInt(row[16]) || 5,
          heir_count: parseInt(row[17]) || 0,
          legal_notes: row[18] || '',
          is_verified: row[19]?.toLowerCase() === 'true',
          compliance_status: row[20] || 'risky',
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
  const riskyCount = properties.filter(p => p.compliance_status === 'risky' || p.heir_count > 1).length

  return {
    total_properties: properties.length,
    total_alpha_value: totalAlpha,
    avg_alpha_gap: Math.round(avgAlphaGap),
    risky_properties: riskyCount,
    by_type: {
      Land: properties.filter(p => p.asset_type === 'Land').length,
      Melkia: properties.filter(p => p.asset_type === 'Melkia').length,
      Villa: properties.filter(p => p.asset_type === 'Villa').length,
      Apartment: properties.filter(p => p.asset_type === 'Apartment').length,
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
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const now = new Date().toISOString()

  // Calculate initial values
  const pricePerM2 = audit.built_m2 > 0
    ? Math.round(audit.asking_price / audit.built_m2)
    : Math.round(audit.asking_price / audit.terrain_m2)

  // Determine risk grade based on SHS and heir count
  let riskGrade = 'C'
  if (audit.shs_score >= 8 && audit.heir_count <= 1) riskGrade = 'A'
  else if (audit.shs_score >= 6 && audit.heir_count <= 2) riskGrade = 'B'
  else if (audit.shs_score >= 4) riskGrade = 'C'
  else if (audit.shs_score >= 2) riskGrade = 'D'
  else riskGrade = 'E'

  if (audit.heir_count > 3) riskGrade = 'F'

  // Compliance status
  let compliance = 'clean'
  if (audit.heir_count > 1 || audit.shs_score < 5) compliance = 'risky'
  if (audit.heir_count > 4 || audit.shs_score < 3) compliance = 'blocked'

  const row = [
    id,
    now,
    `${audit.asset_type} - ${audit.neighborhood}`, // title
    audit.asset_type,
    audit.address,
    audit.neighborhood,
    audit.gps_lat,
    audit.gps_lng,
    audit.terrain_m2,
    audit.built_m2,
    audit.asking_price,
    '', // forensic_price (to be calculated)
    pricePerM2,
    '', // zoning_code
    '', // zoning_potential
    riskGrade,
    audit.shs_score,
    audit.heir_count,
    audit.legal_notes,
    'FALSE', // is_verified
    compliance,
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: 'Properties!A:U',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  })

  // Invalidate cache
  invalidateCache('properties')

  return id
}

export async function updateProperty(id: string, updates: Partial<Property>): Promise<boolean> {
  const sheets = await getSheets()
  const spreadsheetId = getSpreadsheetId()

  // Find row number
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Properties!A:A',
  })

  const rows = response.data.values || []
  const rowIndex = rows.findIndex(row => row[0] === id)

  if (rowIndex === -1) return false

  const rowNumber = rowIndex + 1 // 1-indexed

  // Update specific cells based on what's provided
  const updateRequests: { range: string; values: unknown[][] }[] = []

  if (updates.forensic_price !== undefined) {
    updateRequests.push({
      range: `Properties!L${rowNumber}`,
      values: [[updates.forensic_price]],
    })
  }

  if (updates.zoning_code !== undefined) {
    updateRequests.push({
      range: `Properties!N${rowNumber}`,
      values: [[updates.zoning_code]],
    })
  }

  if (updates.zoning_potential !== undefined) {
    updateRequests.push({
      range: `Properties!O${rowNumber}`,
      values: [[updates.zoning_potential]],
    })
  }

  if (updates.is_verified !== undefined) {
    updateRequests.push({
      range: `Properties!T${rowNumber}`,
      values: [[updates.is_verified ? 'TRUE' : 'FALSE']],
    })
  }

  for (const req of updateRequests) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: req.range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: req.values },
    })
  }

  invalidateCache('properties')
  return true
}

// ============================================
// SHEET INITIALIZATION
// ============================================

export async function initializeSheet(): Promise<void> {
  const sheets = await getSheets()
  const spreadsheetId = getSpreadsheetId()

  // Check if Properties sheet exists and has headers
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Properties!A1:U1',
    })

    if (!response.data.values || response.data.values.length === 0) {
      // Add headers
      const headers = [
        'id', 'created_at', 'title', 'asset_type', 'address', 'neighborhood',
        'gps_lat', 'gps_lng', 'terrain_m2', 'built_m2', 'market_price',
        'forensic_price', 'price_per_m2', 'zoning_code', 'zoning_potential',
        'risk_grade', 'shs_score', 'heir_count', 'legal_notes', 'is_verified',
        'compliance_status'
      ]

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Properties!A1:U1',
        valueInputOption: 'RAW',
        requestBody: { values: [headers] },
      })
    }
  } catch (error) {
    console.error('Failed to initialize sheet:', error)
    throw error
  }
}
