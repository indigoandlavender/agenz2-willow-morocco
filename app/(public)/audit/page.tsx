'use client'

import { useState } from 'react'
import { ForensicAuditForm } from '@/components/forms/ForensicAuditForm'
import { Shield, FileCheck, Zap, AlertTriangle } from 'lucide-react'

export default function AuditPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (data: any) => {
    // In production, this would submit to Supabase
    console.log('Audit data:', data)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center p-6">
        <div className="card p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-forensic-verified/10 flex items-center justify-center mx-auto mb-6">
            <FileCheck className="w-8 h-8 text-forensic-verified" />
          </div>
          <h2 className="heading-2 mb-4">Audit Submitted</h2>
          <p className="text-primary-600 mb-8">
            Your property has been submitted for forensic analysis.
            You will receive a valuation report within 24-48 hours.
          </p>
          <div className="flex flex-col gap-3">
            <a href="/dashboard" className="btn-primary">
              View Dashboard
            </a>
            <button
              onClick={() => setSubmitted(false)}
              className="btn-secondary"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <header className="bg-white border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl text-primary-900">TIFORT-CORE</h1>
              <p className="text-sm text-primary-500">Forensic Audit</p>
            </div>
            <nav className="flex items-center gap-6">
              <a href="/" className="text-sm text-primary-600 hover:text-primary-900">Home</a>
              <a href="/properties" className="text-sm text-primary-600 hover:text-primary-900">Properties</a>
              <a href="/dashboard" className="text-sm text-primary-600 hover:text-primary-900">Dashboard</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Intro */}
        <div className="text-center mb-12">
          <h2 className="heading-1 text-primary-900 mb-4">
            Submit Property for Audit
          </h2>
          <p className="text-primary-600 max-w-2xl mx-auto">
            Our forensic analysis includes structural health assessment,
            legal compliance verification, and market value analysis.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card p-6">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-primary-700" />
            </div>
            <h4 className="font-medium mb-2">Structural Health</h4>
            <p className="text-sm text-primary-500">
              RPS 2011/2026 seismic compliance, humidity, foundation depth, and roof assessment.
            </p>
          </div>

          <div className="card p-6">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5 text-primary-700" />
            </div>
            <h4 className="font-medium mb-2">Legal Compliance</h4>
            <p className="text-sm text-primary-500">
              Bill 34.21, VNA requirements, Tax Gate verification, and document completeness.
            </p>
          </div>

          <div className="card p-6">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-primary-700" />
            </div>
            <h4 className="font-medium mb-2">Alpha Analysis</h4>
            <p className="text-sm text-primary-500">
              Zoning potential calculation, infrastructure proximity, and hidden value identification.
            </p>
          </div>
        </div>

        {/* Form */}
        <ForensicAuditForm onSubmit={handleSubmit} />
      </main>
    </div>
  )
}
