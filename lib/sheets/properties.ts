/**
 * TIFORT-CORE Properties Sheet Service
 * CRUD operations for the Properties sheet
 */

import {
  SHEETS,
  COLUMNS,
  readSheet,
  appendRows,
  updateRow,
  findRowById,
  generateId,
  parseBoolean,
  parseNumber,
  parseJSON,
} from './client'
import type { Property, StructuralHealthScore, AssetType, RiskGrade, ZoningCode, ComplianceStatus } from '@/types'

/**
 * Convert a sheet row to a Property object
 */
function rowToProperty(row: string[], index: number): Property {
  return {
    id: row[0] || generateId(),
    created_at: row[1] || new Date().toISOString(),
    updated_at: row[2] || new Date().toISOString(),
    title: row[3] || '',
    description: row[4],
    asset_type: (row[5] as AssetType) || 'Apartment',
    address: row[6] || '',
    city: row[7] || 'Marrakech',
    neighborhood: row[8],
    gps_latitude: parseNumber(row[9]) || 0,
    gps_longitude: parseNumber(row[10]) || 0,
    terrain_size_m2: parseNumber(row[11]),
    built_size_m2: parseNumber(row[12]),
    floors: parseNumber(row[13]),
    rooms: parseNumber(row[14]),
    bathrooms: parseNumber(row[15]),
    year_built: parseNumber(row[16]),
    market_price: parseNumber(row[17]),
    forensic_price: parseNumber(row[18]),
    price_per_m2: parseNumber(row[19]),
    zoning_code: row[20] as ZoningCode | undefined,
    zoning_potential_value: parseNumber(row[21]),
    risk_grade: (row[22] as RiskGrade) || 'C',
    structural_health_score: parseJSON<StructuralHealthScore>(row[23]) || {
      seismic_chaining: null,
      rps_2011_compliant: false,
      rps_2026_compliant: false,
      humidity_score: null,
      foundation_depth_m: null,
      roof_life_years: null,
      overall_score: null,
    },
    cap_rate: parseNumber(row[24]),
    gross_yield: parseNumber(row[25]),
    net_yield: parseNumber(row[26]),
    resilience_score: parseNumber(row[27]),
    alpha_score: parseNumber(row[28]),
    distance_tgv_station: parseNumber(row[29]),
    distance_grand_stade: parseNumber(row[30]),
    distance_new_highway: parseNumber(row[31]),
    distance_airport: parseNumber(row[32]),
    infrastructure_proximity_score: parseNumber(row[33]),
    compliance_status: (row[34] as ComplianceStatus) || 'pending_review',
    bill_34_21_flagged: parseBoolean(row[35]),
    vna_required: parseBoolean(row[36]),
    tax_gate_passed: parseBoolean(row[37]),
    source_url: row[38],
    source_portal: row[39],
    is_verified: parseBoolean(row[40]),
    verified_at: row[41],
    audit_notes: row[42] ? row[42].split('||') : undefined,
  }
}

/**
 * Convert a Property object to a sheet row
 */
function propertyToRow(property: Partial<Property>): (string | number | boolean | null)[] {
  return [
    property.id || generateId(),
    property.created_at || new Date().toISOString(),
    new Date().toISOString(), // updated_at
    property.title || '',
    property.description || '',
    property.asset_type || 'Apartment',
    property.address || '',
    property.city || 'Marrakech',
    property.neighborhood || '',
    property.gps_latitude || 0,
    property.gps_longitude || 0,
    property.terrain_size_m2 || '',
    property.built_size_m2 || '',
    property.floors || '',
    property.rooms || '',
    property.bathrooms || '',
    property.year_built || '',
    property.market_price || '',
    property.forensic_price || '',
    property.price_per_m2 || '',
    property.zoning_code || '',
    property.zoning_potential_value || '',
    property.risk_grade || 'C',
    property.structural_health_score ? JSON.stringify(property.structural_health_score) : '',
    property.cap_rate || '',
    property.gross_yield || '',
    property.net_yield || '',
    property.resilience_score || '',
    property.alpha_score || '',
    property.distance_tgv_station || '',
    property.distance_grand_stade || '',
    property.distance_new_highway || '',
    property.distance_airport || '',
    property.infrastructure_proximity_score || '',
    property.compliance_status || 'pending_review',
    property.bill_34_21_flagged ? 'TRUE' : 'FALSE',
    property.vna_required ? 'TRUE' : 'FALSE',
    property.tax_gate_passed ? 'TRUE' : 'FALSE',
    property.source_url || '',
    property.source_portal || '',
    property.is_verified ? 'TRUE' : 'FALSE',
    property.verified_at || '',
    property.audit_notes?.join('||') || '',
  ]
}

/**
 * Get all properties
 */
