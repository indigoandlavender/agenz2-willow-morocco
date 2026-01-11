'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import {
  MapPin,
  Building2,
  Users,
  FileText,
  Send,
  CheckCircle,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from 'lucide-react'

const auditSchema = z.object({
  asset_type: z.enum(['Land', 'Melkia', 'Villa', 'Apartment']),
  address: z.string().min(5, 'Address required'),
  neighborhood: z.string().min(2, 'Neighborhood required'),
  gps_lat: z.number().min(-90).max(90),
  gps_lng: z.number().min(-180).max(180),
  terrain_m2: z.number().positive('Enter terrain size'),
  built_m2: z.number().min(0),
  asking_price: z.number().positive('Enter asking price'),
  shs_score: z.number().min(1).max(10),
  heir_count: z.number().min(0).max(20),
  legal_notes: z.string(),
})

type AuditForm = z.infer<typeof auditSchema>

export default function AuditPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AuditForm>({
    resolver: zodResolver(auditSchema),
    defaultValues: {
      asset_type: 'Land',
      gps_lat: 31.6295,
      gps_lng: -8.0089,
      terrain_m2: 0,
      built_m2: 0,
      asking_price: 0,
      shs_score: 5,
      heir_count: 0,
      legal_notes: '',
    },
  })

  const assetType = watch('asset_type')
  const shsScore = watch('shs_score')
  const heirCount = watch('heir_count')

  const onSubmit = async (data: AuditForm) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to submit audit')
      }

      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('gps_lat', position.coords.latitude)
          setValue('gps_lng', position.coords.longitude)
        },
        (error) => {
          console.error('Geolocation error:', error)
        }
      )
    }
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="card p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="heading-2 mb-4">Audit Submitted</h2>
          <p className="text-zinc-400 mb-8">
            Property added to your database. View it in the dashboard.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard" className="btn-primary justify-center">
              View Dashboard
            </Link>
            <button
              onClick={() => {
                setIsSuccess(false)
                setError(null)
              }}
              className="btn-secondary justify-center"
            >
              Add Another
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6 pb-24">
      {/* Header */}
      <div className="max-w-lg mx-auto mb-8">
        <Link href="/" className="btn-ghost mb-6 -ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
        <h1 className="heading-2 mb-2">Street Audit</h1>
        <p className="text-zinc-400">
          Submit property data from the field
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto space-y-6">
        {/* Asset Type */}
        <div>
          <label className="input-label">Asset Type</label>
          <div className="grid grid-cols-4 gap-2">
            {(['Land', 'Melkia', 'Villa', 'Apartment'] as const).map(type => (
              <label
                key={type}
                className={cn(
                  'flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all',
                  assetType === type
                    ? 'border-white bg-zinc-800'
                    : 'border-zinc-700 hover:border-zinc-600'
                )}
              >
                <input
                  type="radio"
                  value={type}
                  {...register('asset_type')}
                  className="sr-only"
                />
                <Building2 className={cn(
                  'w-5 h-5 mb-1',
                  assetType === type ? 'text-white' : 'text-zinc-500'
                )} />
                <span className={cn(
                  'text-xs',
                  assetType === type ? 'text-white' : 'text-zinc-500'
                )}>
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <div>
            <label className="input-label">Address</label>
            <input
              {...register('address')}
              className={cn('input', errors.address && 'input-error')}
              placeholder="Street, number, building..."
            />
          </div>

          <div>
            <label className="input-label">Neighborhood</label>
            <select {...register('neighborhood')} className="select">
              <option value="">Select area</option>
              <option value="Targa">Targa</option>
              <option value="Palmeraie">Palmeraie</option>
              <option value="Gueliz">Guéliz</option>
              <option value="Hivernage">Hivernage</option>
              <option value="Medina">Medina</option>
              <option value="Agdal">Agdal</option>
              <option value="Route de Fes">Route de Fes</option>
              <option value="Route de Casablanca">Route de Casablanca</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Latitude</label>
              <input
                type="number"
                step="any"
                {...register('gps_lat', { valueAsNumber: true })}
                className="input font-mono text-sm"
              />
            </div>
            <div>
              <label className="input-label">Longitude</label>
              <input
                type="number"
                step="any"
                {...register('gps_lng', { valueAsNumber: true })}
                className="input font-mono text-sm"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={getLocation}
            className="btn-ghost text-sm w-full justify-center"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Use Current Location
          </button>
        </div>

        {/* Size & Price */}
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Terrain (m²)</label>
              <input
                type="number"
                {...register('terrain_m2', { valueAsNumber: true })}
                className={cn('input font-mono', errors.terrain_m2 && 'input-error')}
                placeholder="1000"
              />
            </div>
            <div>
              <label className="input-label">Built (m²)</label>
              <input
                type="number"
                {...register('built_m2', { valueAsNumber: true })}
                className="input font-mono"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Asking Price (MAD)</label>
            <input
              type="number"
              {...register('asking_price', { valueAsNumber: true })}
              className={cn('input font-mono', errors.asking_price && 'input-error')}
              placeholder="2,500,000"
            />
          </div>
        </div>

        {/* Structural Health Score */}
        <div className="pt-4 border-t border-zinc-800">
          <label className="input-label flex items-center justify-between">
            <span>SHS Score (1-10)</span>
            <span className={cn(
              'font-mono font-bold',
              shsScore >= 7 ? 'text-emerald-500' :
              shsScore >= 4 ? 'text-amber-500' : 'text-red-500'
            )}>
              {shsScore}
            </span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            {...register('shs_score', { valueAsNumber: true })}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>Critical</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* Legal Risk */}
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <div>
            <label className="input-label flex items-center gap-2">
              <Users className="w-4 h-4" />
              Heir Count
              {heirCount > 2 && (
                <span className="badge-amber text-xs ml-auto">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  High Risk
                </span>
              )}
            </label>
            <input
              type="number"
              min="0"
              max="20"
              {...register('heir_count', { valueAsNumber: true })}
              className="input font-mono"
              placeholder="0"
            />
          </div>

          <div>
            <label className="input-label flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Legal Notes
            </label>
            <textarea
              {...register('legal_notes')}
              className="input min-h-[100px]"
              placeholder="Melkia status, missing docs, disputes..."
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-emerald w-full justify-center py-4"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Submit Audit
            </>
          )}
        </button>
      </form>
    </main>
  )
}
