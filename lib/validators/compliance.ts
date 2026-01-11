/**
 * TIFORT-CORE Legal Compliance Validation Layer
 * Enforcing 2026 Moroccan Real Estate Regulations
 */

import type {
  Property,
  ComplianceAudit,
  Bill3421Check,
  VNACheck,
  TaxGateCheck,
  SeismicCheck,
  ComplianceStatus,
  ForensicDocument,
} from '@/types'

export interface ComplianceResult {
  overall_status: ComplianceStatus
  bill_34_21: Bill3421Check
  vna: VNACheck
  tax_gate: TaxGateCheck
  seismic: SeismicCheck
  flags: ComplianceFlag[]
  recommendations: string[]
}

export interface ComplianceFlag {
  code: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  impact_percent?: number
}

// ============================================
// BILL 34.21 ENFORCEMENT
// Unbuilt land 5-year infrastructure deadline
// ============================================

export function validateBill3421(
  property: Property,
  purchaseDate?: Date | string
): Bill3421Check {
  const check: Bill3421Check = {
    applicable: false,
    purchase_date: undefined,
    deadline_date: undefined,
    construction_started: false,
    is_flagged: false,
  }

  // Only applies to Land assets
  if (property.asset_type !== 'Land') {
    return check
  }

  check.applicable = true

  if (purchaseDate) {
    const purchase = new Date(purchaseDate)
    check.purchase_date = purchase.toISOString()

    // Calculate 5-year deadline
    const deadline = new Date(purchase)
    deadline.setFullYear(deadline.getFullYear() + 5)
    check.deadline_date = deadline.toISOString()

    // Check if deadline exceeded
    const now = new Date()
    if (now > deadline) {
      check.is_flagged = true
    }
  }

  return check
}

// ============================================
// VNA VALIDATION
// Foreign acquisition authorization
// ============================================

export interface VNAValidationParams {
  buyerNationality: string
  propertyIsRural: boolean
  propertyZoning?: string
}

const VNA_EXEMPT_NATIONALITIES = ['MA'] // Moroccan citizens exempt

export function validateVNA(params: VNAValidationParams): VNACheck {
  const check: VNACheck = {
    required: false,
    buyer_nationality: params.buyerNationality,
    property_is_rural: params.propertyIsRural,
    estimated_delay_months: 12,
    estimated_cost_mad: 200000,
  }

  // Moroccan nationals don't need VNA
  if (VNA_EXEMPT_NATIONALITIES.includes(params.buyerNationality)) {
    return check
  }

  // VNA required for foreign buyers of rural land
  if (params.propertyIsRural) {
    check.required = true
  }

  // Agricultural zone always requires VNA for foreigners
  if (params.propertyZoning === 'ZA') {
    check.required = true
    check.estimated_delay_months = 18 // Longer for agricultural
    check.estimated_cost_mad = 250000
  }

  return check
}

// ============================================
// TAX GATE VALIDATION
// QR-Verified Quitus Fiscal requirement
// ============================================

export function validateTaxGate(
  documents: ForensicDocument[]
): TaxGateCheck {
  const quitusFiscal = documents.find(d => d.document_type === 'quitus_fiscal')

  const check: TaxGateCheck = {
    quitus_fiscal_present: !!quitusFiscal,
    qr_verified: quitusFiscal?.qr_code_verified || false,
    is_high_risk: true, // Default to high risk
  }

  // Not high risk if QR verified
  if (check.quitus_fiscal_present && check.qr_verified) {
    check.is_high_risk = false
  }

  return check
}

// ============================================
// SEISMIC COMPLIANCE (RPS 2011/2026)
// ============================================

export function validateSeismic(property: Property): SeismicCheck {
  const yearBuilt = property.year_built
  const shs = property.structural_health_score

  const check: SeismicCheck = {
    year_built: yearBuilt,
    pre_2023: yearBuilt ? yearBuilt < 2023 : false,
    seismic_chaining_present: shs?.seismic_chaining ?? undefined,
    rps_2011_compliant: shs?.rps_2011_compliant || false,
    rps_2026_compliant: shs?.rps_2026_compliant || false,
    value_penalty_percent: 0,
  }

  // Land doesn't have seismic requirements
  if (property.asset_type === 'Land') {
    return check
  }

  // Calculate penalty
  if (check.pre_2023 && check.seismic_chaining_present === false) {
    check.value_penalty_percent = 15
  } else if (check.pre_2023 && check.seismic_chaining_present === null) {
    // Unknown status - partial penalty
    check.value_penalty_percent = 8
  }

  return check
}

