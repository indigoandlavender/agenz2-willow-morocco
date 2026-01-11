/**
 * TIFORT-CORE Valuation Algorithm
 * Forensic Fair Market Value Calculator
 */

import type {
  Property,
  ZoningCodeInfo,
  ValuationResult,
  ValuationAdjustment,
  RiskGrade,
  InfrastructurePoint,
} from '@/types'

// Zoning CES/COS coefficients for potential calculation
const ZONING_MULTIPLIERS: Record<string, { cos: number; ces: number; max_units: number }> = {
  SD1: { cos: 0.07, ces: 0.05, max_units: 1 },
  GH2: { cos: 0.40, ces: 0.35, max_units: 15 },
  SA1: { cos: 0.60, ces: 0.50, max_units: 25 },
  S1: { cos: 0.50, ces: 0.40, max_units: 20 },
  ZI: { cos: 0.70, ces: 0.60, max_units: 1 },
  ZA: { cos: 0.02, ces: 0.01, max_units: 1 },
}

// Infrastructure impact weights
const INFRASTRUCTURE_WEIGHTS = {
  tgv_station: 0.30,
  stadium: 0.25,
  highway: 0.15,
  airport: 0.20,
  industrial_zone: 0.10,
}

// Base price per m2 by neighborhood tier (MAD)
const NEIGHBORHOOD_TIERS: Record<string, number> = {
  hivernage: 25000,
  gueliz: 22000,
  mellah: 18000,
  palmeraie: 30000,
  medina: 15000,
  targa: 12000,
  default: 10000,
}

/**
 * Main valuation function
 * Calculates forensic fair market value with all adjustments
 */
export function calculateFairMarketValue(
  property: Property,
  zoningInfo?: ZoningCodeInfo,
  infrastructurePoints?: InfrastructurePoint[]
): ValuationResult {
  const adjustments: ValuationAdjustment[] = []

  // Start with market price or estimate
  let baseValue = property.market_price || estimateBaseValue(property)
  let forensicValue = baseValue

  // ============================================
  // 1. SEISMIC PENALTY (RPS 2011/2026)
  // ============================================
  const seismicAdjustment = calculateSeismicPenalty(property)
  if (seismicAdjustment.impact_percent !== 0) {
    adjustments.push(seismicAdjustment)
    forensicValue += seismicAdjustment.impact_value
  }

  // ============================================
  // 2. STRUCTURAL HEALTH ADJUSTMENTS
  // ============================================
  const structuralAdjustments = calculateStructuralAdjustments(property)
  structuralAdjustments.forEach(adj => {
    adjustments.push(adj)
    forensicValue += adj.impact_value
  })

  // ============================================
  // 3. COMPLIANCE PENALTIES
  // ============================================
  const complianceAdjustments = calculateComplianceAdjustments(property)
  complianceAdjustments.forEach(adj => {
    adjustments.push(adj)
    forensicValue += adj.impact_value
  })

  // ============================================
  // 4. INFRASTRUCTURE PROXIMITY BONUS
  // ============================================
  if (infrastructurePoints && infrastructurePoints.length > 0) {
    const infraAdjustment = calculateInfrastructureBonus(property, infrastructurePoints)
    if (infraAdjustment.impact_percent !== 0) {
      adjustments.push(infraAdjustment)
      forensicValue += infraAdjustment.impact_value
    }
  }

  // ============================================
  // 5. ZONING POTENTIAL VALUE (Alpha Finder)
  // ============================================
  let zoningPotentialValue: number | undefined
  let alphaValue = 0
  let alphaPercent = 0

  if (property.asset_type === 'Land' && property.zoning_code && property.terrain_size_m2) {
    zoningPotentialValue = calculateZoningPotential(property, zoningInfo)
    alphaValue = zoningPotentialValue - (property.market_price || forensicValue)
    alphaPercent = ((alphaValue / (property.market_price || forensicValue)) * 100)
  }

  // ============================================
  // 6. RESILIENCE SCORE (Apartments - 2030 Events)
  // ============================================
  let resilienceScore: number | undefined
  if (property.asset_type === 'Apartment') {
    resilienceScore = calculateResilienceScore(property, infrastructurePoints)
  }

  // ============================================
  // 7. RISK GRADE CALCULATION
  // ============================================
  const riskGrade = calculateRiskGrade(property, adjustments)

  // ============================================
  // 8. CONFIDENCE SCORE
  // ============================================
  const confidenceScore = calculateConfidenceScore(property)

  return {
    base_value: baseValue,
    forensic_value: Math.max(forensicValue, 0),
    adjustments,
    zoning_potential_value: zoningPotentialValue,
    alpha_value: alphaValue,
    alpha_percent: Math.round(alphaPercent * 100) / 100,
    risk_grade: riskGrade,
    confidence_score: confidenceScore,
    resilience_score: resilienceScore,
  }
}

