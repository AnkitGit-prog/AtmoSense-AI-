import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wind, Search } from 'lucide-react';
import axios from 'axios';

const AqiBar = ({ label, value, max, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
    <div className="w-full bg-slate-700 rounded-full h-2">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={`h-2 rounded-full ${color}`}
      />
    </div>
  </div>
);

const getAqiColor = (aqi) => {
  if (aqi <= 50) return { bg: 'bg-emerald-500', text: 'text-emerald-400', label: 'Good' };
  if (aqi <= 100) return { bg: 'bg-yellow-500', text: 'text-yellow-400', label: 'Moderate' };
  if (aqi <= 150) return { bg: 'bg-orange-500', text: 'text-orange-400', label: 'Unhealthy for Sensitive Groups' };
  if (aqi <= 200) return { bg: 'bg-red-500', text: 'text-red-400', label: 'Unhealthy' };
  return { bg: 'bg-purple-600', text: 'text-purple-400', label: 'Very Unhealthy' };
};

export default function AirQuality() {
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAqi = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}` : 'http://localhost:5000')}/air-quality?city=${encodeURIComponent(city)}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const aqiColor = data ? getAqiColor(data.aqi) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <Wind className="w-12 h-12 text-cyan-400 mx-auto" />
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">Air Quality Monitor</h2>
        <p className="text-slate-400">Check real-time AQI and pollutant levels for any city</p>
      </div>

      <form onSubmit={fetchAqi} className="flex gap-3">
        <input
          type="text" value={city} onChange={e => setCity(e.target.value)}
          placeholder="Enter city name..."
          className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <button type="submit" disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Search size={18} /> {loading ? '...' : 'Check'}
        </button>
      </form>

      {error && <div className="text-red-400 text-center text-sm">{error}</div>}

      {data && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className={`glass-card p-8 rounded-2xl text-center border ${aqiColor.text.replace('text', 'border')}/30`}>
            <div className={`text-7xl font-black ${aqiColor.text}`}>{data.aqi}</div>
            <div className="text-slate-300 text-lg mt-2 font-medium">{aqiColor.label}</div>
            <div className="text-slate-400 text-sm mt-1">Air Quality Index</div>
          </div>
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <h3 className="font-semibold text-white">Pollutant Breakdown</h3>
            <AqiBar label="PM2.5" value={data.pm25} max={150} color="bg-red-500" />
            <AqiBar label="PM10" value={data.pm10} max={250} color="bg-orange-500" />
            <AqiBar label="NO₂" value={data.no2} max={200} color="bg-yellow-500" />
            <AqiBar label="O₃" value={data.o3} max={180} color="bg-blue-500" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
