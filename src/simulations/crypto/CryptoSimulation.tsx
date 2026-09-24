import React, { useState, useEffect } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { Challenge } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import { translations } from '../../i18n/translations';
import { Key, Lock, Sparkles, RefreshCw, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

export const CryptoSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const t = translations[language];

  const addLog = useSimulationStore((s) => s.addLog);

  const [inputA, setInputA] = useState('CYBERSECURITY');
  const [inputB, setInputB] = useState('CYBERSECURITX'); // 1 char difference

  const [hashA, setHashA] = useState('');
  const [hashB, setHashB] = useState('');

  // Compute real SHA-256
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

  // Compute bit difference (Avalanche metric)
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
      <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center select-none">
        {/* Metric Highlight Box */}
        <div className="max-w-3xl w-full mb-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase font-mono">
              {t.crypto.avalancheMetric}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-cyan-400 font-mono tabular-nums">
                {percent}%
              </span>
              <span className="text-sm font-mono text-slate-300">
                ({flippedBits} {t.crypto.changedBits})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t.crypto.idealDesc}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                percent >= 40 && percent <= 65
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                  : 'bg-amber-950 border-amber-600 text-amber-300'
              }`}
            >
              {percent >= 40 && percent <= 65 ? t.crypto.strongDiffusion : (language === 'ar' ? 'فحص التصادم' : 'COLLISION TESTING')}
            </span>
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Input A */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono uppercase">{t.crypto.inputA}</span>
              <span className="text-[10px] text-slate-500 font-mono">{inputA.length} {language === 'ar' ? 'حرف' : 'chars'}</span>
            </div>
            <input
              type="text"
              value={inputA}
              onChange={(e) => setInputA(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-hidden focus:border-cyan-400"
            />
            <div>
              <span className="text-[10px] font-mono text-slate-500 block mb-1">
                {t.crypto.shaDigest}
              </span>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 break-all leading-relaxed">
                {hashA || 'computing...'}
              </div>
            </div>
          </div>

          {/* Input B */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono uppercase">{t.crypto.inputB}</span>
              <span className="text-[10px] text-slate-500 font-mono">{inputB.length} {language === 'ar' ? 'حرف' : 'chars'}</span>
            </div>
            <input
              type="text"
              value={inputB}
              onChange={(e) => setInputB(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-hidden focus:border-cyan-400"
            />
            <div>
              <span className="text-[10px] font-mono text-slate-500 block mb-1">
                {t.crypto.shaDigest}
              </span>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-amber-300 break-all leading-relaxed">
                {hashB || 'computing...'}
              </div>
            </div>
          </div>
        </div>

        {/* Character Hex Pair Difference Matrix */}
        <div className="max-w-3xl w-full bg-slate-900/40 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400 block mb-2 font-mono">
            {t.crypto.byteComparison}
          </span>
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {hashA &&
              hashB &&
              Array.from({ length: 32 }).map((_, i) => {
                const bA = hashA.slice(i * 2, i * 2 + 2);
                const bB = hashB.slice(i * 2, i * 2 + 2);
                const isMatch = bA === bB;
                return (
                  <div
                    key={i}
                    className={`px-1.5 py-1 rounded text-center border ${
                      isMatch
                        ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-800 text-rose-300'
                    }`}
                  >
                    <span className="block text-[9px] opacity-70">#{i}</span>
                    <span>{bB}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </Workspace>
  );
};
