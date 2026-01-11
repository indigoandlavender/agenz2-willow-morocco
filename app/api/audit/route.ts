import { NextRequest, NextResponse } from 'next/server'
import { appendAudit } from '@/lib/google-sheets'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.asset_type || !body.address || !body.neighborhood) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const id = await appendAudit({
      asset_type: body.asset_type,
      address: body.address,
      neighborhood: body.neighborhood,
      gps_lat: body.gps_lat || 0,
      gps_lng: body.gps_lng || 0,
      terrain_m2: body.terrain_m2 || 0,
      built_m2: body.built_m2 || 0,
      asking_price: body.asking_price || 0,
      shs_score: body.shs_score || 5,
      heir_count: body.heir_count || 0,
      legal_notes: body.legal_notes || '',
    })

    return NextResponse.json({ success: true, id }, { status: 201 })
  } catch (error) {
    console.error('Audit submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit audit' },
      { status: 500 }
    )
  }
}
