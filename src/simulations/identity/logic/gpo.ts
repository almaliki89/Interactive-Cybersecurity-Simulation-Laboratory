/**
 * Active Directory Group Policy Object (GPO) Inheritance & Precedence Engine
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { AdOrganizationalUnit, DOMAIN_DN } from './directory';

export interface GpoSettings {
  passwordMinLength?: number;
  accountLockoutThreshold?: number;
  screenLockTimeoutMinutes?: number;
  firewallEnabled?: boolean;
  auditLogonEvents?: boolean;
  auditProcessCreation?: boolean;
  powershellScriptBlockLogging?: boolean;
  usbRemovableStorageBlocked?: boolean;
  restrictLocalAdmin?: boolean;
}

export interface AdGpo {
  id: string;
  name: string;
  linkedTargetDn: string; // DOMAIN_DN or OU distinguishedName
  enabled: boolean;
  enforced: boolean; // Enforced (No Override) cannot be blocked by Block Inheritance and takes top precedence
  order: number; // Link order within target (1 = highest within that container)
  settings: GpoSettings;
  descriptionEn: string;
  descriptionAr: string;
}

export interface GpoPolicyOrigin {
  settingKey: keyof GpoSettings;
  value: any;
  gpoId: string;
  gpoName: string;
  linkedTargetDn: string;
  enforced: boolean;
  tier: 'Domain' | 'ParentOU' | 'TargetOU';
  overrodePrevious?: {
    gpoName: string;
    previousValue: any;
  };
}

export interface GpoTraceStep {
  containerDn: string;
  containerName: string;
  gpoId: string;
  gpoName: string;
  applied: boolean;
  blockedByInheritance: boolean;
  disabled: boolean;
  reasonEn: string;
  reasonAr: string;
}

export interface ResolvedGpoResult {
  targetOuDn: string;
  effectiveSettings: GpoSettings;
  settingOrigins: Partial<Record<keyof GpoSettings, GpoPolicyOrigin>>;
  trace: GpoTraceStep[];
}

export const INITIAL_GPOS: AdGpo[] = [
  {
    id: 'gpo-domain-default',
    name: 'Default Domain Policy',
    linkedTargetDn: DOMAIN_DN,
    enabled: true,
    enforced: false,
    order: 1,
    settings: {
      passwordMinLength: 12,
      accountLockoutThreshold: 5,
      screenLockTimeoutMinutes: 15,
      firewallEnabled: true,
      auditLogonEvents: true,
      auditProcessCreation: false,
      powershellScriptBlockLogging: false,
      usbRemovableStorageBlocked: false,
      restrictLocalAdmin: false,
    },
    descriptionEn: 'Baseline domain-wide security settings applied to all accounts and computers',
    descriptionAr: 'سياسات الأمان الأساسية المطبقة على كافة حسابات وأجهزة النطاق',
  },
  {
    id: 'gpo-finance-security',
    name: 'Finance Department Policy',
    linkedTargetDn: 'OU=Finance,DC=corp,DC=nexora,DC=local',
    enabled: true,
    enforced: false,
    order: 1,
    settings: {
      screenLockTimeoutMinutes: 10,
      usbRemovableStorageBlocked: true,
      auditProcessCreation: true,
    },
    descriptionEn: 'Strict accounting controls: 10-minute screen lock, blocked removable USB drives',
    descriptionAr: 'ضوابط محاسبية صارمة: قفل الشاشة بعد 10 دقائق وحظر وحدات تخزين USB',
  },
  {
    id: 'gpo-workstation-baseline',
    name: 'Finance Workstation Lockdown',
    linkedTargetDn: 'OU=Workstations,OU=Finance,DC=corp,DC=nexora,DC=local',
    enabled: true,
    enforced: false,
    order: 1,
    settings: {
      screenLockTimeoutMinutes: 5,
      powershellScriptBlockLogging: true,
      restrictLocalAdmin: true,
      firewallEnabled: true,
    },
    descriptionEn: 'High-security endpoint configuration for financial workstation nodes',
    descriptionAr: 'إعدادات أمنية مشددة لمحطات العمل الخاصة بالأنظمة المالية',
  },
  {
    id: 'gpo-tier0-dc',
    name: 'Domain Controller Hardening (Enforced)',
    linkedTargetDn: DOMAIN_DN,
    enabled: true,
    enforced: true, // Cannot be overridden or blocked!
    order: 2,
    settings: {
      auditLogonEvents: true,
      auditProcessCreation: true,
      powershellScriptBlockLogging: true,
      firewallEnabled: true,
    },
    descriptionEn: 'Enforced enterprise-wide telemetry and auditing that cannot be blocked by downstream OUs',
    descriptionAr: 'سياسة مفروضة إجبارياً للتدقيق والرصد لا يمكن لأي وحدة تنظيمية حجبها',
  },
  {
    id: 'gpo-contractor-restricted',
    name: 'Contractor Environment Restrictions',
    linkedTargetDn: 'OU=Contractors,DC=corp,DC=nexora,DC=local',
    enabled: true,
    enforced: false,
    order: 1,
    settings: {
      screenLockTimeoutMinutes: 5,
      usbRemovableStorageBlocked: true,
      restrictLocalAdmin: true,
    },
    descriptionEn: 'Isolation policy for external vendors',
    descriptionAr: 'سياسة العزل للمتعاقدين والموردين الخارجيين',
  },
];

/**
 * Builds the inheritance hierarchy from Domain Root down to the target OU.
 */
