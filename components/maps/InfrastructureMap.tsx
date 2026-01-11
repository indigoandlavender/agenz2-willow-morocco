'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import type { Property, InfrastructurePoint } from '@/types'
import { cn } from '@/lib/utils/cn'
import { formatPrice, formatDistance, getRiskGradeClass } from '@/lib/utils/format'
import {
  Layers,
  MapPin,
  Train,
  Building2,
  Plane,
  Route,
  Factory,
  ZoomIn,
  ZoomOut,
  Locate,
  Eye,
  EyeOff,
} from 'lucide-react'

// Initialize Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface InfrastructureMapProps {
  properties: Property[]
  infrastructurePoints?: InfrastructurePoint[]
  center?: [number, number]
  zoom?: number
  onPropertySelect?: (property: Property) => void
  className?: string
}

// Marrakech default center
const DEFAULT_CENTER: [number, number] = [-8.0089, 31.6295]
const DEFAULT_ZOOM = 11

// Infrastructure colors
const INFRA_COLORS: Record<string, string> = {
  tgv_station: '#3b82f6',
  stadium: '#22c55e',
  highway: '#f59e0b',
  airport: '#8b5cf6',
  industrial_zone: '#6b7280',
}

// Risk grade colors for property markers
const RISK_COLORS: Record<string, string> = {
  A: '#22c55e',
  B: '#84cc16',
  C: '#eab308',
  D: '#f97316',
  E: '#ef4444',
  F: '#991b1b',
}