/**
 * Estimate base value when no market price available
 */
function estimateBaseValue(property: Property): number {
  const neighborhood = property.neighborhood?.toLowerCase() || 'default'
  const pricePerM2 = NEIGHBORHOOD_TIERS[neighborhood] || NEIGHBORHOOD_TIERS.default

  const size = property.built_size_m2 || property.terrain_size_m2 || 100
  return size * pricePerM2
}

/**
 * SEISMIC PENALTY
 * Buildings pre-2023 without seismic chaining lose 15% value
 */
function calculateSeismicPenalty(property: Property): ValuationAdjustment {
  const baseValue = property.market_price || 0

  // Only applies to buildings (not land)
  if (property.asset_type === 'Land') {
    return {
      factor: 'seismic_compliance',
      description: 'N/A for land',
      impact_percent: 0,
      impact_value: 0,
    }
  }

  const yearBuilt = property.year_built
  const hasSeismicChaining = property.structural_health_score?.seismic_chaining

  // Pre-2023 building without seismic chaining
  if (yearBuilt && yearBuilt < 2023 && hasSeismicChaining !== true) {
    const penalty = -0.15 // 15% penalty
    return {
      factor: 'seismic_compliance',
      description: `Pre-2023 building without RPS 2011/2026 seismic chaining (-15%)`,
      impact_percent: penalty * 100,
      impact_value: baseValue * penalty,
    }
  }

  // RPS 2026 compliant gets a small bonus
  if (property.structural_health_score?.rps_2026_compliant) {
    return {
      factor: 'seismic_compliance',
      description: 'RPS 2026 compliant (+3%)',
      impact_percent: 3,
      impact_value: baseValue * 0.03,
    }
  }

  return {
    factor: 'seismic_compliance',
    description: 'Standard compliance',
    impact_percent: 0,
    impact_value: 0,
  }
}

/**
 * STRUCTURAL HEALTH ADJUSTMENTS
 * Based on humidity, foundation, roof life
 */
function calculateStructuralAdjustments(property: Property): ValuationAdjustment[] {
  const adjustments: ValuationAdjustment[] = []
  const baseValue = property.market_price || 0
  const shs = property.structural_health_score

  if (!shs || property.asset_type === 'Land') {
    return adjustments
  }

  // Humidity penalty (0-10 scale, >7 is problematic)
  if (shs.humidity_score !== null && shs.humidity_score > 7) {
    const penalty = -0.08 // 8% penalty for high humidity
    adjustments.push({
      factor: 'humidity',
      description: `High humidity score (${shs.humidity_score}/10) - moisture damage risk`,
      impact_percent: penalty * 100,
      impact_value: baseValue * penalty,
    })
  }

  // Roof life penalty
  if (shs.roof_life_years !== null && shs.roof_life_years < 5) {
    const penalty = -0.05 // 5% for roof needing replacement soon
    adjustments.push({
      factor: 'roof_condition',
      description: `Roof replacement needed within ${shs.roof_life_years} years`,
      impact_percent: penalty * 100,
      impact_value: baseValue * penalty,
    })
  }

  // Foundation depth (important for seismic zones)
  if (shs.foundation_depth_m !== null && shs.foundation_depth_m < 1.5) {
    const penalty = -0.06
    adjustments.push({
      factor: 'foundation',
      description: `Shallow foundation (${shs.foundation_depth_m}m) - seismic risk`,
      impact_percent: penalty * 100,
      impact_value: baseValue * penalty,
    })
  }

  return adjustments
}

