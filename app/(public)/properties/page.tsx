'use client'

import { useState, useMemo } from 'react'
import { InfrastructureMap } from '@/components/maps/InfrastructureMap'
import { cn } from '@/lib/utils/cn'
import { formatPrice, formatArea, formatPercent, getRiskGradeClass, getAssetTypeLabel, getZoningLabel } from '@/lib/utils/format'
import type { Property, InfrastructurePoint, AssetType, RiskGrade, ZoningCode } from '@/types'
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Building2,
  Zap,
  Shield,
  X,
  ChevronDown,
  Grid,
  Map,
} from 'lucide-react'

// Mock data - in production this comes from Supabase
const mockProperties: Property[] = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    title: 'Modern Villa in Palmeraie',
    asset_type: 'Villa',
    address: 'Route de Fes, Palmeraie',
    city: 'Marrakech',
    neighborhood: 'palmeraie',
    gps_latitude: 31.6650,
    gps_longitude: -7.9700,
    terrain_size_m2: 2500,
    built_size_m2: 450,
    year_built: 2021,
    market_price: 8500000,
    forensic_price: 7200000,
    zoning_code: 'SD1',
    risk_grade: 'B',
    structural_health_score: { seismic_chaining: true, rps_2011_compliant: true, rps_2026_compliant: false, humidity_score: 3, foundation_depth_m: 2.5, roof_life_years: 25, overall_score: 82 },
    cap_rate: 5.2,
    distance_tgv_station: 8.5,
    distance_grand_stade: 12.0,
    compliance_status: 'compliant',
    bill_34_21_flagged: false,
    vna_required: false,
    tax_gate_passed: true,
    is_verified: true,
  },
  {
    id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    title: 'Apartment Complex Gueliz',
    asset_type: 'Apartment',
    address: 'Avenue Mohammed V, Gueliz',
    city: 'Marrakech',
    neighborhood: 'gueliz',
    gps_latitude: 31.6350,
    gps_longitude: -8.0100,
    terrain_size_m2: 800,
    built_size_m2: 1200,
    year_built: 2018,
    market_price: 12000000,
    forensic_price: 9500000,
    zoning_code: 'GH2',
    risk_grade: 'C',
    structural_health_score: { seismic_chaining: false, rps_2011_compliant: false, rps_2026_compliant: false, humidity_score: 5, foundation_depth_m: 1.8, roof_life_years: 18, overall_score: 65 },
    cap_rate: 6.5,
    resilience_score: 78,
    distance_tgv_station: 2.5,
    distance_grand_stade: 6.0,
    compliance_status: 'pending_review',
    bill_34_21_flagged: false,
    vna_required: false,
    tax_gate_passed: false,
    is_verified: false,
  },
  {
    id: '3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    title: 'Development Land Targa',
    description: 'Prime development land with GH2 zoning. Massive alpha potential.',
    asset_type: 'Land',
    address: 'Zone Targa Nord',
    city: 'Marrakech',
    neighborhood: 'targa',
    gps_latitude: 31.6800,
    gps_longitude: -8.0300,
    terrain_size_m2: 5000,
    market_price: 3500000,
    forensic_price: 3200000,
    zoning_code: 'GH2',
    zoning_potential_value: 8500000,
    risk_grade: 'A',
    structural_health_score: { seismic_chaining: null, rps_2011_compliant: false, rps_2026_compliant: false, humidity_score: null, foundation_depth_m: null, roof_life_years: null, overall_score: null },
    distance_tgv_station: 4.0,
    distance_grand_stade: 3.5,
    infrastructure_proximity_score: 85,
    compliance_status: 'compliant',
    bill_34_21_flagged: false,
    vna_required: false,
    tax_gate_passed: true,
    is_verified: true,
  },
  {
    id: '4',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    title: 'Historic Riad Medina',
    asset_type: 'Villa',
    address: 'Derb Sidi Ahmed, Medina',
    city: 'Marrakech',
    neighborhood: 'medina',
    gps_latitude: 31.6295,
    gps_longitude: -7.9890,
    terrain_size_m2: 400,
    built_size_m2: 600,
    year_built: 1920,
    market_price: 4500000,
    forensic_price: 3200000,
    zoning_code: 'SA1',
    risk_grade: 'D',
    structural_health_score: { seismic_chaining: false, rps_2011_compliant: false, rps_2026_compliant: false, humidity_score: 8, foundation_depth_m: 0.8, roof_life_years: 5, overall_score: 35 },
    cap_rate: 4.2,
    distance_tgv_station: 3.0,
    distance_grand_stade: 8.0,
    compliance_status: 'non_compliant',
    bill_34_21_flagged: false,
    vna_required: true,
    tax_gate_passed: false,
    is_verified: false,
  },
  {
    id: '5',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    title: 'Stadium District Land',
    description: 'Prime World Cup 2030 proximity. High development potential.',
    asset_type: 'Land',
    address: 'Near Grand Stade Site',
    city: 'Marrakech',
    neighborhood: 'targa',
    gps_latitude: 31.5900,
    gps_longitude: -8.0700,
    terrain_size_m2: 3000,
    market_price: 2800000,
    forensic_price: 2500000,
    zoning_code: 'SA1',
    zoning_potential_value: 6500000,
    risk_grade: 'B',
    structural_health_score: { seismic_chaining: null, rps_2011_compliant: false, rps_2026_compliant: false, humidity_score: null, foundation_depth_m: null, roof_life_years: null, overall_score: null },
    distance_tgv_station: 6.0,
    distance_grand_stade: 0.8,
    infrastructure_proximity_score: 95,
    compliance_status: 'pending_review',
    bill_34_21_flagged: true,
    vna_required: false,
    tax_gate_passed: true,
    is_verified: true,
  },
]

