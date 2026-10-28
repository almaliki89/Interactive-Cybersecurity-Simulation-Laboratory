import React, { useState, useEffect } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { Challenge } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import { translations } from '../../i18n/translations';
import {
  Key,
  Lock,
  Sparkles,
  RefreshCw,
  Layers,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  UserX,
  FileCode,
  Radio,
  Coins,
} from 'lucide-react';
import { simulateBlockCipher, simulateDiffieHellman } from './logic/cryptoEngine';
import { PostQuantumLab } from './PostQuantumLab';
import { HardwareSideChannelLab } from './HardwareSideChannelLab';
import { HsmPkiLab } from './HsmPkiLab';
import { SmartContractSecurityLab } from './SmartContractSecurityLab';

type CryptoLabTab = 'AVALANCHE' | 'MODES' | 'DIFFIE_HELLMAN' | 'POST_QUANTUM' | 'SIDE_CHANNEL' | 'HSM_PKI' | 'SMART_CONTRACT';

export const CryptoSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const t = translations[language];
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<CryptoLabTab>('AVALANCHE');

  // --- TAB 1: Avalanche State ---
  const [inputA, setInputA] = useState('CYBERSECURITY');
  const [inputB, setInputB] = useState('CYBERSECURITX');
  const [hashA, setHashA] = useState('');
  const [hashB, setHashB] = useState('');

  const computeSha256 = async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    computeSha256(inputA).then(setHashA);
  }, [inputA]);

  useEffect(() => {
    computeSha256(inputB).then(setHashB);
  }, [inputB]);

  const calcBitDiff = () => {
    if (!hashA || !hashB || hashA.length !== hashB.length) return { flippedBits: 0, percent: 0 };
    let flipped = 0;
    const totalBits = 256;

    for (let i = 0; i < hashA.length; i += 2) {
      const byteA = parseInt(hashA.slice(i, i + 2), 16);
      const byteB = parseInt(hashB.slice(i, i + 2), 16);
      const xor = byteA ^ byteB;
      for (let b = 0; b < 8; b++) {
        if ((xor >> b) & 1) flipped++;
      }
    }
    const percent = Math.round((flipped / totalBits) * 100);
    return { flippedBits: flipped, percent };
  };

  const { flippedBits, percent } = calcBitDiff();

  // --- TAB 2: Block Cipher Modes State ---
  const [blockMode, setBlockMode] = useState<'ECB' | 'CBC'>('ECB');
  const [blockText, setBlockText] = useState('CONFIDENTIAL_PAYROLL_DATA_CONFIDENTIAL_PAYROLL_DATA_CONFIDENTIAL_');
  const blockResult = simulateBlockCipher(blockText, blockMode);

  // --- TAB 3: Diffie-Hellman State ---
  const [alicePriv, setAlicePriv] = useState(6);
  const [bobPriv, setBobPriv] = useState(15);
  const [mitmEnabled, setMitmEnabled] = useState(false);
  const dhState = simulateDiffieHellman(alicePriv, bobPriv, 23, 5, mitmEnabled, 9);

  const cryptoChallenge: Challenge = {
    id: 'crypto-avalanche-challenge',
    simulationId: 'crypto',
    title: t.crypto.missionTitle,
    difficulty: 'Beginner',
    category: t.crypto.missionCategory,
    mission: t.crypto.missionDesc,
    initialExplanation:
      language === 'ar'
        ? 'الخاصية الجوهرية لدوال التجزئة الآمنة (SHA-256) هي تأثير الانهيار الجليدي: تغيير بت واحد في المدخل يؤدي لتغيير نصف بتات المخرجات بشكل عشوائي وغير قابل للتنبؤ.'
        : 'A strict property of secure hash functions (SHA-256) is the Avalanche Effect: a single bit change in the input must cause an unpredictable, dramatic change in the digest.',
    objectives: [
      {
        id: 'obj-avalanche',
        title: t.crypto.objBitFlip,
        description: t.crypto.objBitFlipDesc,
        isCompleted: percent >= 40 && percent <= 65,
        validationKey: 'avalanche_hit',
      },
      {
        id: 'obj-ecb-leak',
        title: isAr ? 'كشف تسرب الأنماط في وضع ECB' : 'Expose ECB Pattern Leakage',
        description: isAr ? 'قارن بين وضع ECB المسرب للأنماط ووضع CBC الآمن' : 'Compare ECB mode pattern leakage against CBC mode',
        isCompleted: blockResult.patternLeakageDetected || blockMode === 'CBC',
        validationKey: 'ecb_cbc_analyzed',
      },
    ],
    hints: [t.crypto.hint1],
  };

  const validateChallenge = () => {
    if (percent >= 40 && percent <= 65) {
      return {
        success: true,
        message: t.crypto.valSuccess,
      };
    }
    return {
      success: false,
      message: t.crypto.valNeedDiff,
    };
  };

  return (
    <Workspace
      title={t.crypto.title}
      subtitle={t.crypto.subtitle}
      challenge={cryptoChallenge}
      onValidateChallenge={validateChallenge}
    >
      <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center select-none custom-scrollbar">
        {/* Navigation Tabs */}
        <div className="w-full max-w-4xl mb-6 flex gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('AVALANCHE')}
            data-testid="tab-crypto-avalanche"
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'AVALANCHE'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAr ? 'تأثير الانهيار الجليدي (SHA-256)' : 'Avalanche Effect (SHA-256)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('MODES')}
            data-testid="tab-crypto-modes"
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'MODES'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isAr ? 'أوضاع التشفير المتناظر (ECB vs CBC)' : 'Block Modes (ECB vs CBC)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('DIFFIE_HELLMAN')}
            data-testid="tab-crypto-dh"
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'DIFFIE_HELLMAN'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>{isAr ? 'تبادل المفاتيح واعتراض MitM' : 'Diffie-Hellman & MitM'}</span>
          </button>

          <button
            onClick={() => setActiveTab('POST_QUANTUM')}
            data-testid="tab-crypto-pqc"
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'POST_QUANTUM'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span>{isAr ? 'التشفير المقاوم للكم (PQC)' : 'Post-Quantum Crypto'}</span>
          </button>

          <button
            onClick={() => setActiveTab('SIDE_CHANNEL')}
            data-testid="tab-crypto-hardware"
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'SIDE_CHANNEL'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-300" />
            <span>{isAr ? 'أمن العتاد والهجمات الجانبية' : 'Hardware & Side-Channel'}</span>
          </button>

          <button
            onClick={() => setActiveTab('HSM_PKI')}
            data-testid="tab-crypto-hsm"
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'HSM_PKI'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4 text-indigo-300" />
            <span>{isAr ? 'وحدات HSM وإدارة المفاتيح' : 'HSM & Enterprise PKI'}</span>
          </button>

          <button
            onClick={() => setActiveTab('SMART_CONTRACT')}
            data-testid="tab-crypto-contract"
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'SMART_CONTRACT'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-300" />
            <span>{isAr ? 'أمن العقود الذكية Web3' : 'Smart Contract Security'}</span>
          </button>
        </div>

        {/* TAB 1: Avalanche Effect */}
        {activeTab === 'AVALANCHE' && (
          <div className="w-full max-w-4xl flex flex-col gap-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-cyan-400 block mb-1">
                {isAr ? 'تأثير الانهيار الجليدي (Strict Avalanche Criterion - SAC):' : 'Avalanche Criterion (SAC):'}
              </span>
              {isAr
                ? 'عند تعديل بت واحد فقط في النص الأصلي، يجب أن تتغير نصف بتات التجزئة الناتجة تقريباً (~50%) بصورة حتمية لكن عشوائية التوزيع.'
                : 'When a single bit is modified in the plaintext, approximately 50% of the resulting digest bits must flip unpredictably.'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-300">{isAr ? 'النص الأصلي (A)' : 'Plaintext (A)'}</label>
                <input
                  type="text"
                  value={inputA}
                  onChange={(e) => setInputA(e.target.value)}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500 uppercase font-bold mt-1">SHA-256 Digest:</span>
                <span className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-400 break-all select-text" dir="ltr">
                  {hashA}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-300">{isAr ? 'النص المعدل (B) - اختلاف حرف واحد' : 'Modified Text (B) - 1 char change'}</label>
                <input
                  type="text"
                  value={inputB}
                  onChange={(e) => setInputB(e.target.value)}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500 uppercase font-bold mt-1">SHA-256 Digest:</span>
                <span className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-amber-400 break-all select-text" dir="ltr">
                  {hashB}
                </span>
              </div>
            </div>

            {/* Avalanche Metric Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">{isAr ? 'نسبة البتات المتغيرة (Avalanche Ratio)' : 'Flipped Bits Percentage'}</span>
                <span className="text-2xl font-black text-cyan-400">{percent}%</span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {flippedBits} / 256 {isAr ? 'بت تغيرت' : 'bits flipped'}
                </span>
              </div>

              <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                percent >= 40 && percent <= 65
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                {percent >= 40 && percent <= 65 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>
                  {percent >= 40 && percent <= 65
                    ? isAr ? 'معيار الانهيار محقق (مثالي ~50%)' : 'Avalanche Criterion Satisfied (~50%)'
                    : isAr ? 'النسبة خارج النطاق النموذجي' : 'Suboptimal Avalanche'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Block Cipher Modes (ECB vs CBC) */}
        {activeTab === 'MODES' && (
          <div className="w-full max-w-4xl flex flex-col gap-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? 'مقارنة أوضاع التشفير المتناظر (ECB vs CBC)' : 'Symmetric Cipher Block Modes Analysis'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isAr
                    ? 'وضع ECB يشفر الكتل المتطابقة إلى نص مشفر متطابق (تسرب الأنماط)، بينما CBC يدمج متجه التهيئة IV وسلسلة الكتل.'
                    : 'ECB encrypts identical blocks identically leaking patterns, whereas CBC chains previous blocks with IV.'}
                </p>
              </div>

              <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setBlockMode('ECB')}
                  data-testid="btn-mode-ecb"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    blockMode === 'ECB' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400'
                  }`}
                >
                  ECB (Insecure)
                </button>
                <button
                  onClick={() => setBlockMode('CBC')}
                  data-testid="btn-mode-cbc"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    blockMode === 'CBC' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400'
                  }`}
                >
                  CBC (Secure)
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-300">{isAr ? 'نص الاختبار المتكرر (Plaintext)' : 'Sample Repetitive Plaintext'}</label>
              <input
                type="text"
                value={blockText}
                onChange={(e) => setBlockText(e.target.value)}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Pattern Leakage Warning Banner */}
            <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
              blockResult.patternLeakageDetected
                ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
            }`}>
              <div className="flex items-center gap-2.5">
                {blockResult.patternLeakageDetected ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <ShieldCheck className="w-5 h-5 shrink-0" />}
                <div>
                  <span className="font-bold block">
                    {blockResult.patternLeakageDetected
                      ? isAr ? 'تحذير أمني: تم رصد تسرب أنماط البيانات (ECB Pattern Leakage)!' : 'SECURITY ALERT: Identical Ciphertext Blocks Detected (ECB Leakage)!'
                      : isAr ? 'وضع CBC آمن: انعدام الأنماط المتكررة وتحقيق التشتت الكامل' : 'CBC Mode Secure: Full Diffusion Chained Across All Blocks.'}
                  </span>
                  <span className="text-[11px] opacity-80">
                    {isAr
                      ? `مؤشر التشتت والعشوائية (Diffusion Entropy): ${blockResult.entropyScore}/100`
                      : `Diffusion Entropy Score: ${blockResult.entropyScore}/100`}
                  </span>
                </div>
              </div>
            </div>

            {/* Block Table */}
            <div className="rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-850">
              <div className="p-2.5 bg-slate-900 font-mono text-[10px] uppercase text-slate-400 grid grid-cols-12 gap-2 font-bold">
                <span className="col-span-1">Block</span>
                <span className="col-span-4">Plaintext (8-bytes)</span>
                <span className="col-span-5">Ciphertext Hex</span>
                <span className="col-span-2 text-end">Duplicate?</span>
              </div>
              {blockResult.blocks.map((blk) => (
                <div
                  key={blk.index}
                  className={`p-2.5 font-mono text-xs grid grid-cols-12 gap-2 items-center transition-colors ${
                    blk.isDuplicateCiphertext
                      ? 'bg-rose-950/20 text-rose-300'
                      : 'bg-slate-950/40 text-slate-300'
                  }`}
                >
                  <span className="col-span-1 font-bold text-slate-500">#{blk.index}</span>
                  <span className="col-span-4 text-cyan-300 truncate" title={blk.plaintextHex}>
                    {blk.plaintextAscii} ({blk.plaintextHex.slice(0, 8)}...)
                  </span>
                  <span className="col-span-5 font-bold truncate select-text" dir="ltr">
                    {blk.ciphertextHex}
                  </span>
                  <span className="col-span-2 text-end">
                    {blk.isDuplicateCiphertext ? (
                      <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-400 text-[10px] font-bold">
                        DUPLICATE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 text-[10px]">
                        UNIQUE
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Diffie-Hellman Key Exchange & MitM */}
        {activeTab === 'DIFFIE_HELLMAN' && (
          <div className="w-full max-w-4xl flex flex-col gap-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? 'محاكاة تبادل المفاتيح ديفي-هيلمان وهجوم MitM' : 'Diffie-Hellman Key Exchange & MitM Lab'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isAr
                    ? 'تبادل مفتاح سري مشترك عبر قناة اتصال غير آمنة باستخدام الرياضيات التوافقية (g=5, p=23).'
                    : 'Establish a shared secret over an insecure channel using modular arithmetic (g=5, p=23).'}
                </p>
              </div>

              <button
                onClick={() => setMitmEnabled(!mitmEnabled)}
                data-testid="btn-toggle-mitm"
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  mitmEnabled
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <UserX className="w-4 h-4" />
                <span>{mitmEnabled ? (isAr ? 'إلغاء هجوم MitM' : 'Disable MitM Intercept') : (isAr ? 'تفعيل هجوم رجل في المنتصف (MitM)' : 'Simulate MitM Attack')}</span>
              </button>
            </div>

            {/* Visual Actors Exchange */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Alice */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Alice (Client)</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Priv: a={alicePriv}</span>
                </div>
                <div className="text-xs text-slate-300 font-mono space-y-1">
                  <div>Public: A = 5^{alicePriv} mod 23 = <span className="text-cyan-300 font-bold">{dhState.alicePublic}</span></div>
                  <div>Computed Secret: <span className="text-emerald-400 font-bold text-sm">{dhState.aliceSharedSecret}</span></div>
                </div>
              </div>

              {/* In-Between Channel / Mallory */}
              <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 ${
                mitmEnabled ? 'bg-rose-950/30 border-rose-800/80' : 'bg-slate-900/30 border-slate-800'
              }`}>
                {mitmEnabled ? (
                  <>
                    <UserX className="w-6 h-6 text-rose-400" />
                    <span className="font-bold text-rose-400 text-xs">Mallory (Attacker MitM)</span>
                    <span className="text-[10px] text-slate-300 font-mono">
                      Substituted Key M={dhState.malloryPublic}<br />
                      Decrypted Alice Secret: {dhState.malloryAliceSecret}<br />
                      Decrypted Bob Secret: {dhState.malloryBobSecret}
                    </span>
                  </>
                ) : (
                  <>
                    <Radio className="w-6 h-6 text-slate-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-400">Insecure Public Channel</span>
                    <span className="text-[10px] text-slate-500">Public parameters: g=5, p=23</span>
                  </>
                )}
              </div>

              {/* Bob */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Bob (Server)</span>
                  <span className="text-[10px] text-purple-400 font-mono">Priv: b={bobPriv}</span>
                </div>
                <div className="text-xs text-slate-300 font-mono space-y-1">
                  <div>Public: B = 5^{bobPriv} mod 23 = <span className="text-purple-300 font-bold">{dhState.bobPublic}</span></div>
                  <div>Computed Secret: <span className="text-emerald-400 font-bold text-sm">{dhState.bobSharedSecret}</span></div>
                </div>
              </div>
            </div>

            {/* Exchange Status Banner */}
            <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
              dhState.isSharedSecretMatching
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}>
              <div className="flex items-center gap-2">
                {dhState.isSharedSecretMatching ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
                <span>
                  {dhState.isSharedSecretMatching
                    ? isAr ? `نجح تبادل المفاتيح: المفتاح السري المشترك (${dhState.aliceSharedSecret}) متطابق ومؤمن.` : `Key Exchange Successful: Shared Secret (${dhState.aliceSharedSecret}) matches securely.`
                    : isAr ? 'هجوم رجل في المنتصف نجح: المهاجم اعترض المحادثة وقسم المفتاح السري!' : 'MitM Compromise: Mallory split the key and intercepts both sessions!'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Post-Quantum Cryptography */}
        {activeTab === 'POST_QUANTUM' && (
          <div className="w-full max-w-4xl">
            <PostQuantumLab language={language} />
          </div>
        )}

        {/* TAB 5: Hardware & Side-Channel Security */}
        {activeTab === 'SIDE_CHANNEL' && (
          <div className="w-full max-w-4xl">
            <HardwareSideChannelLab language={language} />
          </div>
        )}

        {/* TAB 6: HSM & Enterprise PKI Architecture */}
        {activeTab === 'HSM_PKI' && (
          <div className="w-full max-w-4xl">
            <HsmPkiLab language={language} />
          </div>
        )}

        {/* TAB 7: Smart Contract & Web3 Security */}
        {activeTab === 'SMART_CONTRACT' && (
          <div className="w-full max-w-4xl">
            <SmartContractSecurityLab language={language} />
          </div>
        )}
      </div>
    </Workspace>
  );
};
