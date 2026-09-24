import React, { useState } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { Challenge } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Network,
  Globe,
  Server,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Play,
  Layers,
  Radio,
} from 'lucide-react';

export const SubnetRoutingSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);

  // Subnetting State
  const [baseNetwork, setBaseNetwork] = useState('192.168.1.0');
  const [cidrPrefix, setCidrPrefix] = useState<number>(26); // /26 divides /24 into 4 subnets of 64

  // Routing State
  const [defaultGateway, setDefaultGateway] = useState('192.168.1.1');
  const [natEnabled, setNatEnabled] = useState(true);

  const totalIps = Math.pow(2, 32 - cidrPrefix);
  const usableHosts = Math.max(0, totalIps - 2);

  const challenge: Challenge = {
    id: 'subnet-routing-challenge',
    simulationId: 'subnet_routing',
    title: language === 'ar' ? 'تحدي تصميم الشبكات الفرعية وتفعيل NAT' : 'Subnet Design & NAT Gateway Challenge',
    difficulty: 'Beginner',
    category: language === 'ar' ? 'الشبكات وتوجيه الحزم' : 'Networking',
    mission:
      language === 'ar'
        ? 'قسم الشبكة إلى نطاقات فرعية بحجم /26 (62 مضيف صالح) وفعل بوابة NAT للاتصال الآمن بالإنترنت.'
        : 'Design a /26 subnet topology with 62 usable hosts per segment and enforce NAT gateway egress.',
    initialExplanation:
      language === 'ar'
        ? 'التقسيم الفرعي (Subnetting) يعزل الأجهزة ويقلل نطاق البث، بينما بوابة NAT تخفي عناوين IP الداخلية.'
        : 'Subnetting divides networks for isolation; NAT translates private IPs to a public IP on egress.',
    objectives: [
      {
        id: 'obj-cidr',
        title: language === 'ar' ? 'ضبط قناع الشبكة على /26' : 'Set Subnet Mask to /26',
        description: language === 'ar' ? 'تقسيم النطاق لتوفير 62 جهاز لكل شبكة فرعية' : 'Divide network into 4 subnets with 62 hosts each',
        isCompleted: cidrPrefix === 26,
        validationKey: 'cidr_ok',
      },
      {
        id: 'obj-nat',
        title: language === 'ar' ? 'تفعيل بوابة NAT' : 'Enable NAT Gateway',
        description: language === 'ar' ? 'ترجمة عناوين IP الخاصة عند الخروج للإنترنت' : 'Translate private addresses for WAN egress',
        isCompleted: natEnabled,
        validationKey: 'nat_ok',
      },
    ],
    hints: [
      language === 'ar' ? 'اختر البادئة /26 من القائمة المنسدلة وتأكد من تفعيل خيار NAT.' : 'Select prefix /26 and enable NAT toggle.',
    ],
  };

  const validateChallenge = () => {
    if (cidrPrefix === 26 && natEnabled) {
      return {
        success: true,
        message:
          language === 'ar'
            ? 'ممتاز! تم تصميم الشبكة الفرعية وبوابة NAT بنجاح!'
            : 'Subnet topology and NAT gateway verified successfully!',
      };
    }
    return {
      success: false,
      message: language === 'ar' ? 'تحقق من شروط التقسيم وبوابة NAT.' : 'Check CIDR and NAT requirements.',
    };
  };

  return (
    <Workspace
      title={language === 'ar' ? 'محاكي تقسيم الشبكات الفرعية (CIDR) وتوجيه الحزم وبوابة NAT' : 'Subnet Designer, Routing Tables & NAT Gateway Simulator'}
      subtitle={language === 'ar' ? 'حساب نطاقات العناوين، جداول التوجيه، وترجمة العناوين العامة والخاصة' : 'Subnet Boundaries, Routing Hops & Egress NAT Table'}
      challenge={challenge}
      onValidateChallenge={validateChallenge}
      controlDeck={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-bold uppercase font-mono">
              {language === 'ar' ? 'قناع البادئة CIDR:' : 'CIDR Mask:'}
            </span>
            <select
              value={cidrPrefix}
              onChange={(e) => setCidrPrefix(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded px-2.5 py-1 focus:outline-hidden"
            >
              <option value={24}>/24 (254 Hosts · 255.255.255.0)</option>
              <option value={25}>/25 (126 Hosts · 255.255.255.128)</option>
              <option value={26}>/26 (62 Hosts · 255.255.255.192)</option>
              <option value={27}>/27 (30 Hosts · 255.255.255.224)</option>
              <option value={28}>/28 (14 Hosts · 255.255.255.240)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={natEnabled}
                onChange={(e) => setNatEnabled(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500"
              />
              <span>{language === 'ar' ? 'بوابة NAT مفعلة' : 'NAT Gateway Enabled'}</span>
            </label>
          </div>
        </div>
      }
    >
      <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center select-none">
        {/* Subnet Calculator Summary */}
        <div className="max-w-4xl w-full mb-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              {language === 'ar' ? 'النطاق الأساسي' : 'Base Network'}
            </span>
            <span className="text-sm font-bold text-white font-mono">{baseNetwork}/{cidrPrefix}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              {language === 'ar' ? 'إجمالي العناوين' : 'Total IPs'}
            </span>
            <span className="text-sm font-bold text-cyan-400 font-mono">{totalIps}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              {language === 'ar' ? 'الأجهزة الصالحة' : 'Usable Hosts'}
            </span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{usableHosts}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              {language === 'ar' ? 'حالة بوابة NAT' : 'NAT Egress'}
            </span>
            <span className={`text-sm font-bold font-mono ${natEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
              {natEnabled ? 'ACTIVE (203.0.113.1)' : 'DISABLED'}
            </span>
          </div>
        </div>

        {/* Visual Subnets Grid */}
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <span className="text-xs font-bold text-white block mb-2">
              {language === 'ar' ? 'الشبكة الفرعية 1 (Subnet A)' : 'Subnet A (Engineering)'}
            </span>
            <div className="space-y-1 font-mono text-xs text-slate-300">
              <p><span className="text-slate-500">Network ID:</span> 192.168.1.0</p>
              <p><span className="text-slate-500">Usable Range:</span> 192.168.1.1 - 192.168.1.{totalIps - 2}</p>
              <p><span className="text-slate-500">Broadcast:</span> 192.168.1.{totalIps - 1}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <span className="text-xs font-bold text-white block mb-2">
              {language === 'ar' ? 'جدول ترجمة عناوين NAT' : 'Stateful NAT Translation Table'}
            </span>
            <pre className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
              {natEnabled
                ? `[NAT] 192.168.1.15:54201  <->  203.0.113.1:40001  <->  93.184.216.34:443
[NAT] 192.168.1.22:49152  <->  203.0.113.1:40002  <->  8.8.8.8:53`
                : '[NAT DISABLED] Internal IPs exposed directly to egress path'}
            </pre>
          </div>
        </div>
      </div>
    </Workspace>
  );
};
