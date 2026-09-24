import React, { useState } from 'react';
import { globalSimulationRuntime } from '../../engine/runtime/SimulationRuntime';
import { useSimulationStore } from '../../stores/simulationStore';
import { Zap, Send, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';

export const UdpSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [lossRate, setLossRate] = useState<number>(20);
  const [packetsSent, setPacketsSent] = useState<number>(0);
  const [packetsDelivered, setPacketsDelivered] = useState<number>(0);
  const [packetsDropped, setPacketsDropped] = useState<number>(0);

  const handleSendUdpDatagram = () => {
    setPacketsSent((prev) => prev + 1);
    const isDropped = Math.random() * 100 < lossRate;

    globalSimulationRuntime.dispatch({
      type: 'PACKET_SENT',
      source: 'UDP_Client (10.0.0.5)',
      target: 'DNS_Server (8.8.8.8:53)',
      description: 'Connectionless UDP Datagram dispatched immediately without handshake',
    });

    if (isDropped) {
      setPacketsDropped((prev) => prev + 1);
      globalSimulationRuntime.dispatch({
        type: 'PACKET_DROPPED',
        source: 'Network_Wire',
        description: 'UDP Datagram lost in transit. No retransmission initiated!',
      });
    } else {
      setPacketsDelivered((prev) => prev + 1);
      globalSimulationRuntime.dispatch({
        type: 'PACKET_DELIVERED',
        source: 'UDP_Client',
        target: 'DNS_Server',
        description: 'UDP Datagram delivered successfully',
      });
    }
  };

  const handleReset = () => {
    setPacketsSent(0);
    setPacketsDelivered(0);
    setPacketsDropped(0);
    globalSimulationRuntime.reset();
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen rounded-xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-1">
          <Zap className="w-4 h-4" />
          <span>{isAr ? 'بروتوكول بيانات المستخدم (UDP)' : 'User Datagram Protocol (UDP) & Connectionless Flow'}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          {isAr ? 'محاكي بروتوكول UDP ومقارنته بـ TCP' : 'Interactive UDP Connectionless Datagram Simulator'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isAr
            ? 'تتبع إرسال البيانات بسرعة بدون مصافحة أو تأكيد وصول، وملاحظة عدم وجود إعادة إرسال تلقائية عند فقدان الحزم.'
            : 'Observe low-latency connectionless datagram streaming. Compare zero-overhead UDP against stateful TCP retransmissions.'}
        </p>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isAr ? 'نسبة محاكاة فقدان الحزم (%)' : 'Simulated Packet Loss Rate (%)'}
          </label>
          <input
            type="range"
            min="0"
            max="80"
            value={lossRate}
            onChange={(e) => setLossRate(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <div className="text-xs text-cyan-300 font-mono text-right">{lossRate}% Loss Rate</div>
        </div>

        <div className="flex items-end gap-2 md:col-span-2">
          <button
            onClick={handleSendUdpDatagram}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg shadow-lg shadow-cyan-900/30 transition"
          >
            <Send className="w-4 h-4" />
            <span>{isAr ? 'إرسال حزمة UDP' : 'Transmit UDP Datagram'}</span>
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold block mb-1">{isAr ? 'إجمالي الحزم المرسلة' : 'Total UDP Datagrams Sent'}</span>
          <span className="text-2xl font-bold font-mono text-cyan-300">{packetsSent}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold block mb-1">{isAr ? 'الحزم المستلمة بنجاح' : 'Datagrams Delivered'}</span>
          <span className="text-2xl font-bold font-mono text-emerald-300">{packetsDelivered}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold block mb-1">{isAr ? 'الحزم المفقودة (بدون إعادة إرسال)' : 'Datagrams Dropped (No Retransmit)'}</span>
          <span className="text-2xl font-bold font-mono text-rose-300">{packetsDropped}</span>
        </div>
      </div>
    </div>
  );
};
