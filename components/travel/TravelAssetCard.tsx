'use client';

/**
 * TIFORT-CORE: Travel Asset Card
 * Swiss-Terminal aesthetic: High-density, monospace, functional minimalism
 */

import { useMemo } from 'react';
import { calculateTravelAlpha, calculateCorporateReadiness, type TravelAsset } from '@/lib/calculateTravelAlpha';

interface TravelAssetCardProps {
  asset: TravelAsset;
  onAudit?: (assetId: string) => void;
  onSelect?: (asset: TravelAsset) => void;
}

export function TravelAssetCard({ asset, onAudit, onSelect }: TravelAssetCardProps) {
  const alpha = useMemo(() => calculateTravelAlpha(asset), [asset]);
  const readiness = useMemo(() => calculateCorporateReadiness(asset), [asset]);

  const tierColors: Record<string, string> = {
    PLATINUM: 'border-indigo-500 bg-indigo-500/10 text-indigo-300',
    GOLD: 'border-amber-500 bg-amber-500/10 text-amber-300',
    SILVER: 'border-zinc-400 bg-zinc-500/10 text-zinc-300',
    BRONZE: 'border-orange-600 bg-orange-500/10 text-orange-300',
    UNQUALIFIED: 'border-red-700 bg-red-500/10 text-red-400',
  };

  const getStatusColor = (value: number, thresholds: [number, number]) =>
    value >= thresholds[0] ? 'text-emerald-400' : value >= thresholds[1] ? 'text-amber-400' : 'text-red-400';

  return (
    <div
      onClick={() => onSelect?.(asset)}
      className={`bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs ${onSelect ? 'cursor-pointer hover:border-zinc-700' : ''}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-[9px] text-zinc-600">{asset.id}</span>
        <span className={`px-1.5 py-0.5 text-[9px] font-semibold border ${tierColors[readiness.tier]}`}>
          {readiness.tier}
        </span>
      </div>

      {/* Asset Name */}
      <h3 className="text-sm font-semibold text-white mb-0.5">{asset.assetName}</h3>
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-4">
        {asset.location.district} / {asset.location.city}
      </p>

      {/* Operational Health Grid */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-900 border border-zinc-800 mb-4">
        <div className="text-center">
          <div className="text-[9px] text-zinc-500 mb-1">WIFI</div>
          <div className={`text-base font-semibold ${getStatusColor(asset.operationalHealth.wifiSpeed, [50, 15])}`}>
            {asset.operationalHealth.wifiSpeed}
            <span className="text-[9px] text-zinc-600 ml-0.5">Mbps</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-zinc-500 mb-1">SAFETY</div>
          <div className={`text-base font-semibold ${
            asset.operationalHealth.safetyGrade === 'A' ? 'text-emerald-400' :
            ['B', 'C'].includes(asset.operationalHealth.safetyGrade) ? 'text-amber-400' : 'text-red-400'
          }`}>
            {asset.operationalHealth.safetyGrade}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-zinc-500 mb-1">ACCESS</div>
          <div className={`text-base font-semibold ${getStatusColor(asset.operationalHealth.accessibilityScore, [80, 50])}`}>
            {asset.operationalHealth.accessibilityScore}
            <span className="text-[9px] text-zinc-600">/100</span>
          </div>
        </div>
      </div>

      {/* Yield Gap Analysis */}
      <div className="mb-4">
        <div className="text-[9px] text-zinc-500 tracking-wider border-b border-zinc-800 pb-1 mb-2">
          YIELD GAP ANALYSIS
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-zinc-500">PUB.RATE</span>
            <span className="text-zinc-400">{asset.pricing.currency} {alpha.publicRateAvg}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">FOR.RATE</span>
            <span className="text-emerald-400">{asset.pricing.currency} {alpha.forensicRate}</span>
          </div>
          <div className="flex justify-between bg-zinc-900 -mx-1 px-1 py-1">
            <span className="text-zinc-500">GAP</span>
            <span className="text-amber-400 font-semibold">+{alpha.percentageGap}%</span>
          </div>
        </div>
        {/* Yield bar */}
        <div className="flex items-center gap-1 mt-2">
          <span className="text-[9px] text-zinc-600 w-8">YIELD</span>
          <div className="flex-1 flex gap-0.5">
            {['LOW', 'MEDIUM', 'HIGH'].map((level, i) => (
              <div
                key={level}
                className={`h-1 flex-1 ${
                  ['LOW', 'MEDIUM', 'HIGH'].indexOf(alpha.yieldOpportunity) >= i
                    ? alpha.yieldOpportunity === 'HIGH' ? 'bg-emerald-500' :
                      alpha.yieldOpportunity === 'MEDIUM' ? 'bg-amber-500' : 'bg-zinc-600'
                    : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
          <span className="text-[9px] text-zinc-500 w-12 text-right">{alpha.yieldOpportunity}</span>
        </div>
      </div>

      {/* Corporate Readiness */}
      <div className="mb-4">
        <div className="text-[9px] text-zinc-500 tracking-wider border-b border-zinc-800 pb-1 mb-2">
          CORPORATE READINESS
        </div>
        {/* Score bar */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1.5 bg-zinc-800 relative">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
              style={{ width: `${readiness.total}%` }}
            />
          </div>
          <span className={`text-sm font-semibold ${
            readiness.total >= 80 ? 'text-emerald-400' : readiness.total >= 60 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {readiness.total}
          </span>
        </div>
        {/* Breakdown mini bars */}
        <div className="grid grid-cols-5 gap-1">
          {Object.entries(readiness.breakdown).map(([key, value]) => {
            const max = key === 'connectivity' ? 25 : key === 'safety' ? 30 :
                        key === 'accessibility' ? 20 : key === 'reliability' ? 15 : 10;
            return (
              <div key={key} className="text-center">
                <div className="text-[8px] text-zinc-600 mb-0.5">{key.slice(0, 3).toUpperCase()}</div>
                <div className="h-0.5 bg-zinc-800">
                  <div className="h-full bg-emerald-500" style={{ width: `${(value / max) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        {readiness.fortune500Ready && (
          <div className="mt-2 py-1 text-center text-[9px] font-semibold tracking-wider bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            F500 READY
          </div>
        )}
      </div>

      {/* Capacity */}
      <div className="flex items-center gap-2 py-2 border-t border-zinc-800 text-[10px] text-zinc-500">
        <span>{asset.capacity.rooms}R</span>
        <span className="text-zinc-700">|</span>
        <span>{asset.capacity.maxGuests}G</span>
        <span className="text-zinc-700">|</span>
        <span>{asset.capacity.bathrooms}B</span>
        <span className="ml-auto text-emerald-400">{asset.occupancy.currentRate}% OCC</span>
      </div>

      {/* Audit Button */}
      {onAudit && (
        <button
          onClick={e => { e.stopPropagation(); onAudit(asset.id); }}
          className="w-full mt-3 py-2.5 text-[10px] tracking-wider border border-zinc-700 text-zinc-400 hover:bg-zinc-900 hover:border-zinc-600 hover:text-white transition-all"
        >
          RE-AUDIT
        </button>
      )}
    </div>
  );
}

export default TravelAssetCard;
