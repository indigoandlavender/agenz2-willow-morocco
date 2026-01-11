/**
 * TIFORT-CORE Infrastructure Sheet Service
 * CRUD operations for the Infrastructure sheet
 */

import {
  SHEETS,
  readSheet,
  appendRows,
  generateId,
  parseBoolean,
  parseNumber,
} from './client'
import type { InfrastructurePoint } from '@/types'

/**
 * Convert a sheet row to an InfrastructurePoint object
 */
function rowToInfrastructure(row: string[]): InfrastructurePoint {
  return {
    id: row[0] || generateId(),
    name: row[1] || '',
    category: row[2] as InfrastructurePoint['category'] || 'industrial_zone',
    description: row[3],
    gps_latitude: parseNumber(row[4]) || 0,
    gps_longitude: parseNumber(row[5]) || 0,
    completion_year: parseNumber(row[6]),
    is_operational: parseBoolean(row[7]),
    impact_radius_km: parseNumber(row[8]),
    value_multiplier: parseNumber(row[9]),
    created_at: row[10] || new Date().toISOString(),
  }
}

/**
 * Get all infrastructure points
 */
export async function getAllInfrastructure(): Promise<InfrastructurePoint[]> {
  const data = await readSheet(SHEETS.INFRASTRUCTURE)

  return data.slice(1)
    .filter(row => row[0])
    .map(row => rowToInfrastructure(row))
}

/**
 * Get infrastructure by category
 */
export async function getInfrastructureByCategory(
  category: InfrastructurePoint['category']
): Promise<InfrastructurePoint[]> {
  const all = await getAllInfrastructure()
  return all.filter(i => i.category === category)
}

/**
 * Add infrastructure point
 */
export async function addInfrastructurePoint(
  point: Partial<InfrastructurePoint>
): Promise<InfrastructurePoint> {
  const id = generateId()

  const row = [
    id,
    point.name || '',
    point.category || 'industrial_zone',
    point.description || '',
    point.gps_latitude || 0,
    point.gps_longitude || 0,
    point.completion_year || '',
    point.is_operational ? 'TRUE' : 'FALSE',
    point.impact_radius_km || '',
    point.value_multiplier || 1,
    new Date().toISOString(),
  ]

  await appendRows(SHEETS.INFRASTRUCTURE, [row])

  return {
    id,
    name: point.name || '',
    category: point.category || 'industrial_zone',
    description: point.description,
    gps_latitude: point.gps_latitude || 0,
    gps_longitude: point.gps_longitude || 0,
    completion_year: point.completion_year,
    is_operational: point.is_operational || false,
    impact_radius_km: point.impact_radius_km,
    value_multiplier: point.value_multiplier,
    created_at: new Date().toISOString(),
  }
}

/**
 * Get the default Marrakech 2030 infrastructure points
 */
export function getDefaultInfrastructure(): InfrastructurePoint[] {
  return [
    {
      id: 'tgv-marrakech',
      name: 'Gare LGV Marrakech',
      category: 'tgv_station',
      description: 'High-speed rail station connecting to Casablanca and Tangier',
      gps_latitude: 31.6295,
      gps_longitude: -8.0089,
      completion_year: 2027,
      is_operational: false,
      impact_radius_km: 5.0,
      value_multiplier: 1.25,
      created_at: new Date().toISOString(),
    },
    {
      id: 'grand-stade',
      name: 'Grand Stade de Marrakech',
      category: 'stadium',
      description: 'World Cup 2030 stadium with 65,000 capacity',
      gps_latitude: 31.5847,
      gps_longitude: -8.0756,
      completion_year: 2029,
      is_operational: false,
      impact_radius_km: 8.0,
      value_multiplier: 1.40,
      created_at: new Date().toISOString(),
    },
    {
      id: 'autoroute-agadir',
      name: 'Autoroute Marrakech-Agadir Extension',
      category: 'highway',
      description: 'Extended highway connection to southern coast',
      gps_latitude: 31.5500,
      gps_longitude: -8.2000,
      completion_year: 2028,
      is_operational: false,
      impact_radius_km: 3.0,
      value_multiplier: 1.15,
      created_at: new Date().toISOString(),
    },
    {
      id: 'menara-airport',
      name: 'Aéroport Marrakech Menara',
      category: 'airport',
      description: 'International airport with expanding terminal',
      gps_latitude: 31.6069,
      gps_longitude: -8.0363,
      completion_year: 2020,
      is_operational: true,
      impact_radius_km: 10.0,
      value_multiplier: 1.10,
      created_at: new Date().toISOString(),
    },
    {
      id: 'sidi-ghanem',
      name: 'Zone Industrielle Sidi Ghanem',
      category: 'industrial_zone',
      description: 'Industrial and artisan zone',
      gps_latitude: 31.6650,
      gps_longitude: -8.0200,
      completion_year: 2010,
      is_operational: true,
      impact_radius_km: 2.0,
      value_multiplier: 0.95,
      created_at: new Date().toISOString(),
    },
  ]
}
