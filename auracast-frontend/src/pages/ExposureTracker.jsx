import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Wind, Thermometer, AlertTriangle, Clock, ChevronRight, RefreshCw } from 'lucide-react';
import axios from 'axios';

/* ── Circular Progress Ring ── */
function RingMeter({ percent, color, label, size = 120 }) {
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const fill = (Math.min(percent, 100) / 100) * circ * 0.75;
  const cx = size / 2, cy = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={9}
            strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeLinecap="round"
            style={{ transform: 'rotate(135deg)', transformOrigin: `${cx}px ${cy}px` }} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={9}
            strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round"
            style={{ transform: 'rotate(135deg)', transformOrigin: `${cx}px ${cy}px`,
              filter: `drop-shadow(0 0 6px ${color}80)`, transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white">{percent.toFixed(1)}</span>
          <span className="text-[10px] text-slate-500 font-medium">%</span>
        </div>
      </div>
      <span className="text-xs text-slate-400 font-medium">{label}</span>
    </div>
  );
}

/* ── Risk Badge ── */
function RiskBadge({ level }) {
  const styles = {
    SAFE:      { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    WARNING:   { bg: 'bg-yellow-500/15',  border: 'border-yellow-500/40',  text: 'text-yellow-400',  dot: 'bg-yellow-400' },
    DANGEROUS: { bg: 'bg-red-500/15',     border: 'border-red-500/40',     text: 'text-red-400',     dot: 'bg-red-400' },
  };
  const s = styles[level] || styles.SAFE;
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${s.bg} ${s.border}`}>
      <span className={`w-2 h-2 rounded-full animate-pulse ${s.dot}`} />
      <span className={`font-bold text-sm tracking-wider ${s.text}`}>{level}</span>
    </div>
  );
}

/* ── Exposure Bar ── */
function ExposureBar({ label, percent, color }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold text-white">{percent.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(percent, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full" style={{ background: color }} />
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function ExposureTracker() {
  const [form, setForm] = useState({
    city: '', userType: 'office worker', healthCondition: 'none', minutes: 60
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [callCount, setCallCount] = useState(0);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const fetchExposure = async () => {
    if (!form.city.trim()) return;
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({
        city: form.city, userType: form.userType,
        healthCondition: form.healthCondition, minutes: form.minutes
      });
      const res = await axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}` : 'http://localhost:5000')}/exposure?${params}`);
      setData(res.data);
      setCallCount(c => c + 1);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally { setLoading(false); }
  };

  const handleSubmit = e => { e.preventDefault(); fetchExposure(); };

  const pollColor   = data ? (data.pollution_percent >= 80 ? '#f87171' : data.pollution_percent >= 50 ? '#facc15' : '#4ade80') : '#4ade80';
  const heatColor   = data ? (data.heat_percent     >= 80 ? '#f87171' : data.heat_percent     >= 50 ? '#fb923c' : '#60a5fa') : '#60a5fa';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-6 py-8 space-y-8">

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
          <Activity size={14} /> Personal Exposure Tracker
        </div>
        <h2 className="text-3xl font-extrabold text-white">Pollution + Heat Exposure</h2>
        <p className="text-slate-400 text-sm">Track your cumulative daily environmental exposure and get personalized health insights.</p>
      </div>

      {/* Form Card */}
      <div className="p-6 rounded-2xl border border-white/8 space-y-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <h3 className="text-white font-semibold text-sm">Your Profile</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1.5">City</label>
              <input name="city" value={form.city} onChange={handleChange} required
                placeholder="e.g. Mumbai, Delhi, Indore"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Activity Type</label>
              <select name="userType" value={form.userType} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors">
                <option value="office worker">Office Worker</option>
                <option value="student">Student</option>
                <option value="runner">Runner</option>
                <option value="gym">Gym</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Health Condition</label>
              <select name="healthCondition" value={form.healthCondition} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors">
                <option value="none">None</option>
                <option value="asthma">Asthma</option>
                <option value="heart issues">Heart Issues</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock size={14} />
              <span>Exposure interval:</span>
              <select name="minutes" value={form.minutes} onChange={handleChange}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-500">
                <option value={30}>30 min</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={240}>4 hours</option>
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #10b981)' }}>
              {loading ? <RefreshCw size={15} className="animate-spin" /> : <Activity size={15} />}
              {loading ? 'Calculating...' : callCount > 0 ? 'Update Exposure' : 'Calculate Exposure'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">{error}</div>
      )}

      {data && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Risk + Rings Row */}
          <div className="p-6 rounded-2xl border border-white/8 flex flex-col md:flex-row items-center gap-8"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Overall Risk</span>
              <RiskBadge level={data.risk_level} />
              <div className="text-xs text-slate-500 mt-1">
                🌡️ {data.current_conditions.temperature}°C &nbsp;|&nbsp; 💨 AQI {data.current_conditions.aqi}
              </div>
              {callCount > 1 && (
                <div className="text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                  📊 Session call #{callCount} — exposure accumulated
                </div>
              )}
            </div>

            <div className="flex-1 flex justify-center gap-12">
              <RingMeter percent={data.pollution_percent} color={pollColor} label="Pollution Exposure" size={130} />
              <RingMeter percent={data.heat_percent}      color={heatColor}  label="Heat Exposure"      size={130} />
            </div>
          </div>

          {/* Exposure Bars */}
          <div className="p-6 rounded-2xl border border-white/8 space-y-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <h3 className="text-white font-semibold text-sm">Daily Exposure Progress</h3>
            <ExposureBar label="Pollution Exposure" percent={data.pollution_percent} color={pollColor} />
            <ExposureBar label="Heat Exposure"      percent={data.heat_percent}      color={heatColor}  />
            <div className="flex justify-between text-[11px] text-slate-600 pt-1">
              <span>0% — Safe</span><span>50% — Warning</span><span>80%+ — Dangerous</span>
            </div>
          </div>

          {/* Advice + Prediction Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Advice */}
            <div className="p-6 rounded-2xl border border-white/8 space-y-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-yellow-400" />
                <h3 className="text-white font-semibold text-sm">Health Recommendations</h3>
              </div>
              <ul className="space-y-3">
                {data.advice.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <ChevronRight size={15} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 30-min Prediction */}
            <div className="p-6 rounded-2xl border border-white/8 space-y-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-400" />
                <h3 className="text-white font-semibold text-sm">Prediction — Next 30 Minutes</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 text-sm text-slate-400"><Wind size={14} /> Pollution</div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{data.prediction_30min.pollution_percent.toFixed(1)}%</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{
                      color: data.prediction_30min.risk_level === 'SAFE' ? '#4ade80' : data.prediction_30min.risk_level === 'WARNING' ? '#facc15' : '#f87171',
                      borderColor: 'currentColor', background: 'rgba(0,0,0,0.2)'
                    }}>{data.prediction_30min.risk_level}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 text-sm text-slate-400"><Thermometer size={14} /> Heat</div>
                  <span className="text-white font-bold">{data.prediction_30min.heat_percent.toFixed(1)}%</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Based on current AQI ({data.current_conditions.aqi}) and temperature ({data.current_conditions.temperature}°C). Call again to accumulate exposure.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600">
            Last tracked: {new Date(data.tracked_at).toLocaleTimeString()} &nbsp;·&nbsp; Exposure resets at midnight
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
