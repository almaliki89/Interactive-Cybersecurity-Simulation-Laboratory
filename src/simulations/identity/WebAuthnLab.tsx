import React, { useState, useMemo } from 'react';
import {
  KeyRound,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Fingerprint,
  Usb,
  Smartphone,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  RefreshCw,
  Globe,
  Radio,
  FileCode,
  Sparkles,
} from 'lucide-react';

interface WebAuthnLabProps {
  language?: 'ar' | 'en';
}

type AuthenticatorType = 'PLATFORM_TOUCHID' | 'ROAMING_YUBIKEY' | 'SMS_OTP_LEGACY';

export const WebAuthnLab: React.FC<WebAuthnLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [activeStep, setActiveStep] = useState<'REGISTER' | 'AUTHENTICATE' | 'PHISHING_SIM'>('REGISTER');
  const [authenticatorType, setAuthenticatorType] = useState<AuthenticatorType>('PLATFORM_TOUCHID');
  const [userEmail, setUserEmail] = useState<string>('sarah.connor@cyberdyne.corp');

  // Registration State
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [registeredCredential, setRegisteredCredential] = useState<{
    credentialId: string;
    publicKeyPem: string;
    algorithm: string;
    userPresence: boolean;
    userVerification: boolean;
    registeredAt: string;
  } | null>(null);

  // Authentication State
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authResult, setAuthResult] = useState<{
    success: boolean;
    challengeHex: string;
    signatureHex: string;
    rpId: string;
    userVerified: boolean;
    message: string;
  } | null>(null);

  // Phishing Sim State
  const [targetDomain, setTargetDomain] = useState<string>('https://auth.cyberdyne.corp');
  const [phishingProxyDomain, setPhishingProxyDomain] = useState<string>('https://auth.cyberdyne-login-portal.com');
  const [phishingTestResult, setPhishingTestResult] = useState<{
    outcome: 'BLOCKED_BY_WEBAUTHN' | 'COMPROMISED_LEGACY';
    details: string;
  } | null>(null);

  // Handle Passkey Registration
  const handleRegisterPasskey = () => {
    setIsRegistering(true);
    setRegisteredCredential(null);

    setTimeout(() => {
      const credId = 'cred_fido2_' + Math.random().toString(36).substring(2, 10);
      const pubKey = `-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE${Math.random()
        .toString(36)
        .substring(2, 12)}...89A==\n-----END PUBLIC KEY-----`;

      setRegisteredCredential({
        credentialId: credId,
        publicKeyPem: pubKey,
        algorithm: 'ECDSA_P256_SHA256 (ES256)',
        userPresence: true,
        userVerification: authenticatorType !== 'SMS_OTP_LEGACY',
        registeredAt: new Date().toLocaleTimeString(),
      });

      setIsRegistering(false);
    }, 500);
  };

  // Handle Passkey Authentication
  const handleAuthenticatePasskey = () => {
    setIsAuthenticating(true);
    setAuthResult(null);

    setTimeout(() => {
      const randomChallenge = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, '0')
      ).join('');

      const randomSig = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, '0')
      ).join('');

      setAuthResult({
        success: true,
        challengeHex: randomChallenge,
        signatureHex: randomSig,
        rpId: 'auth.cyberdyne.corp',
        userVerified: true,
        message: isAr
          ? 'تم التحقق من التوقيع الرقمي بنجاح وتوثيق هوية المستخدم دون إرسال كلمات مرور.'
          : 'Cryptographic assertion signature verified successfully by Relying Party server.',
      });

      setIsAuthenticating(false);
    }, 450);
  };

  // Handle AiTM Phishing Test
  const handleRunPhishingTest = (domainRequested: string) => {
    const isAttackerDomain = domainRequested.includes('login-portal');

    if (authenticatorType === 'SMS_OTP_LEGACY') {
      setPhishingTestResult({
        outcome: 'COMPROMISED_LEGACY',
        details: isAr
          ? 'تم خديعة المستخدم وسرقة كلمة المرور ورمز SMS OTP بواسطة وكيل الخداع (Evilginx2)! تم اختراق الحساب.'
          : 'CRITICAL FAILURE: Adversary-in-the-Middle (AiTM) proxy intercepted password + SMS OTP and created a live session cookie!',
      });
    } else {
      setPhishingTestResult({
        outcome: 'BLOCKED_BY_WEBAUTHN',
        details: isAr
          ? `حظر تلقائي ببروتوكول WebAuthn: تم رفض التوقيع لأن النطاق المطلب (${domainRequested}) لا يطابق النطاق الموثوق المعتمد (auth.cyberdyne.corp)!`
          : `WEBAUTHN ORIGIN BINDING BLOCKED PHISHING: Client authenticator refused to generate signature for origin "${domainRequested}" because it does not match RP ID "auth.cyberdyne.corp"!`,
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر أمان مفاتيح المرور Passkeys وبروتوكول FIDO2 / WebAuthn' : 'FIDO2 & WebAuthn Passkeys Security Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 rounded-full font-mono">
                W3C WebAuthn L3
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة تفاعلية لتسجيل ومصادقة التوقيعات الرقمية ECDSA ومقاومة هجمات الخداع الإلكتروني (Phishing Resistance).'
                : 'Interactive public-key challenge-response ceremonies, CTAP2 authenticators, and origin-bound phishing defense.'}
            </p>
          </div>
        </div>

        {/* Workflow Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveStep('REGISTER')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeStep === 'REGISTER' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? '1. تسجيل المفتاح' : '1. Registration'}
          </button>
          <button
            onClick={() => setActiveStep('AUTHENTICATE')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeStep === 'AUTHENTICATE' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? '2. التوثيق والتوقيع' : '2. Authentication'}
          </button>
          <button
            onClick={() => setActiveStep('PHISHING_SIM')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeStep === 'PHISHING_SIM' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? '3. هجوم الخداع (AiTM)' : '3. Phishing Attack'}
          </button>
        </div>
      </div>

      {/* Authenticator Hardware Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <span className="text-slate-300 font-bold flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-emerald-400" />
          {isAr ? 'نوع جهاز التوثيق الأصلي (Authenticator Method):' : 'Select CTAP2 Authenticator Device:'}
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setAuthenticatorType('PLATFORM_TOUCHID')}
            className={`px-3 py-1.5 rounded border text-xs font-bold transition-all flex items-center gap-1.5 ${
              authenticatorType === 'PLATFORM_TOUCHID'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Platform Passkey (Touch ID / Hello)</span>
          </button>

          <button
            onClick={() => setAuthenticatorType('ROAMING_YUBIKEY')}
            className={`px-3 py-1.5 rounded border text-xs font-bold transition-all flex items-center gap-1.5 ${
              authenticatorType === 'ROAMING_YUBIKEY'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <Usb className="w-3.5 h-3.5" />
            <span>YubiKey 5 FIDO2 Token</span>
          </button>

          <button
            onClick={() => setAuthenticatorType('SMS_OTP_LEGACY')}
            className={`px-3 py-1.5 rounded border text-xs font-bold transition-all flex items-center gap-1.5 ${
              authenticatorType === 'SMS_OTP_LEGACY'
                ? 'bg-rose-950 border-rose-500 text-rose-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-rose-400" />
            <span>Legacy Password + SMS OTP</span>
          </button>
        </div>
      </div>

      {/* Main Active Step Viewport */}
      {activeStep === 'REGISTER' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                {isAr ? 'مراسم تسجيل مفتاح المرور (Passkey Registration Ceremony)' : 'WebAuthn Credential Registration Ceremony'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? 'يقوم الجهاز بإنشاء زوج مفاتيح منحنيات إهليجية (ES256) فريد لكل موقع، ويحفظ المفتاح الخاص في البيئة الآمنة.'
                  : 'Relying Party challenges client authenticator to generate unique ECDSA P-256 key pair bound to RP ID.'}
              </p>
            </div>

            <button
              onClick={handleRegisterPasskey}
              disabled={isRegistering}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow disabled:opacity-50"
            >
              {isRegistering ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Fingerprint className="w-3.5 h-3.5" />}
              {isAr ? 'إنشاء وتسجيل Passkey جديد' : 'Generate & Register Passkey'}
            </button>
          </div>

          {/* Credential Output Display */}
          {registeredCredential ? (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  {isAr ? 'تم تسجيل المفتاح بنجاح في السيرفر' : 'Credential Registered Successfully on Server'}
                </span>
                <span className="text-slate-400">{registeredCredential.registeredAt}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-slate-300">
                <div>
                  <span className="text-slate-500 block">Credential ID:</span>
                  <span className="text-emerald-300 font-bold">{registeredCredential.credentialId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Algorithm:</span>
                  <span className="text-indigo-300">{registeredCredential.algorithm}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Public Key PEM (Stored on Server):</span>
                <pre className="p-2.5 bg-slate-900 border border-slate-800 text-emerald-400 rounded text-[11px] overflow-x-auto">
                  {registeredCredential.publicKeyPem}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-8 text-center text-slate-500 text-xs">
              {isAr
                ? 'انقر على "إنشاء وتسجيل Passkey جديد" لمحاكاة إنشاء مفاتيح التشفير التابعة لـ W3C.'
                : 'Click "Generate & Register Passkey" to initiate W3C WebAuthn creation ceremony.'}
            </div>
          )}
        </div>
      )}

      {activeStep === 'AUTHENTICATE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {isAr ? 'مراسم التوثيق المشفر للتحدي والاستجابة (Challenge-Response)' : 'WebAuthn Cryptographic Authentication Ceremony'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? 'يرسل السيرفر تحديًا عشوائيًا 32 बाيت، ويقوم جهاز التوثيق بتوقيعه بالمفتاح الخاص بعد فحص البصمة/الوجه.'
                  : 'Server issues random challenge bytes; client authenticates via biometric user presence and signs assertion.'}
              </p>
            </div>

            <button
              onClick={handleAuthenticatePasskey}
              disabled={isAuthenticating}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow disabled:opacity-50"
            >
              {isAuthenticating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
              {isAr ? 'توقيع التحدي والمصادقة' : 'Sign Challenge & Authenticate'}
            </button>
          </div>

          {authResult ? (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>{authResult.message}</span>
              </div>

              <div className="space-y-2 font-mono text-slate-300">
                <div>
                  <span className="text-slate-500 block">RP Domain Binding (Origin):</span>
                  <span className="text-cyan-400 font-bold">{authResult.rpId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Server Cryptographic Challenge (Hex):</span>
                  <span className="text-amber-400 font-bold">{authResult.challengeHex}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Authenticator ECDSA Assertion Signature:</span>
                  <span className="text-emerald-400 break-all">{authResult.signatureHex}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-8 text-center text-slate-500 text-xs">
              {isAr
                ? 'انقر على "توقيع التحدي والمصادقة" لاختبار توقيع التحديات الرقمية بدون كلمات مرور.'
                : 'Click "Sign Challenge & Authenticate" to issue assertion challenge and verify signature.'}
            </div>
          )}
        </div>
      )}

      {activeStep === 'PHISHING_SIM' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              {isAr ? 'اختبار هجمات الخداع المباشرة (Adversary-in-the-Middle Phishing)' : 'Adversary-in-the-Middle (AiTM) Phishing Resilience Test'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'قارن كيف تفشل كلمات المرور وحرموز SMS مقابل حصانة Passkeys المربوطة بنطاق الموقع الأصلي (Origin Binding).'
                : 'Test how FIDO2 origin binding prevents proxy credential theft vs legacy SMS OTP / Password vulnerabilities.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Target Legitimate Site */}
            <div className="bg-slate-950 border border-slate-800 rounded p-4 space-y-3">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                {isAr ? 'الموقع الرسمي الموثوق (RP ID)' : 'Legitimate Corporate Portal'}
              </span>
              <p className="text-slate-400">{targetDomain}</p>
              <button
                onClick={() => handleRunPhishingTest(targetDomain)}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-bold"
              >
                {isAr ? 'تسجيل الدخول على الموقع الأصلي' : 'Login via Legitimate Portal'}
              </button>
            </div>

            {/* Phishing Proxy Site */}
            <div className="bg-slate-950 border border-slate-800 rounded p-4 space-y-3">
              <span className="font-bold text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                {isAr ? 'موقع الخداع الضار (AiTM Proxy)' : 'Phishing Proxy (Evilginx2)'}
              </span>
              <p className="text-slate-400">{phishingProxyDomain}</p>
              <button
                onClick={() => handleRunPhishingTest(phishingProxyDomain)}
                className="w-full py-2 bg-rose-700 hover:bg-rose-600 text-white rounded font-bold"
              >
                {isAr ? 'محاولة الدخول عبر الرابط المخدوع' : 'Attempt Login via Phishing Link'}
              </button>
            </div>
          </div>

          {/* Test Result Display */}
          {phishingTestResult && (
            <div
              className={`p-4 rounded-lg border text-xs font-mono space-y-2 ${
                phishingTestResult.outcome === 'BLOCKED_BY_WEBAUTHN'
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-800 text-rose-200'
              }`}
            >
              <div className="font-bold text-sm flex items-center gap-2">
                {phishingTestResult.outcome === 'BLOCKED_BY_WEBAUTHN' ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>{isAr ? 'نجاح الدفاع: حظر الهجوم تماماً!' : 'PHISHING DEFENDED SUCCESSFULLY!'}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>{isAr ? 'فشل الحماية: تم سرقة البيانات!' : 'COMPROMISED VIA PHISHING PROXY!'}</span>
                  </>
                )}
              </div>
              <p className="leading-relaxed">{phishingTestResult.details}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
