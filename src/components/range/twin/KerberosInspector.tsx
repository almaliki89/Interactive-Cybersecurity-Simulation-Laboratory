/**
 * OMEGA ULTRA REALITY V1.3 — Kerberos Ticket Inspector UI
 * Displays cached TGT / TGS tickets, lifetime, session keys, and purge controls.
 */

import React, { useState } from 'react';
import { globalActiveDirectoryEngine } from '../../../engine/reality/identity/ActiveDirectoryEngine';
import { globalSimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
import { Key, Shield, Clock, Trash2, RefreshCw, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

interface KerberosInspectorProps {
  workstationHost: string;
  language?: 'en' | 'ar';
}

export const KerberosInspector: React.FC<KerberosInspectorProps> = ({ workstationHost, language = 'en' }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const isAr = language === 'ar';
  const vTime = globalSimulationRuntime.clock.getVirtualTime();
  const cache = globalActiveDirectoryEngine.getTicketCache(workstationHost);
  const tickets = cache.listTickets();
  const tgt = cache.getTgt();

  const dcStatus = globalActiveDirectoryEngine.isDcReachable(workstationHost);

  const handlePurge = () => {
    cache.purge();
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div data-testid="kerberos-inspector" className="p-3 bg-slate-950 text-slate-200 font-sans text-xs space-y-3 font-mono border-t border-slate-900">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <div className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>Kerberos Ticket Cache</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {workstationHost}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              KDC: DC01.NEXORA.LOCAL ({dcStatus.dcOnline && dcStatus.networkOk ? 'REACHABLE' : 'UNREACHABLE'})
            </div>
          </div>
        </div>

        <button
          onClick={handlePurge}
          data-testid="kerberos-purge-btn"
          className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[10px] font-bold flex items-center gap-1 transition-colors"
          title="Simulate 'klist purge'"
        >
          <Trash2 className="w-3 h-3" />
          <span>{isAr ? 'تفريغ التذاكر (klist purge)' : 'klist purge'}</span>
        </button>
      </div>

      {/* Ticket List */}
      <div data-testid="kerberos-ticket-list" className="space-y-2">
        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex justify-between items-center">
          <span>Cached Kerberos Tickets ({tickets.length})</span>
          <span>Virtual Time: +{vTime}s</span>
        </div>

        {tickets.length === 0 ? (
          <div className="p-4 rounded-lg bg-slate-900/30 border border-slate-800/60 text-center text-slate-500 space-y-1">
            <AlertTriangle className="w-5 h-5 mx-auto text-amber-500/80" />
            <div className="text-slate-400 font-bold">No Kerberos Tickets Cached</div>
            <div className="text-[10px]">
              {isAr
                ? 'قم بتسجيل الدخول كـ Domain User أو استعلم عن مشاركة SMB مثل \\\\FILE01\\Finance لإصدار TGT / TGS.'
                : 'Log in as a domain user or access \\\\FILE01\\Finance SMB share to request TGT/TGS tickets.'}
            </div>
          </div>
        ) : (
          tickets.map((t, idx) => {
            const isTgt = t.ticketType === 'TGT';
            const isExpired = t.expiresAtVirtualTime <= vTime;

            return (
              <div
                key={t.ticketId}
                className={`p-2.5 rounded-lg border space-y-1.5 transition-all ${
                  isExpired
                    ? 'bg-rose-950/20 border-rose-900/60 text-rose-300'
                    : isTgt
                    ? 'bg-cyan-950/30 border-cyan-800/60 text-slate-200'
                    : 'bg-emerald-950/30 border-emerald-800/60 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                        isTgt
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {t.ticketType}
                    </span>
                    <span className="font-bold text-white text-xs truncate">{t.servicePrincipal}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      isExpired
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {isExpired ? 'EXPIRED' : 'VALID'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-400">
                  <div>
                    <span className="text-slate-500">Client: </span>
                    <span className="text-slate-200">{t.clientPrincipal}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Domain: </span>
                    <span className="text-slate-200">{t.domain}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Issued: </span>
                    <span className="text-slate-300">+{t.issuedAtVirtualTime}s</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Expires: </span>
                    <span className={isExpired ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      +{t.expiresAtVirtualTime}s
                    </span>
                  </div>
                  <div className="col-span-2 text-[9px] text-slate-500 truncate">
                    Flags: {t.flags.join(', ')} | SessionKey: {t.sessionKeyId}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
