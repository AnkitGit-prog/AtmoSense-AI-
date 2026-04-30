import { useState } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, MapPin, Clock, CheckCircle2, AlertTriangle, Navigation, ChevronRight, RefreshCw } from 'lucide-react';
import axios from 'axios';

/* ── Rain Probability Arc ── */
function RainArc({ probability }) {
  const r = 75, sw = 11;
  const nr = r - sw / 2;
  const circ = 2 * Math.PI * nr;
  const arc  = circ * 0.75;
  const fill = (Math.min(probability, 100) / 100) * arc;
  const cx = r, cy = r;

  const color = probability >= 70 ? '#60a5fa'
    : probability >= 40 ? '#818cf8' : '#34d399';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: r * 2, height: r * 2 }}>
        <svg width={r * 2} height={r * 2}>
          <circle cx={cx} cy={cy} r={nr} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw}
            strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round"
            style={{ transform: 'rotate(135deg)', transformOrigin: `${cx}px ${cy}px` }} />
          <circle cx={cx} cy={cy} r={nr} fill="none" stroke={color} strokeWidth={sw}
            strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round"
            style={{ transform: 'rotate(135deg)', transformOrigin: `${cx}px ${cy}px`,
              filter: `drop-shadow(0 0 10px ${color}90)`, transition: 'stroke-dasharray 1.2s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-white">{probability}%</span>
          <span className="text-xs text-slate-500 font-medium mt-0.5">Rain</span>
        </div>
      </div>
    </div>
  );
}

