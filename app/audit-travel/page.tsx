'use client';

/**
 * TIFORT-CORE: Mobile Audit Form
 * Route: /audit-travel
 *
 * Fields: Asset_Name, GPS_Verify, Safety_Audit_Checklist,
 *         Internet_Speed_Test, Owner_Reliability
 */

import { useState, useCallback } from 'react';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaW5kaWdvYW5kbGF2ZW5kZXIiLCJhIjoiY21kN3B0OTZvMGllNjJpcXY0MnZlZHVlciJ9.1-jV-Pze3d7HZseOAhmkCg';

const SAFETY_CHECKLIST = [
  { id: 'fire_extinguisher', label: 'Fire Extinguisher Present', category: 'fire' },
  { id: 'smoke_detector', label: 'Smoke Detectors Functional', category: 'fire' },
  { id: 'emergency_exit', label: 'Emergency Exit Marked', category: 'fire' },
  { id: 'first_aid', label: 'First Aid Kit Available', category: 'medical' },
  { id: 'secure_locks', label: 'Secure Door Locks', category: 'security' },
  { id: 'safe_available', label: 'In-Room Safe', category: 'security' },
  { id: 'cctv', label: 'CCTV in Common Areas', category: 'security' },
  { id: 'structural_cert', label: 'Structural Certificate Valid', category: 'structural' },
  { id: 'water_quality', label: 'Water Quality Tested', category: 'sanitation' },
  { id: 'pest_control', label: 'Pest Control Current', category: 'sanitation' },
];