// ============================================
// FULL COMPLIANCE AUDIT
// ============================================

export function performComplianceAudit(
  property: Property,
  documents: ForensicDocument[],
  params?: {
    purchaseDate?: Date | string
    buyerNationality?: string
  }
): ComplianceResult {
  const flags: ComplianceFlag[] = []
  const recommendations: string[] = []

  // Bill 34.21
  const bill3421 = validateBill3421(property, params?.purchaseDate)
  if (bill3421.is_flagged) {
    flags.push({
      code: 'BILL_34_21_EXCEEDED',
      severity: 'critical',
      title: 'Bill 34.21 Deadline Exceeded',
      description: 'The 5-year infrastructure deadline for this land has passed. Legal action may be pending.',
      impact_percent: -20,
    })
    recommendations.push('Consult legal counsel about Bill 34.21 implications before proceeding.')
  }

  // VNA
  const vna = validateVNA({
    buyerNationality: params?.buyerNationality || 'UNKNOWN',
    propertyIsRural: property.zoning_code === 'ZA',
    propertyZoning: property.zoning_code,
  })
  if (vna.required) {
    flags.push({
      code: 'VNA_REQUIRED',
      severity: 'warning',
      title: 'VNA Authorization Required',
      description: `Foreign acquisition requires VNA. Expected delay: ${vna.estimated_delay_months} months.`,
      impact_percent: -5,
    })
    recommendations.push(`Budget ${vna.estimated_cost_mad.toLocaleString()} MAD for VNA process.`)
    recommendations.push('Allow 12-18 months for authorization timeline.')
  }

  // Tax Gate
  const taxGate = validateTaxGate(documents)
  if (taxGate.is_high_risk) {
    if (!taxGate.quitus_fiscal_present) {
      flags.push({
        code: 'TAX_GATE_NO_QUITUS',
        severity: 'critical',
        title: 'Missing Quitus Fiscal',
        description: 'No tax clearance certificate present. Transaction cannot proceed safely.',
        impact_percent: -10,
      })
      recommendations.push('Request Quitus Fiscal from seller before any deposit.')
    } else if (!taxGate.qr_verified) {
      flags.push({
        code: 'TAX_GATE_NO_QR',
        severity: 'warning',
        title: 'Unverified Quitus Fiscal',
        description: 'Quitus Fiscal present but digital QR verification failed or not performed.',
        impact_percent: -5,
      })
      recommendations.push('Verify Quitus Fiscal QR code with tax authority portal.')
    }
  }

  // Seismic
  const seismic = validateSeismic(property)
  if (seismic.value_penalty_percent > 0) {
    const severity = seismic.value_penalty_percent >= 15 ? 'critical' : 'warning'
    flags.push({
      code: 'SEISMIC_NON_COMPLIANT',
      severity,
      title: 'Seismic Compliance Issue',
      description: `Pre-2023 building without proper seismic chaining. Value penalty: ${seismic.value_penalty_percent}%`,
      impact_percent: -seismic.value_penalty_percent,
    })
    recommendations.push('Commission structural engineer report for seismic retrofit costs.')
  }

  // Determine overall status
  let overallStatus: ComplianceStatus = 'compliant'

  const criticalFlags = flags.filter(f => f.severity === 'critical')
  const warningFlags = flags.filter(f => f.severity === 'warning')

  if (criticalFlags.length > 0) {
    overallStatus = 'non_compliant'
  } else if (warningFlags.length > 0) {
    overallStatus = 'pending_review'
  }

  // Check for expired documents
  const expiredDocs = documents.filter(d => {
    if (!d.expiry_date) return false
    return new Date(d.expiry_date) < new Date()
  })

  if (expiredDocs.length > 0) {
    overallStatus = 'expired'
    flags.push({
      code: 'DOCUMENTS_EXPIRED',
      severity: 'critical',
      title: 'Expired Documents',
      description: `${expiredDocs.length} document(s) have expired and need renewal.`,
    })
  }

  return {
    overall_status: overallStatus,
    bill_34_21: bill3421,
    vna,
    tax_gate: taxGate,
    seismic,
    flags,
    recommendations,
  }
}

// ============================================
// ZONING VALIDATION
// Marrakech 2026 Urban Plan
// ============================================

interface ZoningLimits {
  min_terrain_m2: number
  cos: number
  ces: number
  max_floors: number
}

