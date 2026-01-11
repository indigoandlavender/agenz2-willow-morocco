'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils/cn'
import {
  Building2,
  MapPin,
  Ruler,
  Calendar,
  Shield,
  Droplets,
  Home,
  FileCheck,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  X
} from 'lucide-react'

// Validation Schema
const forensicAuditSchema = z.object({
  // Step 1: Basic Info
  title: z.string().min(5, 'Title must be at least 5 characters'),
  asset_type: z.enum(['Apartment', 'Villa', 'Land']),
  address: z.string().min(10, 'Please enter a complete address'),
  neighborhood: z.string().min(2, 'Neighborhood is required'),
  gps_latitude: z.number().min(-90).max(90),
  gps_longitude: z.number().min(-180).max(180),

  // Step 2: Property Metrics
  terrain_size_m2: z.number().positive('Must be positive'),
  built_size_m2: z.number().positive().optional(),
  floors: z.number().int().min(0).max(50).optional(),
  rooms: z.number().int().min(0).max(100).optional(),
  bathrooms: z.number().int().min(0).max(50).optional(),
  year_built: z.number().int().min(1900).max(new Date().getFullYear()).optional(),

  // Step 3: Structural Health
  seismic_chaining: z.boolean().nullable(),
  rps_2011_compliant: z.boolean(),
  rps_2026_compliant: z.boolean(),
  humidity_score: z.number().min(0).max(10).nullable(),
  foundation_depth_m: z.number().positive().nullable(),
  roof_life_years: z.number().int().min(0).max(100).nullable(),

  // Step 4: Zoning & Pricing
  zoning_code: z.enum(['SD1', 'GH2', 'SA1', 'S1', 'ZI', 'ZA']).optional(),
  market_price: z.number().positive('Market price is required'),
  source_url: z.string().url().optional().or(z.literal('')),

  // Step 5: Compliance
  quitus_fiscal_present: z.boolean(),
  quitus_qr_verified: z.boolean(),
  vna_required: z.boolean(),
  bill_34_21_applicable: z.boolean(),
  construction_started: z.boolean().optional(),

  // Step 6: Documents
  documents: z.array(z.object({
    type: z.string(),
    file: z.any().optional(),
    uploaded: z.boolean()
  })).optional(),

  audit_notes: z.string().optional(),
})

type ForensicAuditData = z.infer<typeof forensicAuditSchema>

interface ForensicAuditFormProps {
  onSubmit: (data: ForensicAuditData) => Promise<void>
  initialData?: Partial<ForensicAuditData>
}

const STEPS = [
  { id: 1, title: 'Location', icon: MapPin },
  { id: 2, title: 'Metrics', icon: Ruler },
  { id: 3, title: 'Structure', icon: Building2 },
  { id: 4, title: 'Valuation', icon: Home },
  { id: 5, title: 'Compliance', icon: Shield },
  { id: 6, title: 'Documents', icon: FileCheck },
]

const DOCUMENT_TYPES = [
  { key: 'certificat_propriete', label: 'Certificat de Propriété', required: true },
  { key: 'note_renseignement', label: 'Note de Renseignement', required: true },
  { key: 'quitus_fiscal', label: 'Quitus Fiscal', required: true },
  { key: 'plan_cadastral', label: 'Plan Cadastral', required: true },
  { key: 'certificat_conformite', label: 'Certificat de Conformité', required: false },
  { key: 'vna', label: 'VNA Authorization', required: false },
  { key: 'tnb_tax', label: 'TNB Tax Receipt', required: false },
]

