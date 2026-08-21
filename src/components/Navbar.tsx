import React from 'react';
import { ShieldCheck, BarChart3, Calculator, Database, Cpu, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeRoute: string;
  setActiveRoute: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeRoute, setActiveRoute }) => {
  const navItems = [
    { id: 'home', label: 'Overview', icon: ShieldCheck },
    { id: 'predict', label: 'EMI Risk Calculator', icon: Calculator },
    { id: 'explore', label: 'EDA Analytics', icon: BarChart3 },
    { id: 'models', label: 'MLflow Models', icon: Cpu },
    { id: 'admin', label: 'Admin Records', icon: Database },
  ];

  return (
    <header className="bg-[#0f172a] border-b border-[#1e293b] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div 
          onClick={() => setActiveRoute('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)] group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight font-mono">EMIPredict</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                AI v2.5
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Financial Risk Platform</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveRoute(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 font-bold border-l-2 border-emerald-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveRoute('predict')}
            className="flex items-center gap-2 px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all active:scale-95 cursor-pointer font-mono"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Assess Risk</span>
          </button>
        </div>
      </div>
    </header>
  );
};
