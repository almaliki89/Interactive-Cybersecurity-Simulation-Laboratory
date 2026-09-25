import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  TokenBucketState,
  FixedWindowState,
  consumeTokenBucket,
  evaluateFixedWindow,
  RateLimitDecision,
} from './logic/rateLimit';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Zap,
  RotateCcw,
  Clock,
  Server,
} from 'lucide-react';

interface RateLimitingLabProps {
  onBackToMap?: () => void;
  onNavigateToLogging?: () => void;
}

export const RateLimitingLab: React.FC<RateLimitingLabProps> = ({
  onBackToMap,
  onNavigateToLogging,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);

  const [simulatedTime, setSimulatedTime] = useState<number>(0);
  const [bucket, setBucket] = useState<TokenBucketState>({
    clientId: 'client-192.168.1.50',
    tokens: 5,
    capacity: 5,
    refillRatePerSec: 1, // 1 token per second
    lastRefillVirtualTime: 0,
  });

  const [recentDecisions, setRecentDecisions] = useState<Array<{ decision: RateLimitDecision; time: number }>>([]);

  const handleSendRequest = (burstCount: number = 1) => {
    let currentB = { ...bucket };
    const decisions: Array<{ decision: RateLimitDecision; time: number }> = [];

    for (let i = 0; i < burstCount; i++) {
      const { decision, updatedBucket } = consumeTokenBucket(currentB, simulatedTime, 1);
      currentB = updatedBucket;
      decisions.unshift({ decision, time: simulatedTime });
    }

    setBucket(currentB);
    setRecentDecisions((prev) => [...decisions, ...prev].slice(0, 10));
  };

  const handleAdvanceTime = (seconds: number) => {
    const nextTime = simulatedTime + seconds * 1000;
    setSimulatedTime(nextTime);
  };

  const handleReset = () => {
    setSimulatedTime(0);
    setBucket({
      clientId: 'client-192.168.1.50',
      tokens: 5,
      capacity: 5,
      refillRatePerSec: 1,
      lastRefillVirtualTime: 0,
    });
    setRecentDecisions([]);
  };

  const currentTokens = Math.min(bucket.capacity, bucket.tokens + ((simulatedTime - bucket.lastRefillVirtualTime) / 1000) * bucket.refillRatePerSec);

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
              <Activity className="w-6 h-6 text-rose-400" />
              <span>{isAr ? 'مختبر تقييد معدل الطلبات (Token Bucket Rate Limiting)' : 'Token Bucket & Rate Limiting Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'محاكاة خوارزمية Token Bucket في الوقت الافتراضي لمنع هجمات التخمين الشامل واستنزاف الموارد'
                : 'Simulate Token Bucket rate limiting, capacity refills, 429 Too Many Requests, and Retry-After headers.'}
            </p>
          </div>
        </div>

        {onNavigateToLogging && (
          <button
            onClick={onNavigateToLogging}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
          >
            <Server className="w-3.5 h-3.5" />
            <span>{isAr ? 'سجلات الأمان و SIEM' : 'AppSec Logging Lab'}</span>
          </button>
        )}
      </div>

      {/* Token Bucket Visualizer Deck */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Bucket Status & Controls */}
        <div className="md:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-slate-300 uppercase">Token Bucket Capacity (Tokens: {currentTokens.toFixed(1)} / {bucket.capacity})</span>
            <span className="text-cyan-400 font-bold">Refill: +{bucket.refillRatePerSec} token/sec</span>
          </div>

          {/* Graphical Token Gauge */}
          <div className="space-y-2">
            <div className="h-6 w-full bg-slate-950 rounded-xl overflow-hidden p-1 border border-slate-800">
              <div
                className="h-full rounded-lg bg-gradient-to-r from-cyan-500 to-rose-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (currentTokens / bucket.capacity) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>0 (Empty / 429 Blocked)</span>
              <span>Capacity: {bucket.capacity} Tokens</span>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              onClick={() => handleSendRequest(1)}
              className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Send 1 Req</span>
            </button>

            <button
              onClick={() => handleSendRequest(3)}
              className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center justify-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Burst 3 Reqs</span>
            </button>

            <button
              onClick={() => handleSendRequest(6)}
              className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Flood 6 Reqs</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAdvanceTime(1)}
                className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
              >
                +1s Time
              </button>
              <button
                onClick={() => handleAdvanceTime(5)}
                className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
              >
                +5s Time
              </button>
            </div>
            <button
              onClick={handleReset}
              className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-Time Decision Stream */}
        <div className="md:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-slate-300 uppercase">Rate Limiter Decision Stream</span>
            <span className="text-slate-500">{recentDecisions.length} event(s)</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {recentDecisions.map((entry, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border flex items-center justify-between text-[11px] ${
                  entry.decision.allowed
                    ? 'bg-slate-950 border-slate-800 text-slate-300'
                    : 'bg-red-950/40 border-red-500/40 text-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-500">T+{entry.time / 1000}s</span>
                  <span className={`font-bold ${entry.decision.allowed ? 'text-emerald-400' : 'text-red-400'}`}>
                    HTTP {entry.decision.statusCode}
                  </span>
                  <span className="truncate max-w-xs">{entry.decision.reasonEn}</span>
                </div>
                {!entry.decision.allowed && (
                  <span className="text-amber-400 font-bold whitespace-nowrap">
                    Retry-After: {entry.decision.headers['Retry-After']}s
                  </span>
                )}
              </div>
            ))}
            {recentDecisions.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                Click a button above to send simulated HTTP traffic against the rate limiter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
