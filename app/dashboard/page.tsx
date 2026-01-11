import Link from 'next/link'
import { PropertyGrid } from '@/components/PropertyGrid'
import { getProperties, getStats, getAlphaOpportunities, type Property } from '@/lib/google-sheets'
import {
  Plus,
  TrendingUp,
  AlertTriangle,
  Building2,
  Zap,
} from 'lucide-react'

// Mock data for when Google Sheets isn't configured
const mockProperties: Property[] = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    title: 'Riad Amina',
    asset_type: 'Titre Foncier',
    address: 'Derb Laksour 23',
    neighborhood: 'Laksour',
    gps_lat: 31.63,
    gps_lng: -8.0,
    terrain_m2: 280,
    built_m2: 280,
    market_price: 4500000,
    forensic_price: 4050000,
    price_per_m2: 16071,
    zoning_code: '',
    zoning_potential: 5400000,
    alpha_gap: 20,
    alpha_value: 900000,
    risk_grade: 'B',
    shs_score: 9,
    heir_count: 0,
    legal_notes: 'Renovation needed',
    is_verified: true,
    compliance_status: 'clean',
    legal_status: 'Titre Foncier',
    structural_health: 85,
    days_on_market: 45,
    suites: 6,
    render_url: '',
  },
  {
    id: '2',
    created_at: new Date().toISOString(),
    title: 'Dar Yasmine',
    asset_type: 'Melkia',
    address: 'Derb Laksour 47',
    neighborhood: 'Laksour',
    gps_lat: 31.63,
    gps_lng: -8.0,
    terrain_m2: 220,
    built_m2: 220,
    market_price: 3200000,
    forensic_price: 2880000,
    price_per_m2: 14545,
    zoning_code: '',
    zoning_potential: 4160000,
    alpha_gap: 30,
    alpha_value: 960000,
    risk_grade: 'C',
    shs_score: 7,
    heir_count: 0,
    legal_notes: 'Needs renovation',
    is_verified: false,
    compliance_status: 'risky',
    legal_status: 'Melkia',
    structural_health: 72,
    days_on_market: 120,
    suites: 4,
    render_url: '',
  },
]

export default async function DashboardPage() {
  let properties: Property[] = mockProperties
  let stats = {
    total_properties: mockProperties.length,
    total_alpha_value: mockProperties.reduce((sum, p) => sum + Math.max(0, p.alpha_value), 0),
    avg_alpha_gap: Math.round(mockProperties.reduce((sum, p) => sum + p.alpha_gap, 0) / mockProperties.length),
    risky_properties: mockProperties.filter(p => p.compliance_status === 'risky').length,
  }

  // Try to fetch from Google Sheets
  try {
    if (process.env.GOOGLE_SPREADSHEET_ID) {
      const [sheetProperties, sheetStats] = await Promise.all([
        getProperties(),
        getStats(),
      ])
      if (sheetProperties.length > 0) {
        properties = sheetProperties
        stats = sheetStats
      }
    }
  } catch (error) {
    console.error('Failed to fetch from sheets:', error)
  }

  const alphaOpportunities = properties
    .filter(p => p.alpha_gap > 15)
    .sort((a, b) => b.alpha_gap - a.alpha_gap)
    .slice(0, 5)

  return (
    <main className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-white mb-1">Dashboard</h1>
            <p className="text-sm text-zinc-500 font-mono">
              {properties.length} properties indexed
            </p>
          </div>
          <Link href="/audit" className="btn-emerald">
            <Plus className="w-4 h-4 mr-2" />
            New Audit
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="w-5 h-5 text-zinc-500" />
            </div>
            <p className="stat-value">{stats.total_properties}</p>
            <p className="stat-label">Properties</p>
          </div>

          <div className="stat-card glow-emerald border-emerald-900/30">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="stat-value text-emerald-400">
              {formatCompact(stats.total_alpha_value)}
            </p>
            <p className="stat-label">Total Alpha</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-5 h-5 text-zinc-500" />
            </div>
            <p className="stat-value">+{stats.avg_alpha_gap}%</p>
            <p className="stat-label">Avg Gap</p>
          </div>

          <div className="stat-card glow-amber border-amber-900/30">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <p className="stat-value text-amber-400">{stats.risky_properties}</p>
            <p className="stat-label">Risky</p>
          </div>
        </div>
      </div>

      {/* Alpha Opportunities */}
      {alphaOpportunities.length > 0 && (
        <div className="max-w-7xl mx-auto mb-8">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500" />
            Alpha Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {alphaOpportunities.map((property, index) => (
              <div
                key={property.id}
                className="card p-4 border-emerald-900/30 hover:border-emerald-700/50 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500">#{index + 1}</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    +{property.alpha_gap}%
                  </span>
                </div>
                <p className="text-sm text-white truncate">{property.neighborhood}</p>
                <p className="text-xs text-zinc-500">{property.asset_type}</p>
                <p className="font-mono text-xs text-emerald-500 mt-2">
                  {formatCompact(property.alpha_value)} MAD
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property Grid */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg font-medium text-white mb-4">All Properties</h2>
        <PropertyGrid properties={properties} />
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-12 pt-6 border-t border-zinc-800">
        <div className="flex items-center justify-between text-xs text-zinc-600">
          <span className="font-mono">TIFORT-CORE</span>
          <Link href="/" className="hover:text-zinc-400">Home</Link>
        </div>
      </footer>
    </main>
  )
}

function formatCompact(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`
  }
  return num.toString()
}
