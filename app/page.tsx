import Link from 'next/link'
import { ArrowRight, Terminal, Zap, Shield, Eye } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen grid-lines">
      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-400 font-mono">TIFORT-CORE v1.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white mb-6">
            Forensic
            <br />
            <span className="text-emerald-500">Real Estate</span>
          </h1>

          <p className="text-xl text-zinc-400 mb-12 max-w-xl mx-auto">
            Proprietary data on Moroccan property. Find the Alpha Gap between
            market price and zoning potential.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="btn-primary">
              <Terminal className="w-4 h-4 mr-2" />
              Open Dashboard
            </Link>
            <Link href="/audit" className="btn-secondary">
              <Zap className="w-4 h-4 mr-2" />
              Street Audit
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card p-8">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-3">Alpha Gap</h3>
              <p className="text-sm text-zinc-400">
                Find land zoned for 15 apartments being sold at villa prices.
                The arbitrage is in the coefficients.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-3">Legal Risk</h3>
              <p className="text-sm text-zinc-400">
                Heir count, Melkia status, missing documents.
                Know the blockers before you waste time.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-3">SHS Score</h3>
              <p className="text-sm text-zinc-400">
                Structural Health Score. Seismic chaining, humidity,
                foundation depth. The forensic truth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terminal CTA */}
      <section className="py-24 px-6 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card p-8 border-zinc-700">
            <pre className="text-left text-sm font-mono text-zinc-400 mb-6">
              <code>
{`$ tifort audit --type=land
> Location: Targa Nord
> Terrain: 5,000m²
> Market Price: 3,500,000 MAD
> Zoning: GH2 (Multi-unit)
> Alpha Gap: +142%
> Risk Grade: A

[✓] High Alpha Opportunity Detected`}
              </code>
            </pre>
            <Link href="/audit" className="btn-emerald w-full justify-center">
              Start Auditing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-mono text-sm text-zinc-500">TIFORT</span>
          <span className="text-xs text-zinc-600">Marrakech, Morocco</span>
        </div>
      </footer>
    </main>
  )
}
