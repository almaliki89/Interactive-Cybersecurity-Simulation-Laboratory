import React, { useState, useMemo } from 'react';
import {
  Activity,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Terminal,
  Cpu,
  Radio,
  Play,
  Flame,
  Gauge,
  Layers,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lock,
} from 'lucide-react';

interface IcsScadaLabProps {
  language?: 'ar' | 'en';
}

interface ModbusCommand {
  id: string;
  nameEn: string;
  nameAr: string;
  functionCode: number;
  fcName: string;
  unitId: number;
  targetRegister: number;
  registerValue: number;
  descriptionEn: string;
  descriptionAr: string;
  isMaliciousWrite: boolean;
}

const MODBUS_COMMANDS: ModbusCommand[] = [
  {
    id: 'CMD-01',
    nameEn: 'Read Generator Telemetry (FC 03)',
    nameAr: 'قراءة بيانات المولد (FC 03)',
    functionCode: 3,
    fcName: '0x03 Read Holding Registers',
    unitId: 1,
    targetRegister: 40001,
    registerValue: 0,
    descriptionEn: 'Standard SCADA HMI polling query to read turbine RPM, temperature, and pressure telemetry from PLC Unit 1.',
    descriptionAr: 'استعلام استطلاع قياسي لنظام SCADA HMI لقراءة سرعة التوربين، وحرارته، وضغطه من وحدة PLC 1.',
    isMaliciousWrite: false,
  },
  {
    id: 'CMD-02',
    nameEn: 'Read Cooling Pump Valve State (FC 01)',
    nameAr: 'قراءة حالة صمام مضخة التبريد (FC 01)',
    functionCode: 1,
    fcName: '0x01 Read Coils',
    unitId: 1,
    targetRegister: 0,
    registerValue: 0,
    descriptionEn: 'Queries digital output coil #00001 to confirm if main emergency coolant valve is OPEN (1) or CLOSED (0).',
    descriptionAr: 'يستعلم عن ملف الخرج الرقمي #00001 للتأكد مما إذا كان صمام الطوارئ مفتوحًا أم مغلقًا.',
    isMaliciousWrite: false,
  },
  {
    id: 'CMD-03',
    nameEn: 'Tamper Cooling Valve Setpoint (FC 06)',
    nameAr: 'التلاعب في ضبط صمام التبريد (FC 06)',
    functionCode: 6,
    fcName: '0x06 Write Single Register',
    unitId: 1,
    targetRegister: 40005,
    registerValue: 0, // Force close coolant
    descriptionEn: 'Adversarial packet forcing coolant flow to 0%, causing rapid heat accumulation in the primary reactor core.',
    descriptionAr: 'حزمة معاداة تجبر تدفق التبريد على 0٪، مما يسبب تراكمًا سريعًا للحرارة في قلب المفاعل.',
    isMaliciousWrite: true,
  },
  {
    id: 'CMD-04',
    nameEn: 'Mass Override Safety Interlocks (FC 16)',
    nameAr: 'إلغاء قواطع الأمان الجماعية (FC 16)',
    functionCode: 16,
    fcName: '0x16 Write Multiple Registers',
    unitId: 1,
    targetRegister: 40010,
    registerValue: 9999, // Dangerous maximum RPM limit
    descriptionEn: 'Crafted Modbus frame writing multi-register values to disable thermal trip breakers and overspeed automatic shutdowns.',
    descriptionAr: 'إطار Modbus مكتوب خصيصًا لتعديل سجلات متعددة لإلغاء قواطع الإغلاق التلقائي لمنع الحرارة المفرطة.',
    isMaliciousWrite: true,
  },
];

