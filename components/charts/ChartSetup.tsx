'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Default chart options for Swiss minimalist aesthetic
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#121212',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#333333',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      titleFont: {
        family: 'Inter',
        size: 12,
        weight: '600' as const,
      },
      bodyFont: {
        family: 'Inter',
        size: 12,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: 'Inter',
          size: 11,
        },
        color: '#666666',
      },
    },
    y: {
      grid: {
        color: '#f0f0f0',
      },
      ticks: {
        font: {
          family: 'Inter',
          size: 11,
        },
        color: '#666666',
      },
    },
  },
}

// Color palette
export const chartColors = {
  primary: '#121212',
  accent: '#B8860B',
  positive: '#22c55e',
  negative: '#ef4444',
  muted: '#666666',
  gradient: {
    start: 'rgba(18, 18, 18, 0.1)',
    end: 'rgba(18, 18, 18, 0)',
  },
  risk: {
    A: '#22c55e',
    B: '#84cc16',
    C: '#eab308',
    D: '#f97316',
    E: '#ef4444',
    F: '#991b1b',
  },
  assetTypes: {
    Apartment: '#3b82f6',
    Villa: '#8b5cf6',
    Land: '#f59e0b',
  },
}

export function ChartSetup() {
  return null
}
