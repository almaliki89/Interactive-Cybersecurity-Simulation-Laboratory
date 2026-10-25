/**
 * OMEGA V14 — Kubernetes RBAC & Privilege Escalation Interactive Lab
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  useSimulationStore,
  registerChallengeValidator,
  unregisterChallengeValidator,
} from '../../stores/simulationStore';
import { getInitialClusterRoles, auditKubernetesRbac } from './logic/rbac';
import { KubernetesRole } from './logic/types';
import { Key, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

export const K8sRbacLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const completeChallenge = useSimulationStore((s) => s.completeChallenge);
  const isAr = language === 'ar';

  const initialData = getInitialClusterRoles();
  const [roles, setRoles] = useState<KubernetesRole[]>(initialData.roles);
  const rolesRef = useRef(roles);
  rolesRef.current = roles;

  const updateRolesAndSyncRef = (nextRoles: KubernetesRole[]) => {
    rolesRef.current = nextRoles;
    setRoles(nextRoles);
  };

  const audit = auditKubernetesRbac(roles);

  useEffect(() => {
    registerChallengeValidator('k8s-hardening-challenge', () => {
      const liveRoles = rolesRef.current;
      const liveAudit = auditKubernetesRbac(liveRoles);
      return {
        success: liveAudit.isCompliant && liveAudit.securityScore >= 100,
        score: liveAudit.securityScore,
        message: liveAudit.isCompliant
          ? 'Kubernetes container isolation and RBAC verified with zero privilege escalation vectors.'
          : `RBAC audit failed: ${liveAudit.findings[0]?.explanationEn || 'Unresolved RBAC security findings'}`,
      };
    });

    return () => {
      unregisterChallengeValidator('k8s-hardening-challenge');
    };
  }, []);

  const sanitizeRbac = () => {
    const sanitizedRoles: KubernetesRole[] = [
      {
        id: 'role-frontend-sa',
        name: 'frontend-service-role',
        namespace: 'production',
        isClusterRole: false,
        rules: [
          {
            apiGroups: [''],
            resources: ['configmaps'],
            verbs: ['get', 'list'],
          },
        ],
      },
      {
        id: 'role-ci-runner',
        name: 'ci-runner-scoped-role',
        namespace: 'ci-cd',
        isClusterRole: false,
        rules: [
          {
            apiGroups: ['apps'],
            resources: ['deployments'],
            verbs: ['get', 'update', 'patch'],
          },
        ],
      },
      {
        id: 'role-backend-restricted',
        name: 'backend-pod-reader',
        namespace: 'production',
        isClusterRole: false,
        rules: [
          {
            apiGroups: [''],
            resources: ['configmaps'],
            verbs: ['get', 'list', 'watch'],
          },
        ],
      },
    ];
    updateRolesAndSyncRef(sanitizedRoles);

    const postAudit = auditKubernetesRbac(sanitizedRoles);
    if (postAudit.isCompliant) {
      completeChallenge('k8s-hardening-challenge', {
        success: true,
        score: postAudit.securityScore,
        message: 'Kubernetes container isolation and RBAC verified with zero privilege escalation vectors.',
      });
    }
  };

  const resetToVulnerable = () => {
    updateRolesAndSyncRef(initialData.roles);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs mb-1">
              <Key className="w-4 h-4" />
              <span>{isAr ? 'مختبر إدارة صلاحيات كوبرنيتيس RBAC' : 'Kubernetes RBAC Security Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'كشف الصلاحيات الفضفاضة وترقية الامتيازات (RBAC Escalation)' : 'RBAC Privilege Escalation & Wildcard Sanitizer'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'افحص أدوار Roles و ClusterRoles وتخلص من علامات النجمة (*) وصلاحيات pods/exec غير المقيدة.'
                : 'Audit cluster roles, detect dangerous wildcard grants, and eliminate pods/exec backdoors.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">{isAr ? 'أمان RBAC' : 'RBAC Score'}</div>
              <div
                className={`text-2xl font-black ${
                  audit.securityScore >= 80
                    ? 'text-emerald-400'
                    : audit.securityScore >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {audit.securityScore}%
              </div>
            </div>

            <button
              onClick={sanitizeRbac}
              data-testid="btn-harden-k8s"
              className="px-3.5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'تطهير وتطبيق مبدأ أقل الصلاحيات' : 'Sanitize & Enforce Least Privilege'}</span>
            </button>

            <button
              onClick={resetToVulnerable}
              data-testid="btn-reset-k8s"
              title={isAr ? 'إعادة التعيين للحالة الأولية' : 'Reset to Vulnerable Roles'}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Findings Panel */}
        {audit.findings.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>{isAr ? 'الثغرات ومسارات ترقية الصلاحيات المكتشفة:' : 'Dangerous RBAC Escalation Findings:'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {audit.findings.map((f, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-rose-300">{f.roleName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {f.riskSeverity}
                    </span>
                  </div>

                  <div className="text-slate-300 leading-relaxed">{isAr ? f.explanationAr : f.explanationEn}</div>

                  <div className="p-2.5 rounded bg-slate-950 text-[11px] text-amber-300 font-mono">
                    <span className="text-slate-500">Escalation: </span>
                    <span>{isAr ? f.escalationVectorAr : f.escalationVectorEn}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roles Explorer */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isAr ? 'الأدوار النشطة في الكلاستر (Active Roles & Rules):' : 'Active Cluster Roles & Rules:'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((r) => (
              <div key={r.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-white truncate">{r.name}</div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-yellow-300 border border-slate-700">
                    {r.isClusterRole ? 'ClusterRole' : `Namespace: ${r.namespace}`}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {r.rules.map((rule, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800/80 space-y-1"
                    >
                      <div>
                        <span className="text-slate-500">Resources: </span>
                        <span
                          className={
                            rule.resources.includes('*') || rule.resources.includes('secrets')
                              ? 'text-rose-400 font-bold'
                              : 'text-cyan-400'
                          }
                        >
                          {rule.resources.join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Verbs: </span>
                        <span
                          className={
                            rule.verbs.includes('*') || rule.verbs.includes('exec')
                              ? 'text-rose-400 font-bold'
                              : 'text-emerald-400'
                          }
                        >
                          {rule.verbs.join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
