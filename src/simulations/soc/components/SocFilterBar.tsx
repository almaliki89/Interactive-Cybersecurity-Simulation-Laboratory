import React from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import { useSocStore } from '../../../stores/socStore';
import { Filter, X, RotateCcw, Search, ChevronDown } from 'lucide-react';

export const SocFilterBar: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  
  const filters = useSocStore((s) => s.filters);
  const setFilter = useSocStore((s) => s.setFilter);
  const resetFilters = useSocStore((s) => s.resetFilters);

  const activeCount = Object.values(filters).flat().length;

  return (
    <div className="h-10 border-b border-slate-900 bg-slate-950 px-4 flex items-center gap-4 shrink-0 z-10 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2 shrink-0">
        <Filter className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest hidden sm:inline">
          {isAr ? 'تصفية' : 'FILTERS'}
        </span>
      </div>

      <div className="flex items-center gap-2">
         <FilterDropdown 
           label={isAr ? 'الخطورة' : 'Severity'} 
           options={['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']} 
           selected={filters.severity}
           onChange={(vals) => setFilter('severity', vals)}
         />
         <FilterDropdown 
           label={isAr ? 'المجال' : 'Source'} 
           options={['NETWORK', 'IDENTITY', 'APPSEC', 'WINDOWS', 'LINUX', 'CLOUD', 'CONTAINERS', 'DEVSECOPS']} 
           selected={filters.sourceWorld}
           onChange={(vals) => setFilter('sourceWorld', vals)}
         />
         <FilterDropdown 
           label={isAr ? 'الفئة' : 'Category'} 
           options={['AUTHENTICATION', 'ACCESS_CONTROL', 'PROCESS_EXECUTION', 'NETWORK_CONNECTION', 'APPLICATION_DEFENSE']} 
           selected={filters.category}
           onChange={(vals) => setFilter('category', vals)}
         />
      </div>

      <div className="flex items-center gap-2 shrink-0">
         {activeCount > 0 && (
           <button 
             onClick={resetFilters}
             className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-900 text-[9px] font-mono text-rose-500 uppercase transition-colors"
           >
             <RotateCcw className="w-3 h-3" />
             {isAr ? 'مسح' : 'Clear'}
           </button>
         )}
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
         {Object.entries(filters).map(([key, values]) => 
           values.map(val => (
             <div key={`${key}-${val}`} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/30 border border-cyan-800/40 text-[9px] font-mono text-cyan-400 uppercase whitespace-nowrap">
                <span>{val}</span>
                <button onClick={() => setFilter(key as any, values.filter(v => v !== val))}>
                   <X className="w-2.5 h-2.5 hover:text-white" />
                </button>
             </div>
           ))
         )}
      </div>
    </div>
  );
};

const FilterDropdown: React.FC<{ label: string, options: string[], selected: string[], onChange: (vals: string[]) => void }> = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter(v => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono uppercase transition-all whitespace-nowrap ${
          selected.length > 0 ? 'bg-cyan-950/20 border-cyan-800/50 text-cyan-400' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
        }`}
      >
        <span>{label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 min-w-[140px] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-1 animate-in fade-in slide-in-from-top-2 duration-150">
           {options.map(opt => (
             <button
               key={opt}
               onClick={() => toggle(opt)}
               className={`w-full text-left p-2 rounded-lg text-[10px] font-mono uppercase flex items-center justify-between hover:bg-slate-850 ${
                 selected.includes(opt) ? 'text-cyan-400 bg-cyan-950/20' : 'text-slate-400'
               }`}
             >
                {opt}
                {selected.includes(opt) && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />}
             </button>
           ))}
        </div>
      )}
    </div>
  );
};
