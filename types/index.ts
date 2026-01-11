// TIFORT-CORE Type Definitions

export type AssetType = 'Apartment' | 'Villa' | 'Land'
export type RiskGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
export type ZoningCode = 'SD1' | 'GH2' | 'SA1' | 'S1' | 'ZI' | 'ZA'
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'pending_review' | 'expired'
export type DocumentType =
  | 'certificat_propriete'
  | 'note_renseignement'
  | 'quitus_fiscal'
  | 'plan_cadastral'
  | 'certificat_conformite'
  | 'vna'
  | 'tnb_tax'

// Structural Health Score
export interface StructuralHealthScore {
  seismic_chaining: boolean | null
  rps_2011_compliant: boolean
  rps_2026_compliant: boolean
  humidity_score: number | null // 0-10
  foundation_depth_m: number | null
  roof_life_years: number | null
  overall_score: number | null // 0-100
}

// Property Core
export interface Property {
  id: string
  created_at: string
  updated_at: string

  // Basic Info
  title: string
  description?: string
  asset_type: AssetType
  address: string
  city: string
  neighborhood?: string

  // Geolocation
  gps_latitude: number
  gps_longitude: number

  // Land Metrics
  terrain_size_m2?: number
  built_size_m2?: number
  floors?: number
  rooms?: number
  bathrooms?: number
  year_built?: number

  // Pricing
  market_price?: number
  forensic_price?: number
  price_per_m2?: number

  // Zoning
  zoning_code?: ZoningCode
  zoning_potential_value?: number

  // Scores
  risk_grade: RiskGrade
  structural_health_score: StructuralHealthScore

  // Investment Metrics
  cap_rate?: number
  gross_yield?: number
  net_yield?: number
  resilience_score?: number
  alpha_score?: number

  // Infrastructure Proximity (km)
  distance_tgv_station?: number
  distance_grand_stade?: number
  distance_new_highway?: number
  distance_airport?: number
  infrastructure_proximity_score?: number

  // Compliance Flags
  compliance_status: ComplianceStatus
  bill_34_21_flagged: boolean
  vna_required: boolean
  tax_gate_passed: boolean

  // Metadata
  source_url?: string
  source_portal?: string
  is_verified: boolean
  verified_at?: string
  verified_by?: string

  audit_notes?: string[]
}

// Zoning Code Details
export interface ZoningCodeInfo {
  id: string
  code: ZoningCode
  name: string
  description?: string
  min_terrain_m2: number
  cos: number // Ground Coverage
  ces: number // Building Footprint
  max_height_m?: number
  max_floors?: number
  multi_unit_allowed: boolean
  max_units_per_hectare?: number
  commercial_allowed: boolean
  hotel_allowed: boolean
  typical_price_per_m2_min?: number
  typical_price_per_m2_max?: number
  notes?: string
}

// Forensic Document
export interface ForensicDocument {
  id: string
  property_id: string
  document_type: DocumentType
  file_path: string
  file_name: string
  file_size_bytes?: number
  mime_type?: string
  is_verified: boolean
  verified_at?: string
  verified_by?: string
  qr_code_verified: boolean
  document_date?: string
  expiry_date?: string
  reference_number?: string
  issuing_authority?: string
  extracted_data?: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Market Listing (scraped)
export interface MarketListing {
  id: string
  created_at: string
  scraped_at: string
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
  price_per_m2?: number
  gps_latitude?: number
  gps_longitude?: number
  raw_data?: Record<string, unknown>
  matched_property_id?: string
  price_gap_percent?: number
}

// Infrastructure Point
export interface InfrastructurePoint {
  id: string
  name: string
  category: 'tgv_station' | 'stadium' | 'highway' | 'airport' | 'industrial_zone'
  description?: string
  gps_latitude: number
  gps_longitude: number
  completion_year?: number
  is_operational: boolean
  impact_radius_km?: number
  value_multiplier?: number
  created_at: string
}

// Compliance Audit
export interface ComplianceAudit {
  id: string
  property_id: string
  audited_at: string
  audited_by?: string
  bill_34_21_check: Bill3421Check
  vna_check: VNACheck
  tax_gate_check: TaxGateCheck
  seismic_check: SeismicCheck
  overall_status: ComplianceStatus
  notes?: string
}

export interface Bill3421Check {
  applicable: boolean
  purchase_date?: string
  deadline_date?: string
  construction_started: boolean
  is_flagged: boolean
}

export interface VNACheck {
  required: boolean
  buyer_nationality?: string
  property_is_rural: boolean
  estimated_delay_months: number
  estimated_cost_mad: number
}

export interface TaxGateCheck {
  quitus_fiscal_present: boolean
  qr_verified: boolean
  is_high_risk: boolean
}

export interface SeismicCheck {
  year_built?: number
  pre_2023: boolean
  seismic_chaining_present?: boolean
  rps_2011_compliant: boolean
  rps_2026_compliant: boolean
  value_penalty_percent: number
}

// User Profile
export interface UserProfile {
  id: string
  created_at: string
  updated_at: string
  full_name?: string
  company?: string
  role: 'investor' | 'agent' | 'auditor' | 'admin'
  phone?: string
  preferred_asset_types?: AssetType[]
  preferred_cities?: string[]
  min_budget?: number
  max_budget?: number
  properties_viewed?: string[]
  saved_properties?: string[]
  is_verified_investor: boolean
}

// Valuation Result
export interface ValuationResult {
  base_value: number
  forensic_value: number
  adjustments: ValuationAdjustment[]
  zoning_potential_value?: number
  alpha_value: number
  alpha_percent: number
  risk_grade: RiskGrade
  confidence_score: number
  resilience_score?: number
}

export interface ValuationAdjustment {
  factor: string
  description: string
  impact_percent: number
  impact_value: number
}

// Search Filters
export interface PropertyFilters {
  asset_types?: AssetType[]
  min_price?: number
  max_price?: number
  min_size?: number
  max_size?: number
  zoning_codes?: ZoningCode[]
  risk_grades?: RiskGrade[]
  min_cap_rate?: number
  max_distance_tgv?: number
  max_distance_stadium?: number
  only_verified?: boolean
  only_alpha_opportunities?: boolean
  city?: string
  neighborhoods?: string[]
}

// Dashboard Stats
export interface DashboardStats {
  total_properties: number
  verified_properties: number
  total_alpha_value: number
  average_cap_rate: number
  properties_by_risk: Record<RiskGrade, number>
  properties_by_type: Record<AssetType, number>
  market_vs_forensic_gap: number
}
