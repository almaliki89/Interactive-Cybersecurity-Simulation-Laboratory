import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Server,
  Globe,
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Network,
} from 'lucide-react';

export interface ServiceWorkload {
  id: string;
  name: string;
  spiffeId: string;
  mtlsEnabled: boolean;
  certExpirationDays: number;
  allowedRoutes: string[];
}

export const ZeroTrustMeshLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [mtlsEnforced, setMtlsEnforced] = useState(true);
  const [spiffeVerification, setSpiffeVerification] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState('/v1/payments/process');
  const [clientIdentity, setClientIdentity] = useState('spiffe://corp.mesh/ns/prod/sa/frontend');

  const [isSending, setIsSending] = useState(false);
  const [traceLogs, setTraceLogs] = useState<string[]>([]);
  const [lastResponse, setLastResponse] = useState<{
    status: number;
    message: string;
    tlsHandshake: string;
    spiffeIdValidated: boolean;
  } | null>(null);

  const workloads: ServiceWorkload[] = [
    {
      id: 'frontend',
      name: 'Frontend Proxy',
      spiffeId: 'spiffe://corp.mesh/ns/prod/sa/frontend',
      mtlsEnabled: true,
      certExpirationDays: 4,
      allowedRoutes: ['/v1/payments/process', '/v1/users/profile'],
    },
    {
      id: 'payment',
      name: 'Payment API Service',
      spiffeId: 'spiffe://corp.mesh/ns/prod/sa/payment-api',
      mtlsEnabled: true,
      certExpirationDays: 1,
      allowedRoutes: ['/v1/db/query'],
    },
    {
      id: 'untrusted_pod',
      name: 'Rogue Compromised Pod',
      spiffeId: 'spiffe://external.attacker/sa/malicious',
      mtlsEnabled: false,
      certExpirationDays: 0,
      allowedRoutes: ['*'],
    },
  ];

  const handleSendRequest = () => {
    setIsSending(true);
    setTraceLogs([
      `[${new Date().toLocaleTimeString()}] Envoy Sidecar Proxy intercepting outbound request to Payment-API...`,
    ]);

    setTimeout(() => {
      setIsSending(false);

      const isMtlsOk = mtlsEnforced ? clientIdentity.startsWith('spiffe://corp.mesh/') : true;
      const isSpiffeOk = spiffeVerification ? clientIdentity === 'spiffe://corp.mesh/ns/prod/sa/frontend' : true;

      if (mtlsEnforced && !isMtlsOk) {
        setTraceLogs((prev) => [
          ...prev,
          `[mTLS FATAL] Client cert presentation failed or untrusted root CA: "${clientIdentity}"`,
          `[TLS Handshake] Alert (21) Bad Certificate. Connection terminated by server.`,
        ]);
        setLastResponse({
          status: 403,
          message: 'mTLS Handshake Rejected: Peer Certificate Invalid',
          tlsHandshake: 'FAILED (Untrusted CA)',
          spiffeIdValidated: false,
        });
        return;
      }

      if (selectedRoute.includes('admin') || selectedRoute.includes('debug')) {
        setTraceLogs((prev) => [
          ...prev,
          `[mTLS] TLS v1.3 Handshake completed successfully with SAN: ${clientIdentity}`,
          `[Envoy L7 Policy] Evaluated authorization rule "deny-admin-routes" -> DENIED`,
        ]);
        setLastResponse({
          status: 401,
          message: 'RBAC Policy Denied: Service not authorized for route',
          tlsHandshake: 'SUCCESS (mTLS ECDHE-RSA-AES256-GCM)',
          spiffeIdValidated: true,
        });
        return;
      }

      setTraceLogs((prev) => [
        ...prev,
        `[mTLS] Mutual X.509 handshake established using SPIRE SAN URI`,
        `[Envoy L7 Policy] SPIFFE ID "${clientIdentity}" match rule "allow-frontend-to-payment" -> ALLOWED`,
        `[Upstream] HTTP/2 200 OK returned from Payment-API container`,
      ]);
      setLastResponse({
        status: 200,
        message: 'Transaction Processed: HTTP/2 200 OK',
        tlsHandshake: 'SUCCESS (Strict mTLS v1.3)',
        spiffeIdValidated: true,
      });
    }, 900);
  };

  const handleReset = () => {
    setMtlsEnforced(true);
    setSpiffeVerification(true);
    setSelectedRoute('/v1/payments/process');
    setClientIdentity('spiffe://corp.mesh/ns/prod/sa/frontend');
    setTraceLogs([]);
    setLastResponse(null);
  };

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto custom-scrollbar select-none">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Network className="w-4 h-4" />
            <span>{isAr ? 'معمل شبكة Zero Trust وهويات الدقائق (SPIFFE & mTLS)' : 'Zero Trust Service Mesh & SPIFFE/SPIRE Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1 uppercase tracking-tight">
            {isAr ? 'المصادقة المتبادلة mTLS وسياسات Envoy L7' : 'STRICT_MTLS_&_ENVOY_L7_AUTHORIZATION_MESH'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMtlsEnforced(!mtlsEnforced)}
            data-testid="btn-toggle-mtls"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
              mtlsEnforced
                ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/70 border-rose-800 text-rose-300'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{mtlsEnforced ? 'Strict mTLS Enforced' : 'Permissive (Insecure Plaintext Allowed)'}</span>
          </button>

          <button
            onClick={() => setSpiffeVerification(!spiffeVerification)}
            data-testid="btn-toggle-spiffe"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
              spiffeVerification
                ? 'bg-cyan-950/70 border-cyan-800 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>{spiffeVerification ? (isAr ? 'تحقق SPIFFE ID مُمكّن' : 'SPIFFE ID Check Active') : (isAr ? 'تعطيل تحقق SPIFFE' : 'Disable SPIFFE Check')}</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Mesh Workloads Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {workloads.map((wl) => (
          <div
            key={wl.id}
            className={`p-4 rounded-xl border space-y-2 ${
              wl.id === 'untrusted_pod'
                ? 'bg-rose-950/20 border-rose-900/50'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">{wl.name}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                wl.mtlsEnabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                {wl.mtlsEnabled ? 'mTLS Active' : 'No Cert'}
              </span>
            </div>
            <div className="font-mono text-[11px] text-cyan-400 truncate" dir="ltr">
              {wl.spiffeId}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
              <span>Short-lived Cert: {wl.certExpirationDays} days left</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Request Sender */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? 'اختبار إرسال الطلبات عبر شبكة Envoy Proxy' : 'Simulate Microservice Request via Envoy Sidecar'}</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">SPIRE Agent Issued X.509 SVID</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold">{isAr ? 'هوية الخدمة المراد استخدامها (Client SPIFFE ID):' : 'Client Identity (SPIFFE ID):'}</label>
            <select
              value={clientIdentity}
              onChange={(e) => setClientIdentity(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="spiffe://corp.mesh/ns/prod/sa/frontend">spiffe://corp.mesh/ns/prod/sa/frontend (Authorized Frontend)</option>
              <option value="spiffe://external.attacker/sa/malicious">spiffe://external.attacker/sa/malicious (Rogue Container)</option>
              <option value="spiffe://corp.mesh/ns/dev/sa/test-app">spiffe://corp.mesh/ns/dev/sa/test-app (Dev Namespace)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-semibold">{isAr ? 'المسار المستهدف (Target HTTP Route):' : 'Target Endpoint Route:'}</label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="/v1/payments/process">POST /v1/payments/process (Allowed Payment Route)</option>
              <option value="/v1/admin/debug">GET /v1/admin/debug (Restricted Admin Endpoint)</option>
              <option value="/v1/db/query">POST /v1/db/query (Database Direct Access)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSendRequest}
          disabled={isSending}
          data-testid="btn-send-mesh-request"
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-cyan-950/40"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isSending ? (isAr ? 'جاري الفحص وإرسال الطلب...' : 'Executing mTLS Handshake...') : (isAr ? 'إرسال الطلب في الشبكة' : 'Send mTLS Service Request')}</span>
        </button>
      </div>

      {/* Output Console & Result Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trace Logs */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-850 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'سجل تتبع Envoy Proxy' : 'Envoy Sidecar Access Log Stream'}</span>
            </div>
            <span>L7 Protocol Engine</span>
          </div>

          <div className="h-44 overflow-y-auto font-mono text-xs p-3 bg-slate-900/50 rounded-lg border border-slate-900 text-cyan-300 select-text leading-relaxed whitespace-pre-wrap" dir="ltr">
            {traceLogs.length === 0 ? (isAr ? 'في انتظار إرسال الطلب...' : 'Awaiting request execution...') : traceLogs.join('\n')}
          </div>
        </div>

        {/* Result Status */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'نتيجة تقييم السياسة (Policy Evaluation Outcome)' : 'Envoy Policy Decision'}</span>
            </h4>

            {lastResponse ? (
              <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                lastResponse.status === 200
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">HTTP {lastResponse.status}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-950">{lastResponse.tlsHandshake}</span>
                </div>
                <p>{lastResponse.message}</p>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic p-6 text-center bg-slate-950 rounded-lg border border-slate-850">
                {isAr ? 'قم بإرسال طلب لملاحظة قرار الجدار الناري المحلي.' : 'Execute a request to observe Envoy L7 enforcement.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
