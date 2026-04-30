import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Cloud, Wind, Activity, Home as HomeIcon, BarChart2, History, Settings, Bell, Moon, TrendingUp, CloudRain } from 'lucide-react';
import { SignedIn, SignedOut, SignIn, UserButton } from '@clerk/clerk-react';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import InputForm from './pages/InputForm';
import PredictionDashboard from './pages/PredictionDashboard';
import AirQuality from './pages/AirQuality';
import BodyImpactApp from './pages/BodyImpactApp';
import ExposureTracker from './pages/ExposureTracker';
import RainPrediction  from './pages/RainPrediction';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/predict" element={<InputForm />} />
        <Route path="/results" element={<PredictionDashboard />} />
        <Route path="/air-quality" element={<AirQuality />} />
        <Route path="/body-impact" element={<BodyImpactApp />} />
        <Route path="/exposure"    element={<ExposureTracker />} />
        <Route path="/rain"        element={<RainPrediction />} />
      </Routes>
    </AnimatePresence>
  );
}

function SidebarLink({ to, icon: Icon, label }) {
  const location = useLocation();
  const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  return (
    <Link to={to} className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl w-full transition-all ${active ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
      <Icon size={20} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

function AppLayout() {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/predict', label: 'Predict' },
    { path: '/air-quality', label: 'Air Quality' },
    { path: '/body-impact', label: 'Body Impact' },
    { path: '/exposure', label: 'Exposure' },
    { path: '/rain',     label: 'Rain' },
  ];
  return (
    <div className="min-h-screen flex" style={{ background: '#080810' }}>
      <aside className="w-[72px] min-h-screen flex flex-col items-center py-5 gap-1 border-r border-white/5 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="mb-4"><Cloud className="text-cyan-400 w-7 h-7" /></div>
        <SidebarLink to="/" icon={HomeIcon} label="Home" />
        <SidebarLink to="/predict" icon={Activity} label="Predict" />
        <SidebarLink to="/air-quality" icon={Wind} label="Air Quality" />
        <SidebarLink to="/body-impact" icon={BarChart2} label="Body Impact" />
        <SidebarLink to="/exposure" icon={TrendingUp} label="Exposure" />
        <SidebarLink to="/rain"     icon={CloudRain}  label="Rain" />
        <div className="flex-1" />
        <SidebarLink to="/history" icon={History} label="History" />
        <SidebarLink to="/settings" icon={Settings} label="Settings" />
        <div className="flex items-center gap-1.5 mt-3 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-semibold">Live</span>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-3 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <Cloud className="text-cyan-400 w-5 h-5" /> AtmoSense AI
          </div>
          <nav className="flex items-center gap-1 bg-white/5 rounded-xl px-1 py-1">
            {navItems.map(item => (
              <Link key={item.path} to={item.path}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${location.pathname === item.path ? 'bg-white/10 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
              <Bell size={18} /><span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"><Moon size={18} /></button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        <main className="flex-1 overflow-auto"><AnimatedRoutes /></main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <SignedIn>
        <AppLayout />
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#080810' }}>
          <SignIn routing="hash" />
        </div>
      </SignedOut>
    </Router>
  );
}