function buildOuHierarchy(
  ous: AdOrganizationalUnit[],
  targetOuDn: string
): { dn: string; name: string; blockInheritance: boolean }[] {
  const hierarchy: { dn: string; name: string; blockInheritance: boolean }[] = [];

  // Domain root always comes first
  hierarchy.push({
    dn: DOMAIN_DN,
    name: 'Domain (Root)',
    blockInheritance: false,
  });

  if (targetOuDn === DOMAIN_DN) {
    return hierarchy;
  }

  // Walk up from targetOuDn to root
  const chain: { dn: string; name: string; blockInheritance: boolean }[] = [];
  let currentDn: string | null = targetOuDn;

  while (currentDn && currentDn !== DOMAIN_DN) {
    const ou = ous.find((o) => o.distinguishedName === currentDn);
    if (!ou) break;

    chain.unshift({
      dn: ou.distinguishedName,
      name: ou.name,
      blockInheritance: ou.blockInheritance || false,
    });

    currentDn = ou.parentOu;
  }

  return [...hierarchy, ...chain];
}

/**
 * Resolves effective Group Policy settings for a given container OU according to
 * LSDOU processing rules, link order, inheritance blocking, and 'Enforced' flags.
 */
export function resolveEffectivePolicies(
  allGpos: AdGpo[],
  ous: AdOrganizationalUnit[],
  targetOuDn: string
): ResolvedGpoResult {
  const hierarchy = buildOuHierarchy(ous, targetOuDn);
  const trace: GpoTraceStep[] = [];
  const effectiveSettings: GpoSettings = {};
  const settingOrigins: Partial<Record<keyof GpoSettings, GpoPolicyOrigin>> = {};

  // Check if any OU in the path blocks inheritance
  // If an OU blocks inheritance, all non-enforced GPOs linked above that OU are blocked
  const blockingOus = new Set<string>();
  for (let i = 1; i < hierarchy.length; i++) {
    if (hierarchy[i].blockInheritance) {
      blockingOus.add(hierarchy[i].dn);
    }
  }

  // Two-pass approach:
  // 1. Process normal (non-enforced) GPOs in order from Domain -> Parent OU -> Target OU
  // 2. Process Enforced GPOs (they override downstream non-enforced settings)

  for (let i = 0; i < hierarchy.length; i++) {
    const container = hierarchy[i];
    const tier: 'Domain' | 'ParentOU' | 'TargetOU' =
      i === 0 ? 'Domain' : i === hierarchy.length - 1 ? 'TargetOU' : 'ParentOU';

    // Get GPOs linked to this container, sorted by order descending (lower order number applies last and wins)
    const linkedGpos = allGpos
      .filter((g) => g.linkedTargetDn.toLowerCase() === container.dn.toLowerCase())
      .sort((a, b) => b.order - a.order);

    for (const gpo of linkedGpos) {
      if (!gpo.enabled) {
        trace.push({
          containerDn: container.dn,
          containerName: container.name,
          gpoId: gpo.id,
          gpoName: gpo.name,
          applied: false,
          blockedByInheritance: false,
          disabled: true,
          reasonEn: `GPO '${gpo.name}' is disabled and will not process.`,
          reasonAr: `السياسة '${gpo.name}' معطلة ولن يتم تطبيقها.`,
        });
        continue;
      }

      // Check if blocked by inheritance:
      // If a downstream OU has blockInheritance, and this GPO is linked above it, and NOT enforced
      let isBlocked = false;
      if (!gpo.enforced) {
        for (let j = i + 1; j < hierarchy.length; j++) {
          if (hierarchy[j].blockInheritance) {
            isBlocked = true;
            break;
          }
        }
      }

      if (isBlocked) {
        trace.push({
          containerDn: container.dn,
          containerName: container.name,
          gpoId: gpo.id,
          gpoName: gpo.name,
          applied: false,
          blockedByInheritance: true,
          disabled: false,
          reasonEn: `GPO '${gpo.name}' blocked by downstream Block Inheritance on child OU.`,
          reasonAr: `تم حجب السياسة '${gpo.name}' بسبب تفعيل خيار حظر التوريث على وحدة تنظيمية فرعية.`,
        });
        continue;
      }

      // Apply settings
      const appliedKeys: string[] = [];
      for (const [key, val] of Object.entries(gpo.settings)) {
        if (val === undefined) continue;
        const sKey = key as keyof GpoSettings;

        // If this setting is already set by an ENFORCED GPO and current GPO is not enforced, it cannot override
        const currentOrigin = settingOrigins[sKey];
        if (currentOrigin && currentOrigin.enforced && !gpo.enforced) {
          continue;
        }

        const prevVal = effectiveSettings[sKey];
        (effectiveSettings as any)[sKey] = val;
        appliedKeys.push(sKey);

        settingOrigins[sKey] = {
          settingKey: sKey,
          value: val,
          gpoId: gpo.id,
          gpoName: gpo.name,
          linkedTargetDn: container.dn,
          enforced: gpo.enforced,
          tier,
          overrodePrevious:
            prevVal !== undefined
              ? {
                  gpoName: currentOrigin?.gpoName || 'Previous GPO',
                  previousValue: prevVal,
                }
              : undefined,
        };
      }

      trace.push({
        containerDn: container.dn,
        containerName: container.name,
        gpoId: gpo.id,
        gpoName: gpo.name,
        applied: true,
        blockedByInheritance: false,
        disabled: false,
        reasonEn: `Applied settings: [${appliedKeys.join(', ')}]${gpo.enforced ? ' (Enforced)' : ''}.`,
        reasonAr: `تم تطبيق الإعدادات: [${appliedKeys.join(', ')}]${gpo.enforced ? ' (مفروضة إجبارياً)' : ''}.`,
      });
    }
  }

  return {
    targetOuDn,
    effectiveSettings,
    settingOrigins,
    trace,
  };
}
