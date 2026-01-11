'use client'

import { useMemo } from 'react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { ChartSetup, defaultChartOptions, chartColors } from './ChartSetup'
import { cn } from '@/lib/utils/cn'
import { formatPrice, formatPercent, getRiskGradeClass } from '@/lib/utils/format'
import type { Property, DashboardStats, RiskGrade, AssetType } from '@/types'
import {
  TrendingUp,
  TrendingDown,
  Building2,
  MapPin,
  Target,
  Shield,
  Zap,
  AlertTriangle,
} from 'lucide-react'

interface InvestmentDashboardProps {
  properties: Property[]
  stats?: DashboardStats
}

export function InvestmentDashboard({ properties, stats }: InvestmentDashboardProps) {
  // Calculate stats if not provided
  const calculatedStats = useMemo(() => {
    if (stats) return stats

    const total = properties.length
    const verified = properties.filter(p => p.is_verified).length

    const totalAlpha = properties.reduce((sum, p) => {
      if (p.zoning_potential_value && p.market_price) {
        return sum + (p.zoning_potential_value - p.market_price)
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
    }, {} as Record<RiskGrade, number>)

    const typeDistribution = properties.reduce((acc, p) => {
      acc[p.asset_type] = (acc[p.asset_type] || 0) + 1
      return acc
    }, {} as Record<AssetType, number>)

    const forensicPrices = properties.filter(p => p.forensic_price && p.market_price)
    const marketGap = forensicPrices.length > 0
      ? forensicPrices.reduce((sum, p) => sum + ((p.market_price! - p.forensic_price!) / p.forensic_price! * 100), 0) / forensicPrices.length
      : 0

    return {
      total_properties: total,
      verified_properties: verified,
      total_alpha_value: totalAlpha,
      average_cap_rate: avgCapRate,
      properties_by_risk: riskDistribution,
      properties_by_type: typeDistribution,
      market_vs_forensic_gap: marketGap,
    }
  }, [properties, stats])

  // Alpha opportunities (top 5)
  const alphaOpportunities = useMemo(() => {
    return properties
      .filter(p => p.zoning_potential_value && p.market_price)
      .map(p => ({
        ...p,
        alpha_value: p.zoning_potential_value! - p.market_price!,
        alpha_percent: ((p.zoning_potential_value! - p.market_price!) / p.market_price!) * 100,
      }))
      .filter(p => p.alpha_percent > 0)
      .sort((a, b) => b.alpha_percent - a.alpha_percent)
      .slice(0, 5)
  }, [properties])

  // Risk distribution chart data
  const riskChartData = useMemo(() => ({
    labels: ['A', 'B', 'C', 'D', 'E', 'F'],
    datasets: [{
      data: [
        calculatedStats.properties_by_risk['A'] || 0,
        calculatedStats.properties_by_risk['B'] || 0,
        calculatedStats.properties_by_risk['C'] || 0,
        calculatedStats.properties_by_risk['D'] || 0,
        calculatedStats.properties_by_risk['E'] || 0,
        calculatedStats.properties_by_risk['F'] || 0,
      ],
      backgroundColor: [
        chartColors.risk.A,
        chartColors.risk.B,
        chartColors.risk.C,
        chartColors.risk.D,
        chartColors.risk.E,
        chartColors.risk.F,
      ],
      borderWidth: 0,
    }],
  }), [calculatedStats])

  // Asset type distribution
  const assetTypeData = useMemo(() => ({
    labels: ['Apartments', 'Villas', 'Land'],
    datasets: [{
      data: [
        calculatedStats.properties_by_type['Apartment'] || 0,
        calculatedStats.properties_by_type['Villa'] || 0,
        calculatedStats.properties_by_type['Land'] || 0,
      ],
      backgroundColor: [
        chartColors.assetTypes.Apartment,
        chartColors.assetTypes.Villa,
        chartColors.assetTypes.Land,
      ],
      borderWidth: 0,
    }],
  }), [calculatedStats])

  // Price comparison data (forensic vs market)
  const priceComparisonData = useMemo(() => {
    const comparableProperties = properties
      .filter(p => p.forensic_price && p.market_price)
      .slice(0, 10)

    return {
      labels: comparableProperties.map(p => p.title.substring(0, 15) + '...'),
      datasets: [
        {
          label: 'Market Price',
          data: comparableProperties.map(p => p.market_price! / 1000000),
          backgroundColor: '#e5e5e5',
          borderRadius: 4,
        },
        {
          label: 'Forensic Price',
          data: comparableProperties.map(p => p.forensic_price! / 1000000),
          backgroundColor: chartColors.primary,
          borderRadius: 4,
        },
      ],
    }
  }, [properties])

  return (
    <div className="space-y-6">
      <ChartSetup />

      {/* Key Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="Total Properties"
          value={calculatedStats.total_properties.toString()}
          subValue={`${calculatedStats.verified_properties} verified`}
        />
        <StatCard
          icon={Target}
          label="Avg CAP Rate"
          value={formatPercent(calculatedStats.average_cap_rate)}
          trend={calculatedStats.average_cap_rate > 5 ? 'up' : 'neutral'}
        />
        <StatCard
          icon={Zap}
          label="Total Alpha"
          value={formatPrice(calculatedStats.total_alpha_value, { compact: true })}
          subValue="Hidden value identified"
          trend="up"
        />
        <StatCard
          icon={Shield}
          label="Market Gap"
          value={formatPercent(Math.abs(calculatedStats.market_vs_forensic_gap))}
          subValue={calculatedStats.market_vs_forensic_gap > 0 ? 'Overpriced' : 'Underpriced'}
          trend={calculatedStats.market_vs_forensic_gap > 0 ? 'down' : 'up'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Distribution */}
        <div className="card p-6">
          <h3 className="heading-3 mb-4">Risk Distribution</h3>
          <div className="h-48">
            <Doughnut
              data={riskChartData}
              options={{
                ...defaultChartOptions,
                cutout: '60%',
                plugins: {
                  ...defaultChartOptions.plugins,
                  legend: {
                    display: true,
                    position: 'bottom' as const,
                    labels: {
                      usePointStyle: true,
                      padding: 12,
                      font: { size: 11, family: 'Inter' },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Asset Type Distribution */}
        <div className="card p-6">
          <h3 className="heading-3 mb-4">Asset Types</h3>
          <div className="h-48">
            <Doughnut
              data={assetTypeData}
              options={{
                ...defaultChartOptions,
                cutout: '60%',
                plugins: {
                  ...defaultChartOptions.plugins,
                  legend: {
                    display: true,
                    position: 'bottom' as const,
                    labels: {
                      usePointStyle: true,
                      padding: 12,
                      font: { size: 11, family: 'Inter' },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Alpha Opportunities */}
        <div className="card p-6">
          <h3 className="heading-3 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent-gold" />
            Top Alpha
          </h3>
          {alphaOpportunities.length > 0 ? (
            <div className="space-y-3">
              {alphaOpportunities.map((property, index) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-primary-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-primary-400">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[120px]">
                        {property.title}
                      </p>
                      <p className="text-xs text-primary-500">{property.zoning_code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-forensic-verified">
                      +{formatPercent(property.alpha_percent)}
                    </p>
                    <p className="text-xs text-primary-500">
                      {formatPrice(property.alpha_value, { compact: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-primary-500 text-center py-8">
              No alpha opportunities identified
            </p>
          )}
        </div>
      </div>

      {/* Price Comparison Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="heading-3">Market vs Forensic Valuation</h3>
            <p className="text-sm text-primary-500 mt-1">
              Comparison of asking prices vs our audited valuations (in millions MAD)
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary-200"></span>
              Market
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary-900"></span>
              Forensic
            </span>
          </div>
        </div>
        <div className="h-64">
          <Bar
            data={priceComparisonData}
            options={{
              ...defaultChartOptions,
              scales: {
                ...defaultChartOptions.scales,
                y: {
                  ...defaultChartOptions.scales.y,
                  title: {
                    display: true,
                    text: 'Price (M MAD)',
                    font: { size: 11, family: 'Inter' },
                    color: '#666666',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Compliance Alerts */}
      <div className="card p-6">
        <h3 className="heading-3 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Compliance Alerts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AlertCard
            title="Tax Gate Failures"
            count={properties.filter(p => !p.tax_gate_passed).length}
            description="Missing QR-Verified Quitus Fiscal"
            severity="high"
          />
          <AlertCard
            title="Bill 34.21 Flagged"
            count={properties.filter(p => p.bill_34_21_flagged).length}
            description="5-year deadline exceeded"
            severity="high"
          />
          <AlertCard
            title="VNA Required"
            count={properties.filter(p => p.vna_required).length}
            description="Foreign acquisition pending"
            severity="medium"
          />
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
}

function StatCard({ icon: Icon, label, value, subValue, trend }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <Icon className="w-5 h-5 text-primary-400" />
        {trend && (
          <span className={cn(
            'flex items-center text-sm',
            trend === 'up' && 'text-forensic-verified',
            trend === 'down' && 'text-forensic-flagged',
            trend === 'neutral' && 'text-primary-400'
          )}>
            {trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4" />}
          </span>
        )}
      </div>
      <p className="stat-value mt-3">{value}</p>
      <p className="stat-label">{label}</p>
      {subValue && (
        <p className="text-xs text-primary-500 mt-1">{subValue}</p>
      )}
    </div>
  )
}

// Alert Card Component
interface AlertCardProps {
  title: string
  count: number
  description: string
  severity: 'high' | 'medium' | 'low'
}

function AlertCard({ title, count, description, severity }: AlertCardProps) {
  return (
    <div className={cn(
      'p-4 rounded-xl border',
      severity === 'high' && 'bg-red-50 border-red-200',
      severity === 'medium' && 'bg-amber-50 border-amber-200',
      severity === 'low' && 'bg-blue-50 border-blue-200'
    )}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={cn(
          'font-medium text-sm',
          severity === 'high' && 'text-red-900',
          severity === 'medium' && 'text-amber-900',
          severity === 'low' && 'text-blue-900'
        )}>
          {title}
        </h4>
        <span className={cn(
          'text-2xl font-display',
          severity === 'high' && 'text-red-600',
          severity === 'medium' && 'text-amber-600',
          severity === 'low' && 'text-blue-600'
        )}>
          {count}
        </span>
      </div>
      <p className={cn(
        'text-xs',
        severity === 'high' && 'text-red-700',
        severity === 'medium' && 'text-amber-700',
        severity === 'low' && 'text-blue-700'
      )}>
        {description}
      </p>
    </div>
  )
}