/**
 * COMPLIANCE ADJUSTMENTS
 * Bill 34.21, VNA, Tax Gate
 */
function calculateComplianceAdjustments(property: Property): ValuationAdjustment[] {
  const adjustments: ValuationAdjustment[] = []
  const baseValue = property.market_price || 0

  // Bill 34.21 Flag (5-year deadline exceeded)
  if (property.bill_34_21_flagged) {
    adjustments.push({
      factor: 'bill_34_21',
      description: 'Bill 34.21: 5-year infrastructure deadline exceeded - legal risk',
      impact_percent: -20,
      impact_value: baseValue * -0.20,
    })
  }

  // Tax Gate (missing QR-verified Quitus Fiscal)
  if (!property.tax_gate_passed) {
    adjustments.push({
      factor: 'tax_gate',
      description: 'Missing digital QR-Verified Quitus Fiscal - high transaction risk',
      impact_percent: -10,
      impact_value: baseValue * -0.10,
    })
  }

  // VNA Required (foreign acquisition delays)
  if (property.vna_required) {
    // VNA adds ~12 months delay and 200k MAD cost
    const vnaCost = 200000
    adjustments.push({
      factor: 'vna_requirement',
      description: 'VNA required: 12-month delay + 200,000 MAD budget for rural acquisition',
      impact_percent: -5,
      impact_value: -(vnaCost + (baseValue * 0.02)), // Cost + time value
    })
  }

  return adjustments
}

/**
 * INFRASTRUCTURE PROXIMITY BONUS
 * 2030 World Cup / CAN 2025 / TGV impact
 */
function calculateInfrastructureBonus(
  property: Property,
  infrastructurePoints: InfrastructurePoint[]
): ValuationAdjustment {
  const baseValue = property.market_price || 0
  let totalBonus = 0
  const bonusDetails: string[] = []

  infrastructurePoints.forEach(point => {
    const distance = calculateDistance(
      property.gps_latitude,
      property.gps_longitude,
      point.gps_latitude,
      point.gps_longitude
    )

    // Within impact radius
    if (point.impact_radius_km && distance <= point.impact_radius_km) {
      const weight = INFRASTRUCTURE_WEIGHTS[point.category] || 0.10
      const distanceFactor = 1 - (distance / point.impact_radius_km) // Closer = better
      const multiplier = (point.value_multiplier || 1.1) - 1
      const bonus = multiplier * distanceFactor * weight

      totalBonus += bonus
      bonusDetails.push(`${point.name}: ${(bonus * 100).toFixed(1)}%`)
    }
  })

  return {
    factor: 'infrastructure_proximity',
    description: bonusDetails.length > 0
      ? `2030 Infrastructure Premium: ${bonusDetails.join(', ')}`
      : 'No significant infrastructure proximity',
    impact_percent: Math.round(totalBonus * 100 * 100) / 100,
    impact_value: baseValue * totalBonus,
  }
}

/**
 * ZONING POTENTIAL VALUE
 * Calculate what land COULD be worth based on CES/COS
 */
function calculateZoningPotential(
  property: Property,
  zoningInfo?: ZoningCodeInfo
): number {
  if (!property.terrain_size_m2 || !property.zoning_code) {
    return property.market_price || 0
  }

  const zoning = ZONING_MULTIPLIERS[property.zoning_code]
  if (!zoning) {
    return property.market_price || 0
  }

  // Calculate maximum buildable area
  const maxBuildableArea = property.terrain_size_m2 * zoning.cos
  const maxUnits = Math.min(
    zoning.max_units,
    Math.floor(maxBuildableArea / 80) // Assuming 80m2 average unit
  )

  // Get neighborhood price per m2
  const neighborhood = property.neighborhood?.toLowerCase() || 'default'
  const pricePerM2 = NEIGHBORHOOD_TIERS[neighborhood] || NEIGHBORHOOD_TIERS.default

  // Potential value = buildable area × price per m2
  // Discount for development costs (~30%)
  const developmentDiscount = 0.70
  const potentialValue = maxBuildableArea * pricePerM2 * developmentDiscount

  return Math.round(potentialValue)
}

