import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  API_ENDPOINTS,
  evaluateApiAuthorization,
  ApiRequest,
} from './logic/api';
import {
  Radio,
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileCode,
  Sliders,
} from 'lucide-react';

interface ApiSecurityLabProps {
  onBackToMap?: () => void;
  onNavigateToJwt?: () => void;
}

export const ApiSecurityLab: React.FC<ApiSecurityLabProps> = ({
  onBackToMap,
  onNavigateToJwt,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const [selectedEndpointKey, setSelectedEndpointKey] = useState<string>('GET /api/v1/orders/:id');
  const [userId, setUserId] = useState<string>('usr-bob');
  const [resourceId, setResourceId] = useState<string>('ord-1001');
  const [grantedScopes, setGrantedScopes] = useState<string[]>(['read:orders']);
  const [itemSku, setItemSku] = useState<string>('SKU-992');
  const [quantity, setQuantity] = useState<number>(5);

  const endpointConfig = API_ENDPOINTS[selectedEndpointKey];
  const [method, path] = selectedEndpointKey.split(' ');

  const apiReq: ApiRequest = {
    id: 'api-req-001',
    method,
    endpoint: path,
    userId: userId || undefined,
    scopes: grantedScopes,
    resourceId,
    body: method === 'POST' ? { itemSku, quantity, shippingAddress: '123 Main St, Nexora City' } : undefined,
  };

  const evalResult = evaluateApiAuthorization(apiReq, endpointConfig);

  const toggleScope = (scope: string) => {
    setGrantedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const allAvailableScopes = ['read:profile', 'read:orders', 'write:orders', 'admin:system'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-mono text-xs">
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
              <Radio className="w-6 h-6 text-blue-400" />
              <span>{isAr ? 'مختبر أمن بوابات واجهات البرمجة (API Security & BOLA)' : 'API Gateway & BOLA Security Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'فحص صلاحيات API Scopes، منع هجمات BOLA / BFLA، وتدقيق مخططات البيانات (Schema Validation)'
                : 'Inspect OAuth API Scopes, Broken Object Level Authorization (BOLA), and payload schema validation.'}
            </p>
          </div>
        </div>

        {onNavigateToJwt && (
          <button
            onClick={onNavigateToJwt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-bold"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{isAr ? 'فحص رموز JWT' : 'JWT Security Lab'}</span>
          </button>
        )}
      </div>

      {/* Control Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <label className="text-slate-300 font-bold block mb-1">1. API Endpoint:</label>
          <select
            value={selectedEndpointKey}
            onChange={(e) => setSelectedEndpointKey(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          >
            {Object.keys(API_ENDPOINTS).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <div className="text-slate-500 text-[11px] pt-1">
            Required Scopes: <span className="text-cyan-400">[{endpointConfig.requiredScopes.join(', ')}]</span>
          </div>
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">2. Client User & Resource:</label>
          <div className="space-y-2">
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-white"
            >
              <option value="usr-bob">Bob (usr-bob)</option>
              <option value="usr-alice">Alice (usr-alice)</option>
              <option value="">Unauthenticated (No Token)</option>
            </select>

            {selectedEndpointKey.includes(':id') && (
              <div>
                <span className="text-slate-400 text-[11px] block">Resource ID Parameter:</span>
                <input
                  type="text"
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-white"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-slate-300 font-bold block mb-1">3. Token Scopes Granted:</label>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {allAvailableScopes.map((scope) => (
              <button
                key={scope}
                onClick={() => toggleScope(scope)}
                className={`py-1 px-2 rounded-lg text-[10px] font-bold text-left truncate ${
                  grantedScopes.includes(scope)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-950 border border-slate-800 text-slate-400'
                }`}
              >
                {scope}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Decision Card */}
      <div className={`p-6 rounded-2xl border space-y-4 ${
        evalResult.allowed
          ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
          : 'bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/20'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="font-bold uppercase tracking-wider text-slate-400">API Gateway Evaluation Result</span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
            evalResult.allowed ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
          }`}>
            HTTP {evalResult.statusCode} {evalResult.errorCode && `(${evalResult.errorCode})`}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs leading-relaxed text-slate-200">
          {isAr ? evalResult.reasonAr : evalResult.reasonEn}
        </div>
      </div>
    </div>
  );
};
