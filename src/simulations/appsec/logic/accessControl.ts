/**
 * Web & Application Security: Access Control Engine (RBAC & Object-Level Ownership)
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export type AppRole = 'Customer' | 'Finance' | 'Manager' | 'Administrator';

export interface AppUser {
  id: string;
  username: string;
  role: AppRole;
  department: string;
  email: string;
}

export interface AppResource {
  id: string;
  type: 'order' | 'report' | 'profile' | 'document' | 'admin_setting';
  ownerUserId: string;
  name: string;
  data: Record<string, unknown>;
  requiredRole?: AppRole;
}

export interface AccessDecision {
  allowed: boolean;
  authenticated: boolean;
  authorized: boolean;
  statusCode: 200 | 401 | 403;
  reasonCode:
    | 'ACCESS_GRANTED'
    | 'UNAUTHENTICATED_NO_SESSION'
    | 'INSUFFICIENT_ROLE_PRIVILEGE'
    | 'OBJECT_OWNERSHIP_VIOLATION_IDOR'
    | 'RESOURCE_NOT_FOUND';
  reasonEn: string;
  reasonAr: string;
  context: {
    userId?: string;
    userRole?: AppRole;
    resourceId?: string;
    resourceOwnerId?: string;
    routePath?: string;
  };
}

export const APP_USERS: Record<string, AppUser> = {
  'usr-alice': {
    id: 'usr-alice',
    username: 'alice',
    role: 'Customer',
    department: 'Retail',
    email: 'alice@nexora.local',
  },
  'usr-bob': {
    id: 'usr-bob',
    username: 'bob',
    role: 'Customer',
    department: 'Retail',
    email: 'bob@nexora.local',
  },
  'usr-sara-fin': {
    id: 'usr-sara-fin',
    username: 'sara_finance',
    role: 'Finance',
    department: 'Finance',
    email: 'sara.fin@corp.nexora.local',
  },
  'usr-admin': {
    id: 'usr-admin',
    username: 'admin',
    role: 'Administrator',
    department: 'IT Security',
    email: 'admin@corp.nexora.local',
  },
};

export const APP_RESOURCES: Record<string, AppResource> = {
  'ord-1001': {
    id: 'ord-1001',
    type: 'order',
    ownerUserId: 'usr-alice',
    name: 'Order #1001 - Enterprise Server Rack',
    data: { amount: 14500, status: 'Shipped', customer: 'Alice Corp' },
  },
  'ord-1002': {
    id: 'ord-1002',
    type: 'order',
    ownerUserId: 'usr-bob',
    name: 'Order #1002 - Cloud Firewall License',
    data: { amount: 3200, status: 'Processing', customer: 'Bob Retail' },
  },
  'rep-q3-fin': {
    id: 'rep-q3-fin',
    type: 'report',
    ownerUserId: 'usr-sara-fin',
    name: 'Q3 Financial Audit Ledger',
    data: { revenue: 4500000, margin: '24.5%' },
    requiredRole: 'Finance',
  },
  'adm-settings': {
    id: 'adm-settings',
    type: 'admin_setting',
    ownerUserId: 'usr-admin',
    name: 'Core System Configurations',
    data: { mfaEnforced: true, logRetentionDays: 365 },
    requiredRole: 'Administrator',
  },
};

/**
 * Evaluates route-level role authorization
 */
export function evaluateRouteAccess(
  user: AppUser | undefined,
  requiredRole?: AppRole
): { allowed: boolean; statusCode: 200 | 401 | 403; reasonEn: string; reasonAr: string } {
  if (!user) {
    return {
      allowed: false,
      statusCode: 401,
      reasonEn: 'Authentication required. No valid user credentials found in request.',
      reasonAr: 'المصادقة مطلوبة. لم يتم العثور على بيانات اعتماد مستخدم صالحة في الطلب.',
    };
  }

  if (!requiredRole) {
    return {
      allowed: true,
      statusCode: 200,
      reasonEn: 'Public or unauthenticated route accessible.',
      reasonAr: 'المسار عام ومتاح للوصول.',
    };
  }

  // Administrators have access to all routes
  if (user.role === 'Administrator') {
    return {
      allowed: true,
      statusCode: 200,
      reasonEn: `Administrator granted superuser access to role '${requiredRole}'.`,
      reasonAr: `تم منح المسؤول صلاحية وصول شاملة للدور '${requiredRole}'.`,
    };
  }

  if (user.role !== requiredRole) {
    return {
      allowed: false,
      statusCode: 403,
      reasonEn: `Access Denied: User '${user.username}' with role '${user.role}' lacks required role '${requiredRole}'.`,
      reasonAr: `تم رفض الوصول: المستخدم '${user.username}' بالدور '${user.role}' يفتقر إلى الدور المطلوب '${requiredRole}'.`,
    };
  }

  return {
    allowed: true,
    statusCode: 200,
    reasonEn: `Access Granted: Role '${user.role}' matches required policy '${requiredRole}'.`,
    reasonAr: `تم السماح بالوصول: الدور '${user.role}' يطابق السياسة المطلوبة '${requiredRole}'.`,
  };
}

