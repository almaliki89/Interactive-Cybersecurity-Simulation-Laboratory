import React from 'react';
import { MapPin, Shield, Zap, Activity } from 'lucide-react';

interface NationalDefenseMapProps {
  language?: 'ar' | 'en';
  infrastructureHealth: number;
  activeCrisis: boolean;
}

export const NationalDefenseMap: React.FC<NationalDefenseMapProps> = ({
  language = 'en',
  infrastructureHealth,
  activeCrisis
}) => {
  const isAr = language === 'ar';

  const regions = [
    { id: 'north', nameEn: 'North (Erbil/Mosul)', nameAr: 'الشمال (أربيل/الموصل)', x: '50%', y: '15%', status: 'stable' },
    { id: 'central', nameEn: 'Central (Baghdad)', nameAr: 'الوسط (بغداد)', x: '55%', y: '45%', status: infrastructureHealth < 70 ? 'warning' : 'stable' },
    { id: 'south', nameEn: 'South (Basra)', nameAr: 'الجنوب (البصرة)', x: '75%', y: '80%', status: infrastructureHealth < 40 ? 'critical' : 'stable' },
  ];

  return (
    <div className="relative w-full aspect-[4/3] bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      {/* Simulated Iraq Map Outline (Abstract) */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-20 fill-cyan-500/20 stroke-cyan-500/40">
        <path d="M40,10 L70,15 L85,40 L90,85 L60,95 L30,85 L15,40 Z" />
      </svg>

      {/* Region Nodes */}
      {regions.map((region) => (
        <div 
          key={region.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
          style={{ left: region.x, top: region.y }}
        >
          <div className="relative">
            <div className={`w-4 h-4 rounded-full border-2 ${
              region.status === 'stable' ? 'bg-emerald-500/20 border-emerald-500' :
              region.status === 'warning' ? 'bg-amber-500/20 border-amber-500 animate-pulse' :
              'bg-rose-500/20 border-rose-500 animate-ping'
            }`} />
            {activeCrisis && region.status !== 'stable' && (
              <Zap className="absolute -top-4 -left-4 w-4 h-4 text-rose-400 animate-bounce" />
            )}
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-950/80 px-1 rounded backdrop-blur-sm whitespace-nowrap">
            {isAr ? region.nameAr : region.nameEn}
          </span>
        </div>
      ))}

      {/* Overlay Status */}
      <div className="absolute bottom-2 right-2 flex items-center gap-2 text-[9px] font-mono text-slate-500">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{isAr ? 'مستقر' : 'STABLE'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>{isAr ? 'تنبيه' : 'WARNING'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>{isAr ? 'حرج' : 'CRITICAL'}</span>
        </div>
      </div>
    </div>
  );
};
