import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Key,
  Lock,
  Unlock,
  RefreshCw,
  Cpu,
  Sparkles,
  Layers,
  Globe,
  Radio,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface PostQuantumLabProps {
  language?: 'ar' | 'en';
}

type CryptoScheme = 'CLASSICAL_RSA2048' | 'CLASSICAL_ECDSA' | 'PQC_ML_KEM768' | 'HYBRID_X25519_MLKEM';

export const PostQuantumLab: React.FC<PostQuantumLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [activeScheme, setActiveScheme] = useState<CryptoScheme>('HYBRID_X25519_MLKEM');
  const [isSimulatingQuantum, setIsSimulatingQuantum] = useState<boolean>(false);
  const [quantumSimulationResult, setQuantumSimulationResult] = useState<{
    brokenByShor: boolean;
    quantumTimeSeconds: number;
    ciphertextSizeBytes: number;
    latticeDimension: number;
    securityLevelBits: number;
    details: string;
  } | null>(null);

  // Hybrid TLS Handshake state
  const [isHandshaking, setIsHandshaking] = useState<boolean>(false);
  const [tlsHandshakeLog, setTlsHandshakeLog] = useState<{
    clientHelloGroup: string;
    serverKemCiphertext: string;
    sharedSecretHex: string;
    pqcVerified: boolean;
  } | null>(null);

  const handleSimulateQuantumAttack = () => {
    setIsSimulatingQuantum(true);
    setQuantumSimulationResult(null);

    setTimeout(() => {
      if (activeScheme === 'CLASSICAL_RSA2048') {
        setQuantumSimulationResult({
          brokenByShor: true,
          quantumTimeSeconds: 0.004,
          ciphertextSizeBytes: 256,
          latticeDimension: 0,
          securityLevelBits: 0, // Broken!
          details: isAr
            ? 'خوارزمية Shor على الحاسب الكمومي فكّت تحليل العوامل الأولية للعدد N=pq خلال ثوانٍ! تم استخراج المفتاح الخاص RSA.'
            : "CRITICAL FAILURE: Shor's algorithm on a 4,096-qubit quantum computer factored RSA-2048 modulus in milliseconds!",
        });
      } else if (activeScheme === 'CLASSICAL_ECDSA') {
        setQuantumSimulationResult({
          brokenByShor: true,
          quantumTimeSeconds: 0.002,
          ciphertextSizeBytes: 64,
          latticeDimension: 0,
          securityLevelBits: 0,
          details: isAr
            ? 'خوارزمية Shor فكّت اللوغاريتم المتقطع على المنحنيات الإهليجية P-256! تم تسريب المفتاح الخاص فوراً.'
            : 'CRITICAL FAILURE: Quantum period-finding solved Elliptic Curve Discrete Logarithm Problem (ECDLP) instantly.',
        });
      } else if (activeScheme === 'PQC_ML_KEM768') {
        setQuantumSimulationResult({
          brokenByShor: false,
          quantumTimeSeconds: 9999999,
          ciphertextSizeBytes: 1088,
          latticeDimension: 768,
          securityLevelBits: 192,
          details: isAr
            ? 'صمدت خوارزمية ML-KEM-768 الشبكية أمام الحاسب الكمومي! تتطلب حل مشكلة Learning With Errors (LWE) أجيالاً طويلة.'
            : 'QUANTUM RESILIENT: Module-Lattice ML-KEM-768 withstands both Shor and Grover quantum algorithms (192-bit quantum security).',
        });
      } else {
        setQuantumSimulationResult({
          brokenByShor: false,
          quantumTimeSeconds: 9999999,
          ciphertextSizeBytes: 1120, // X25519 (32) + ML-KEM (1088)
          latticeDimension: 768,
          securityLevelBits: 192,
          details: isAr
            ? 'المصادقة الهجينة (Hybrid TLS 1.3): تحمي البيانات حتى في حال اكتشاف كسر أحد الخوارزميتين مستقبلاً.'
            : 'HYBRID TLS PROTECTED: Dual-key exchange combines classical X25519 with post-quantum ML-KEM-768 for defense-in-depth.',
        });
      }

      setIsSimulatingQuantum(false);
    }, 450);
  };

  const handleRunHybridTlsHandshake = () => {
    setIsHandshaking(true);
    setTlsHandshakeLog(null);

    setTimeout(() => {
      setTlsHandshakeLog({
        clientHelloGroup: 'x25519_mlkem768 (0x11ec)',
        serverKemCiphertext: '4a91b0028e1... (1088 bytes encapsulated ML-KEM key)',
        sharedSecretHex: 'e892f00119283746501928374650192837465019283746501928374650192837',
        pqcVerified: true,
      });
      setIsHandshaking(false);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر التشفير المقاوم للحواسيب الكمومية (Post-Quantum Crypto)' : 'Post-Quantum Safe Cryptography Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-indigo-400 bg-indigo-950/60 border border-indigo-800 rounded-full font-mono">
                NIST FIPS 203 (ML-KEM)
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'اختبار حماية التشفير ضد خوارزمية Shor، ومحاكاة هجمات HNDL، ومصادقة TLS 1.3 الهجينة.'
                : 'Interactive quantum threat simulation against RSA/ECC, NIST lattice cryptography, and hybrid TLS 1.3 key exchange.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isAr ? 'معيار NIST:' : 'NIST PQC Standard:'}</span>
          <span className="px-2 py-1 bg-indigo-950 border border-indigo-800 text-indigo-300 rounded font-bold">
            ML-KEM / ML-DSA (2024)
          </span>
        </div>
      </div>

      {/* Crypto Scheme Selection Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <button
          onClick={() => setActiveScheme('CLASSICAL_RSA2048')}
          className={`p-3 rounded-lg border text-left transition-all flex flex-col space-y-1 ${
            activeScheme === 'CLASSICAL_RSA2048'
              ? 'bg-rose-950/50 border-rose-500 text-rose-200'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="font-bold text-rose-400">RSA-2048 (Classical)</span>
          <span className="text-[11px] text-slate-400">Factoring N = p × q</span>
          <span className="text-[10px] text-rose-500 font-bold uppercase">{isAr ? 'ضعيف جداً ضد الكم' : 'Vulnerable to Shor'}</span>
        </button>

        <button
          onClick={() => setActiveScheme('CLASSICAL_ECDSA')}
          className={`p-3 rounded-lg border text-left transition-all flex flex-col space-y-1 ${
            activeScheme === 'CLASSICAL_ECDSA'
              ? 'bg-rose-950/50 border-rose-500 text-rose-200'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="font-bold text-rose-400">ECDSA P-256 (Classical)</span>
          <span className="text-[11px] text-slate-400">Discrete Log on Curves</span>
          <span className="text-[10px] text-rose-500 font-bold uppercase">{isAr ? 'ضعيف جداً ضد الكم' : 'Vulnerable to Shor'}</span>
        </button>

        <button
          onClick={() => setActiveScheme('PQC_ML_KEM768')}
          className={`p-3 rounded-lg border text-left transition-all flex flex-col space-y-1 ${
            activeScheme === 'PQC_ML_KEM768'
              ? 'bg-indigo-950/50 border-indigo-500 text-slate-100'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="font-bold text-indigo-300">ML-KEM-768 (Kyber)</span>
          <span className="text-[11px] text-slate-400">Module Lattice LWE</span>
          <span className="text-[10px] text-emerald-400 font-bold uppercase">{isAr ? 'مقاوم كمومياً NIST' : 'Quantum Safe (NIST)'}</span>
        </button>

        <button
          onClick={() => setActiveScheme('HYBRID_X25519_MLKEM')}
          className={`p-3 rounded-lg border text-left transition-all flex flex-col space-y-1 ${
            activeScheme === 'HYBRID_X25519_MLKEM'
              ? 'bg-emerald-950/50 border-emerald-500 text-slate-100'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="font-bold text-emerald-300">Hybrid X25519 + ML-KEM</span>
          <span className="text-[11px] text-slate-400">Dual TLS 1.3 Key Exchange</span>
          <span className="text-[10px] text-emerald-400 font-bold uppercase">{isAr ? 'الخيار الأفضل للإنتاج' : 'Recommended Production'}</span>
        </button>
      </div>

      {/* Main Grid: Quantum Attack Simulation + Hybrid TLS 1.3 Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Harvest-Now-Decrypt-Later Threat Tester */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              {isAr ? 'محاكاة كسر التشفير بالحاسب الكمومي (Shor Attack)' : 'Quantum Computer Cryptanalysis Attack'}
            </h3>
            <button
              onClick={handleSimulateQuantumAttack}
              disabled={isSimulatingQuantum}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-indigo-400/30 disabled:opacity-50"
            >
              {isSimulatingQuantum ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {isAr ? 'تشغيل هجوم Shor الكمومي' : 'Launch Shor Attack'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-2 text-xs">
            <span className="text-slate-400 font-bold block">{isAr ? 'هجوم التقاط الترافيك الحالي للفك مستقبلاً (HNDL):' : 'Harvest-Now-Decrypt-Later (HNDL) Risk:'}</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {isAr
                ? 'يقوم المهاجم بجمع الحزم المشفرة اليوم وتخزينها لحين إتاحة حاسب كمومي ذو 4000 Qubit لفك التشفير بأمر واحد.'
                : 'Adversaries passively record encrypted internet traffic today to decrypt retroactively once fault-tolerant quantum computers arrive.'}
            </p>
          </div>

          {/* Quantum Attack Result Box */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[200px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'نتيجة التحليل الكمومي للنظام' : 'Quantum Cryptanalysis Outcome'}</span>
            </div>

            {quantumSimulationResult ? (
              <div className="space-y-3 text-xs">
                <div
                  className={`p-3 rounded border font-mono ${
                    quantumSimulationResult.brokenByShor
                      ? 'bg-rose-950/50 border-rose-800 text-rose-200'
                      : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {quantumSimulationResult.brokenByShor ? (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'تم كسر التشفير بالكامل!' : 'CRYPTO SYSTEM BROKEN BY QUANTUM SHOR'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'التشفير صامد ومحمي كمومياً!' : 'QUANTUM RESILIENT CRYPTO SYSTEM'}</span>
                      </>
                    )}
                  </div>
                  {quantumSimulationResult.details}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 bg-slate-900 border border-slate-800 p-2.5 rounded">
                  <div>
                    <span className="text-slate-500 block">Ciphertext Payload:</span>
                    <span className="text-indigo-300 font-bold">{quantumSimulationResult.ciphertextSizeBytes} bytes</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Quantum Security Margin:</span>
                    <span className="text-emerald-400 font-bold">{quantumSimulationResult.securityLevelBits} bits</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Cpu className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر خوارزمية التشفير وانقر على "تشغيل هجوم Shor الكمومي" لاختبار المقاومة.'
                    : 'Select a cipher scheme and click "Launch Shor Attack" to simulate quantum resilience.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Hybrid TLS 1.3 Key Exchange Workbench */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              {isAr ? 'مصافحة TLS 1.3 الهجينة (Post-Quantum Handshake)' : 'Hybrid TLS 1.3 Handshake Simulator'}
            </h3>
            <button
              onClick={handleRunHybridTlsHandshake}
              disabled={isHandshaking}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-emerald-400/30 disabled:opacity-50"
            >
              {isHandshaking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
              {isAr ? 'بدء مصافحة TLS 1.3' : 'Start Hybrid TLS Handshake'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'مجموعة التشفير المعروضة في ClientHello:' : 'Offered ClientHello Key Share:'}</span>
            <span className="text-cyan-400 font-bold">X25519_MLKEM768 (Group Code: 0x11EC)</span>
          </div>

          {/* TLS Handshake Telemetry */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[200px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل تفاوض المفاتيح المشتركة' : 'Key Agreement Telemetry Log'}</span>
            </div>

            {tlsHandshakeLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-emerald-950/30 border border-emerald-800 text-emerald-300 rounded">
                  <div className="font-bold flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'نجحت مصافحة TLS 1.3 الهجينة!' : 'HYBRID TLS 1.3 HANDSHAKE COMPLETED'}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {isAr
                      ? 'تم اشتقاق المفتاح السري باستخدام X25519 + ML-KEM-768 بنجاح لحماية الجلسة.'
                      : 'Established quantum-resistant symmetric key using dual EC Diffie-Hellman + ML-KEM encapsulation.'}
                  </p>
                </div>

                <div className="space-y-1 text-[11px] text-slate-300 bg-slate-900 border border-slate-800 p-2.5 rounded">
                  <div>
                    <span className="text-slate-500 block">Server Encapsulated Ciphertext:</span>
                    <span className="text-amber-300 break-all">{tlsHandshakeLog.serverKemCiphertext}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Derived Session Master Secret (AES-256-GCM):</span>
                    <span className="text-emerald-400 break-all">{tlsHandshakeLog.sharedSecretHex}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Key className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'انقر على "بدء مصافحة TLS 1.3" لمحاكاة تبادل المفاتيح الهجين PQC.'
                    : 'Click "Start Hybrid TLS Handshake" to initiate PQC ML-KEM key exchange.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
