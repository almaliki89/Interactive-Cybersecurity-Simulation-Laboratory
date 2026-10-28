import React, { useState, useMemo } from 'react';
import {
  Coins,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Code,
  Play,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface SmartContractSecurityLabProps {
  language?: 'ar' | 'en';
}

interface ContractScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'REENTRANCY' | 'FLASH_LOAN_ORACLE' | 'FRONT_RUNNING_MEV';
  solidityCode: string;
  attackerDrainAmountEth: number;
  descriptionEn: string;
  descriptionAr: string;
  isThreat: boolean;
}

const CONTRACT_SCENARIOS: ContractScenario[] = [
  {
    id: 'ETH-01',
    nameEn: 'Reentrancy Vulnerability (The DAO Exploit Pattern)',
    nameAr: 'ثغرة إعادة الدخول Reentrancy (نمط هجوم The DAO الشهير)',
    category: 'REENTRANCY',
    solidityCode: `// Vulnerable Bank Contract
function withdraw(uint256 amount) public {
    require(balances[msg.sender] >= amount);
    // VULNERABLE: External call before state update!
    (bool sent, ) = msg.sender.call{value: amount}("");
    require(sent, "Failed to send Ether");
    balances[msg.sender] -= amount; // Too late!
}`,
    attackerDrainAmountEth: 1000,
    descriptionEn: 'Attacker fallback function recursively calls withdraw() before user balance state variable is decremented, draining contract vault.',
    descriptionAr: 'دالة fallback الخاصة بالمهاجم تستدعي withdraw() بشكل ارتدادي مكرر قبل خصم الرصيد، مما يفرغ خزينة العقد بالكامل.',
    isThreat: true,
  },
  {
    id: 'ETH-02',
    nameEn: 'Flash Loan Automated Price Oracle Manipulation',
    nameAr: 'التلاعب بأسعار أوراكل التبادل عبر قروض الفلاش السريعة',
    category: 'FLASH_LOAN_ORACLE',
    solidityCode: `// Vulnerable Lending Protocol using Spot AMM Price
function getCollateralValue(address token) public view returns (uint256) {
    // VULNERABLE: Direct spot reserves ratio can be manipulated in single tx!
    return tokenReserveA / tokenReserveB; 
}`,
    attackerDrainAmountEth: 450,
    descriptionEn: 'Attacker takes out $50M uncollateralized Flash Loan, dumps tokens into AMM pool to artificially crash spot price, and liquidates loans.',
    descriptionAr: 'يقترض المهاجم 50 مليون دولار بقرض فلاش لحظي، ويضخ كميات ضخمة لإسقاط السعر الفوري في المجمع وتصفية القروض.',
    isThreat: true,
  },
  {
    id: 'ETH-03',
    nameEn: 'Mempool Front-Running & Sandwich Attack (MEV)',
    nameAr: 'هجمات السباق المالي وسندويش المعاملات Front-Running MEV',
    category: 'FRONT_RUNNING_MEV',
    solidityCode: `// Large DEX Swap Transaction pending in public Mempool
// Tx1: Attacker Front-Runs with high Gas (Buy low)
// Tx2: Victim Large Swap executes (Pumps price)
// Tx3: Attacker Back-Runs with low Gas (Sell high, pure profit)`,
    attackerDrainAmountEth: 120,
    descriptionEn: 'MEV bot observes victim large slippage swap in public mempool, bribes validator with priority gas fees to sandwich the trade.',
    descriptionAr: 'بوت MEV يرصد صفقة كبيرة في Mempool ويدفع رشوة غاز للمعدن لإدراج صفقات شراء قبله وبيع بعده لجني أرباح طائلة.',
    isThreat: true,
  },
];