export const IcsScadaLab: React.FC<IcsScadaLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedCmdId, setSelectedCmdId] = useState<string>('CMD-01');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);

  // SCADA State Simulation
  const [coreTemperature, setCoreTemperature] = useState<number>(65); // Celsius
  const [turbineRpm, setTurbineRpm] = useState<number>(3000);
  const [coolantFlowPct, setCoolantFlowPct] = useState<number>(100);
  const [safetyInterlockActive, setSafetyInterlockActive] = useState<boolean>(true);

  // SCADA Firewall / Modbus DPI Settings
  const [firewallReadOnlyPolicy, setFirewallReadOnlyPolicy] = useState<boolean>(false);
  const [firewallMaxTempThreshold, setFirewallMaxTempThreshold] = useState<boolean>(false);

  const [lastTransmission, setLastTransmission] = useState<{
    status: 'ACCEPTED' | 'DROPPED_BY_FIREWALL' | 'ALARM';
    message: string;
    modbusHexAdu: string;
  } | null>(null);

  const cmd = useMemo(
    () => MODBUS_COMMANDS.find((c) => c.id === selectedCmdId) || MODBUS_COMMANDS[0],
    [selectedCmdId]
  );

  const handleSendModbusFrame = () => {
    setIsTransmitting(true);
    setLastTransmission(null);

    // Build raw Modbus TCP ADU Hex String for educational inspection
    // Header: Transaction ID (0x0001), Protocol (0x0000), Length (0x0006), UnitID (0x01), FC, Reg, Val
    const txnIdHex = '0001';
    const protoIdHex = '0000';
    const lenHex = '0006';
    const unitHex = cmd.unitId.toString(16).padStart(2, '0');
    const fcHex = cmd.functionCode.toString(16).padStart(2, '0');
    const regHex = cmd.targetRegister.toString(16).padStart(4, '0');
    const valHex = cmd.registerValue.toString(16).padStart(4, '0');
    const fullHex = `${txnIdHex} ${protoIdHex} ${lenHex} ${unitHex} ${fcHex} ${regHex} ${valHex}`.toUpperCase();

    setTimeout(() => {
      let isDropped = false;
      let dropReason = '';

      if (cmd.isMaliciousWrite) {
        if (firewallReadOnlyPolicy) {
          isDropped = true;
          dropReason = isAr
            ? 'تم إسقاط الحزمة بواسطة جدار حماية ICS: تم تفعيل سياسة القراءة فقط لمقبض Modbus (حظر FC 06 و FC 16).'
            : 'ICS_FIREWALL_DROP: Read-Only Modbus DPI policy blocked unauthorized FC 0x06 / 0x16 write attempt from untrusted workstation.';
        } else if (firewallMaxTempThreshold && cmd.registerValue === 0) {
          isDropped = true;
          dropReason = isAr
            ? 'تم إسقاط الحزمة: شذوذ في القيم الحسابية للسجلات (تجاوز الحدود الآمنة للحرارة).'
            : 'ICS_DPI_ANOMALY: Modbus payload setpoint violation detected (Coolant Flow 0% breaches safety baseline).';
        }
      }

      if (isDropped) {
        setLastTransmission({
          status: 'DROPPED_BY_FIREWALL',
          message: dropReason,
          modbusHexAdu: fullHex,
        });
      } else {
        // Apply state changes to SCADA plant
        if (cmd.id === 'CMD-03') {
          setCoolantFlowPct(0);
          setCoreTemperature(115); // Alarm Overheat!
        } else if (cmd.id === 'CMD-04') {
          setTurbineRpm(5800); // Critical Overspeed
          setSafetyInterlockActive(false);
          setCoreTemperature(135);
        }

        const isAlarming = cmd.isMaliciousWrite;
        setLastTransmission({
          status: isAlarming ? 'ALARM' : 'ACCEPTED',
          message: isAlarming
            ? isAr
              ? 'تم تنفيذ أمر تعديل PLC بنجاح! ارتفعت حرارة المفاعل وسرعة التوربين إلى مستويات حرجّة!'
              : 'PLC REGISTER MODIFIED! Reactor core temperature exceeded safe operating threshold (115°C+).'
            : isAr
            ? 'تمت قراءة سجلات PLC بنجاح ببروتوكول Modbus TCP.'
            : 'Modbus TCP read request processed normally by PLC unit 1.',
          modbusHexAdu: fullHex,
        });
      }

      setIsTransmitting(false);
    }, 400);
  };

  const handleResetScada = () => {
    setCoreTemperature(65);
    setTurbineRpm(3000);
    setCoolantFlowPct(100);
    setSafetyInterlockActive(true);
    setLastTransmission(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر أمان النظم التشغيلية وتجهيزات SCADA / ICS' : 'OT, ICS & SCADA Modbus Security Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800 rounded-full font-mono">
                IEC 62443 / Modbus TCP
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة تفاعلية لحزم Modbus TCP والتلاعب بسجلات PLC والتحكم بالنظم الصناعية المباشرة.'
                : 'Interactive Modbus TCP frame crafting, PLC register tampering, and SCADA firewall anomaly detection.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetScada}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {isAr ? 'إعادة ضبط المحطة' : 'Reset SCADA Plant'}
        </button>
      </div>

      {/* Real-time SCADA Telemetry Screen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'حرارة القلب' : 'Reactor Core Temp'}</span>
            <span
              className={`text-lg font-bold ${
                coreTemperature > 90 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
              }`}
            >
              {coreTemperature}°C
            </span>
          </div>
          <Flame className={`w-6 h-6 ${coreTemperature > 90 ? 'text-rose-500' : 'text-emerald-500'}`} />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'دوران التوربين' : 'Turbine Generator'}</span>
            <span className={`text-lg font-bold ${turbineRpm > 4500 ? 'text-amber-400' : 'text-cyan-400'}`}>
              {turbineRpm} RPM
            </span>
          </div>
          <Gauge className="w-6 h-6 text-cyan-400" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'صمام التبريد' : 'Coolant Flow Rate'}</span>
            <span className={`text-lg font-bold ${coolantFlowPct === 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {coolantFlowPct}%
            </span>
          </div>
          <Activity className="w-6 h-6 text-indigo-400" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'قواطع السلامة' : 'Safety Interlocks'}</span>
            <span className={`text-xs font-bold ${safetyInterlockActive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {safetyInterlockActive ? (isAr ? 'نشطة وخالية' : 'ENGAGED') : (isAr ? 'ملغاة! خطورة' : 'TRIPPED / BYPASSED')}
            </span>
          </div>
          <ShieldCheck className={`w-6 h-6 ${safetyInterlockActive ? 'text-emerald-400' : 'text-rose-400'}`} />
        </div>
      </div>

      {/* Main Grid: Command Crafting + Frame Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Command Selector & Firewall Toggles */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'أوامر Modbus TCP المستهدفة' : 'Modbus Command Packets'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {MODBUS_COMMANDS.map((c) => {
              const isSelected = c.id === selectedCmdId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCmdId(c.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-amber-950/50 border-amber-500 text-slate-100 shadow-md shadow-amber-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">{c.id}</span>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] rounded font-semibold ${
                        c.isMaliciousWrite
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {c.fcName}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? c.nameAr : c.nameEn}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? c.descriptionAr : c.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Industrial Firewall Settings */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'جدار حماية الشبكات الصناعية (DPI Firewall)' : 'Industrial DPI Firewall Rules'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'سياسة القراءة فقط (حظر FC 06 & FC 16)' : 'Enforce Read-Only Modbus Policy'}</span>
                <input
                  type="checkbox"
                  checked={firewallReadOnlyPolicy}
                  onChange={(e) => setFirewallReadOnlyPolicy(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'تدقيق الحدود الأمنية لقيم السجلات' : 'Register Sanity Boundary Verification'}</span>
                <input
                  type="checkbox"
                  checked={firewallMaxTempThreshold}
                  onChange={(e) => setFirewallMaxTempThreshold(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Frame Assembly & Execution Log */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              {isAr ? 'تركيب إطار حزمة Modbus TCP (ADU Frame)' : 'Modbus TCP Frame Inspector'}
            </h3>
            <button
              onClick={handleSendModbusFrame}
              disabled={isTransmitting}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-amber-400/30 disabled:opacity-50"
            >
              {isTransmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isAr ? 'بث الإطار إلى وحدة PLC' : 'Transmit Modbus Frame'}
            </button>
          </div>

          {/* Hex Packet Breakdown */}
          <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-2 text-xs">
            <span className="text-slate-400 font-bold block">{isAr ? 'تفاصيل هيكل الإطار ADU Hex:' : 'ADU Binary/Hex Payload Breakdown:'}</span>
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px]">
              <div className="bg-slate-900 border border-slate-800 p-1 rounded">
                <span className="text-[9px] text-slate-500 block">Txn ID</span>
                <span className="text-cyan-400 font-bold">0001</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-1 rounded">
                <span className="text-[9px] text-slate-500 block">Proto</span>
                <span className="text-slate-400">0000</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-1 rounded">
                <span className="text-[9px] text-slate-500 block">Length</span>
                <span className="text-slate-400">0006</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-1 rounded">
                <span className="text-[9px] text-slate-500 block">Unit ID</span>
                <span className="text-indigo-400 font-bold">01</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-1 rounded">
                <span className="text-[9px] text-slate-500 block">FC</span>
                <span className="text-amber-400 font-bold">0{cmd.functionCode}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-1 rounded">
                <span className="text-[9px] text-slate-500 block">Register</span>
                <span className="text-emerald-400 font-bold">{cmd.targetRegister}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-1 rounded">
                <span className="text-[9px] text-slate-500 block">Value</span>
                <span className="text-rose-400 font-bold">{cmd.registerValue}</span>
              </div>
            </div>
          </div>

          {/* Execution Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[200px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل الاتصال بالشبكة الصناعية' : 'PLC Bus Telemetry Log'}</span>
            </div>

            {lastTransmission ? (
              <div className="space-y-3">
                <div
                  className={`p-3 rounded border text-xs font-mono ${
                    lastTransmission.status === 'DROPPED_BY_FIREWALL'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : lastTransmission.status === 'ALARM'
                      ? 'bg-rose-950/50 border-rose-800 text-rose-200'
                      : 'bg-slate-900 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {lastTransmission.status === 'DROPPED_BY_FIREWALL' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم إسقاط الإطار بواسطة جدار الحماية الصناعي' : 'MODBUS FRAME DROPPED BY FIREWALL'}</span>
                      </>
                    ) : lastTransmission.status === 'ALARM' ? (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'إنذار: تم تعديل السجلات وحصول انحراف خطر!' : 'CRITICAL OT INCIDENT - REGISTERS OVERRIDDEN'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تمت معالجة القراءة بنجاح' : 'READ COMMAND PROCESSED'}</span>
                      </>
                    )}
                  </div>
                  {lastTransmission.message}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Radio className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر أمرًا من القائمة وانقر على "بث الإطار" لإرسال الحزمة واختبار رد فعل شبكة OT.'
                    : 'Select a command payload and click "Transmit Modbus Frame" to test industrial bus responses.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
