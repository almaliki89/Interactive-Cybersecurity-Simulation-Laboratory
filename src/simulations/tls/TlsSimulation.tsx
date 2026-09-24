import React, { useState } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { StageCanvas } from '../../components/simulation/StageCanvas';
import { SimulationNode, Packet, ConnectionLink, Challenge } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import { translations } from '../../i18n/translations';
import { Lock, ShieldAlert, ShieldCheck, Play, RotateCcw, AlertTriangle, FileCheck } from 'lucide-react';

export const TlsSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const t = translations[language];

  const clockStatus = useSimulationStore((s) => s.clockStatus);
  const clockSpeed = useSimulationStore((s) => s.clockSpeed);
  const addLog = useSimulationStore((s) => s.addLog);
  const addEvent = useSimulationStore((s) => s.addEvent);

  const [certExpired, setCertExpired] = useState(false);
  const [untrustedCa, setUntrustedCa] = useState(false);
  const [mitmAttack, setMitmAttack] = useState(false);

  const [packets, setPackets] = useState<Packet[]>([]);
  const [tlsPhase, setTlsPhase] = useState<'idle' | 'client_hello' | 'server_hello' | 'cert_verify' | 'key_exchange' | 'established' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nodes: SimulationNode[] = [
    {
      id: 'browser',
      name: language === 'ar' ? 'متصفح العميل' : 'Client Browser',
      type: 'client',
      ip: '192.168.1.100',
      status: tlsPhase === 'established' ? 'protected' : tlsPhase === 'failed' ? 'warning' : 'online',
      position: { x: 15, y: 50 },
    },
    {
      id: 'ca',
      name: untrustedCa
        ? (language === 'ar' ? 'سلطة شهادات غير موثوقة' : 'Untrusted Self-Sign CA')
        : (language === 'ar' ? 'سلطة الشهادات المعتمدة Root CA' : 'DigiCert Global Root CA'),
      type: 'ca',
      ip: '192.0.2.1',
      status: untrustedCa ? 'warning' : 'online',
      position: { x: 50, y: 20 },
      metadata: { rootCertTrusted: !untrustedCa },
    },
    {
      id: 'web_server',
      name: mitmAttack
        ? (language === 'ar' ? 'بروكسي المهاجم (رجل في المنتصف)' : 'Attacker Proxy (MITM)')
        : 'bank.secure (Web Server)',
      type: mitmAttack ? 'attacker' : 'server',
      ip: mitmAttack ? '198.51.100.99' : '198.51.100.25',
      status: mitmAttack ? 'warning' : 'online',
      position: { x: 85, y: 50 },
      services: [{ name: 'TLS 1.3', port: 443, protocol: 'TCP', status: 'running' }],
      metadata: {
        subject: mitmAttack ? 'spoofed.bank.secure' : 'bank.secure',
        expires: certExpired ? '2023-01-01 (EXPIRED)' : '2028-12-31 (VALID)',
        issuer: untrustedCa ? 'Self-Signed Untrusted Authority' : 'DigiCert Global Root CA',
      },
    },
  ];

  const connections: ConnectionLink[] = [
    { id: 'c-b-s', source: 'browser', target: 'web_server', label: language === 'ar' ? 'قناة اتصال TLS 1.3' : 'TLS 1.3 Channel' },
    { id: 'c-b-ca', source: 'browser', target: 'ca', label: language === 'ar' ? 'فحص الثقة في مستودع Root CA' : 'Root Trust Store Check' },
  ];

  const tlsChallenge: Challenge = {
    id: 'tls-handshake-challenge',
    simulationId: 'tls',
    title: t.tls.missionTitle,
    difficulty: 'Intermediate',
    category: t.tls.missionCategory,
    mission: t.tls.missionDesc,
    initialExplanation:
      language === 'ar'
        ? 'يوفر بروتوكول TLS 1.3 التحقق من الهوية عبر شهادات X.509 والسرية التامة للأمام عبر خوارزمية تبادل مفاتيح ديفي-هيلمان البيضاوية (ECDHE).'
        : 'TLS 1.3 provides authentication via X.509 PKI certificates and forward secrecy using Ephemeral Elliptic Curve Diffie-Hellman (ECDHE).',
    objectives: [
      {
        id: 'obj-cert-verify',
        title: t.tls.objValidateCert,
        description: t.tls.objValidateCertDesc,
        isCompleted: tlsPhase === 'established',
        validationKey: 'cert_valid',
      },
      {
        id: 'obj-tls-established',
        title: t.tls.objEstablishTls,
        description: t.tls.objEstablishTlsDesc,
        isCompleted: tlsPhase === 'established',
        validationKey: 'tls_established',
      },
    ],
    hints: [t.tls.hint1, t.tls.hint2],
  };

  const startHandshake = () => {
    setTlsPhase('client_hello');
    setErrorMessage(null);

    addLog({
      level: 'INFO',
      source: 'CLIENT_TLS',
      message: 'Client Hello sent: TLS 1.3, CipherSuites: [TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256], SNI: bank.secure',
      category: 'SECURITY',
    });

    setPackets([
      {
        id: 'pkt-client-hello',
        source: 'browser',
        destination: 'web_server',
        protocol: 'TLS',
        sourcePort: 54120,
        destinationPort: 443,
        label: 'Client Hello',
        state: 'moving',
        progress: 0,
        timestamp: Date.now(),
      },
    ]);

    setTimeout(() => {
      // Step 2: Server Hello + Certificate
      setTlsPhase('server_hello');
      addLog({
        level: 'INFO',
        source: 'SERVER_TLS',
        message: 'Server Hello: Selected TLS_AES_256_GCM_SHA384, Server Key Share generated. Presenting X.509 certificate chain.',
        category: 'SECURITY',
      });

      setPackets([
        {
          id: 'pkt-server-hello',
          source: 'web_server',
          destination: 'browser',
          protocol: 'TLS',
          sourcePort: 443,
          destinationPort: 54120,
          label: 'Server Hello + Cert',
          state: 'moving',
          progress: 0,
          timestamp: Date.now(),
        },
      ]);

      setTimeout(() => {
        // Step 3: Certificate Verification
        setTlsPhase('cert_verify');

        if (untrustedCa) {
          setTlsPhase('failed');
          setErrorMessage(
            language === 'ar'
              ? 'خطأ أمني: سلطة الشهادة غير موثوقة (SEC_ERROR_UNTRUSTED_ISSUER)'
              : 'SECURITY ALERT: Untrusted Certificate Authority (SEC_ERROR_UNTRUSTED_ISSUER)'
          );
          addLog({
            level: 'ERROR',
            source: 'CLIENT_TLS',
            message: 'TLS Handshake Aborted: Certificate signed by unknown authority. Root check failed.',
            category: 'SECURITY',
          });
          setPackets([]);
          return;
        }

        if (certExpired) {
          setTlsPhase('failed');
          setErrorMessage(
            language === 'ar'
              ? 'خطأ أمني: شهادة التشفير منتهية الصلاحية (SEC_ERROR_EXPIRED_CERTIFICATE)'
              : 'SECURITY ALERT: Server Certificate Expired (SEC_ERROR_EXPIRED_CERTIFICATE)'
          );
          addLog({
            level: 'ERROR',
            source: 'CLIENT_TLS',
            message: 'TLS Handshake Aborted: Server certificate expired on 2023-01-01.',
            category: 'SECURITY',
          });
          setPackets([]);
          return;
        }

        if (mitmAttack) {
          setTlsPhase('failed');
          setErrorMessage(
            language === 'ar'
              ? 'تحذير هجوم: عدم تطابق اسم المضيف SNI مع الشهادة (MITM Detected)'
              : 'HOST MISMATCH: Certificate subject does not match requested SNI (MITM Spoofing Detected)'
          );
          addLog({
            level: 'ERROR',
            source: 'CLIENT_TLS',
            message: 'MITM Detection: Received certificate for spoofed.bank.secure instead of bank.secure.',
            category: 'SECURITY',
          });
          setPackets([]);
          return;
        }

        addLog({
          level: 'INFO',
          source: 'CLIENT_TLS',
          message: 'X.509 Chain Verified against trusted DigiCert Root CA. Generating Ephemeral ECDHE Shared Secret.',
          category: 'SECURITY',
        });

        // Step 4: Key Exchange & Finished
        setTlsPhase('key_exchange');
        setTimeout(() => {
          setTlsPhase('established');
          addLog({
            level: 'INFO',
            source: 'TLS_SESSION',
            message: 'TLS 1.3 Connection Established. Symmetric cipher active: AES-256-GCM. Traffic is now encrypted.',
            category: 'SECURITY',
          });
          setPackets([]);
        }, 1200 / clockSpeed);
      }, 1500 / clockSpeed);
    }, 1200 / clockSpeed);
  };

  const validateChallenge = () => {
    if (tlsPhase === 'established') {
      return {
        success: true,
        message: t.tls.valSuccess,
      };
    }
    return {
      success: false,
      message: t.tls.valCertFailed,
    };
  };

  return (
    <Workspace
      title={t.tls.title}
      subtitle={t.tls.subtitle}
      challenge={tlsChallenge}
      onValidateChallenge={validateChallenge}
      onRestart={() => {
        setPackets([]);
        setTlsPhase('idle');
        setErrorMessage(null);
      }}
      controlDeck={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={startHandshake}
              className="py-1.5 px-3.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t.tls.startHandshake}</span>
            </button>
          </div>

          {/* Security Flaw Injections */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={certExpired}
                onChange={(e) => setCertExpired(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
              />
              <span className={certExpired ? 'text-rose-400 font-semibold' : ''}>{t.tls.expiredCertToggle}</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={untrustedCa}
                onChange={(e) => setUntrustedCa(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
              />
              <span className={untrustedCa ? 'text-rose-400 font-semibold' : ''}>{t.tls.untrustedCaToggle}</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={mitmAttack}
                onChange={(e) => setMitmAttack(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
              />
              <span className={mitmAttack ? 'text-rose-400 font-semibold' : ''}>{t.tls.mitmToggle}</span>
            </label>
          </div>
        </div>
      }
    >
      {/* Handshake Status Alert */}
      {tlsPhase === 'established' && (
        <div className="absolute top-4 left-6 right-6 z-20 flex justify-center pointer-events-none">
          <div className="bg-slate-950/95 border border-emerald-500/80 px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 pointer-events-auto">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white font-mono">
              {t.tls.channelProtected}
            </span>
          </div>
        </div>
      )}

      {tlsPhase === 'failed' && (
        <div className="absolute top-4 left-6 right-6 z-20 flex justify-center pointer-events-none">
          <div className="bg-slate-950/95 border border-rose-500/80 px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 pointer-events-auto">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-rose-300 font-mono">
              {errorMessage}
            </span>
          </div>
        </div>
      )}

      <StageCanvas nodes={nodes} connections={connections} packets={packets} />
    </Workspace>
  );
};
