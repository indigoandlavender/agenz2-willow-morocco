/**
 * TIFORT-CORE Google Sheets Client
 * Handles authentication and base operations
 */

import { google, sheets_v4 } from 'googleapis'
import { JWT } from 'google-auth-library'

// Sheet names (tabs in the spreadsheet)
export const SHEETS = {
  PROPERTIES: 'Properties',
  ZONING_CODES: 'ZoningCodes',
  DOCUMENTS: 'Documents',
  INFRASTRUCTURE: 'Infrastructure',
  MARKET_LISTINGS: 'MarketListings',
  COMPLIANCE_AUDITS: 'ComplianceAudits',
} as const

// Column mappings for each sheet
export const COLUMNS = {
  PROPERTIES: {
    id: 'A',
    created_at: 'B',
    updated_at: 'C',
    title: 'D',
    description: 'E',
    asset_type: 'F',
    address: 'G',
    city: 'H',
    neighborhood: 'I',
    gps_latitude: 'J',
    gps_longitude: 'K',
    terrain_size_m2: 'L',
    built_size_m2: 'M',
    floors: 'N',
    rooms: 'O',
    bathrooms: 'P',
    year_built: 'Q',
    market_price: 'R',
    forensic_price: 'S',
    price_per_m2: 'T',
    zoning_code: 'U',
    zoning_potential_value: 'V',
    risk_grade: 'W',
    structural_health_score: 'X', // JSON string
    cap_rate: 'Y',
    gross_yield: 'Z',
    net_yield: 'AA',
    resilience_score: 'AB',
    alpha_score: 'AC',
    distance_tgv_station: 'AD',
    distance_grand_stade: 'AE',
    distance_new_highway: 'AF',
    distance_airport: 'AG',
    infrastructure_proximity_score: 'AH',
    compliance_status: 'AI',
    bill_34_21_flagged: 'AJ',
    vna_required: 'AK',
    tax_gate_passed: 'AL',
    source_url: 'AM',
    source_portal: 'AN',
    is_verified: 'AO',
    verified_at: 'AP',
    audit_notes: 'AQ',
  },
  ZONING_CODES: {
    id: 'A',
    code: 'B',
    name: 'C',
    description: 'D',
    min_terrain_m2: 'E',
    cos: 'F',
    ces: 'G',
    max_height_m: 'H',
    max_floors: 'I',
    multi_unit_allowed: 'J',
    max_units_per_hectare: 'K',
    commercial_allowed: 'L',
    hotel_allowed: 'M',
    notes: 'N',
  },
  INFRASTRUCTURE: {
    id: 'A',
    name: 'B',
    category: 'C',
    description: 'D',
    gps_latitude: 'E',
    gps_longitude: 'F',
    completion_year: 'G',
    is_operational: 'H',
    impact_radius_km: 'I',
    value_multiplier: 'J',
  },
}

let sheetsClient: sheets_v4.Sheets | null = null

/**
 * Get authenticated Google Sheets client
 */
export async function getSheetsClient(): Promise<sheets_v4.Sheets> {
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

/**
 * Get spreadsheet ID from environment
 */
export function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SPREADSHEET_ID
  if (!id) {
    throw new Error('GOOGLE_SPREADSHEET_ID environment variable is required')
  }
  return id
}

/**
 * Read all rows from a sheet
 */
export async function readSheet(sheetName: string): Promise<string[][]> {
  const sheets = await getSheetsClient()
  const spreadsheetId = getSpreadsheetId()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:ZZ`,
  })

  return response.data.values || []
}

/**
 * Read a specific range from a sheet
 */
export async function readRange(range: string): Promise<string[][]> {
  const sheets = await getSheetsClient()
  const spreadsheetId = getSpreadsheetId()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  })

  return response.data.values || []
}

/**
 * Append rows to a sheet
 */
export async function appendRows(
  sheetName: string,
  rows: (string | number | boolean | null)[][]
): Promise<void> {
  const sheets = await getSheetsClient()
  const spreadsheetId = getSpreadsheetId()

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:ZZ`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: rows.map(row => row.map(cell => cell?.toString() ?? '')),
    },
  })
}

/**
 * Update a specific row by row number
 */
export async function updateRow(
  sheetName: string,
  rowNumber: number,
  values: (string | number | boolean | null)[]
): Promise<void> {
  const sheets = await getSheetsClient()
  const spreadsheetId = getSpreadsheetId()

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A${rowNumber}:ZZ${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values.map(cell => cell?.toString() ?? '')],
    },
  })
}

/**
 * Update a specific cell
 */
export async function updateCell(
  sheetName: string,
  column: string,
  rowNumber: number,
  value: string | number | boolean | null
): Promise<void> {
  const sheets = await getSheetsClient()
  const spreadsheetId = getSpreadsheetId()

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!${column}${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[value?.toString() ?? '']],
    },
  })
}

/**
 * Clear a row (for deletion - we keep the row but clear values)
 */
export async function clearRow(
  sheetName: string,
  rowNumber: number
): Promise<void> {
  const sheets = await getSheetsClient()
  const spreadsheetId = getSpreadsheetId()

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${sheetName}!A${rowNumber}:ZZ${rowNumber}`,
  })
}

/**
 * Find row number by ID (column A)
 */
export async function findRowById(
  sheetName: string,
  id: string
): Promise<number | null> {
  const data = await readSheet(sheetName)

  for (let i = 1; i < data.length; i++) { // Skip header row
    if (data[i][0] === id) {
      return i + 1 // 1-indexed for Sheets API
    }
  }

  return null
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Parse boolean from sheet value
 */
export function parseBoolean(value: string | undefined): boolean {
  if (!value) return false
  return value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes'
}

/**
 * Parse number from sheet value
 */
export function parseNumber(value: string | undefined): number | undefined {
  if (!value || value === '') return undefined
  const num = parseFloat(value)
  return isNaN(num) ? undefined : num
}

/**
 * Parse JSON from sheet value
 */
export function parseJSON<T>(value: string | undefined): T | null {
  if (!value || value === '') return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}
