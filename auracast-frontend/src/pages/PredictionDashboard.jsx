import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BarChart2, ArrowRight } from 'lucide-react';

export default function PredictionDashboard() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto text-center glass-card p-12 rounded-2xl space-y-6">
      <BarChart2 className="w-16 h-16 text-blue-400 mx-auto" />
      <h2 className="text-3xl font-bold text-white">Prediction Results</h2>
      <p className="text-slate-400">View your full body impact analysis with personalized health metrics and recommendations.</p>
      <Link to="/body-impact">
        <motion.button whileHover={{ scale: 1.05 }} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold rounded-xl inline-flex items-center gap-2">
          Start Analysis <ArrowRight size={16} />
        </motion.button>
      </Link>
    </motion.div>
  );
}
