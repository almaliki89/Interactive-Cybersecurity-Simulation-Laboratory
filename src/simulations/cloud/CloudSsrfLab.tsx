import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Cloud,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Lock,
  Unlock,
  Key,
  Globe,
  Server,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Database,
} from 'lucide-react';

export const CloudSsrfLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [targetUrl, setTargetUrl] = useState('http://169.254.169.254/latest/meta-data/iam/security-credentials/S3-Admin-Role');
  const [imdsVersion, setImdsVersion] = useState<'IMDSv1' | 'IMDSv2'>('IMDSv1');
  const [wafFiltered, setWafFiltered] = useState(false);
  const [isExploiting, setIsExploiting] = useState(false);
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [stolenKeys, setStolenKeys] = useState<{
    accessKeyId?: string;
    secretAccessKey?: string;
    token?: string;
  } | null>(null);
  const [bucketExfiltrated, setBucketExfiltrated] = useState(false);

  const handleExecuteSsrf = () => {
    setIsExploiting(true);
    setResponseOutput(null);
    setStolenKeys(null);

    setTimeout(() => {
      setIsExploiting(false);

      if (wafFiltered && targetUrl.includes('169.254.169.254')) {
        setResponseOutput('HTTP/1.1 403 Forbidden\n[WAF Rule SSRF-001] Internal IP 169.254.169.254 blocked by egress firewall.');
        return;
      }

      if (imdsVersion === 'IMDSv2') {
        if (!targetUrl.includes('api/token')) {
          setResponseOutput('HTTP/1.1 401 Unauthorized\n[IMDSv2 Enforced] Request missing valid X-aws-ec2-metadata-token header.');
          return;
        }
      }

      if (targetUrl.includes('iam/security-credentials')) {
        const fakeCredentials = {
          Code: 'Success',
          LastUpdated: new Date().toISOString(),
          Type: 'AWS-HMAC',
          AccessKeyId: 'ASIA26X7Q9P4M8K1L5N0',
          SecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
          Token: 'IQoJb3JpZ2luX2VjEAAA...[Stolen Temporary STS Token]...',
          Expiration: new Date(Date.now() + 3600000).toISOString(),
        };
        setStolenKeys({
          accessKeyId: fakeCredentials.AccessKeyId,
          secretAccessKey: fakeCredentials.SecretAccessKey,
          token: fakeCredentials.Token,
        });
        setResponseOutput(JSON.stringify(fakeCredentials, null, 2));
      } else {
        setResponseOutput(
          'ami-id\nami-launch-index\nami-manifest-path\nhostname\niam/\ninstance-id\ninstance-type\nlocal-hostname\nlocal-ipv4\npublic-ipv4\nsecurity-groups'
        );
      }
    }, 1000);
  };

  const handleExfiltrateS3 = () => {
    if (!stolenKeys) return;
    setBucketExfiltrated(true);
  };

  const handleReset = () => {
    setTargetUrl('http://169.254.169.254/latest/meta-data/iam/security-credentials/S3-Admin-Role');
    setImdsVersion('IMDSv1');
    setWafFiltered(false);
    setIsExploiting(false);
    setResponseOutput(null);
    setStolenKeys(null);
    setBucketExfiltrated(false);
  };

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto custom-scrollbar select-none">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Cloud className="w-4 h-4" />
            <span>{isAr ? 'معمل ثغرات SSRF وسرقة توكنات السحابة (IMDS)' : 'Cloud SSRF & IMDS Credential Theft Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1 uppercase tracking-tight">
            {isAr ? 'استغلال IMDSv1 وتحصين البيئة بـ IMDSv2' : 'IMDSv1_EXPLOITATION_&_IMDSv2_HARDENING'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setImdsVersion(imdsVersion === 'IMDSv1' ? 'IMDSv2' : 'IMDSv1')}
            data-testid="btn-toggle-imdsv2"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
              imdsVersion === 'IMDSv2'
                ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/70 border-rose-800 text-rose-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{imdsVersion === 'IMDSv2' ? 'IMDSv2 Enforced (Tokens Required)' : 'IMDSv1 (Vulnerable Sessionless)'}</span>
          </button>

          <button
            onClick={() => setWafFiltered(!wafFiltered)}
            data-testid="btn-toggle-ssrf-waf"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
              wafFiltered
                ? 'bg-cyan-950/70 border-cyan-800 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{wafFiltered ? (isAr ? 'حظر SSRF مفعل' : 'WAF SSRF Egress Filter Active') : (isAr ? 'تفعيل فلتر الجدار الناري' : 'Enable WAF Egress Filter')}</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
        <span className="font-bold text-cyan-400 block">
          {isAr ? 'شرح آلية الهجوم والدفاع (Server-Side Request Forgery - SSRF):' : 'Cloud SSRF & IMDS Exploitation Mechanism:'}
        </span>
        <p className="text-slate-400">
          {isAr
            ? 'عند قيام المهاجم بتمرير عنوان IP الخاص بخدمة بيانات الميتا السحابية (169.254.169.254) إلى تطبيق ويب غير محصن، يتم جلب مفاتيح STS المؤقتة لدور IAM وتصعيده لسرقة بيانات S3.'
            : 'By injecting the cloud Instance Metadata Service IP (169.254.169.254) into a vulnerable web endpoint, attackers extract temporary STS role keys and access private S3 buckets.'}
        </p>
      </div>

      {/* Interactive Vulnerable Proxy Input */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? 'نقطة النهاية الضعيفة في تطبيق الويب (Vulnerable PDF/Image Fetcher)' : 'Vulnerable Web App Fetch Endpoint: GET /api/convert-pdf?url='}</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Target IP: 169.254.169.254</span>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-semibold">{isAr ? 'عنوان URL المحقون بواسطة المهاجم (Target URL):' : 'Injected Target URL:'}</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
              dir="ltr"
            />
            <button
              onClick={handleExecuteSsrf}
              disabled={isExploiting}
              data-testid="btn-execute-ssrf"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-cyan-950/40 shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isExploiting ? (isAr ? 'جاري الاستغلال...' : 'Sending SSRF Probe...') : (isAr ? 'إرسال طلب SSRF' : 'Send SSRF Request')}</span>
            </button>
          </div>
        </div>

        {/* Quick Target Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
          <span className="text-slate-500">{isAr ? 'نماذج الهجوم:' : 'Quick Payloads:'}</span>
          <button
            onClick={() => setTargetUrl('http://169.254.169.254/latest/meta-data/')}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300"
          >
            /meta-data/
          </button>
          <button
            onClick={() => setTargetUrl('http://169.254.169.254/latest/meta-data/iam/security-credentials/S3-Admin-Role')}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-rose-400"
          >
            /iam/security-credentials/
          </button>
        </div>
      </div>

      {/* Response Output Console & Stolen Keys */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Terminal Response */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-850 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'استجابة السيرفر الداخلي (HTTP Response Body)' : 'Server HTTP Response Stream'}</span>
            </div>
            <span>IMDS Metadata</span>
          </div>

          <div className="h-56 overflow-y-auto font-mono text-xs p-3 bg-slate-900/50 rounded-lg border border-slate-900 text-cyan-300 select-text leading-relaxed whitespace-pre-wrap" dir="ltr">
            {responseOutput || (isAr ? 'في انتظار إرسال طلب SSRF...' : 'Waiting for SSRF execution...')}
          </div>
        </div>

        {/* Cloud Shell Exploitation & S3 Access */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-rose-400" />
                <span>{isAr ? 'بيانات الاعتماد المسروقة (Stolen STS Credentials)' : 'Stolen Role Credentials'}</span>
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                stolenKeys ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-950 text-slate-500'
              }`}>
                {stolenKeys ? 'EXFILTRATED' : 'SECURE'}
              </span>
            </div>

            {stolenKeys ? (
              <div className="space-y-1.5 font-mono text-xs bg-slate-950 p-3 rounded-lg border border-rose-900/50 text-rose-300 select-text" dir="ltr">
                <div>AWS_ACCESS_KEY_ID: {stolenKeys.accessKeyId}</div>
                <div>AWS_SECRET_ACCESS_KEY: {stolenKeys.secretAccessKey?.slice(0, 16)}...</div>
                <div>AWS_SESSION_TOKEN: {stolenKeys.token?.slice(0, 20)}...</div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic p-4 text-center bg-slate-950 rounded-lg border border-slate-850">
                {isAr ? 'لم يتم استخراج توكنات حقيقية بعد.' : 'No active STS tokens compromised.'}
              </div>
            )}
          </div>

          {/* S3 Bucket Access Action */}
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={handleExfiltrateS3}
              disabled={!stolenKeys || bucketExfiltrated}
              data-testid="btn-exfiltrate-s3"
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-950/40"
            >
              <Database className="w-4 h-4" />
              <span>
                {bucketExfiltrated
                  ? (isAr ? 'تم استخراج بيانات قاعدة البيانات بنجاح (Exfiltrated)!' : 'S3 Bucket Dumped (Exfiltrated)!')
                  : (isAr ? 'استغلال التوكن لسرقة s3://finance-db-backups/' : 'Execute AWS CLI s3 sync stolen-keys')}
              </span>
            </button>

            {bucketExfiltrated && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-xs text-rose-300 flex items-center gap-2 font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>[CRITICAL COMPROMISE] Dumped 4.2GB payroll_hashes.bak from S3!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