export async function getAllProperties(): Promise<Property[]> {
  const data = await readSheet(SHEETS.PROPERTIES)

  // Skip header row (row 0)
  return data.slice(1)
    .filter(row => row[0]) // Filter out empty rows
    .map((row, index) => rowToProperty(row, index + 1))
}

/**
 * Get a property by ID
 */
export async function getPropertyById(id: string): Promise<Property | null> {
  const data = await readSheet(SHEETS.PROPERTIES)

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      return rowToProperty(data[i], i)
    }
  }

  return null
}

/**
 * Create a new property
 */
export async function createProperty(property: Partial<Property>): Promise<Property> {
  const id = generateId()
  const now = new Date().toISOString()

  const newProperty: Partial<Property> = {
    ...property,
    id,
    created_at: now,
    updated_at: now,
  }

  const row = propertyToRow(newProperty)
  await appendRows(SHEETS.PROPERTIES, [row])

  return {
    ...newProperty,
    id,
    created_at: now,
    updated_at: now,
  } as Property
}

/**
 * Update a property
 */
export async function updateProperty(
  id: string,
  updates: Partial<Property>
): Promise<Property | null> {
  const rowNumber = await findRowById(SHEETS.PROPERTIES, id)
  if (!rowNumber) return null

  const existing = await getPropertyById(id)
  if (!existing) return null

  const updated: Property = {
    ...existing,
    ...updates,
    id, // Ensure ID doesn't change
    updated_at: new Date().toISOString(),
  }

  const row = propertyToRow(updated)
  await updateRow(SHEETS.PROPERTIES, rowNumber, row)

  return updated
}

/**
 * Search properties with filters
 */
export async function searchProperties(filters: {
  asset_types?: AssetType[]
  risk_grades?: RiskGrade[]
  zoning_codes?: ZoningCode[]
  min_price?: number
  max_price?: number
  only_verified?: boolean
  only_alpha?: boolean
  city?: string
  neighborhood?: string
}): Promise<Property[]> {
  const all = await getAllProperties()

  return all.filter(p => {
    if (filters.asset_types?.length && !filters.asset_types.includes(p.asset_type)) {
      return false
    }

    if (filters.risk_grades?.length && !filters.risk_grades.includes(p.risk_grade)) {
      return false
    }

    if (filters.zoning_codes?.length && p.zoning_code && !filters.zoning_codes.includes(p.zoning_code)) {
      return false
    }

    if (filters.min_price && (p.market_price || 0) < filters.min_price) {
      return false
    }

    if (filters.max_price && (p.market_price || 0) > filters.max_price) {
      return false
    }

    if (filters.only_verified && !p.is_verified) {
      return false
    }

    if (filters.only_alpha) {
      const hasAlpha = p.zoning_potential_value && p.market_price && p.zoning_potential_value > p.market_price
      if (!hasAlpha) return false
    }

    if (filters.city && p.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false
    }

    if (filters.neighborhood && p.neighborhood?.toLowerCase() !== filters.neighborhood.toLowerCase()) {
      return false
    }

    return true
  })
}

/**
 * Get properties with alpha opportunities
 */
export async function getAlphaOpportunities(minAlphaPercent: number = 20): Promise<Property[]> {
  const all = await getAllProperties()

  return all
    .filter(p => {
      if (!p.zoning_potential_value || !p.market_price) return false
      const alphaPercent = ((p.zoning_potential_value - p.market_price) / p.market_price) * 100
      return alphaPercent >= minAlphaPercent
    })
    .sort((a, b) => {
      const alphaA = ((a.zoning_potential_value! - a.market_price!) / a.market_price!) * 100
      const alphaB = ((b.zoning_potential_value! - b.market_price!) / b.market_price!) * 100
      return alphaB - alphaA
    })
}

/**
 * Get dashboard stats
 */
export async function getDashboardStats() {
  const properties = await getAllProperties()

  const total = properties.length
  const verified = properties.filter(p => p.is_verified).length

  const totalAlpha = properties.reduce((sum, p) => {
    if (p.zoning_potential_value && p.market_price) {
      return sum + Math.max(0, p.zoning_potential_value - p.market_price)
    }
    return sum
  }, 0)

  const capRates = properties.filter(p => p.cap_rate).map(p => p.cap_rate!)
  const avgCapRate = capRates.length > 0
    ? capRates.reduce((a, b) => a + b, 0) / capRates.length
    : 0

  const riskDistribution = properties.reduce((acc, p) => {
    acc[p.risk_grade] = (acc[p.risk_grade] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const typeDistribution = properties.reduce((acc, p) => {
    acc[p.asset_type] = (acc[p.asset_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total_properties: total,
    verified_properties: verified,
    total_alpha_value: totalAlpha,
    average_cap_rate: avgCapRate,
    properties_by_risk: riskDistribution,
    properties_by_type: typeDistribution,
  }
}
