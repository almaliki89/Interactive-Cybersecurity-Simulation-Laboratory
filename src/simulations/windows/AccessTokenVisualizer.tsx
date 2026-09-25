import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  INITIAL_WINDOWS_USERS,
  INITIAL_WINDOWS_GROUPS,
  WindowsUser,
} from './logic/identity';
import {
  buildAccessToken,
  WindowsAccessToken,
  IntegrityLevel,
  tokenHasPrivilege,
  tokenHasGroup,
  canElevate,
} from './logic/token';
import {
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  Lock,
  Unlock,
  Layers,
  ChevronRight,
  Terminal,
  Activity,
  Info,
} from 'lucide-react';

interface AccessTokenVisualizerProps {
  onBackToMap?: () => void;
  onNavigateToNtfs?: () => void;
}

export const AccessTokenVisualizer: React.FC<AccessTokenVisualizerProps> = ({
  onBackToMap,
  onNavigateToNtfs,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const addLog = useSimulationStore((s) => s.addLog);

  const [selectedUsername, setSelectedUsername] = useState<string>('alice');
  const [elevatedUac, setElevatedUac] = useState<boolean>(false);
  const [loginStep, setLoginStep] = useState<number>(3); // 1: Login, 2: Auth, 3: Token, 4: Access Decision

  const currentUser = INITIAL_WINDOWS_USERS.find((u) => u.username === selectedUsername) || INITIAL_WINDOWS_USERS[0];

  // Build the access token using production logic
  const token: WindowsAccessToken = buildAccessToken(
    currentUser,
    INITIAL_WINDOWS_GROUPS,
    undefined,
    elevatedUac ? 'High' : undefined,
    virtualTime
  );

  const handleUserSelect = (username: string) => {
    setSelectedUsername(username);
    setElevatedUac(false);
    addLog({
      level: 'INFO',
      source: 'LSA',
      category: 'AUTH',
      message: `Event 4624: An account was successfully logged on (Subject: ${username})`,
      timestamp: virtualTime,
    });
  };

  const handleToggleUacElevation = () => {
    const nextState = !elevatedUac;
    setElevatedUac(nextState);
    addLog({
      level: nextState ? 'WARN' : 'INFO',
      source: 'UAC',
      category: 'SECURITY',
      message: nextState
        ? `UAC Elevation Prompt Approved: Process spawned with High Integrity Token for "${currentUser.username}"`
        : `Token filtered down to Medium Integrity (Standard User Token)`,
      timestamp: virtualTime,
    });
  };

  const getIntegrityColor = (lvl: IntegrityLevel) => {
    switch (lvl) {
      case 'System':
        return 'bg-purple-950/80 border-purple-600 text-purple-300';
      case 'High':
        return 'bg-rose-950/80 border-rose-600 text-rose-300';
      case 'Medium':
        return 'bg-blue-950/80 border-blue-600 text-blue-300';
      case 'Low':
        return 'bg-amber-950/80 border-amber-600 text-amber-300';
      default:
        return 'bg-slate-900 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 select-none space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isAr ? 'العودة للخارطة' : 'Back to Map'}
            >
              <BackArrow className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              <span>{isAr ? 'محلل رمز الأمان (Windows Access Token Visualizer)' : 'Windows Access Token Visualizer'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'فهم الفارق الجوهري بين المصادقة (Authentication) والتفويض (Authorization) وهيكل الرمز الأمني'
                : 'Visually understand Authentication vs Authorization and how Windows builds Security Tokens.'}
            </p>
          </div>
        </div>
      </div>

      {/* Authentication vs Authorization Concept Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-indigo-500/30 p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-blue-500/30">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 mb-1">
              <Lock className="w-4 h-4" />
              <span>1. {isAr ? 'المصادقة (Authentication - AuthN)' : 'Authentication (AuthN)'}</span>
            </div>
            <div className="text-xs font-semibold text-white mb-1">
              {isAr ? 'من أنت؟ (Who are you?)' : 'Who are you?'}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr
                ? 'التحقق من هوية المستخدم عبر إثبات صحة كلمة المرور أو البصمة بواسطة نظام LSA/SAM. عند النجاح، ينتهي دور المصادقة ويتم إنشاء رمز أمان جديد.'
                : 'Validating credentials (password, biometric, Kerberos) via LSA/SAM. Once verified, authentication finishes by minting a Security Token.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 mb-1">
              <Key className="w-4 h-4" />
              <span>2. {isAr ? 'التفويض (Authorization - AuthZ)' : 'Authorization (AuthZ)'}</span>
            </div>
            <div className="text-xs font-semibold text-white mb-1">
              {isAr ? 'ما الذي يحق لك فعله؟ (What may you do?)' : 'What may you do?'}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr
                ? 'تقييم رمز الأمان (المعرف SID، المجموعات، الامتيازات) مقابل قوائم التحكم بالوصول (NTFS DACL) للبت في منح الإذن أو حجبه.'
                : 'Evaluating the minted token (User SID, Groups, Privileges, Integrity) against NTFS DACLs to allow or deny access.'}
            </p>
          </div>
        </div>
      </div>

      {/* User Login Selector Bar */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-semibold text-slate-400">
            {isAr ? 'اختر حساب تسجيل الدخول:' : 'Log on as User:'}
          </span>
          {INITIAL_WINDOWS_USERS.map((user) => {
            const isSelected = user.username === selectedUsername;
            return (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user.username)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40 font-bold'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {user.username}
              </button>
            );
          })}
        </div>

        {/* UAC Elevation Button (for Admins) */}
        {canElevate(token) || elevatedUac ? (
          <button
            onClick={handleToggleUacElevation}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md ${
              elevatedUac
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>
              {elevatedUac
                ? isAr
                  ? 'خفض الصلاحية إلى وضع المستخدم العادي (Drop Elevation)'
                  : 'Drop High Elevation (Filtered Token)'
                : isAr
                ? 'تصعيد الصلاحيات (Run as Administrator / UAC)'
                : 'Elevate with UAC (Run as Admin)'}
            </span>
          </button>
        ) : null}
      </div>

      {/* Security Token Card Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Token Overview & Visual Identity (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-amber-500/40 p-5 space-y-4 shadow-xl shadow-amber-950/10">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{token.tokenId}</h3>
                  <span className="text-[10px] font-mono text-slate-400">Windows NT Primary Token</span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${getIntegrityColor(token.integrityLevel)}`}>
                {token.integrityLevel} Integrity
              </span>
            </div>

            {/* Token Fields */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-0.5">User Identity:</span>
                <div className="font-bold text-white font-mono text-sm">{token.username}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{token.fullName}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-0.5">User SID:</span>
                <span className="font-mono text-cyan-400 text-[11px] break-all select-all">{token.userSid}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block">Elevation Type:</span>
                  <span className="font-mono font-semibold text-slate-200">{token.elevationType}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block">Session ID:</span>
                  <span className="font-mono font-semibold text-slate-200">Session {token.sessionId}</span>
                </div>
              </div>
            </div>

            {/* Next Lab Shortcut */}
            {onNavigateToNtfs && (
              <button
                onClick={onNavigateToNtfs}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
              >
                <span>{isAr ? 'اختبار الرمز في مختبر أذونات NTFS' : 'Test Token in NTFS Lab'}</span>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Group SIDs & Assigned Privileges (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Group SIDs in Token */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                {isAr ? 'معرفات المجموعات المضمنة في الرمز (Group SIDs)' : 'Group SIDs in Security Token'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">{token.groupSids.length} groups</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {token.groupSids.map((sid) => {
                const groupObj = INITIAL_WINDOWS_GROUPS.find((g) => g.sid === sid);
                const isGroupAdmin = sid === 'S-1-5-32-544';

                return (
                  <div
                    key={sid}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                      isGroupAdmin
                        ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-mono font-bold text-white text-xs">
                        {groupObj ? groupObj.name : sid === 'S-1-1-0' ? 'Everyone' : 'Authenticated Users'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">{sid}</div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800 whitespace-nowrap">
                      {isGroupAdmin ? 'MANDATORY ADMIN' : 'ENABLED'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Windows Privileges */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                {isAr ? 'امتيازات الرمز الممنوحة (Token Privileges)' : 'Assigned Windows Privileges'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {token.privileges.filter((p) => p.enabled).length} enabled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {token.privileges.map((priv) => {
                return (
                  <div
                    key={priv.name}
                    className={`p-2.5 rounded-xl border text-xs transition-colors flex flex-col justify-between ${
                      priv.enabled
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                        : 'bg-slate-950/50 border-slate-900 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono font-bold text-[11px] truncate">{priv.name}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                          priv.enabled ? 'bg-emerald-900/80 text-emerald-300' : 'bg-slate-900 text-slate-600'
                        }`}
                      >
                        {priv.enabled ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {isAr ? priv.descriptionAr : priv.descriptionEn}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