const mockInfrastructure: InfrastructurePoint[] = [
  { id: '1', name: 'Gare LGV Marrakech', category: 'tgv_station', gps_latitude: 31.6295, gps_longitude: -8.0089, completion_year: 2027, is_operational: false, impact_radius_km: 5.0, value_multiplier: 1.25, created_at: new Date().toISOString() },
  { id: '2', name: 'Grand Stade de Marrakech', category: 'stadium', gps_latitude: 31.5847, gps_longitude: -8.0756, completion_year: 2029, is_operational: false, impact_radius_km: 8.0, value_multiplier: 1.40, created_at: new Date().toISOString() },
  { id: '3', name: 'Aeroport Marrakech Menara', category: 'airport', gps_latitude: 31.6069, gps_longitude: -8.0363, completion_year: 2020, is_operational: true, impact_radius_km: 10.0, value_multiplier: 1.10, created_at: new Date().toISOString() },
]

export default function PropertiesPage() {
  const [view, setView] = useState<'grid' | 'map'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  // Filters
  const [filters, setFilters] = useState({
    assetTypes: [] as AssetType[],
    riskGrades: [] as RiskGrade[],
    zoningCodes: [] as ZoningCode[],
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    onlyVerified: false,
    onlyAlpha: false,
  })

  // Filter properties
  const filteredProperties = useMemo(() => {
    return mockProperties.filter(p => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!p.title.toLowerCase().includes(query) &&
            !p.address.toLowerCase().includes(query) &&
            !p.neighborhood?.toLowerCase().includes(query)) {
          return false
        }
      }

      // Asset type filter
      if (filters.assetTypes.length > 0 && !filters.assetTypes.includes(p.asset_type)) {
        return false
      }

      // Risk grade filter
      if (filters.riskGrades.length > 0 && !filters.riskGrades.includes(p.risk_grade)) {
        return false
      }

      // Zoning filter
      if (filters.zoningCodes.length > 0 && p.zoning_code && !filters.zoningCodes.includes(p.zoning_code)) {
        return false
      }

      // Price range
      if (filters.minPrice && (p.market_price || 0) < filters.minPrice) {
        return false
      }
      if (filters.maxPrice && (p.market_price || 0) > filters.maxPrice) {
        return false
      }

      // Verified only
      if (filters.onlyVerified && !p.is_verified) {
        return false
      }

      // Alpha opportunities only
      if (filters.onlyAlpha) {
        const hasAlpha = p.zoning_potential_value && p.market_price && p.zoning_potential_value > p.market_price
        if (!hasAlpha) return false
      }

      return true
    })
  }, [searchQuery, filters])

  const toggleAssetType = (type: AssetType) => {
    setFilters(f => ({
      ...f,
      assetTypes: f.assetTypes.includes(type)
        ? f.assetTypes.filter(t => t !== type)
        : [...f.assetTypes, type]
    }))
  }

  const toggleRiskGrade = (grade: RiskGrade) => {
    setFilters(f => ({
      ...f,
      riskGrades: f.riskGrades.includes(grade)
        ? f.riskGrades.filter(g => g !== grade)
        : [...f.riskGrades, grade]
    }))
  }

  const clearFilters = () => {
    setFilters({
      assetTypes: [],
      riskGrades: [],
      zoningCodes: [],
      minPrice: undefined,
      maxPrice: undefined,
      onlyVerified: false,
      onlyAlpha: false,
    })
    setSearchQuery('')
  }

  const hasActiveFilters = filters.assetTypes.length > 0 ||
    filters.riskGrades.length > 0 ||
    filters.zoningCodes.length > 0 ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.onlyVerified ||
    filters.onlyAlpha

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <header className="bg-white border-b border-primary-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl text-primary-900">TIFORT-CORE</h1>
              <p className="text-sm text-primary-500">Property Search</p>
            </div>
            <nav className="flex items-center gap-6">
              <a href="/" className="text-sm text-primary-600 hover:text-primary-900">Home</a>
              <a href="/dashboard" className="text-sm text-primary-600 hover:text-primary-900">Dashboard</a>
              <a href="/audit" className="text-sm text-primary-600 hover:text-primary-900">Audit</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Search & Filters Bar */}
      <div className="bg-white border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, address, or neighborhood..."
                className="input pl-10"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'btn-secondary flex items-center gap-2',
                showFilters && 'bg-primary-100'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-primary-900 text-white text-xs flex items-center justify-center">
                  {filters.assetTypes.length + filters.riskGrades.length + (filters.onlyVerified ? 1 : 0) + (filters.onlyAlpha ? 1 : 0)}
                </span>
              )}
            </button>

            {/* View Toggle */}
            <div className="flex items-center border border-primary-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={cn(
                  'p-2.5 transition',
                  view === 'grid' ? 'bg-primary-900 text-white' : 'text-primary-600 hover:bg-primary-50'
                )}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('map')}
                className={cn(
                  'p-2.5 transition',
                  view === 'map' ? 'bg-primary-900 text-white' : 'text-primary-600 hover:bg-primary-50'
                )}
              >
                <Map className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-primary-100 animate-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Asset Type */}
                <div>
                  <label className="text-xs font-medium text-primary-500 uppercase mb-2 block">
                    Asset Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['Apartment', 'Villa', 'Land'] as AssetType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => toggleAssetType(type)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm transition',
                          filters.assetTypes.includes(type)
                            ? 'bg-primary-900 text-white'
                            : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Risk Grade */}
                <div>
                  <label className="text-xs font-medium text-primary-500 uppercase mb-2 block">
                    Risk Grade
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['A', 'B', 'C', 'D', 'E', 'F'] as RiskGrade[]).map(grade => (
                      <button
                        key={grade}
                        onClick={() => toggleRiskGrade(grade)}
                        className={cn(
                          'w-8 h-8 rounded-lg text-sm font-medium transition',
                          filters.riskGrades.includes(grade)
                            ? getRiskGradeClass(grade)
                            : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                        )}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Filters */}
                <div>
                  <label className="text-xs font-medium text-primary-500 uppercase mb-2 block">
                    Quick Filters
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.onlyVerified}
                        onChange={(e) => setFilters(f => ({ ...f, onlyVerified: e.target.checked }))}
                        className="w-4 h-4 rounded border-primary-300"
                      />
                      <span className="text-sm">Verified Only</span>
                      <Shield className="w-4 h-4 text-forensic-verified" />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.onlyAlpha}
                        onChange={(e) => setFilters(f => ({ ...f, onlyAlpha: e.target.checked }))}
                        className="w-4 h-4 rounded border-primary-300"
                      />
                      <span className="text-sm">Alpha Only</span>
                      <Zap className="w-4 h-4 text-accent-gold" />
                    </label>
                  </div>
                </div>

                {/* Clear */}
                <div className="flex items-end">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary-500 hover:text-primary-900 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <p className="text-sm text-primary-500">
          {filteredProperties.length} properties found
        </p>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        {view === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => setSelectedProperty(property)}
              />
            ))}
          </div>
        ) : (
          <div className="h-[70vh] rounded-2xl overflow-hidden">
            <InfrastructureMap
              properties={filteredProperties}
              infrastructurePoints={mockInfrastructure}
              onPropertySelect={setSelectedProperty}
              className="h-full"
            />
          </div>
        )}

        {filteredProperties.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-primary-300" />
            <h3 className="heading-3 text-primary-700 mb-2">No properties found</h3>
            <p className="text-primary-500">Try adjusting your filters</p>
          </div>
        )}
      </main>
    </div>
  )
}