const ZONING_LIMITS: Record<string, ZoningLimits> = {
  SD1: { min_terrain_m2: 1000, cos: 0.07, ces: 0.05, max_floors: 2 },
  GH2: { min_terrain_m2: 250, cos: 0.40, ces: 0.35, max_floors: 5 },
  SA1: { min_terrain_m2: 500, cos: 0.60, ces: 0.50, max_floors: 7 },
  S1: { min_terrain_m2: 1000, cos: 0.50, ces: 0.40, max_floors: 5 },
  ZI: { min_terrain_m2: 2000, cos: 0.70, ces: 0.60, max_floors: 3 },
  ZA: { min_terrain_m2: 10000, cos: 0.02, ces: 0.01, max_floors: 1 },
}

export interface ZoningValidationResult {
  is_compliant: boolean
  violations: string[]
  max_buildable_m2: number
  max_footprint_m2: number
  development_potential: {
    max_units: number
    estimated_value: number
  }
}

export function validateZoning(
  property: Property,
  proposedFloors?: number,
  proposedBuiltArea?: number
): ZoningValidationResult {
  const result: ZoningValidationResult = {
    is_compliant: true,
    violations: [],
    max_buildable_m2: 0,
    max_footprint_m2: 0,
    development_potential: {
      max_units: 0,
      estimated_value: 0,
    },
  }

  if (!property.zoning_code || !property.terrain_size_m2) {
    return result
  }

  const limits = ZONING_LIMITS[property.zoning_code]
  if (!limits) {
    return result
  }

  // Check minimum terrain size
  if (property.terrain_size_m2 < limits.min_terrain_m2) {
    result.is_compliant = false
    result.violations.push(
      `Terrain size (${property.terrain_size_m2}m²) below minimum (${limits.min_terrain_m2}m²) for ${property.zoning_code}`
    )
  }

  // Calculate maximums
  result.max_buildable_m2 = property.terrain_size_m2 * limits.cos
  result.max_footprint_m2 = property.terrain_size_m2 * limits.ces

  // Check proposed floors
  if (proposedFloors && proposedFloors > limits.max_floors) {
    result.is_compliant = false
    result.violations.push(
      `Proposed floors (${proposedFloors}) exceed maximum (${limits.max_floors}) for ${property.zoning_code}`
    )
  }

  // Check proposed built area
  if (proposedBuiltArea && proposedBuiltArea > result.max_buildable_m2) {
    result.is_compliant = false
    result.violations.push(
      `Proposed built area (${proposedBuiltArea}m²) exceeds maximum (${result.max_buildable_m2.toFixed(0)}m²) for ${property.zoning_code}`
    )
  }

  // Calculate development potential
  const avgUnitSize = 80 // m2
  result.development_potential.max_units = Math.floor(result.max_buildable_m2 / avgUnitSize)

  // Estimated value based on neighborhood
  const avgPricePerM2 = 15000 // MAD - conservative estimate
  result.development_potential.estimated_value = result.max_buildable_m2 * avgPricePerM2 * 0.7 // 30% dev discount

  return result
}

// ============================================
// DOCUMENT COMPLETENESS CHECK
// ============================================

const REQUIRED_DOCUMENTS = [
  'certificat_propriete',
  'note_renseignement',
  'quitus_fiscal',
  'plan_cadastral',
]

const CONDITIONAL_DOCUMENTS = {
  certificat_conformite: (p: Property) => p.asset_type !== 'Land',
  vna: (p: Property) => p.vna_required,
  tnb_tax: (p: Property) => p.asset_type === 'Land',
}

export interface DocumentCompletenessResult {
  is_complete: boolean
  present: string[]
  missing: string[]
  optional_missing: string[]
  completeness_percent: number
}

export function checkDocumentCompleteness(
  property: Property,
  documents: ForensicDocument[]
): DocumentCompletenessResult {
  const presentTypes = documents.map(d => d.document_type)

  const missing = REQUIRED_DOCUMENTS.filter(type => !presentTypes.includes(type as any))

  const optionalMissing: string[] = []
  Object.entries(CONDITIONAL_DOCUMENTS).forEach(([type, condition]) => {
    if (condition(property) && !presentTypes.includes(type as any)) {
      optionalMissing.push(type)
    }
  })

  const totalRequired = REQUIRED_DOCUMENTS.length + optionalMissing.length
  const totalPresent = presentTypes.filter(t =>
    REQUIRED_DOCUMENTS.includes(t) || Object.keys(CONDITIONAL_DOCUMENTS).includes(t)
  ).length

  return {
    is_complete: missing.length === 0 && optionalMissing.length === 0,
    present: presentTypes,
    missing,
    optional_missing: optionalMissing,
    completeness_percent: Math.round((totalPresent / totalRequired) * 100),
  }
}
