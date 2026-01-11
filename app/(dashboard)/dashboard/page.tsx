import { Suspense } from 'react'
import { InvestmentDashboard } from '@/components/charts/InvestmentDashboard'
import type { Property, InfrastructurePoint } from '@/types'

// Mock data for demonstration - in production this comes from Supabase
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
    zoning_potential_value: 8000000,
    risk_grade: 'B',
    structural_health_score: {
      seismic_chaining: true,
      rps_2011_compliant: true,
      rps_2026_compliant: false,
      humidity_score: 3,
      foundation_depth_m: 2.5,
      roof_life_years: 25,
      overall_score: 82,
    },
    cap_rate: 5.2,
    gross_yield: 6.8,
    net_yield: 4.9,
    distance_tgv_station: 8.5,
    distance_grand_stade: 12.0,
    distance_airport: 15.0,
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
    floors: 4,
    rooms: 24,
    year_built: 2018,
    market_price: 12000000,
    forensic_price: 9500000,
    zoning_code: 'GH2',
    risk_grade: 'C',
    structural_health_score: {
      seismic_chaining: false,
      rps_2011_compliant: false,
      rps_2026_compliant: false,
      humidity_score: 5,
      foundation_depth_m: 1.8,
      roof_life_years: 18,
      overall_score: 65,
    },
    cap_rate: 6.5,
    gross_yield: 8.2,
    net_yield: 5.8,
    resilience_score: 78,
    distance_tgv_station: 2.5,
    distance_grand_stade: 6.0,
    distance_airport: 8.0,
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
    structural_health_score: {
      seismic_chaining: null,
      rps_2011_compliant: false,
      rps_2026_compliant: false,
      humidity_score: null,
      foundation_depth_m: null,
      roof_life_years: null,
      overall_score: null,
    },
    cap_rate: 0,
    distance_tgv_station: 4.0,
    distance_grand_stade: 3.5,
    distance_airport: 10.0,
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
    floors: 2,
    rooms: 8,
    year_built: 1920,
    market_price: 4500000,
    forensic_price: 3200000,
    zoning_code: 'SA1',
    risk_grade: 'D',
    structural_health_score: {
      seismic_chaining: false,
      rps_2011_compliant: false,
      rps_2026_compliant: false,
      humidity_score: 8,
      foundation_depth_m: 0.8,
      roof_life_years: 5,
      overall_score: 35,
    },
    cap_rate: 4.2,
    distance_tgv_station: 3.0,
    distance_grand_stade: 8.0,
    distance_airport: 6.0,
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
    structural_health_score: {
      seismic_chaining: null,
      rps_2011_compliant: false,
      rps_2026_compliant: false,
      humidity_score: null,
      foundation_depth_m: null,
      roof_life_years: null,
      overall_score: null,
    },
    distance_tgv_station: 6.0,
    distance_grand_stade: 0.8,
    distance_airport: 12.0,
    infrastructure_proximity_score: 95,
    compliance_status: 'pending_review',
    bill_34_21_flagged: true,
    vna_required: false,
    tax_gate_passed: true,
    is_verified: true,
  },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <header className="bg-white border-b border-primary-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl text-primary-900">TIFORT-CORE</h1>
              <p className="text-sm text-primary-500">Investment Dashboard</p>
            </div>
            <nav className="flex items-center gap-6">
              <a href="/" className="text-sm text-primary-600 hover:text-primary-900">
                Home
              </a>
              <a href="/properties" className="text-sm text-primary-600 hover:text-primary-900">
                Properties
              </a>
              <a href="/audit" className="text-sm text-primary-600 hover:text-primary-900">
                Audit
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="heading-2 text-primary-900 mb-2">Portfolio Overview</h2>
          <p className="text-primary-600">
            Real-time analysis of market opportunities and compliance status
          </p>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <InvestmentDashboard properties={mockProperties} />
        </Suspense>
      </main>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card p-6 h-32 bg-primary-100" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="card p-6 h-64 bg-primary-100" />
        ))}
      </div>
      <div className="card p-6 h-80 bg-primary-100" />
    </div>
  )
}
