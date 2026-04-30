import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, Brain, ArrowRight, Thermometer, Droplets, Wind, MapPin, Activity, Shield, BarChart2, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

/* ── AQI Circular Gauge ── */
function AqiGauge({ aqi = 0 }) {
  const r = 70, sw = 10;
  const nr = r - sw / 2;
  const circ = 2 * Math.PI * nr;
  const arc = circ * 0.75;
  const frac = Math.min(aqi / 300, 1);
  const fill = arc * frac;
  const cx = r, cy = r;

  const color = aqi <= 50 ? '#4ade80' : aqi <= 100 ? '#facc15' : aqi <= 150 ? '#fb923c' : aqi <= 200 ? '#f87171' : '#c084fc';
  const label = aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 150 ? 'Unhealthy (Sensitive)' : aqi <= 200 ? 'Unhealthy' : 'Dangerous';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: r * 2, height: r * 2 }}>
        <svg width={r * 2} height={r * 2}>
          <circle cx={cx} cy={cy} r={nr} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={sw}
            strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round"
            style={{ transform: 'rotate(135deg)', transformOrigin: `${cx}px ${cy}px` }} />
          {aqi > 0 && (
            <circle cx={cx} cy={cy} r={nr} fill="none" stroke={color} strokeWidth={sw}
              strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round"
              style={{ transform: 'rotate(135deg)', transformOrigin: `${cx}px ${cy}px`, filter: `drop-shadow(0 0 8px ${color}80)`, transition: 'stroke-dasharray 1.2s ease' }} />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-xs text-slate-500 font-medium tracking-wide">AQI</span>
          <motion.span key={aqi} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-black text-white leading-none">
            {aqi || '--'}
          </motion.span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        <span className="text-sm font-semibold" style={{ color }}>{aqi ? label : 'Loading...'}</span>
      </div>
    </div>
  );
}

/* ── Pollutant Cell ── */
function PollutantCell({ label, value, unit }) {
  return (
    <div className="text-center">
      <div className="text-white font-bold text-base">{value ?? '--'}<span className="text-[10px] text-slate-400 ml-0.5">{unit}</span></div>
      <div className="text-slate-500 text-[11px] mt-0.5">{label}</div>
    </div>
  );
}

/* ── Weather Stat ── */
function WeatherStat({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-slate-400 flex-shrink-0" />
      <div>
        <div className="text-white text-sm font-semibold">{value ?? '--'}</div>
        <div className="text-slate-500 text-[11px]">{label}</div>
      </div>
    </div>
  );
}

/* ── Feature Card ── */
function FeatureCard({ icon: Icon, title, desc, to, gradient }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="group p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.025)' }}>
      <Link to={to} className="flex flex-col h-full">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 flex-shrink-0" style={{ background: gradient }}>
          <Icon size={18} className="text-white" />
        </div>
        <div className="font-semibold text-white text-sm mb-1">{title}</div>
        <div className="text-slate-500 text-xs leading-relaxed flex-1">{desc}</div>
        <ArrowRight size={15} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all mt-4" />
      </Link>
    </motion.div>
  );
}

