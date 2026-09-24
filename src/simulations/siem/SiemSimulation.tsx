import React, { useState } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { Challenge } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import { translations } from '../../i18n/translations';
import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Play,
  RotateCcw,
  CheckCircle2,
  Lock,
  Radio,
  Sliders,
} from 'lucide-react';

interface SiemEvent {
  id: string;
  time: string;
  type: string;
  user: string;
  ip: string;
  status: 'FAIL' | 'SUCCESS' | 'SUSPICIOUS';
}

export const SiemSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const t = translations[language];

  const addLog = useSimulationStore((s) => s.addLog);
  const addEvent = useSimulationStore((s) => s.addEvent);

  const [threshold, setThreshold] = useState<number>(3);
  const [eventStream, setEventStream] = useState<SiemEvent[]>([]);
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [ipBlocked, setIpBlocked] = useState(false);

  const siemChallenge: Challenge = {
    id: 'siem-correlation-challenge',
    simulationId: 'siem',
    title: t.siem.missionTitle,
    difficulty: 'Intermediate',
    category: t.siem.missionCategory,
    mission: t.siem.missionDesc,
    initialExplanation:
      language === 'ar'
        ? 'تقوم أنظمة إدارة المعلومات والأحداث الأمنية (SIEM) بربط سجلات الخوادم المنفصلة عبر نوافذ زمنية محددة لاكتشاف الهجمات متعددة المراحل.'
        : 'Security Information and Event Management (SIEM) systems correlate isolated log events across time windows to detect multi-stage attack patterns.',
    objectives: [
      {
        id: 'obj-trigger-alert',
        title: t.siem.objTriggerAlert,
        description: t.siem.objTriggerAlertDesc,
        isCompleted: alertTriggered,
        validationKey: 'siem_alert',
      },
      {
        id: 'obj-contain-threat',
        title: t.siem.objBlockAttacker,
        description: t.siem.objBlockAttackerDesc,
        isCompleted: alertTriggered && ipBlocked,
        validationKey: 'threat_contained',
      },
    ],
    hints: [t.siem.hint1, t.siem.hint2],
  };

  const simulateAttack = () => {
    setAlertTriggered(false);
    setIpBlocked(false);
    setEventStream([]);

    const attackerIp = '198.51.100.77';
    const attackSequence: Omit<SiemEvent, 'id'>[] = [
      { time: '14:20:01', type: 'AUTH_LOGIN', user: 'admin', ip: attackerIp, status: 'FAIL' },
      { time: '14:20:03', type: 'AUTH_LOGIN', user: 'admin', ip: attackerIp, status: 'FAIL' },
      { time: '14:20:06', type: 'AUTH_LOGIN', user: 'admin', ip: attackerIp, status: 'FAIL' },
      { time: '14:20:09', type: 'AUTH_LOGIN', user: 'admin', ip: attackerIp, status: 'FAIL' },
      { time: '14:20:12', type: 'AUTH_LOGIN', user: 'admin', ip: attackerIp, status: 'SUCCESS' },
      { time: '14:20:14', type: 'PRIV_ESCALATE', user: 'admin', ip: attackerIp, status: 'SUSPICIOUS' },
    ];

    attackSequence.forEach((evt, idx) => {
      setTimeout(() => {
        const fullEvt: SiemEvent = {
          id: `evt-${Date.now()}-${idx}`,
          ...evt,
        };

        setEventStream((prev) => [...prev, fullEvt]);

        addLog({
          level: evt.status === 'FAIL' ? 'WARN' : evt.status === 'SUSPICIOUS' ? 'ALERT' : 'INFO',
          source: 'SIEM_INGEST',
          message: `${evt.type} from ${evt.ip} (${evt.user}): ${evt.status}`,
          category: 'SECURITY',
        });

        // Trigger alert at threshold
        if (idx === 4) {
          setAlertTriggered(true);
          addEvent({
            type: 'THREAT_DETECTED',
            description: `BRUTE FORCE ALERT: 4 failed logins followed by auth compromise from ${attackerIp}`,
            severity: 'critical',
          });
        }
      }, idx * 600);
    });
  };

  const handleBlockIp = () => {
    setIpBlocked(true);
    addLog({
      level: 'INFO',
      source: 'SOAR_PLAYBOOK',
      message: 'Automated containment: Ingress firewall rule created dropping 198.51.100.77',
      category: 'FIREWALL',
    });
  };

  const validateChallenge = () => {
    if (alertTriggered && ipBlocked) {
      return {
        success: true,
        message: t.siem.valSuccess,
      };
    }
    return {
      success: false,
      message: t.siem.valFailed,
    };
  };

  return (
    <Workspace
      title={t.siem.title}
      subtitle={t.siem.subtitle}
      challenge={siemChallenge}
      onValidateChallenge={validateChallenge}
      onRestart={() => {
        setEventStream([]);
        setAlertTriggered(false);
        setIpBlocked(false);
      }}
      controlDeck={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={simulateAttack}
              className="py-1.5 px-3.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t.siem.simulateAttack}</span>
            </button>

            {alertTriggered && (
              <button
                onClick={handleBlockIp}
                disabled={ipBlocked}
                className="py-1.5 px-3.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{ipBlocked ? (language === 'ar' ? 'تم حظر IP المهاجم' : 'Offending IP Blocked') : t.siem.containIncident}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1 rounded border border-slate-800">
              <span className="text-[11px] text-slate-400">{t.siem.slidingWindow}</span>
              <span className="text-xs font-mono text-cyan-300 font-bold">{threshold} {t.siem.attempts}</span>
            </div>
          </div>
        </div>
      }
    >
      <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center select-none">
        {/* Active Alert Banner */}
        {alertTriggered && (
          <div className="max-w-4xl w-full mb-6 bg-rose-950/40 border border-rose-600 rounded-xl p-4 shadow-xl flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <span className="text-sm font-bold text-white font-mono block">
                  {t.siem.alertTriggered}
                </span>
                <p className="text-xs text-rose-300 mt-1 leading-relaxed font-mono">
                  {t.siem.alertTriggeredDesc}
                </p>
              </div>
            </div>
            {ipBlocked && (
              <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600 px-3 py-1 rounded whitespace-nowrap">
                {language === 'ar' ? 'تم الاحتواء بنجاح' : 'CONTAINED'}
              </span>
            )}
          </div>
        )}

        {/* Live Event Stream Table */}
        <div className="max-w-4xl w-full bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                {t.siem.eventStreamTitle}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {eventStream.length} {language === 'ar' ? 'أحداث مستلمة' : 'Events Ingested'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-500 text-[10px] uppercase">
                  <th className="py-2 px-3">{t.siem.timeCol}</th>
                  <th className="py-2 px-3">{t.siem.typeCol}</th>
                  <th className="py-2 px-3">{t.siem.userCol}</th>
                  <th className="py-2 px-3">{t.siem.ipCol}</th>
                  <th className="py-2 px-3">{t.siem.statusCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {eventStream.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                      {language === 'ar'
                        ? 'لا توجد أحداث أمنية مسجلة حالياً. اضغط "محاكاة هجوم تخمين كلمات المرور" لتدفق الأحداث.'
                        : 'No security events in buffer. Click "Simulate Brute Force Attack" to stream events.'}
                    </td>
                  </tr>
                ) : (
                  eventStream.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-slate-400">{evt.time}</td>
                      <td className="py-2 px-3 font-semibold text-white">{evt.type}</td>
                      <td className="py-2 px-3 text-cyan-300">{evt.user}</td>
                      <td className="py-2 px-3 text-slate-300">{evt.ip}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            evt.status === 'SUCCESS'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : evt.status === 'FAIL'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Workspace>
  );
};