// Property Card Component
function PropertyCard({ property, onClick }: { property: Property; onClick: () => void }) {
  const hasAlpha = property.zoning_potential_value &&
    property.market_price &&
    property.zoning_potential_value > property.market_price

  const alphaPercent = hasAlpha
    ? ((property.zoning_potential_value! - property.market_price!) / property.market_price!) * 100
    : 0

  return (
    <div
      onClick={onClick}
      className="card-interactive p-6 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-medium text-primary-900 mb-1">{property.title}</h3>
          <p className="text-sm text-primary-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {property.neighborhood || property.city}
          </p>
        </div>
        <span className={getRiskGradeClass(property.risk_grade)}>
          {property.risk_grade}
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700">
          {getAssetTypeLabel(property.asset_type)}
        </span>
        {property.zoning_code && (
          <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-700">
            {property.zoning_code}
          </span>
        )}
        {property.is_verified && (
          <span className="badge-verified">
            <Shield className="w-3 h-3" />
            Verified
          </span>
        )}
      </div>

      {/* Alpha Badge */}
      {hasAlpha && (
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Alpha Opportunity
            </span>
            <span className="text-sm font-bold text-amber-700">
              +{alphaPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-primary-500 uppercase mb-1">Market Price</p>
          <p className="font-mono font-medium">
            {formatPrice(property.market_price || 0, { compact: true })}
          </p>
        </div>
        <div>
          <p className="text-xs text-primary-500 uppercase mb-1">Forensic Price</p>
          <p className={cn(
            'font-mono font-medium',
            property.forensic_price ? 'text-primary-900' : 'text-primary-400'
          )}>
            {property.forensic_price
              ? formatPrice(property.forensic_price, { compact: true })
              : 'Pending'}
          </p>
        </div>
      </div>

      {/* Size & CAP Rate */}
      <div className="flex items-center justify-between text-sm text-primary-600 pt-4 border-t border-primary-100">
        <span>
          {formatArea(property.built_size_m2 || property.terrain_size_m2 || 0)}
        </span>
        {property.cap_rate && (
          <span>CAP {formatPercent(property.cap_rate)}</span>
        )}
        {property.infrastructure_proximity_score && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {property.infrastructure_proximity_score}
          </span>
        )}
      </div>
    </div>
  )
}