export function ForensicAuditForm({ onSubmit, initialData }: ForensicAuditFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File>>({})

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<ForensicAuditData>({
    resolver: zodResolver(forensicAuditSchema),
    defaultValues: {
      asset_type: 'Apartment',
      rps_2011_compliant: false,
      rps_2026_compliant: false,
      quitus_fiscal_present: false,
      quitus_qr_verified: false,
      vna_required: false,
      bill_34_21_applicable: false,
      ...initialData,
    },
  })

  const assetType = watch('asset_type')
  const vnaRequired = watch('vna_required')
  const bill3421Applicable = watch('bill_34_21_applicable')

  const validateStep = async () => {
    const fieldsToValidate: (keyof ForensicAuditData)[][] = [
      ['title', 'asset_type', 'address', 'neighborhood', 'gps_latitude', 'gps_longitude'],
      ['terrain_size_m2', 'built_size_m2', 'year_built'],
      ['seismic_chaining', 'humidity_score'],
      ['zoning_code', 'market_price'],
      ['quitus_fiscal_present', 'vna_required'],
      [],
    ]

    const fields = fieldsToValidate[currentStep - 1]
    const isValid = await trigger(fields)
    return isValid
  }

  const nextStep = async () => {
    const isValid = await validateStep()
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleFormSubmit = async (data: ForensicAuditData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (docType: string, file: File) => {
    setUploadedDocs(prev => ({ ...prev, [docType]: file }))
  }

  const removeFile = (docType: string) => {
    setUploadedDocs(prev => {
      const updated = { ...prev }
      delete updated[docType]
      return updated
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Steps - Mobile Optimized */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2 scrollbar-thin">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <div
                key={step.id}
                className={cn(
                  'flex flex-col items-center min-w-[60px]',
                  index < STEPS.length - 1 && 'flex-1'
                )}
              >
                <div className="flex items-center w-full">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                      isActive && 'bg-primary-900 text-white',
                      isCompleted && 'bg-forensic-verified text-white',
                      !isActive && !isCompleted && 'bg-primary-100 text-primary-400'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-2',
                        isCompleted ? 'bg-forensic-verified' : 'bg-primary-100'
                      )}
                    />
                  )}
                </div>
                <span className={cn(
                  'text-xs mt-2 whitespace-nowrap',
                  isActive ? 'text-primary-900 font-medium' : 'text-primary-400'
                )}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="card p-6 md:p-8">
          {/* Step 1: Location */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in">
              <h2 className="heading-3">Property Location</h2>

              <div>
                <label className="input-label">Property Title</label>
                <input
                  {...register('title')}
                  className={cn('input', errors.title && 'input-error')}
                  placeholder="e.g., Modern Villa in Palmeraie"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="input-label">Asset Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Apartment', 'Villa', 'Land'] as const).map(type => (
                    <label
                      key={type}
                      className={cn(
                        'flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all',
                        assetType === type
                          ? 'border-primary-900 bg-primary-50'
                          : 'border-primary-100 hover:border-primary-300'
                      )}
                    >
                      <input
                        type="radio"
                        value={type}
                        {...register('asset_type')}
                        className="sr-only"
                      />
                      <Building2 className={cn(
                        'w-6 h-6 mb-2',
                        assetType === type ? 'text-primary-900' : 'text-primary-400'
                      )} />
                      <span className={cn(
                        'text-sm font-medium',
                        assetType === type ? 'text-primary-900' : 'text-primary-600'
                      )}>
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="input-label">Full Address</label>
                <textarea
                  {...register('address')}
                  className={cn('input min-h-[80px]', errors.address && 'input-error')}
                  placeholder="Street, number, building name..."
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="input-label">Neighborhood</label>
                <select {...register('neighborhood')} className="select">
                  <option value="">Select neighborhood</option>
                  <option value="hivernage">Hivernage</option>
                  <option value="gueliz">Guéliz</option>
                  <option value="medina">Medina</option>
                  <option value="palmeraie">Palmeraie</option>
                  <option value="targa">Targa</option>
                  <option value="mellah">Mellah</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    {...register('gps_latitude', { valueAsNumber: true })}
                    className={cn('input', errors.gps_latitude && 'input-error')}
                    placeholder="31.6295"
                  />
                </div>
                <div>
                  <label className="input-label">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    {...register('gps_longitude', { valueAsNumber: true })}
                    className={cn('input', errors.gps_longitude && 'input-error')}
                    placeholder="-8.0089"
                  />
                </div>
              </div>
              <p className="input-hint">
                Tip: Use Google Maps to get precise coordinates
              </p>
            </div>
          )}

          {/* Step 2: Property Metrics */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in">
              <h2 className="heading-3">Property Metrics</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Terrain Size (m²)</label>
                  <input
                    type="number"
                    {...register('terrain_size_m2', { valueAsNumber: true })}
                    className={cn('input', errors.terrain_size_m2 && 'input-error')}
                    placeholder="1000"
                  />
                </div>
                {assetType !== 'Land' && (
                  <div>
                    <label className="input-label">Built Size (m²)</label>
                    <input
                      type="number"
                      {...register('built_size_m2', { valueAsNumber: true })}
                      className="input"
                      placeholder="250"
                    />
                  </div>
                )}
              </div>

              {assetType !== 'Land' && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="input-label">Floors</label>
                      <input
                        type="number"
                        {...register('floors', { valueAsNumber: true })}
                        className="input"
                        placeholder="2"
                      />
                    </div>
                    <div>
                      <label className="input-label">Rooms</label>
                      <input
                        type="number"
                        {...register('rooms', { valueAsNumber: true })}
                        className="input"
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <label className="input-label">Bathrooms</label>
                      <input
                        type="number"
                        {...register('bathrooms', { valueAsNumber: true })}
                        className="input"
                        placeholder="3"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Year Built</label>
                    <input
                      type="number"
                      {...register('year_built', { valueAsNumber: true })}
                      className="input"
                      placeholder="2020"
                    />
                    <p className="input-hint">
                      Buildings before 2023 without seismic chaining receive a 15% penalty
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Structural Health */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in">
              <h2 className="heading-3">Structural Health Score (SHS)</h2>

              {assetType !== 'Land' ? (
                <>
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800">RPS 2011/2026 Compliance</p>
                        <p className="text-sm text-amber-700 mt-1">
                          Buildings pre-2023 without seismic chaining lose 15% value
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Seismic Chaining Present?</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'true', label: 'Yes' },
                        { value: 'false', label: 'No' },
                        { value: 'null', label: 'Unknown' },
                      ].map(option => (
                        <label
                          key={option.value}
                          className={cn(
                            'flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all',
                            watch('seismic_chaining')?.toString() === option.value
                              ? 'border-primary-900 bg-primary-50'
                              : 'border-primary-100 hover:border-primary-300'
                          )}
                        >
                          <Controller
                            name="seismic_chaining"
                            control={control}
                            render={({ field }) => (
                              <input
                                type="radio"
                                className="sr-only"
                                checked={field.value?.toString() === option.value}
                                onChange={() => {
                                  const val = option.value === 'null' ? null : option.value === 'true'
                                  field.onChange(val)
                                }}
                              />
                            )}
                          />
                          <span className="text-sm font-medium">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-4 rounded-xl border border-primary-100">
                      <input
                        type="checkbox"
                        {...register('rps_2011_compliant')}
                        className="w-5 h-5 rounded border-primary-300"
                      />
                      <span className="text-sm">RPS 2011 Compliant</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 rounded-xl border border-primary-100">
                      <input
                        type="checkbox"
                        {...register('rps_2026_compliant')}
                        className="w-5 h-5 rounded border-primary-300"
                      />
                      <span className="text-sm">RPS 2026 Compliant</span>
                    </label>
                  </div>

                  <div>
                    <label className="input-label">
                      <Droplets className="w-4 h-4 inline mr-2" />
                      Humidity Score (0-10)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      {...register('humidity_score', { valueAsNumber: true })}
                      className="input"
                      placeholder="5"
                    />
                    <p className="input-hint">0 = Bone dry, 10 = Severe moisture issues</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Foundation Depth (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        {...register('foundation_depth_m', { valueAsNumber: true })}
                        className="input"
                        placeholder="2.0"
                      />
                    </div>
                    <div>
                      <label className="input-label">Roof Life (years)</label>
                      <input
                        type="number"
                        {...register('roof_life_years', { valueAsNumber: true })}
                        className="input"
                        placeholder="15"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-primary-500">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Structural health assessment not applicable for land</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Valuation */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in">
              <h2 className="heading-3">Zoning & Valuation</h2>

              <div>
                <label className="input-label">Zoning Code (Marrakech 2026)</label>
                <select {...register('zoning_code')} className="select">
                  <option value="">Select zoning</option>
                  <option value="SD1">SD1 - Villas (Min 1,000m² | COS 0.07)</option>
                  <option value="GH2">GH2 - Apartments (Min 250m² | Multi-unit)</option>
                  <option value="SA1">SA1 - Tourism/Mixed (High-density)</option>
                  <option value="S1">S1 - Tourism Zone</option>
                  <option value="ZI">ZI - Industrial</option>
                  <option value="ZA">ZA - Agricultural (Restricted)</option>
                </select>
              </div>

              <div className="p-4 bg-primary-50 rounded-xl">
                <h4 className="font-medium mb-2">Alpha Finder</h4>
                <p className="text-sm text-primary-600">
                  The algorithm will compare the asking price against the zoning potential.
                  Land zoned GH2 (apartments) sold at SD1 (villa) prices represents hidden value.
                </p>
              </div>

              <div>
                <label className="input-label">Market Price (MAD)</label>
                <input
                  type="number"
                  {...register('market_price', { valueAsNumber: true })}
                  className={cn('input font-mono', errors.market_price && 'input-error')}
                  placeholder="2,500,000"
                />
                {errors.market_price && (
                  <p className="text-red-500 text-sm mt-1">{errors.market_price.message}</p>
                )}
              </div>

              <div>
                <label className="input-label">Source URL (optional)</label>
                <input
                  {...register('source_url')}
                  className="input"
                  placeholder="https://agenz.ma/property/..."
                />
                <p className="input-hint">Link to original listing for reference</p>
              </div>
            </div>
          )}

          {/* Step 5: Compliance */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in">
              <h2 className="heading-3">2026 Legal Compliance</h2>

              {/* Tax Gate */}
              <div className="p-4 rounded-xl border border-primary-200">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Tax Gate Check
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      {...register('quitus_fiscal_present')}
                      className="w-5 h-5 rounded border-primary-300"
                    />
                    <span className="text-sm">Quitus Fiscal document present</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      {...register('quitus_qr_verified')}
                      className="w-5 h-5 rounded border-primary-300"
                    />
                    <span className="text-sm">QR code digitally verified</span>
                  </label>
                </div>
                {!watch('quitus_fiscal_present') && (
                  <p className="text-sm text-amber-600 mt-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Missing Quitus = High Transaction Risk flag
                  </p>
                )}
              </div>

              {/* VNA Check */}
              <div className="p-4 rounded-xl border border-primary-200">
                <h4 className="font-medium mb-3">VNA Requirement (Foreign Buyers)</h4>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register('vna_required')}
                    className="w-5 h-5 rounded border-primary-300"
                  />
                  <span className="text-sm">VNA required for this property</span>
                </label>
                {vnaRequired && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>VNA Impact:</strong> 12-month delay + 200,000 MAD budget
                      for rural villa acquisitions by foreign entities
                    </p>
                  </div>
                )}
              </div>

              {/* Bill 34.21 */}
              {assetType === 'Land' && (
                <div className="p-4 rounded-xl border border-primary-200">
                  <h4 className="font-medium mb-3">Bill 34.21 Check</h4>
                  <label className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      {...register('bill_34_21_applicable')}
                      className="w-5 h-5 rounded border-primary-300"
                    />
                    <span className="text-sm">5-year infrastructure deadline applies</span>
                  </label>
                  {bill3421Applicable && (
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        {...register('construction_started')}
                        className="w-5 h-5 rounded border-primary-300"
                      />
                      <span className="text-sm">Construction has started</span>
                    </label>
                  )}
                </div>
              )}

              <div>
                <label className="input-label">Audit Notes</label>
                <textarea
                  {...register('audit_notes')}
                  className="input min-h-[100px]"
                  placeholder="Additional observations, red flags, or special conditions..."
                />
              </div>
            </div>
          )}

          {/* Step 6: Documents */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in">
              <h2 className="heading-3">Forensic Seven Vault</h2>
              <p className="text-sm text-primary-600 mb-6">
                Upload the essential documents for complete verification
              </p>

              <div className="space-y-3">
                {DOCUMENT_TYPES.map(doc => (
                  <div
                    key={doc.key}
                    className="flex items-center justify-between p-4 rounded-xl border border-primary-100"
                  >
                    <div className="flex items-center gap-3">
                      <FileCheck className={cn(
                        'w-5 h-5',
                        uploadedDocs[doc.key] ? 'text-forensic-verified' : 'text-primary-300'
                      )} />
                      <div>
                        <p className="text-sm font-medium">{doc.label}</p>
                        {doc.required && (
                          <span className="text-xs text-amber-600">Required</span>
                        )}
                        {uploadedDocs[doc.key] && (
                          <p className="text-xs text-primary-500 truncate max-w-[150px]">
                            {uploadedDocs[doc.key].name}
                          </p>
                        )}
                      </div>
                    </div>
                    {uploadedDocs[doc.key] ? (
                      <button
                        type="button"
                        onClick={() => removeFile(doc.key)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <label className="btn-ghost text-sm cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(doc.key, file)
                          }}
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-primary-50 rounded-xl">
                <p className="text-sm text-primary-600">
                  Documents will be stored securely in the Supabase vault.
                  PDF files with QR codes will be automatically verified.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-primary-100">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={cn(
                'btn-secondary',
                currentStep === 1 && 'opacity-50 cursor-not-allowed'
              )}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-accent"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Submit Audit
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
