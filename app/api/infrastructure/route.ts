import { NextRequest, NextResponse } from 'next/server'
import {
  getAllInfrastructure,
  getDefaultInfrastructure,
  addInfrastructurePoint,
} from '@/lib/sheets'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const useDefault = searchParams.get('default') === 'true'

    // If no Google Sheets configured or requesting defaults, return hardcoded data
    if (useDefault || !process.env.GOOGLE_SPREADSHEET_ID) {
      const infrastructure = getDefaultInfrastructure()
      return NextResponse.json({ infrastructure, count: infrastructure.length })
    }

    const infrastructure = await getAllInfrastructure()

    // If sheet is empty, return defaults
    if (infrastructure.length === 0) {
      const defaults = getDefaultInfrastructure()
      return NextResponse.json({ infrastructure: defaults, count: defaults.length })
    }

    return NextResponse.json({ infrastructure, count: infrastructure.length })
  } catch (error) {
    console.error('Error fetching infrastructure:', error)
    // Fallback to defaults on error
    const infrastructure = getDefaultInfrastructure()
    return NextResponse.json({ infrastructure, count: infrastructure.length })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const point = await addInfrastructurePoint(body)

    return NextResponse.json({ point }, { status: 201 })
  } catch (error) {
    console.error('Error creating infrastructure point:', error)
    return NextResponse.json(
      { error: 'Failed to create infrastructure point' },
      { status: 500 }
    )
  }
}
