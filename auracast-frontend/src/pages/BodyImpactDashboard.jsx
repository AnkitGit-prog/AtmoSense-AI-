import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity, Heart, Droplets, Wind, AlertTriangle } from 'lucide-react';

const ImpactCard = ({ title, value, status, icon: Icon }) => {
  const statusColors = {
    LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    HIGH: 'bg-red-500/20 text-red-400 border-red-500/50',
    DEFAULT: 'bg-blue-500/20 text-blue-400 border-blue-500/50'
  };

  const colorClass = statusColors[status] || statusColors.DEFAULT;

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`p-6 rounded-2xl border ${colorClass} backdrop-blur-sm`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <Icon className="w-6 h-6" />
        <h3 className="font-semibold text-slate-200">{title}</h3>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {status && <div className="mt-2 text-sm opacity-80 uppercase tracking-wider">{status} Risk</div>}
    </motion.div>
  );
};

export default function BodyImpactDashboard({ data, onReset }) {
  const { impact, recommendations, weather, aqi, user_profile } = data;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <button 
        onClick={onReset}
        className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Profile</span>
      </button>

      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Body Impact Analysis
        </h2>
        <p className="text-slate-400">
          Personalized for a {user_profile.age || 'user'} year old {user_profile.activity_type} in {user_profile.city}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ImpactCard 
          title="Stamina" 
          value={impact.stamina} 
          icon={Activity} 
        />
        <ImpactCard 
          title="Breathing Stress" 
          value={impact.breathing_stress} 
          status={impact.breathing_stress}
          icon={Wind} 
        />
        <ImpactCard 
          title="Dehydration" 
          value={impact.dehydration_risk} 
          status={impact.dehydration_risk}
          icon={Droplets} 
        />
        <ImpactCard 
          title="Fatigue Level" 
          value={impact.fatigue_level} 
          status={impact.fatigue_level}
          icon={Heart} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center space-x-2 mb-6">
            <AlertTriangle className="text-yellow-400" />
            <h3 className="text-xl font-semibold">Actionable Recommendations</h3>
          </div>
          <ul className="space-y-4">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start space-x-3 text-slate-300">
                <span className="text-emerald-400 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-6">
          <h3 className="text-xl font-semibold">Current Conditions</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl">
              <span className="text-slate-400">Temperature</span>
              <span className="font-semibold">{weather.temperature}°C</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl">
              <span className="text-slate-400">Humidity</span>
              <span className="font-semibold">{weather.humidity}%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl">
              <span className="text-slate-400">AQI</span>
              <span className="font-semibold">{aqi.aqi}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