/**
 * Evaluates resource-level ownership authorization (Horizontal Privilege / IDOR Protection)
 */
export function evaluateResourceOwnership(
  user: AppUser | undefined,
  resourceId: string,
  enforceOwnership: boolean = true
): AccessDecision {
  if (!user) {
    return {
      allowed: false,
      authenticated: false,
      authorized: false,
      statusCode: 401,
      reasonCode: 'UNAUTHENTICATED_NO_SESSION',
      reasonEn: 'Authentication required: User is not logged in.',
      reasonAr: 'المصادقة مطلوبة: المستخدم لم يسجل دخوله.',
      context: { resourceId },
    };
  }

  const resource = APP_RESOURCES[resourceId];
  if (!resource) {
    return {
      allowed: false,
      authenticated: true,
      authorized: false,
      statusCode: 403,
      reasonCode: 'RESOURCE_NOT_FOUND',
      reasonEn: `Resource '${resourceId}' not found or inaccessible.`,
      reasonAr: `المورد '${resourceId}' غير موجود أو لا يمكن الوصول إليه.`,
      context: { userId: user.id, userRole: user.role, resourceId },
    };
  }

  // Check required role on resource
  if (resource.requiredRole && user.role !== 'Administrator' && user.role !== resource.requiredRole) {
    return {
      allowed: false,
      authenticated: true,
      authorized: false,
      statusCode: 403,
      reasonCode: 'INSUFFICIENT_ROLE_PRIVILEGE',
      reasonEn: `Access Denied: Resource '${resource.name}' requires role '${resource.requiredRole}', but user has role '${user.role}'.`,
      reasonAr: `تم رفض الوصول: المورد '${resource.name}' يتطلب الدور '${resource.requiredRole}'، بينما يملك المستخدم الدور '${user.role}'.`,
      context: {
        userId: user.id,
        userRole: user.role,
        resourceId,
        resourceOwnerId: resource.ownerUserId,
      },
    };
  }

  // Check object ownership
  if (enforceOwnership && user.role !== 'Administrator' && resource.ownerUserId !== user.id) {
    return {
      allowed: false,
      authenticated: true,
      authorized: false,
      statusCode: 403,
      reasonCode: 'OBJECT_OWNERSHIP_VIOLATION_IDOR',
      reasonEn: `BOLA / IDOR Violation: Authenticated user '${user.username}' (${user.id}) requested resource owned by '${resource.ownerUserId}'.`,
      reasonAr: `انتهاك تفويض الكائنات (IDOR): المستخدم الموثق '${user.username}' طلب مورداً يملكه المستخدم '${resource.ownerUserId}'.`,
      context: {
        userId: user.id,
        userRole: user.role,
        resourceId,
        resourceOwnerId: resource.ownerUserId,
      },
    };
  }

  return {
    allowed: true,
    authenticated: true,
    authorized: true,
    statusCode: 200,
    reasonCode: 'ACCESS_GRANTED',
    reasonEn: `Authorized: User '${user.username}' is verified owner or privileged accessor of '${resource.name}'.`,
    reasonAr: `مصرح بالوصول: المستخدم '${user.username}' هو المالك الفعلي للمورد '${resource.name}'.`,
    context: {
      userId: user.id,
      userRole: user.role,
      resourceId,
      resourceOwnerId: resource.ownerUserId,
    },
  };
}
