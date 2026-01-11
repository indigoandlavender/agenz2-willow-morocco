'use client'

import { cn } from '@/lib/utils/cn'
import type { Property } from '@/lib/google-sheets'
import {
  MapPin,
  Users,
  AlertTriangle,
  TrendingUp,
  Building2,
  Landmark,
  TreePine,
  Home,
} from 'lucide-react'

interface PropertyGridProps {
  properties: Property[]
  onSelect?: (property: Property) => void
}

export function PropertyGrid({ properties, onSelect }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        <div className="text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No properties found</p>
          <p className="text-sm mt-1">Start auditing to add data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          index={index}
          onClick={() => onSelect?.(property)}
        />
      ))}
    </div>
  )
}

interface PropertyCardProps {
  property: Property
  index: number
  onClick: () => void
}

function PropertyCard({ property, index, onClick }: PropertyCardProps) {
  const hasAlpha = property.alpha_gap > 15
  const isRisky = property.compliance_status === 'risky' || property.heir_count > 1
  const isBlocked = property.compliance_status === 'blocked'

  // Bento sizing - make some cards larger
  const isLarge = hasAlpha && index % 5 === 0
  const isTall = property.alpha_gap > 30 && index % 3 === 0

  const AssetIcon = {
    Land: TreePine,
    Melkia: Landmark,
    Villa: Home,
    Apartment: Building2,
  }[property.asset_type] || Building2

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative bg-zinc-900 border border-zinc-800 rounded-xl p-5 cursor-pointer transition-all duration-300',
        'hover:border-zinc-700 hover:bg-zinc-800/50',
        isLarge && 'md:col-span-2',
        isTall && 'md:row-span-2',
        hasAlpha && 'border-emerald-900/50 hover:border-emerald-700/50',
        isBlocked && 'border-red-900/50 opacity-60'
      )}
    >
      {/* Alpha Badge */}
      {hasAlpha && (
        <div className="absolute -top-2 -right-2 px-2 py-1 bg-emerald-500 text-black text-xs font-bold rounded-full flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          +{property.alpha_gap}%
        </div>
      )}

      {/* Risk Badge */}
      {isRisky && !hasAlpha && (
        <div className="absolute -top-2 -right-2 px-2 py-1 bg-amber-500 text-black text-xs font-bold rounded-full flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          RISK
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            property.asset_type === 'Land' && 'bg-emerald-500/10 text-emerald-500',
            property.asset_type === 'Melkia' && 'bg-amber-500/10 text-amber-500',
            property.asset_type === 'Villa' && 'bg-blue-500/10 text-blue-500',
            property.asset_type === 'Apartment' && 'bg-purple-500/10 text-purple-500',
          )}>
            <AssetIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">
              {property.asset_type}
            </p>
            <p className="text-sm text-zinc-300 font-medium truncate max-w-[140px]">
              {property.neighborhood}
            </p>
          </div>
        </div>

        {/* Risk Grade */}
        <span className={cn(
          'px-2 py-1 rounded text-xs font-mono font-bold',
          property.risk_grade === 'A' && 'bg-emerald-500/20 text-emerald-400',
          property.risk_grade === 'B' && 'bg-lime-500/20 text-lime-400',
          property.risk_grade === 'C' && 'bg-yellow-500/20 text-yellow-400',
          property.risk_grade === 'D' && 'bg-orange-500/20 text-orange-400',
          property.risk_grade === 'E' && 'bg-red-500/20 text-red-400',
          property.risk_grade === 'F' && 'bg-red-900/30 text-red-500',
        )}>
          {property.risk_grade}
        </span>
      </div>

      {/* Price Metrics - IBM Plex Mono style */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-zinc-500">Price/m²</span>
          <span className="font-mono text-lg text-white">
            {formatNumber(property.price_per_m2)}
            <span className="text-xs text-zinc-500 ml-1">MAD</span>
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-xs text-zinc-500">Market</span>
          <span className="font-mono text-sm text-zinc-400">
            {formatCompact(property.market_price)}
          </span>
        </div>

        {property.alpha_gap > 0 && (
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-zinc-500">Alpha Gap</span>
            <span className={cn(
              'font-mono text-sm font-bold',
              property.alpha_gap > 30 ? 'text-emerald-400' :
              property.alpha_gap > 15 ? 'text-emerald-500' :
              'text-zinc-400'
            )}>
              +{formatCompact(property.alpha_value)}
            </span>
          </div>
        )}
      </div>

      {/* Footer Indicators */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {property.terrain_m2}m²
          </span>
          {property.heir_count > 0 && (
            <span className={cn(
              'flex items-center gap-1',
              property.heir_count > 2 && 'text-amber-500'
            )}>
              <Users className="w-3 h-3" />
              {property.heir_count}
            </span>
          )}
        </div>

        <span className={cn(
          'text-xs font-mono',
          property.shs_score >= 7 && 'text-emerald-500',
          property.shs_score >= 4 && property.shs_score < 7 && 'text-yellow-500',
          property.shs_score < 4 && 'text-red-500',
        )}>
          SHS:{property.shs_score}
        </span>
      </div>

      {/* Legal Notes Preview */}
      {property.legal_notes && (
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 truncate">
            {property.legal_notes}
          </p>
        </div>
      )}
    </div>
  )
}

// Format number with spaces (Moroccan style)
function formatNumber(num: number): string {
  return num.toLocaleString('fr-FR')
}

// Format compact (1.2M, 500K)
function formatCompact(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`
  }
  return num.toString()
}