export const SmartContractSecurityLab: React.FC<SmartContractSecurityLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('ETH-01');
  const [isExploiting, setIsExploiting] = useState<boolean>(false);

  // Vault Balances
  const [contractVaultEth, setContractVaultEth] = useState<number>(1000);
  const [attackerWalletEth, setAttackerWalletEth] = useState<number>(0);

  const [contractLog, setContractLog] = useState<{
    status: 'SMART_CONTRACT_SECURE' | 'VAULT_DRAINED_EXPLOITED';
    details: string;
    gasReport: string;
    activeDefenses: string[];
  } | null>(null);

  // Smart Contract Guardrails
  const [defenseReentrancyGuard, setDefenseReentrancyGuard] = useState<boolean>(false);
  const [defenseTwapOracle, setDefenseTwapOracle] = useState<boolean>(false);
  const [defensePrivateMempool, setDefensePrivateMempool] = useState<boolean>(false);

  const scenario = useMemo(
    () => CONTRACT_SCENARIOS.find((c) => c.id === selectedScenarioId) || CONTRACT_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleSimulateContractExploit = () => {
    setIsExploiting(true);
    setContractLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (scenario.category === 'REENTRANCY' && defenseReentrancyGuard) {
        activeDefenses.push('OpenZeppelin ReentrancyGuard: nonReentrant Mutex Lock & Checks-Effects-Interactions Pattern');
        isBlocked = true;
      } else if (scenario.category === 'FLASH_LOAN_ORACLE' && defenseTwapOracle) {
        activeDefenses.push('Chainlink Decentralized Multi-Source TWAP (Time-Weighted Average Price) Oracle');
        isBlocked = true;
      } else if (scenario.category === 'FRONT_RUNNING_MEV' && defensePrivateMempool) {
        activeDefenses.push('Flashbots Protect / MEV-Share Private Relayer (Encrypted Mempool Bundle)');
        isBlocked = true;
      }

      if (isBlocked) {
        setContractLog({
          status: 'SMART_CONTRACT_SECURE',
          details: isAr
            ? 'تم حظر الهجوم بنجاح وتأمين رصيد العقد الذكي من السحب غير المشروع!'
            : 'SMART CONTRACT DEFENSE ACTIVE: Transaction reverted with custom error or private relayer prevented MEV sandwich.',
          gasReport: isAr
            ? 'خزينة العقد آمنة بالكامل: تم إرجاع المعاملة Reverted مع استهلاك الغاز الأساسي فقط.'
            : 'Vault assets safe. EVM Revert triggered: Reason "ReentrancyGuard: reentrant call".',
          activeDefenses,
        });
      } else {
        const drainAmount = Math.min(contractVaultEth, scenario.attackerDrainAmountEth);
        setContractVaultEth((prev) => Math.max(0, prev - drainAmount));
        setAttackerWalletEth((prev) => prev + drainAmount);

        setContractLog({
          status: 'VAULT_DRAINED_EXPLOITED',
          details: isAr
            ? `تحذير: تم استغلال ثغرة العقد وتفريغ ${drainAmount} ETH من الخزينة إلى محفظة المهاجم!`
            : `CRITICAL EVM EXPLOIT: Vault drained of ${drainAmount} ETH via reentrancy loop or oracle manipulation!`,
          gasReport: isAr
            ? `[تنفيذ الاستغلال على شبكة EVM] تم تحويل ${drainAmount} ETH بنجاح لغياب نمط Checks-Effects-Interactions.`
            : `[EXPLOIT CONFIRMED IN BLOCK] Emitted Transfer(${drainAmount} ETH -> AttackerContract).`,
          activeDefenses: [],
        });
      }

      setIsExploiting(false);
    }, 450);
  };

  const handleResetVault = () => {
    setContractVaultEth(1000);
    setAttackerWalletEth(0);
    setContractLog(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر أمان العقود الذكية وسلاسل الكتل (Smart Contract & Web3 Security)' : 'Smart Contract & Blockchain Security Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800 rounded-full font-mono">
                Ethereum EVM / Solidity 0.8+
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة تفاعلية لهجمات إعادة الدخول Reentrancy، وتلاعب أسعار قروض الفلاش، وحماية المعاملات ضد بوتات MEV.'
                : 'Interactive EVM Reentrancy exploits, flash loan oracle manipulation, MEV sandwiching, and OpenZeppelin guards.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetVault}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {isAr ? 'إعادة شحن الخزينة' : 'Reset Contract Vault'}
        </button>
      </div>

      {/* Vault Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'رصيد خزينة العقد الذكي' : 'DeFi Protocol Vault Balance'}</span>
            <span className={`text-2xl font-bold ${contractVaultEth === 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {contractVaultEth} ETH
            </span>
          </div>
          <Coins className="w-7 h-7 text-emerald-400" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">{isAr ? 'محفظة المهاجم المستولى عليها' : 'Attacker Stolen Funds'}</span>
            <span className={`text-2xl font-bold ${attackerWalletEth > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {attackerWalletEth} ETH
            </span>
          </div>
          <TrendingDown className={`w-7 h-7 ${attackerWalletEth > 0 ? 'text-rose-400' : 'text-slate-600'}`} />
        </div>
      </div>

      {/* Main Grid: Attack Vector Selection + Solidity Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Attack Vector Selector + Defenses */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات ثغرات العقود الذكية' : 'Smart Contract Threat Vectors'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {CONTRACT_SCENARIOS.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-amber-950/50 border-amber-500 text-slate-100 shadow-md shadow-amber-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">{sc.id}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-slate-300 rounded font-semibold">
                      {sc.category}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? sc.nameAr : sc.nameEn}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? sc.descriptionAr : sc.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Smart Contract Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'دروع حماية وتدقيق العقود الذكية' : 'Smart Contract Hardening Controls'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'تطبيق ReentrancyGuard ونمط CEI' : 'OpenZeppelin ReentrancyGuard & CEI Pattern'}</span>
                <input
                  type="checkbox"
                  checked={defenseReentrancyGuard}
                  onChange={(e) => setDefenseReentrancyGuard(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'استخدام أوراكل موثوق متعدد المصادر TWAP' : 'Multi-Source TWAP Chainlink Oracle'}</span>
                <input
                  type="checkbox"
                  checked={defenseTwapOracle}
                  onChange={(e) => setDefenseTwapOracle(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'إرسال المعاملات عبر Mempool خاص مشفر' : 'Private Mempool Relayer (Flashbots Protect)'}</span>
                <input
                  type="checkbox"
                  checked={defensePrivateMempool}
                  onChange={(e) => setDefensePrivateMempool(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Solidity Code Inspector & EVM Execution Screen */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Code className="w-4 h-4 text-amber-400" />
              {isAr ? 'فحص شفرة كود Solidity البرمجية' : 'Solidity Vulnerable Code Inspector'}
            </h3>
            <button
              onClick={handleSimulateContractExploit}
              disabled={isExploiting}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-amber-400/30 disabled:opacity-50"
            >
              {isExploiting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isAr ? 'تنفيذ استغلال العقد' : 'Trigger Contract Exploit'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-2">
            <span className="text-slate-400 font-bold block">{isAr ? 'شفرة العقد البرمجية في بيئة EVM:' : 'Vulnerable Solidity Routine:'}</span>
            <pre className="p-2.5 bg-slate-900 border border-slate-800 text-amber-300 rounded text-[11px] overflow-x-auto max-h-[160px]">
              {scenario.solidityCode}
            </pre>
          </div>

          {/* EVM Execution Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[220px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل أحداث شبكة EVM ومعاملات البلوك تشين' : 'EVM Transaction Execution Log'}</span>
            </div>

            {contractLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    contractLog.status === 'SMART_CONTRACT_SECURE'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {contractLog.status === 'SMART_CONTRACT_SECURE' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم حماية العقد واسترجاع المعاملة Revert' : 'CONTRACT REVERTED SAFELY - FUNDS SECURED'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'إنذار: تم سحب رصيد الخزينة بنجاح!' : 'CRITICAL CONTRACT DRAIN EXPLOITED'}</span>
                      </>
                    )}
                  </div>
                  {contractLog.details}
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[11px]">
                  {contractLog.gasReport}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Coins className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر ثغرة وانقر على "تنفيذ استغلال العقد" لمعاينة استجابة العقود الذكية ودفاعات OpenZeppelin.'
                    : 'Select a Web3 vulnerability and click "Trigger Contract Exploit".'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