/**
 * RESILIENCE SCORE
 * For apartments: CAN 2025 / World Cup 2030 booking potential
 */
function calculateResilienceScore(
  property: Property,
  infrastructurePoints?: InfrastructurePoint[]
): number {
  let score = 50 // Base score

  // Location near stadium = high group-booking potential
  if (property.distance_grand_stade && property.distance_grand_stade < 5) {
    score += 25
  } else if (property.distance_grand_stade && property.distance_grand_stade < 10) {
    score += 15
  }

  // TGV connectivity
  if (property.distance_tgv_station && property.distance_tgv_station < 3) {
    score += 15
  }

  // Airport proximity
  if (property.distance_airport && property.distance_airport < 8) {
    score += 10
  }

  // Penalize luxury-riad displacement areas (Medina)
  if (property.neighborhood?.toLowerCase() === 'medina') {
    score -= 10 // Riad competition
  }

  // Bonus for multi-unit zoning (can do short-term rentals)
  if (property.zoning_code === 'GH2' || property.zoning_code === 'SA1') {
    score += 10
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * RISK GRADE CALCULATION
 */
function calculateRiskGrade(
  property: Property,
  adjustments: ValuationAdjustment[]
): RiskGrade {
  let riskScore = 0

  // Base risk from compliance
  if (property.bill_34_21_flagged) riskScore += 30
  if (!property.tax_gate_passed) riskScore += 20
  if (property.vna_required) riskScore += 10

  // Risk from structural issues
  const negativeAdjustments = adjustments.filter(a => a.impact_percent < 0)
  const totalNegativeImpact = negativeAdjustments.reduce((sum, a) => sum + Math.abs(a.impact_percent), 0)
  riskScore += totalNegativeImpact

  // Verification reduces risk
  if (property.is_verified) riskScore -= 15

  // Map to grade
  if (riskScore <= 10) return 'A'
  if (riskScore <= 20) return 'B'
  if (riskScore <= 35) return 'C'
  if (riskScore <= 50) return 'D'
  if (riskScore <= 70) return 'E'
  return 'F'
}

/**
 * CONFIDENCE SCORE
 * How confident are we in our valuation?
 */
function calculateConfidenceScore(property: Property): number {
  let score = 40 // Base score

  // Has market price to compare
  if (property.market_price) score += 15

  // Has structural data
  if (property.structural_health_score?.overall_score !== null) score += 15

  // Is verified
  if (property.is_verified) score += 20

  // Has complete location data
  if (property.distance_tgv_station !== undefined) score += 5
  if (property.distance_grand_stade !== undefined) score += 5

  return Math.min(100, score)
}

/**
 * Helper: Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * ALPHA FINDER
 * Identify properties where market_price < zoning_potential
 */
export function findAlphaOpportunities(
  properties: Property[],
  minAlphaPercent: number = 20
): Array<Property & { alpha_value: number; alpha_percent: number }> {
  return properties
    .filter(p => p.asset_type === 'Land' && p.zoning_code && p.market_price)
    .map(p => {
      const potentialValue = calculateZoningPotential(p)
      const alphaValue = potentialValue - (p.market_price || 0)
      const alphaPercent = ((alphaValue / (p.market_price || 1)) * 100)
      return { ...p, alpha_value: alphaValue, alpha_percent: alphaPercent }
    })
    .filter(p => p.alpha_percent >= minAlphaPercent)
    .sort((a, b) => b.alpha_percent - a.alpha_percent)
}

/**
 * MARKET GAP CALCULATOR
 * Compare our forensic prices vs market averages
 */
export function calculateMarketGap(
  forensicPrice: number,
  marketPrice: number
): { gap_value: number; gap_percent: number; verdict: 'overpriced' | 'underpriced' | 'fair' } {
  const gapValue = marketPrice - forensicPrice
  const gapPercent = (gapValue / forensicPrice) * 100

  let verdict: 'overpriced' | 'underpriced' | 'fair'
  if (gapPercent > 10) verdict = 'overpriced'
  else if (gapPercent < -10) verdict = 'underpriced'
  else verdict = 'fair'

  return {
    gap_value: Math.round(gapValue),
    gap_percent: Math.round(gapPercent * 100) / 100,
    verdict,
  }
}