/* ── Confidence Badge ── */
function ConfidenceBadge({ level }) {
  const styles = {
    HIGH:   'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
    MEDIUM: 'bg-yellow-500/15  border-yellow-500/40  text-yellow-400',
    LOW:    'bg-red-500/15     border-red-500/40     text-red-400',
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wide ${styles[level] || styles.MEDIUM}`}>
      {level} Confidence
    </span>
  );
}

/* ── Hourly Bar ── */
function HourlyBar({ hour, probability, confidence }) {
  const color = probability >= 70 ? '#60a5fa' : probability >= 40 ? '#818cf8' : '#34d399';
  const time  = new Date(hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <span className="text-xs font-semibold text-white">{probability}%</span>
      <div className="w-full rounded-full overflow-hidden bg-white/5" style={{ height: 6 }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${probability}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full" style={{ background: color }} />
      </div>
      <span className="text-[10px] text-slate-500">{time}</span>
    </div>
  );
}

/* ── Main Page ── */
export default function RainPrediction() {
  const [coords, setCoords] = useState({ lat: '', lon: '' });
  const [cityMode, setCityMode] = useState(true);
  const [cityInput, setCityInput] = useState('');
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [locating, setLocating] = useState(false);

  const fetchByCoords = async (lat, lon) => {
    setLoading(true); setError(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}` : 'http://localhost:5000')}/rain-prediction?lat=${lat}&lon=${lon}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally { setLoading(false); }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) return setError('Geolocation not supported.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setLocating(false); fetchByCoords(pos.coords.latitude.toFixed(4), pos.coords.longitude.toFixed(4)); },
      ()  => { setLocating(false); setError('Location access denied.'); }
    );
  };

  const handleManual = async (e) => {
    e.preventDefault();
    if (cityMode && cityInput.trim()) {
      // Geocode city via OWM
      setLoading(true); setError(null);
      try {
        const geo = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityInput)}&limit=1&appid=1ee2c6f33251dd55113fa2ae0bc18849`);
        if (!geo.data.length) throw new Error(`City "${cityInput}" not found.`);
        const { lat, lon } = geo.data[0];
        setCoords({ lat, lon });
        await fetchByCoords(lat, lon);
      } catch (err) {
        setError(err.response?.data?.detail || err.message);
        setLoading(false);
      }
    } else {
      fetchByCoords(coords.lat, coords.lon);
    }
  };

  const prob   = data?.rain_probability ?? 0;
  const goOut  = data?.should_go_out;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-6 py-8 space-y-8">

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
          <CloudRain size={14} /> Ensemble Rain Prediction
        </div>
        <h2 className="text-3xl font-extrabold text-white">Rain Forecast</h2>
        <p className="text-slate-400 text-sm">High-accuracy prediction using 3 weather APIs combined with ensemble logic.</p>
      </div>

      {/* Input Card */}
      <div className="p-6 rounded-2xl border border-white/8 space-y-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="flex gap-2 mb-2">
          <button onClick={() => setCityMode(true)}  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${cityMode  ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-white/5'}`}>City Name</button>
          <button onClick={() => setCityMode(false)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${!cityMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-white/5'}`}>Lat / Lon</button>
        </div>

        <form onSubmit={handleManual} className="flex flex-col gap-3">
          {cityMode ? (
            <input value={cityInput} onChange={e => setCityInput(e.target.value)} required
              placeholder="Enter city name — e.g. Mumbai, Delhi, Indore"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <input value={coords.lat} onChange={e => setCoords(c => ({ ...c, lat: e.target.value }))} placeholder="Latitude (e.g. 19.07)"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
              <input value={coords.lon} onChange={e => setCoords(c => ({ ...c, lon: e.target.value }))} placeholder="Longitude (e.g. 72.87)"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
              {loading ? <RefreshCw size={15} className="animate-spin" /> : <CloudRain size={15} />}
              {loading ? 'Fetching...' : 'Predict Rain'}
            </button>
            <button type="button" onClick={handleGPS} disabled={locating}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 border border-white/10 hover:border-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Navigation size={15} className={locating ? 'animate-pulse text-blue-400' : ''} />
              {locating ? 'Locating...' : 'Use GPS'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">{error}</div>}

      {data && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Main Result */}
          <div className="p-6 rounded-2xl border border-white/8 flex flex-col md:flex-row items-center gap-8"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <RainArc probability={prob} />

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <ConfidenceBadge level={data.confidence} />
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${goOut ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' : 'bg-red-500/15 border-red-500/40 text-red-400'}`}>
                  {goOut ? '✅ Safe to go out' : '🌧️ Stay indoors'}
                </span>
              </div>

              {data.time_window && data.time_window !== 'No significant rain expected' && (
                <div className="flex items-center gap-2 text-slate-300 text-sm">
                  <Clock size={14} className="text-blue-400" />
                  <span>Rain window: <strong className="text-white">{data.time_window}</strong></span>
                </div>
              )}

              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <MapPin size={12} /> {data.lat}, {data.lon}
                <span className="mx-1">·</span>
                <span>{data.sources_queried} API{data.sources_queried > 1 ? 's' : ''} used</span>
                {data.cached && <span className="text-yellow-500 ml-1">· cached</span>}
              </div>

              <ul className="space-y-2">
                {data.advice.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <ChevronRight size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Next 3 Hours */}
          <div className="p-6 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <h3 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
              <Clock size={15} className="text-blue-400" /> Next 3 Hours
            </h3>
            <div className="flex gap-4">
              {data.next_3_hours.map((h, i) => (
                <HourlyBar key={i} hour={h.hour} probability={h.rain_probability} confidence={h.confidence} />
              ))}
            </div>
          </div>

          {/* Full Hourly Forecast */}
          <div className="p-6 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <h3 className="text-white font-semibold text-sm mb-5">Hourly Breakdown</h3>
            <div className="space-y-2">
              {data.hourly_forecast.slice(0, 8).map((h, i) => {
                const t = new Date(h.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const barColor = h.rain_probability >= 70 ? '#60a5fa' : h.rain_probability >= 40 ? '#818cf8' : '#34d399';
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-16 flex-shrink-0">{t}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${h.rain_probability}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="h-full rounded-full" style={{ background: barColor }} />
                    </div>
                    <span className="text-xs text-white font-semibold w-10 text-right">{h.rain_probability}%</span>
                    <span className={`text-[10px] w-12 text-right ${h.confidence === 'HIGH' ? 'text-emerald-400' : h.confidence === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {h.confidence}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-600 mt-4">
              Generated at {new Date(data.generated_at).toLocaleTimeString()} · Cached for 5 minutes
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
