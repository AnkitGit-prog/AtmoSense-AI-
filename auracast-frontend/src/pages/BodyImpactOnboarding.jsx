import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import axios from 'axios';

export default function BodyImpactOnboarding({ onDataFetched }) {
  const [formData, setFormData] = useState({
    city: '',
    age: '',
    activity_type: 'office worker',
    health_conditions: 'none',
    sensitivity: 'low'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post((import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/get-impact` : 'http://localhost:5000/get-impact'), formData);
      onDataFetched(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto glass-card p-8 rounded-2xl"
    >
      <div className="flex items-center justify-center space-x-3 mb-8">
        <Activity className="text-emerald-400 w-8 h-8" />
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Body Impact Profile
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
          <input
            type="text"
            name="city"
            required
            value={formData.city}
            onChange={handleChange}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="e.g. London, Tokyo"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Activity Level</label>
            <select
              name="activity_type"
              value={formData.activity_type}
              onChange={handleChange}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="office worker">Office Worker (Low)</option>
              <option value="student">Student (Moderate)</option>
              <option value="runner">Runner (High)</option>
              <option value="gym">Gym Enthusiast (High)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Health Conditions</label>
            <select
              name="health_conditions"
              value={formData.health_conditions}
              onChange={handleChange}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="none">None</option>
              <option value="asthma">Asthma</option>
              <option value="heart issues">Heart Issues</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Sensitivity Level</label>
            <select
              name="sensitivity"
              value={formData.sensitivity}
              onChange={handleChange}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 flex justify-center items-center"
        >
          {loading ? 'Analyzing...' : 'Generate Body Impact'}
        </button>
      </form>
    </motion.div>
  );
}