/* ── Main Home Component ── */
export default function Home() {
  const [city, setCity] = useState('Delhi');
  const [inputCity, setInputCity] = useState('');
  const [showCityInput, setShowCityInput] = useState(false);
  const [aqi, setAqi] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async (c) => {
    setLoading(true);
    try {
      const [aqiRes, wRes] = await Promise.allSettled([
        axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}` : 'http://localhost:5000')}/air-quality?city=${encodeURIComponent(c)}`),
        axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}` : 'http://localhost:5000')}/weather?city=${encodeURIComponent(c)}`)
      ]);
      if (aqiRes.status === 'fulfilled') setAqi(aqiRes.value.data);
      if (wRes.status === 'fulfilled') setWeather(wRes.value.data);
      setLastUpdated(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(city); }, []);

  const handleCitySubmit = (e) => {
    e.preventDefault();
    if (inputCity.trim()) { setCity(inputCity.trim()); fetchData(inputCity.trim()); setShowCityInput(false); setInputCity(''); }
  };

  const minutesAgo = lastUpdated ? Math.floor((new Date() - lastUpdated) / 60000) : null;

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 52px)' }}>
      {/* Top section: hero + AQI widget */}
      <div className="flex flex-1">

        {/* ── LEFT HERO ── */}
        <div className="flex-1 relative flex flex-col justify-center px-10 py-10 overflow-hidden">
          {/* Cosmic background blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'70%', height:'80%', background:'radial-gradient(ellipse, rgba(15,40,100,0.35) 0%, transparent 70%)', borderRadius:'50%' }} />
            <div style={{ position:'absolute', bottom:'-10%', right:'10%', width:'50%', height:'60%', background:'radial-gradient(ellipse, rgba(20,80,60,0.2) 0%, transparent 70%)', borderRadius:'50%' }} />
            {/* Particle-like stars */}
            {[...Array(18)].map((_, i) => (
              <motion.div key={i} animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                style={{ position: 'absolute', width: 2, height: 2, borderRadius: '50%', background: 'rgba(255,255,255,0.6)',
                  left: `${(i * 17 + 5) % 90}%`, top: `${(i * 13 + 8) % 85}%` }} />
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 space-y-6 max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-xs text-slate-300 font-medium"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Zap size={12} className="text-yellow-400" /> AI-Powered Environmental Health
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Understand Your<br />Environment.<br />
              <span className="text-slate-300">Protect Your Health.</span>
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed">
              Get personalized health insights using AI to monitor real-time air quality and weather data.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link to="/air-quality">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/20 hover:border-white/40 transition-all"
                  style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <Zap size={15} className="text-yellow-400" /> Check Live AQI →
                </motion.button>
              </Link>
              <Link to="/body-impact">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/10 hover:border-white/20 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  ▶ Run Health Prediction
                </motion.button>
              </Link>
            </div>

            {/* Stat Badges */}
            <div className="flex flex-wrap gap-3 pt-2">
              {[
                { icon: Zap, label: 'Real-time', sub: 'Live Data' },
                { icon: CheckCircle2, label: '99%', sub: 'Accuracy' },
                { icon: Brain, label: 'AI-Powered', sub: 'Insights' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/8 text-xs"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <Icon size={13} className="text-emerald-400" />
                  <span className="text-white font-semibold">{label}</span>
                  <span className="text-slate-500">{sub}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT AQI WIDGET ── */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="w-[340px] flex-shrink-0 m-6 rounded-2xl border border-white/8 flex flex-col"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}>

          {/* Widget Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Air Quality
            </div>
            <button onClick={() => setShowCityInput(v => !v)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
              <MapPin size={12} /> {city} <ChevronDown size={12} />
            </button>
          </div>

          {/* City input */}
          {showCityInput && (
            <form onSubmit={handleCitySubmit} className="px-5 py-3 border-b border-white/5 flex gap-2">
              <input value={inputCity} onChange={e => setInputCity(e.target.value)} placeholder="Enter city..."
                className="flex-1 text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500" />
              <button type="submit" className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg">Go</button>
            </form>
          )}

          {/* AQI Gauge */}
          <div className="flex justify-center py-6">
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-[140px] h-[140px] rounded-full border-4 border-white/10 animate-pulse" />
                <span className="text-xs text-slate-500">Fetching data...</span>
              </div>
            ) : <AqiGauge aqi={aqi?.aqi ?? 0} />}
          </div>

          {/* Pollutants Grid */}
          <div className="grid grid-cols-4 gap-2 px-5 pb-4 border-b border-white/5">
            <PollutantCell label="PM2.5" value={aqi?.pm25} unit="μg/m³" />
            <PollutantCell label="PM10" value={aqi?.pm10} unit="μg/m³" />
            <PollutantCell label="NO₂" value={aqi?.no2} unit="ppb" />
            <PollutantCell label="O₃" value={aqi?.o3} unit="ppb" />
          </div>

          {/* Weather Row */}
          <div className="grid grid-cols-3 gap-2 px-5 py-4">
            <WeatherStat icon={Thermometer} value={weather?.temperature != null ? `${weather.temperature}°C` : null} label="Temperature" />
            <WeatherStat icon={Droplets} value={weather?.humidity != null ? `${weather.humidity}%` : null} label="Humidity" />
            <WeatherStat icon={Wind} value={weather?.wind_speed != null ? `${weather.wind_speed} km/h` : null} label="Wind" />
          </div>
        </motion.div>
      </div>

      {/* ── BOTTOM: Feature Cards ── */}
      <div className="px-10 pb-8 border-t border-white/5 pt-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold">What would you like to do?</h3>
          {minutesAgo !== null && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Updated {minutesAgo === 0 ? 'just now' : `${minutesAgo} min ago`} →
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCard icon={Activity} title="Body Impact Analysis" desc="See how air quality affects your health today" to="/body-impact" gradient="linear-gradient(135deg, #3b82f6, #8b5cf6)" />
          <FeatureCard icon={BarChart2} title="AI-Powered Forecast" desc="Predict AQI and weather for the next 24h" to="/predict" gradient="linear-gradient(135deg, #f59e0b, #ef4444)" />
          <FeatureCard icon={Wind} title="Air Quality Monitor" desc="View real-time and historical AQI trends" to="/air-quality" gradient="linear-gradient(135deg, #10b981, #06b6d4)" />
          <FeatureCard icon={Shield} title="Health Recommendations" desc="Get personalised safety tips based on current AQI" to="/body-impact" gradient="linear-gradient(135deg, #6366f1, #ec4899)" />
        </div>
      </div>
    </div>
  );
}

