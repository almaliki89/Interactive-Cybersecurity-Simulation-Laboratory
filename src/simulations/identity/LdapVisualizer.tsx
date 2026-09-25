import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  INITIAL_DIRECTORY_OBJECTS,
  DOMAIN_DN,
} from './logic/directory';
import {
  searchDirectory,
  LdapScope,
  LdapSearchResult,
} from './logic/ldap';
import {
  Search,
  Database,
  ArrowRight,
  ArrowLeft,
  Filter,
  CheckCircle2,
  FileCode,
  Layers,
  Sparkles,
  Info,
  Laptop,
  User,
  Users,
  Folder,
} from 'lucide-react';

interface LdapVisualizerProps {
  onBackToMap?: () => void;
}

export const LdapVisualizer: React.FC<LdapVisualizerProps> = ({ onBackToMap }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);

  const [searchBase, setSearchBase] = useState<string>(DOMAIN_DN);
  const [scope, setScope] = useState<LdapScope>('subtree');
  const [filterQuery, setFilterQuery] = useState<string>('(department=Finance)');
  const [selectedResult, setSelectedResult] = useState<LdapSearchResult | null>(null);

  const queryExec = searchDirectory(
    INITIAL_DIRECTORY_OBJECTS,
    searchBase,
    filterQuery,
    scope,
    virtualTime
  );

  const cannedFilters = [
    { label: 'Finance Department Staff', query: '(department=Finance)' },
    { label: 'Active Users (&(objectClass=user)(enabled=true))', query: '(&(objectClass=user)(enabled=true))' },
    { label: 'Privileged Accounts (adminCount=1)', query: '(adminCount=1)' },
    { label: 'Enterprise Service Accounts', query: '(isServiceAccount=true)' },
    { label: 'Domain Computers', query: '(objectClass=computer)' },
    { label: 'Security Groups', query: '(objectClass=group)' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <BackArrow className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Search className="w-6 h-6 text-teal-400" />
              <span>{isAr ? 'مستكشف استعلامات بروتوكول LDAP التفاعلي' : 'Interactive LDAP Query Visualizer'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'تنفيذ استعلامات RFC 4515 المعقدة محلياً على كائنات الدليل وفحص سمات الكائنات المسترجعة'
                : 'Execute synthetic RFC 4515 directory searches, test LDAP filters, and inspect returned attribute trees'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-teal-400">
            Port: TCP 389 (LDAP) / 636 (LDAPS)
          </span>
        </div>
      </div>

      {/* Query Builder Deck */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 font-mono text-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Base */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-slate-300 font-bold block">Search Base DN:</label>
            <select
              value={searchBase}
              onChange={(e) => setSearchBase(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
            >
              <option value={DOMAIN_DN}>{DOMAIN_DN} (Domain Root)</option>
              <option value="OU=Finance,DC=corp,DC=nexora,DC=local">OU=Finance,DC=corp,DC=nexora,DC=local</option>
              <option value="OU=HR,DC=corp,DC=nexora,DC=local">OU=HR,DC=corp,DC=nexora,DC=local</option>
              <option value="OU=IT,DC=corp,DC=nexora,DC=local">OU=IT,DC=corp,DC=nexora,DC=local</option>
              <option value="OU=Contractors,DC=corp,DC=nexora,DC=local">OU=Contractors,DC=corp,DC=nexora,DC=local</option>
              <option value="OU=Servers,DC=corp,DC=nexora,DC=local">OU=Servers,DC=corp,DC=nexora,DC=local</option>
            </select>
          </div>

          {/* Scope */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-slate-300 font-bold block">Search Scope:</label>
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              {(['base', 'oneLevel', 'subtree'] as LdapScope[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setScope(s)}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all ${
                    scope === s
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Input */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-slate-300 font-bold block">LDAP Filter (RFC 4515):</label>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="e.g. (department=Finance)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-bold"
            />
          </div>
        </div>

        {/* Quick Canned Filter Buttons */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-slate-500 text-[11px] mr-1">Pre-built Filters:</span>
          {cannedFilters.map((cf, idx) => (
            <button
              key={idx}
              onClick={() => setFilterQuery(cf.query)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-teal-300 hover:border-teal-600 text-[11px] transition-colors"
            >
              {cf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Query Stats Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs text-slate-400">
        <span>
          Base: <strong className="text-white">{searchBase}</strong> • Scope: <strong className="text-teal-400">{scope}</strong>
        </span>
        <span>
          Returned Results: <strong className="text-emerald-400">{queryExec.count} entries</strong>
        </span>
      </div>

      {/* Results Grid + Attribute Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Results List (6 cols) */}
        <div className="lg:col-span-6 space-y-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
            {isAr ? 'الكائنات المتطابقة مع الاستعلام:' : 'Matched Directory Objects:'}
          </span>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {queryExec.results.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-500 font-mono text-xs">
                {isAr ? 'لم تتطابق أي كائنات مع الفلتر الحالي' : 'No directory objects matched the specified filter.'}
              </div>
            ) : (
              queryExec.results.map((res, idx) => {
                const isSelected = selectedResult?.dn === res.dn;
                let Icon = User;
                if (res.objectClass === 'computer') Icon = Laptop;
                if (res.objectClass === 'group') Icon = Users;
                if (res.objectClass === 'organizationalUnit') Icon = Folder;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedResult(res)}
                    className={`p-3 rounded-xl border font-mono text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-950/60 border-teal-500 text-teal-200 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <Icon className="w-4 h-4 text-teal-400 shrink-0" />
                        <span className="font-bold text-white truncate">{res.dn}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-400 shrink-0">
                        {res.objectClass}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Attribute Inspector (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4 text-teal-400" />
              <span>LDAP Entry Attributes</span>
            </span>
            {selectedResult && (
              <span className="text-[10px] text-teal-400">{selectedResult.objectClass}</span>
            )}
          </div>

          {selectedResult ? (
            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {Object.entries(selectedResult.attributes).map(([attr, val], idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <span className="text-teal-400 font-bold text-[11px] block">{attr}:</span>
                  <span className="text-slate-300 break-all text-[11px]">
                    {Array.isArray(val) ? val.join(', ') : String(val)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              {isAr
                ? 'انقر على أي كائن من قائمة النتائج لعرض سمات LDAP التفصيلية'
                : 'Select an entry from the search results to inspect its full LDAP schema attributes.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