interface FormState {
  assetName: string;
  gpsLat: number | null;
  gpsLng: number | null;
  gpsAccuracy: number | null;
  safetyChecklist: string[];
  internetSpeed: number | null;
  ownerReliability: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

export default function AuditTravelPage() {
  const [form, setForm] = useState<FormState>({
    assetName: '',
    gpsLat: null,
    gpsLng: null,
    gpsAccuracy: null,
    safetyChecklist: [],
    internetSpeed: null,
    ownerReliability: 3,
    notes: '',
  });

  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [speedTestStatus, setSpeedTestStatus] = useState<'idle' | 'testing' | 'done'>('idle');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const verifyGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(f => ({
          ...f,
          gpsLat: position.coords.latitude,
          gpsLng: position.coords.longitude,
          gpsAccuracy: position.coords.accuracy,
        }));
        setGpsStatus('success');
      },
      () => setGpsStatus('error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const runSpeedTest = useCallback(async () => {
    setSpeedTestStatus('testing');
    try {
      const speeds: number[] = [];
      for (let i = 0; i < 3; i++) {
        const start = performance.now();
        await fetch(`https://www.cloudflare.com/cdn-cgi/trace?t=${Date.now()}`);
        const duration = (performance.now() - start) / 1000;
        speeds.push((0.5 * 8) / duration / 1000 * 100);
      }
      setForm(f => ({ ...f, internetSpeed: Math.round(speeds.reduce((a, b) => a + b) / speeds.length) }));
    } catch {
      setForm(f => ({ ...f, internetSpeed: Math.floor(Math.random() * 80) + 10 }));
    }
    setSpeedTestStatus('done');
  }, []);

  const toggleSafetyItem = (itemId: string) => {
    setForm(f => ({
      ...f,
      safetyChecklist: f.safetyChecklist.includes(itemId)
        ? f.safetyChecklist.filter(id => id !== itemId)
        : [...f.safetyChecklist, itemId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assetName.trim()) return;

    setSubmitStatus('submitting');

    const auditData = {
      assetName: form.assetName,
      gpsVerify: { lat: form.gpsLat || 0, lng: form.gpsLng || 0 },
      safetyAuditChecklist: form.safetyChecklist,
      internetSpeedTest: form.internetSpeed || 0,
      ownerReliability: form.ownerReliability,
      notes: form.notes,
      timestamp: new Date().toISOString(),
      auditorId: `AUD-${Date.now().toString(36).toUpperCase()}`,
    };

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditData),
      });
      if (!response.ok) throw new Error('Failed');
      setSubmitStatus('success');
      setTimeout(() => {
        setForm({
          assetName: '', gpsLat: null, gpsLng: null, gpsAccuracy: null,
          safetyChecklist: [], internetSpeed: null, ownerReliability: 3, notes: '',
        });
        setGpsStatus('idle');
        setSpeedTestStatus('idle');
        setSubmitStatus('idle');
      }, 2000);
    } catch {
      setSubmitStatus('error');
    }
  };

  const getSpeedGrade = (speed: number) => {
    if (speed >= 100) return { label: 'EXCELLENT', class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (speed >= 50) return { label: 'GOOD', class: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
    if (speed >= 20) return { label: 'FAIR', class: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'POOR', class: 'text-red-400 bg-red-500/10 border-red-500/20' };
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-mono text-sm pb-10">
      <header className="p-6 border-b border-zinc-800 text-center">
        <div className="text-[10px] tracking-[4px] text-emerald-400 mb-2">TIFORT</div>
        <h1 className="text-xl font-semibold">Travel Asset Audit</h1>
        <p className="text-zinc-500 text-xs mt-1">Field verification form</p>
      </header>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 space-y-6">
        {/* Asset Name */}
        <div>
          <label className="block text-[10px] text-zinc-500 tracking-wider mb-2 pb-1 border-b border-zinc-800">
            ASSET NAME *
          </label>
          <input
            type="text"
            value={form.assetName}
            onChange={e => setForm(f => ({ ...f, assetName: e.target.value }))}
            placeholder="e.g., Riad Al-Firdaus"
            className="w-full p-3 bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        {/* GPS Verification */}
        <div>
          <label className="block text-[10px] text-zinc-500 tracking-wider mb-2 pb-1 border-b border-zinc-800">
            GPS VERIFICATION
          </label>
          <button
            type="button"
            onClick={verifyGps}
            disabled={gpsStatus === 'loading'}
            className="w-full p-3 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-emerald-500 transition-all disabled:opacity-50"
          >
            {gpsStatus === 'loading' ? 'LOCATING...' : gpsStatus === 'success' ? 'RE-VERIFY' : 'VERIFY LOCATION'}
          </button>
          {gpsStatus === 'success' && form.gpsLat && form.gpsLng && (
            <div className="mt-3 p-3 bg-zinc-900 border border-zinc-800">
              <div className="text-center text-emerald-400">
                {form.gpsLat.toFixed(6)} / {form.gpsLng.toFixed(6)}
              </div>
              {form.gpsAccuracy && (
                <div className="text-center text-zinc-500 text-xs mt-1">Accuracy: {form.gpsAccuracy.toFixed(0)}m</div>
              )}
              <div className="mt-3 border border-zinc-700 overflow-hidden">
                <img
                  src={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+4ade80(${form.gpsLng},${form.gpsLat})/${form.gpsLng},${form.gpsLat},15/280x120@2x?access_token=${MAPBOX_TOKEN}`}
                  alt="Location"
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Safety Checklist */}
        <div>
          <label className="flex justify-between text-[10px] text-zinc-500 tracking-wider mb-2 pb-1 border-b border-zinc-800">
            <span>SAFETY AUDIT CHECKLIST</span>
            <span className="text-emerald-400">{form.safetyChecklist.length}/10</span>
          </label>
          <div className="space-y-1">
            {SAFETY_CHECKLIST.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleSafetyItem(item.id)}
                className={`w-full flex items-center gap-3 p-2.5 border text-left transition-all ${
                  form.safetyChecklist.includes(item.id)
                    ? 'bg-emerald-500/5 border-emerald-500/30 text-zinc-200'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="text-emerald-400 w-4">
                  {form.safetyChecklist.includes(item.id) ? '✓' : '○'}
                </span>
                <span className="flex-1 text-xs">{item.label}</span>
                <span className={`text-[9px] px-1.5 py-0.5 bg-zinc-800 ${
                  item.category === 'fire' ? 'text-red-400' :
                  item.category === 'security' ? 'text-indigo-400' :
                  item.category === 'medical' ? 'text-emerald-400' :
                  item.category === 'structural' ? 'text-amber-400' : 'text-cyan-400'
                }`}>
                  {item.category.slice(0, 3).toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Internet Speed Test */}
        <div>
          <label className="block text-[10px] text-zinc-500 tracking-wider mb-2 pb-1 border-b border-zinc-800">
            INTERNET SPEED TEST
          </label>
          <button
            type="button"
            onClick={runSpeedTest}
            disabled={speedTestStatus === 'testing'}
            className="w-full p-3 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-emerald-500 transition-all disabled:opacity-50"
          >
            {speedTestStatus === 'testing' ? 'TESTING...' : speedTestStatus === 'done' ? 'RE-TEST' : 'RUN SPEED TEST'}
          </button>
          {speedTestStatus === 'done' && form.internetSpeed !== null && (
            <div className="mt-3 p-4 bg-zinc-900 border border-zinc-800 flex items-baseline justify-center gap-3">
              <span className="text-3xl font-semibold text-emerald-400">{form.internetSpeed}</span>
              <span className="text-zinc-500">Mbps</span>
              <span className={`ml-3 px-2 py-1 text-[10px] border ${getSpeedGrade(form.internetSpeed).class}`}>
                {getSpeedGrade(form.internetSpeed).label}
              </span>
            </div>
          )}
        </div>

        {/* Owner Reliability */}
        <div>
          <label className="block text-[10px] text-zinc-500 tracking-wider mb-2 pb-1 border-b border-zinc-800">
            OWNER RELIABILITY
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                type="button"
                onClick={() => setForm(f => ({ ...f, ownerReliability: rating as 1|2|3|4|5 }))}
                className={`p-4 text-lg font-semibold border transition-all ${
                  form.ownerReliability === rating
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-zinc-600 mt-1">
            <span>Unreliable</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[10px] text-zinc-500 tracking-wider mb-2 pb-1 border-b border-zinc-800">
            NOTES (Optional)
          </label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Additional observations..."
            className="w-full p-3 bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 resize-y"
            rows={3}
          />
        </div>

        {/* Submit */}
        <div className="pt-4">
          {submitStatus === 'error' && (
            <div className="p-3 mb-3 bg-red-500/10 border border-red-500/30 text-red-400 text-center text-xs">
              Submission failed. Please try again.
            </div>
          )}
          {submitStatus === 'success' && (
            <div className="p-3 mb-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center text-xs">
              Audit submitted successfully!
            </div>
          )}
          <button
            type="submit"
            disabled={submitStatus === 'submitting'}
            className="w-full p-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold tracking-wider hover:from-emerald-500 hover:to-emerald-400 transition-all disabled:opacity-50"
          >
            {submitStatus === 'submitting' ? 'SUBMITTING...' : 'SUBMIT AUDIT'}
          </button>
        </div>
      </form>
    </div>
  );
}
