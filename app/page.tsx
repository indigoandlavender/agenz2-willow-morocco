import Link from 'next/link'
import { ArrowRight, Shield, Zap, MapPin, BarChart3, FileCheck, Target } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 grid-pattern opacity-30" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <p className="caption text-primary-500 mb-6">
            Institutional Real Estate Intelligence
          </p>

          <h1 className="heading-display text-primary-900 mb-6">
            Beyond Probability.
            <br />
            <span className="text-accent-gold">Forensic Certainty.</span>
          </h1>

          <p className="body-large text-primary-600 max-w-2xl mx-auto mb-12">
            The only platform that provides verified valuations, legal compliance,
            and infrastructure proximity analysis for the Moroccan market.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/properties" className="btn-primary">
              Explore Properties
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              View Dashboard
            </Link>
          </div>

          <div className="mt-16 pt-16 border-t border-primary-100">
            <p className="caption text-primary-400 mb-6">Powered by</p>
            <div className="flex items-center justify-center gap-12 text-primary-300">
              <span className="text-lg font-medium">Marrakech 2026</span>
              <span className="text-lg font-medium">RPS 2011/2026</span>
              <span className="text-lg font-medium">World Cup 2030</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="heading-1 text-primary-900 mb-4">
              The Arbitrage Others Miss
            </h2>
            <p className="body-large text-primary-600 max-w-2xl mx-auto">
              Agenz provides probability. We provide verification.
              Every data point validated, every risk quantified.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Forensic Valuation */}
            <div className="card p-8">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-primary-900" />
              </div>
              <h3 className="heading-3 mb-3">Forensic Valuation</h3>
              <p className="text-primary-600">
                Our algorithm factors seismic compliance, structural health,
                and zoning potential to reveal true market value.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-primary-500">
                <li>• 15% penalty for pre-2023 seismic gaps</li>
                <li>• CES/COS coefficient analysis</li>
                <li>• Structural Health Score (SHS)</li>
              </ul>
            </div>

            {/* Alpha Finder */}
            <div className="card p-8 border-accent-gold/20 bg-gradient-to-br from-amber-50/50 to-white">
              <div className="w-12 h-12 rounded-xl bg-accent-gold/10 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-accent-gold" />
              </div>
              <h3 className="heading-3 mb-3">Alpha Finder</h3>
              <p className="text-primary-600">
                Identify land zoned for apartments being sold at villa prices.
                The arbitrage institutional developers exploit.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-primary-500">
                <li>• GH2 potential on SD1 pricing</li>
                <li>• Multi-unit capacity analysis</li>
                <li>• Development ROI modeling</li>
              </ul>
            </div>

            {/* 2030 Shield */}
            <div className="card p-8">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-primary-900" />
              </div>
              <h3 className="heading-3 mb-3">2030 Shield</h3>
              <p className="text-primary-600">
                Infrastructure proximity scoring for TGV, Grand Stade,
                and highway access. The 2030 front-row seat.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-primary-500">
                <li>• World Cup proximity premium</li>
                <li>• CAN 2025 rental yield</li>
                <li>• TGV station value multiplier</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Compliance */}
      <section className="py-24 bg-primary-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="caption text-accent-gold mb-4">Legal Compliance</p>
              <h2 className="heading-1 text-primary-900 mb-6">
                2026 Regulatory Framework
              </h2>
              <p className="body-large text-primary-600 mb-8">
                Every property validated against current Moroccan law.
                Bill 34.21, VNA requirements, and tax compliance automated.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <FileCheck className="w-4 h-4 text-primary-900" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Forensic Seven Vault</h4>
                    <p className="text-sm text-primary-500">
                      All critical documents verified: Certificat de Propriété,
                      Note de Renseignement, Quitus Fiscal, and more.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-primary-900" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Tax Gate</h4>
                    <p className="text-sm text-primary-500">
                      QR-verified Quitus Fiscal required. Missing documentation
                      flagged as high transaction risk.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-primary-900" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">VNA Automation</h4>
                    <p className="text-sm text-primary-500">
                      Foreign acquisition timeline and budget calculated.
                      12-month delay + 200K MAD for rural villas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-8">
              <h4 className="font-medium mb-6">Risk Grade Distribution</h4>
              <div className="space-y-4">
                {[
                  { grade: 'A', label: 'Investment Grade', color: 'bg-risk-A', width: '15%' },
                  { grade: 'B', label: 'Low Risk', color: 'bg-risk-B', width: '25%' },
                  { grade: 'C', label: 'Moderate Risk', color: 'bg-risk-C', width: '35%' },
                  { grade: 'D', label: 'Elevated Risk', color: 'bg-risk-D', width: '15%' },
                  { grade: 'E', label: 'High Risk', color: 'bg-risk-E', width: '7%' },
                  { grade: 'F', label: 'Speculative', color: 'bg-risk-F', width: '3%' },
                ].map(item => (
                  <div key={item.grade}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Grade {item.grade}</span>
                      <span className="text-primary-500">{item.label}</span>
                    </div>
                    <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: item.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="heading-1 text-white mb-6">
            Start Finding Alpha
          </h2>
          <p className="body-large text-primary-300 mb-12 max-w-2xl mx-auto">
            Join institutional investors who use forensic data to find
            the deals invisible to the market.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/properties" className="btn-accent">
              Browse Properties
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/audit" className="btn bg-white/10 text-white hover:bg-white/20 px-6 py-3">
              Submit Property for Audit
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-primary-950 text-primary-400">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-display text-xl text-white mb-1">TIFORT-CORE</p>
              <p className="text-sm">Forensic Real Estate Intelligence</p>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <Link href="/properties" className="hover:text-white transition">
                Properties
              </Link>
              <Link href="/dashboard" className="hover:text-white transition">
                Dashboard
              </Link>
              <Link href="/audit" className="hover:text-white transition">
                Audit
              </Link>
            </div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} TIFORT. Marrakech, Morocco.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
