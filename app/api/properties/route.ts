import { NextRequest, NextResponse } from 'next/server'
import {
  getAllProperties,
  searchProperties,
  createProperty,
} from '@/lib/sheets'
import type { AssetType, RiskGrade, ZoningCode } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Check for filters
    const assetTypes = searchParams.get('asset_types')?.split(',') as AssetType[] | undefined
    const riskGrades = searchParams.get('risk_grades')?.split(',') as RiskGrade[] | undefined
    const zoningCodes = searchParams.get('zoning_codes')?.split(',') as ZoningCode[] | undefined
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const onlyVerified = searchParams.get('only_verified') === 'true'
    const onlyAlpha = searchParams.get('only_alpha') === 'true'
    const city = searchParams.get('city')
    const neighborhood = searchParams.get('neighborhood')

    const hasFilters = assetTypes || riskGrades || zoningCodes || minPrice || maxPrice || onlyVerified || onlyAlpha || city || neighborhood

    let properties

    if (hasFilters) {
      properties = await searchProperties({
        asset_types: assetTypes,
        risk_grades: riskGrades,
        zoning_codes: zoningCodes,
        min_price: minPrice ? parseFloat(minPrice) : undefined,
        max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        only_verified: onlyVerified,
        only_alpha: onlyAlpha,
        city: city || undefined,
        neighborhood: neighborhood || undefined,
      })
    } else {
      properties = await getAllProperties()
    }

    return NextResponse.json({ properties, count: properties.length })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const property = await createProperty(body)

    return NextResponse.json({ property }, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}