export function InfrastructureMap({
  properties,
  infrastructurePoints = [],
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  onPropertySelect,
  className,
}: InfrastructureMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const popupRef = useRef<mapboxgl.Popup | null>(null)

  const [mapLoaded, setMapLoaded] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [showInfrastructure, setShowInfrastructure] = useState(true)
  const [activeLayer, setActiveLayer] = useState<'properties' | 'alpha' | 'risk'>('properties')

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center,
      zoom,
      attributionControl: false,
    })

    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left')

    map.current.on('load', () => {
      setMapLoaded(true)
      addInfrastructureHeatmap()
      addInfrastructurePoints()
      addPropertyMarkers()
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Add 2030 Infrastructure Heatmap
  const addInfrastructureHeatmap = useCallback(() => {
    if (!map.current || !mapLoaded) return

    // Remove existing layers if present
    if (map.current.getLayer('infrastructure-heat')) {
      map.current.removeLayer('infrastructure-heat')
    }
    if (map.current.getSource('infrastructure-heat-source')) {
      map.current.removeSource('infrastructure-heat-source')
    }

    // Create heatmap data from infrastructure points
    const heatmapData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: infrastructurePoints.map(point => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [point.gps_longitude, point.gps_latitude],
        },
        properties: {
          intensity: point.value_multiplier || 1,
          category: point.category,
        },
      })),
    }

    map.current.addSource('infrastructure-heat-source', {
      type: 'geojson',
      data: heatmapData,
    })

    map.current.addLayer({
      id: 'infrastructure-heat',
      type: 'heatmap',
      source: 'infrastructure-heat-source',
      paint: {
        'heatmap-weight': ['get', 'intensity'],
        'heatmap-intensity': 0.8,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(33,102,172,0)',
          0.2, 'rgba(103,169,207,0.4)',
          0.4, 'rgba(209,229,240,0.6)',
          0.6, 'rgba(253,219,199,0.7)',
          0.8, 'rgba(239,138,98,0.8)',
          1, 'rgba(178,24,43,0.9)',
        ],
        'heatmap-radius': 80,
        'heatmap-opacity': showHeatmap ? 0.6 : 0,
      },
    })
  }, [mapLoaded, infrastructurePoints, showHeatmap])

  // Add infrastructure point markers
  const addInfrastructurePoints = useCallback(() => {
    if (!map.current || !mapLoaded || !showInfrastructure) return

    infrastructurePoints.forEach(point => {
      const el = document.createElement('div')
      el.className = 'infrastructure-marker'
      el.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: ${INFRA_COLORS[point.category] || '#6b7280'};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      `

      // Add icon based on category
      const iconSvg = getInfrastructureIcon(point.category)
      el.innerHTML = iconSvg

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div style="padding: 12px; min-width: 200px;">
            <h4 style="font-weight: 600; margin-bottom: 4px;">${point.name}</h4>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">
              ${point.description || point.category.replace('_', ' ')}
            </p>
            <div style="display: flex; gap: 12px; font-size: 11px;">
              <span>
                <strong>Impact:</strong> +${((point.value_multiplier || 1) - 1) * 100}%
              </span>
              <span>
                <strong>Radius:</strong> ${point.impact_radius_km}km
              </span>
            </div>
            <p style="font-size: 11px; color: #888; margin-top: 8px;">
              ${point.is_operational ? '✓ Operational' : `Expected: ${point.completion_year}`}
            </p>
          </div>
        `)

      new mapboxgl.Marker(el)
        .setLngLat([point.gps_longitude, point.gps_latitude])
        .setPopup(popup)
        .addTo(map.current!)
    })
  }, [mapLoaded, infrastructurePoints, showInfrastructure])

  // Add property markers
  const addPropertyMarkers = useCallback(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    properties.forEach(property => {
      const el = document.createElement('div')
      el.className = 'property-marker'

      const color = RISK_COLORS[property.risk_grade] || '#6b7280'
      const hasAlpha = property.zoning_potential_value &&
        property.market_price &&
        property.zoning_potential_value > property.market_price

      el.style.cssText = `
        width: ${hasAlpha ? '28px' : '24px'};
        height: ${hasAlpha ? '28px' : '24px'};
        border-radius: 50%;
        background: ${activeLayer === 'alpha' && hasAlpha ? '#B8860B' : color};
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        cursor: pointer;
        transition: transform 0.2s;
        ${hasAlpha ? 'animation: pulse 2s infinite;' : ''}
      `

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)'
      })

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
      })

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        maxWidth: '300px',
      }).setHTML(createPropertyPopup(property, hasAlpha))

      const marker = new mapboxgl.Marker(el)
        .setLngLat([property.gps_longitude, property.gps_latitude])
        .setPopup(popup)
        .addTo(map.current!)

      marker.getElement().addEventListener('click', () => {
        onPropertySelect?.(property)
      })

      markersRef.current.push(marker)
    })
  }, [mapLoaded, properties, activeLayer, onPropertySelect])

  // Update markers when data changes
  useEffect(() => {
    if (mapLoaded) {
      addPropertyMarkers()
    }
  }, [mapLoaded, properties, activeLayer])

  // Update heatmap visibility
  useEffect(() => {
    if (map.current && mapLoaded && map.current.getLayer('infrastructure-heat')) {
      map.current.setPaintProperty(
        'infrastructure-heat',
        'heatmap-opacity',
        showHeatmap ? 0.6 : 0
      )
    }
  }, [showHeatmap, mapLoaded])

  const handleZoomIn = () => map.current?.zoomIn()
  const handleZoomOut = () => map.current?.zoomOut()
  const handleRecenter = () => {
    map.current?.flyTo({ center, zoom, duration: 1000 })
  }

  return (
    <div className={cn('relative rounded-2xl overflow-hidden', className)}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full min-h-[400px]" />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition"
        >
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition"
        >
          <ZoomOut className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={handleRecenter}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition"
        >
          <Locate className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Layer Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="bg-white rounded-xl shadow-md p-3">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Layers</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={cn(
                'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs transition',
                showHeatmap ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {showHeatmap ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              2030 Heatmap
            </button>

            <button
              onClick={() => setShowInfrastructure(!showInfrastructure)}
              className={cn(
                'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs transition',
                showInfrastructure ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {showInfrastructure ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              Infrastructure
            </button>
          </div>

          <div className="border-t border-gray-100 my-3" />

          <div className="space-y-1">
            {(['properties', 'alpha', 'risk'] as const).map(layer => (
              <button
                key={layer}
                onClick={() => setActiveLayer(layer)}
                className={cn(
                  'w-full px-2 py-1.5 rounded-lg text-xs text-left transition',
                  activeLayer === layer
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {layer === 'properties' && 'All Properties'}
                {layer === 'alpha' && 'Alpha Opportunities'}
                {layer === 'risk' && 'Risk View'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-md p-3">
        <p className="text-xs font-medium text-gray-700 mb-2">Infrastructure</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(INFRA_COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600 capitalize">
                {key.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pulse animation style */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(184, 134, 11, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(184, 134, 11, 0); }
        }
      `}</style>
    </div>
  )
}

// Helper: Get infrastructure icon SVG
function getInfrastructureIcon(category: string): string {
  const icons: Record<string, string> = {
    tgv_station: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
    stadium: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
    highway: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>',
    airport: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
    industrial_zone: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M2 20h20M5 20V4l5 4V4l5 4h5v12"/></svg>',
  }
  return icons[category] || icons.industrial_zone
}

// Helper: Create property popup HTML
function createPropertyPopup(property: Property, hasAlpha: boolean): string {
  const alphaValue = hasAlpha
    ? property.zoning_potential_value! - property.market_price!
    : 0
  const alphaPercent = hasAlpha
    ? ((alphaValue / property.market_price!) * 100).toFixed(1)
    : 0

  return `
    <div style="padding: 16px; min-width: 240px;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <h4 style="font-weight: 600; font-size: 14px; margin: 0; max-width: 180px;">
          ${property.title}
        </h4>
        <span style="
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          background: ${RISK_COLORS[property.risk_grade]}20;
          color: ${RISK_COLORS[property.risk_grade]};
        ">
          ${property.risk_grade}
        </span>
      </div>

      <p style="font-size: 12px; color: #666; margin-bottom: 12px;">
        ${property.address}
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
        <div>
          <p style="font-size: 10px; color: #999; text-transform: uppercase; margin-bottom: 2px;">
            Market Price
          </p>
          <p style="font-size: 13px; font-weight: 600; font-family: monospace;">
            ${formatPrice(property.market_price || 0, { compact: true })}
          </p>
        </div>
        <div>
          <p style="font-size: 10px; color: #999; text-transform: uppercase; margin-bottom: 2px;">
            Forensic Price
          </p>
          <p style="font-size: 13px; font-weight: 600; font-family: monospace; color: ${property.forensic_price ? '#121212' : '#999'};">
            ${property.forensic_price ? formatPrice(property.forensic_price, { compact: true }) : 'Pending'}
          </p>
        </div>
      </div>

      ${hasAlpha ? `
        <div style="
          background: linear-gradient(135deg, #B8860B10 0%, #B8860B05 100%);
          border: 1px solid #B8860B30;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 12px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: #B8860B; font-weight: 500;">
              ⚡ Alpha Opportunity
            </span>
            <span style="font-size: 14px; color: #B8860B; font-weight: 700;">
              +${alphaPercent}%
            </span>
          </div>
          <p style="font-size: 11px; color: #666; margin-top: 4px;">
            ${formatPrice(alphaValue, { compact: true })} hidden value
          </p>
        </div>
      ` : ''}

      <div style="display: flex; gap: 12px; font-size: 11px; color: #666;">
        <span>📍 ${property.neighborhood || 'Unknown'}</span>
        <span>🏷 ${property.zoning_code || 'N/A'}</span>
      </div>
    </div>
  `
}
