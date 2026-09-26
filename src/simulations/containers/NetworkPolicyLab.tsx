/**
 * OMEGA V14 — Kubernetes NetworkPolicy & Microsegmentation Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  getInitialClusterPods,
  getInitialNetworkPolicies,
  evaluatePacketFlow,
  PacketFlowTestRequest,
} from './logic/networkPolicies';
import { KubernetesNetworkPolicy, KubernetesPod } from './logic/types';
import { Network, ShieldCheck, ShieldAlert, ArrowRight, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

export const NetworkPolicyLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [pods] = useState<KubernetesPod[]>(getInitialClusterPods());
  const [policies, setPolicies] = useState<KubernetesNetworkPolicy[]>(getInitialNetworkPolicies());

  const [srcPodId, setSrcPodId] = useState<string>('pod-frontend-web');
  const [dstPodId, setDstPodId] = useState<string>('pod-postgres-db');
  const [targetPort, setTargetPort] = useState<number>(5432);
  const [testMetadata, setTestMetadata] = useState<boolean>(false);

  const [lastResult, setLastResult] = useState<any>(null);

  const applyDefaultDenyPolicies = () => {
    const hardenedPolicies: KubernetesNetworkPolicy[] = [
      {
        id: 'np-default-deny-all',
        name: 'default-deny-ingress-egress',
        namespace: 'database',
        podSelector: {},
        policyTypes: ['Ingress', 'Egress'],
        ingressRules: [
          {
            from: [{ podSelector: { app: 'backend' } }],
            ports: [{ protocol: 'TCP', port: 5432 }],
          },
        ],
        egressRules: [],
        enabled: true,
      },
      {
        id: 'np-block-metadata-egress',
        name: 'block-cloud-metadata-egress',
        namespace: 'production',
        podSelector: {},
        policyTypes: ['Egress'],
        ingressRules: [],
        egressRules: [
          {
            to: [
              {
                ipBlock: {
                  cidr: '0.0.0.0/0',
                  except: ['169.254.169.254/32'],
                },
              },
            ],
            ports: [],
          },
        ],
        enabled: true,
      },
    ];

    setPolicies(hardenedPolicies);
  };

  const executePacketTest = () => {
    const req: PacketFlowTestRequest = {
      srcPodId,
      dstPodId,
      dstPort: targetPort,
      protocol: 'TCP',
      isExternalIp: testMetadata,
      externalIpTarget: testMetadata ? '169.254.169.254' : undefined,
    };

    const res = evaluatePacketFlow(req, pods, policies);
    setLastResult(res);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs mb-1">
              <Network className="w-4 h-4" />
              <span>{isAr ? 'مختبر سياسات شبكات كوبرنيتيس' : 'K8s NetworkPolicies & Microsegmentation Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'فرض سياسات العزل الميكروي وحظر التحرك الجانبي' : 'Default Deny Policies & Cloud Metadata Egress Protection'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'اختبر تدفق الحزم بين حزم Pods المختلفة وافرض سياسة Default Deny لعزل قواعد البيانات وحظر 169.254.169.254.'
                : 'Simulate packet firewalling between microservice Pods and enforce zero-trust declarative NetworkPolicies.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={applyDefaultDenyPolicies}
              className="px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-teal-950"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? 'فرض سياسات العزل الافتراضية' : 'Enforce Zero-Trust NetworkPolicies'}</span>
            </button>

            <button
              onClick={() => {
                setPolicies(getInitialNetworkPolicies());
                setLastResult(null);
              }}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Packet Flow Test Controller */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {isAr ? 'اختبار تدفق حزمة بيانات (Packet Injection Test):' : 'Inject Test Traffic:'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">{isAr ? 'المرسل (Source Pod):' : 'Source Pod:'}</label>
              <select
                value={srcPodId}
                onChange={(e) => setSrcPodId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
              >
                {pods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.namespace})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">{isAr ? 'الهدف (Destination):' : 'Destination Pod:'}</label>
              <select
                disabled={testMetadata}
                value={dstPodId}
                onChange={(e) => setDstPodId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono disabled:opacity-40"
              >
                {pods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.namespace})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">{isAr ? 'المنفذ المستهدف:' : 'Port:'}</label>
              <input
                type="number"
                value={targetPort}
                onChange={(e) => setTargetPort(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer mb-1">
                <input
                  type="checkbox"
                  checked={testMetadata}
                  onChange={(e) => setTestMetadata(e.target.checked)}
                  className="accent-teal-500"
                />
                <span className={testMetadata ? 'text-teal-400 font-bold' : 'text-slate-400'}>
                  {isAr ? 'استعلام الميتاداتا 169.254' : 'Query IMDS 169.254'}
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={executePacketTest}
            className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isAr ? 'إرسال حزمة الاختبار وتقييم السياسات' : 'Send Test Packet & Evaluate Policies'}</span>
          </button>

          {/* Test Result Display */}
          {lastResult && (
            <div
              className={`mt-4 p-4 rounded-xl border space-y-2 ${
                lastResult.allowed
                  ? lastResult.isLateralAttackAttempt
                    ? 'bg-rose-950/40 border-rose-500/50'
                    : 'bg-emerald-950/30 border-emerald-500/30'
                  : 'bg-slate-950 border-teal-500/40'
              }`}
            >
              <div className="flex items-center gap-2">
                {lastResult.allowed ? (
                  lastResult.isLateralAttackAttempt ? (
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )
                ) : (
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                )}
                <span className="font-bold text-sm text-white">
                  {lastResult.allowed
                    ? lastResult.isLateralAttackAttempt
                      ? isAr
                        ? 'تحذير: تسرب جانبي حرج غير معزول!'
                        : 'Warning: Unrestricted Lateral Traversal Permitted!'
                      : isAr
                      ? 'الاتصال مصرح به ومسموح'
                      : 'Connection Permitted'
                    : isAr
                    ? 'تم حظر الحزمة بنجاح بواسطة سياسة الشبكة'
                    : 'Packet Successfully Blocked by NetworkPolicy'}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-mono">
                {isAr ? lastResult.reasonAr : lastResult.reasonEn}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
