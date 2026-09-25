/**
 * Synthetic Lightweight Directory Access Protocol (LDAP) Search Engine
 * Fully deterministic & safe - no external network calls, no Date.now, Math.random.
 */

import { AdObject, AdUser, AdComputer, AdGroup, AdOrganizationalUnit } from './directory';

export type LdapScope = 'base' | 'oneLevel' | 'subtree';

export interface LdapSearchResult {
  dn: string;
  objectClass: string;
  attributes: Record<string, string | number | boolean | string[]>;
}

export interface LdapQueryExecution {
  searchBase: string;
  scope: LdapScope;
  filter: string;
  count: number;
  results: LdapSearchResult[];
  executionVirtualTime: number;
}

/**
 * Converts an AdObject to an LDAP-like attribute dictionary with distinguishedName.
 */
export function objectToLdapResult(obj: AdObject): LdapSearchResult {
  switch (obj.type) {
    case 'user': {
      const u = obj as AdUser;
      const dn = `CN=${u.displayName},${u.ou}`;
      return {
        dn,
        objectClass: 'user',
        attributes: {
          distinguishedName: dn,
          objectClass: 'user',
          samAccountName: u.samAccountName,
          displayName: u.displayName,
          userPrincipalName: u.userPrincipalName,
          objectSid: u.sid,
          department: u.department,
          enabled: u.enabled,
          memberOf: u.groups,
          adminCount: u.adminCount || 0,
          isServiceAccount: u.isServiceAccount,
          privileged: u.privileged,
          allowInteractiveLogon: u.allowInteractiveLogon,
        },
      };
    }
    case 'computer': {
      const c = obj as AdComputer;
      const dn = `CN=${c.hostname},${c.ou}`;
      return {
        dn,
        objectClass: 'computer',
        attributes: {
          distinguishedName: dn,
          objectClass: 'computer',
          hostname: c.hostname,
          dNSHostName: `${c.hostname.toLowerCase()}.corp.nexora.local`,
          objectSid: c.sid,
          operatingSystem: c.operatingSystem,
          enabled: c.enabled,
          ipAddress: c.ipAddress || '',
        },
      };
    }
    case 'group': {
      const g = obj as AdGroup;
      const dn = `CN=${g.name},${g.ou}`;
      return {
        dn,
        objectClass: 'group',
        attributes: {
          distinguishedName: dn,
          objectClass: 'group',
          name: g.name,
          objectSid: g.sid,
          groupScope: g.scope,
          groupType: g.groupType,
          member: g.members,
          privileged: g.privileged,
          description: g.descriptionEn,
        },
      };
    }
    case 'ou': {
      const ou = obj as AdOrganizationalUnit;
      return {
        dn: ou.distinguishedName,
        objectClass: 'organizationalUnit',
        attributes: {
          distinguishedName: ou.distinguishedName,
          objectClass: 'organizationalUnit',
          name: ou.name,
          linkedGpos: ou.linkedGpos,
          blockInheritance: ou.blockInheritance || false,
          description: ou.descriptionEn,
        },
      };
    }
  }
}

/**
 * Checks if an object's DN falls within the searchBase and scope.
 */
function isDnInScope(objectDn: string, objectOu: string, searchBase: string, scope: LdapScope): boolean {
  const normBase = searchBase.trim().toLowerCase();
  const normDn = objectDn.trim().toLowerCase();
  const normOu = objectOu.trim().toLowerCase();

  if (scope === 'base') {
    return normDn === normBase;
  }

  if (scope === 'oneLevel') {
    return normOu === normBase;
  }

  // subtree: object is inside searchBase or is searchBase itself
  return normDn === normBase || normDn.endsWith(`,${normBase}`) || normOu.endsWith(normBase);
}

/**
 * Evaluates an educational LDAP filter against an attribute map.
 */
