import { NextResponse } from 'next/server'
import { getDashboardStats, getAlphaOpportunities } from '@/lib/sheets'

export async function GET() {
  try {
    // Check if Google Sheets is configured
    if (!process.env.GOOGLE_SPREADSHEET_ID) {
      // Return mock stats for demo
      return NextResponse.json({
        stats: {
          total_properties: 5,
          verified_properties: 3,
          total_alpha_value: 8200000,
          average_cap_rate: 5.4,
          properties_by_risk: { A: 1, B: 2, C: 1, D: 1, E: 0, F: 0 },
          properties_by_type: { Apartment: 1, Villa: 2, Land: 2 },
        },
        alpha_opportunities: [],
      })
    }

    const [stats, alphaOpportunities] = await Promise.all([
      getDashboardStats(),
      getAlphaOpportunities(20),
    ])

    return NextResponse.json({
      stats,
      alpha_opportunities: alphaOpportunities.slice(0, 10),
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
