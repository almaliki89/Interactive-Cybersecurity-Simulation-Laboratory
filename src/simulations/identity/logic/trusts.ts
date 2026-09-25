/**
 * Active Directory Enterprise Trust Relationships Engine
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export type TrustDirection = 'OneWay_Incoming' | 'OneWay_Outgoing' | 'TwoWay';
export type TrustType = 'ParentChild' | 'Forest' | 'External';

export interface DomainTrust {
  id: string;
  sourceDomain: string; // The domain defining the trust
  targetDomain: string; // The partner domain
  direction: TrustDirection;
  trustType: TrustType;
  transitive: boolean;
  sidFilteringEnabled: boolean;
  descriptionEn: string;
  descriptionAr: string;
}

export interface TrustAuthDecision {
  canAuthenticate: boolean;
  trustPath: string[];
  reasonEn: string;
  reasonAr: string;
  transitivePath: boolean;
  authSuccessWarningEn: string;
  authSuccessWarningAr: string;
}

export const INITIAL_DOMAIN_TRUSTS: DomainTrust[] = [
  {
    id: 'trust-parent-child',
    sourceDomain: 'corp.nexora.local',
    targetDomain: 'emea.corp.nexora.local',
    direction: 'TwoWay',
    trustType: 'ParentChild',
    transitive: true,
    sidFilteringEnabled: false,
    descriptionEn: 'Automatic bidirectional transitive tree root to child domain trust',
    descriptionAr: 'علاقة ثقة تلقائية ثنائية الاتجاه ومتعدية بين النطاق الرئيسي والفرعي',
  },
  {
    id: 'trust-forest-partner',
    sourceDomain: 'corp.nexora.local',
    targetDomain: 'partner-alliance.net',
    direction: 'OneWay_Incoming', // corp.nexora.local trusts partner-alliance.net (partner users access corp resources)
    trustType: 'Forest',
    transitive: true,
    sidFilteringEnabled: true,
    descriptionEn: 'One-Way Forest Trust: Partner-Alliance users can authenticate to Nexora resources',
    descriptionAr: 'ثقة غابات أحادية الاتجاه: يمكن لمستخدمي الشريك المصادقة على موارد نيكسورا',
  },
  {
    id: 'trust-external-legacy',
    sourceDomain: 'corp.nexora.local',
    targetDomain: 'legacy-datacenter.internal',
    direction: 'OneWay_Outgoing', // legacy trusts corp (corp users access legacy)
    trustType: 'External',
    transitive: false,
    sidFilteringEnabled: true,
    descriptionEn: 'One-Way External Trust: Nexora users can authenticate to legacy internal systems',
    descriptionAr: 'ثقة خارجية أحادية الاتجاه: يمكن لمستخدمي نيكسورا الوصول للأنظمة القديمة',
  },
];

/**
 * Checks if a user from userDomain can authenticate against resources in resourceDomain.
 * Rule: For user in Domain B to access Domain A: Domain A must TRUST Domain B!
 * Direction on Domain A: 'TwoWay' OR 'OneWay_Incoming' (or on Domain B: 'OneWay_Outgoing').
 */
export function canAuthenticateAcrossTrust(
  trusts: DomainTrust[],
  userDomain: string,
  resourceDomain: string
): TrustAuthDecision {
  const normUserDomain = userDomain.trim().toLowerCase();
  const normResourceDomain = resourceDomain.trim().toLowerCase();

  // Same domain: local authentication
  if (normUserDomain === normResourceDomain) {
    return {
      canAuthenticate: true,
      trustPath: [userDomain],
      reasonEn: `Intra-domain authentication: User and resource reside within the same domain '${userDomain}'.`,
      reasonAr: `مصادقة داخلية: المستخدم والمورد يقعان ضمن نفس النطاق '${userDomain}'.`,
      transitivePath: false,
      authSuccessWarningEn: 'Authentication allows Kerberos ticket issuance, but resource DACL still governs authorization.',
      authSuccessWarningAr: 'المصادقة تتيح إصدار تذاكر Kerberos، لكن قوائم DACL للمورد هي التي تحدد التفويض الفعلي.',
    };
  }

  // Find direct trust relationship
  const directTrust = trusts.find(
    (t) =>
      (t.sourceDomain.toLowerCase() === normResourceDomain && t.targetDomain.toLowerCase() === normUserDomain) ||
      (t.sourceDomain.toLowerCase() === normUserDomain && t.targetDomain.toLowerCase() === normResourceDomain)
  );

  if (directTrust) {
    // If trust is defined on resourceDomain towards userDomain:
    if (directTrust.sourceDomain.toLowerCase() === normResourceDomain) {
      if (directTrust.direction === 'TwoWay' || directTrust.direction === 'OneWay_Incoming') {
        return {
          canAuthenticate: true,
          trustPath: [userDomain, resourceDomain],
          reasonEn: `Direct ${directTrust.trustType} Trust: '${resourceDomain}' trusts '${userDomain}' (${directTrust.direction}).`,
          reasonAr: `ثقة مباشرة من نوع ${directTrust.trustType}: النطاق '${resourceDomain}' يثق في '${userDomain}'.`,
          transitivePath: directTrust.transitive,
          authSuccessWarningEn: 'Authentication succeeded across forest trust. Note: Cross-realm Kerberos referral tickets generated.',
          authSuccessWarningAr: 'نجحت المصادقة عبر ثقة الغابات. ملاحظة: تم توليد تذاكر إحالة Kerberos عابرة للنطاقات.',
        };
      }
    } else {
      // Trust defined on userDomain towards resourceDomain
      if (directTrust.direction === 'TwoWay' || directTrust.direction === 'OneWay_Outgoing') {
        return {
          canAuthenticate: true,
          trustPath: [userDomain, resourceDomain],
          reasonEn: `Direct ${directTrust.trustType} Trust: '${resourceDomain}' trusts '${userDomain}'.`,
          reasonAr: `ثقة مباشرة من نوع ${directTrust.trustType}: النطاق '${resourceDomain}' يثق في '${userDomain}'.`,
          transitivePath: directTrust.transitive,
          authSuccessWarningEn: 'Authentication succeeded across trust boundary.',
          authSuccessWarningAr: 'نجحت المصادقة عبر حدود علاقة الثقة.',
        };
      }
    }
  }

  return {
    canAuthenticate: false,
    trustPath: [],
    reasonEn: `Authentication Failed: No valid trust path exists allowing '${userDomain}' identities to authenticate against '${resourceDomain}'.`,
    reasonAr: `فشلت المصادقة: لا يوجد مسار ثقة صالح يسمح لهويات '${userDomain}' بالمصادقة لدى '${resourceDomain}'.`,
    transitivePath: false,
    authSuccessWarningEn: 'No Kerberos referral tickets could be negotiated.',
    authSuccessWarningAr: 'تعذر التفاوض على تذاكر إحالة Kerberos.',
  };
}