export function matchDirectoryFilter(
  attributes: Record<string, any>,
  filter: string
): boolean {
  const trimmed = filter.trim();
  if (!trimmed || trimmed === '(objectClass=*)') return true;

  // Handle AND: (&(filter1)(filter2)...)
  if (trimmed.startsWith('(&') && trimmed.endsWith(')')) {
    const inner = trimmed.slice(2, -1);
    const subFilters = parseSubFilters(inner);
    return subFilters.every((sf) => matchDirectoryFilter(attributes, sf));
  }

  // Handle OR: (|(filter1)(filter2)...)
  if (trimmed.startsWith('(|') && trimmed.endsWith(')')) {
    const inner = trimmed.slice(2, -1);
    const subFilters = parseSubFilters(inner);
    return subFilters.some((sf) => matchDirectoryFilter(attributes, sf));
  }

  // Handle NOT: (!(filter))
  if (trimmed.startsWith('(!') && trimmed.endsWith(')')) {
    const inner = trimmed.slice(2, -1);
    return !matchDirectoryFilter(attributes, inner);
  }

  // Simple item: (attr=val) or (attr=*) or (attr=prefix*)
  const clean = trimmed.startsWith('(') && trimmed.endsWith(')') ? trimmed.slice(1, -1) : trimmed;
  const eqIdx = clean.indexOf('=');
  if (eqIdx === -1) return true;

  const attr = clean.slice(0, eqIdx).trim();
  const rawExpected = clean.slice(eqIdx + 1).trim();

  // Find matching attribute key (case-insensitive)
  const key = Object.keys(attributes).find((k) => k.toLowerCase() === attr.toLowerCase());
  if (!key) return false;

  const actualValue = attributes[key];
  if (actualValue === undefined || actualValue === null) return false;

  // Presence check: (attr=*)
  if (rawExpected === '*') {
    return true;
  }

  // Prefix wildcard: (attr=prefix*)
  if (rawExpected.endsWith('*') && !rawExpected.startsWith('*')) {
    const prefix = rawExpected.slice(0, -1).toLowerCase();
    const strVal = String(actualValue).toLowerCase();
    return strVal.startsWith(prefix);
  }

  // Boolean check
  if (typeof actualValue === 'boolean') {
    return actualValue === (rawExpected.toLowerCase() === 'true');
  }

  // Array check (e.g. memberOf, member)
  if (Array.isArray(actualValue)) {
    return actualValue.some((item) => String(item).toLowerCase() === rawExpected.toLowerCase());
  }

  // Number check
  if (typeof actualValue === 'number') {
    return actualValue === Number(rawExpected);
  }

  // String equality check (case-insensitive)
  return String(actualValue).toLowerCase() === rawExpected.toLowerCase();
}

/**
 * Helper to split sub-expressions within (&(...)(...)) or (|(...)(...)).
 */
function parseSubFilters(content: string): string[] {
  const result: string[] = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < content.length; i++) {
    if (content[i] === '(') {
      if (depth === 0) start = i;
      depth++;
    } else if (content[i] === ')') {
      depth--;
      if (depth === 0 && start !== -1) {
        result.push(content.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return result.length > 0 ? result : [content];
}

/**
 * Searches the synthetic directory with standard LDAP parameters.
 */
export function searchDirectory(
  objects: AdObject[],
  searchBaseDn: string,
  filterString: string,
  scope: LdapScope = 'subtree',
  virtualTime: number = 0
): LdapQueryExecution {
  const matchedResults: LdapSearchResult[] = [];

  for (const obj of objects) {
    const ldapItem = objectToLdapResult(obj);
    const objOu = 'ou' in obj ? (obj as any).ou : ('distinguishedName' in obj ? (obj as any).distinguishedName : '');

    if (isDnInScope(ldapItem.dn, objOu, searchBaseDn, scope)) {
      if (matchDirectoryFilter(ldapItem.attributes, filterString)) {
        matchedResults.push(ldapItem);
      }
    }
  }

  // Sort deterministically by distinguishedName
  matchedResults.sort((a, b) => a.dn.localeCompare(b.dn));

  return {
    searchBase: searchBaseDn,
    scope,
    filter: filterString,
    count: matchedResults.length,
    results: matchedResults,
    executionVirtualTime: virtualTime,
  };
}
