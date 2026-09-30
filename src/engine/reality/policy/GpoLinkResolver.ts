/**
 * OMEGA ULTRA REALITY V1.5 — GPO Link Resolver
 * Resolves LSDOU (Local, Site, Domain, Parent OU, Child OU) processing hierarchy.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import { GpoLink, GroupPolicyObject } from './types';
import { GpoStore, globalGpoStore } from './GpoStore';

export interface ContainerScope {
  level: 'Local' | 'Site' | 'Domain' | 'ParentOU' | 'ChildOU';
  containerPath: string;
  blockInheritance: boolean;
}

export class GpoLinkResolver {
  private gpoStore: GpoStore;

  constructor(gpoStore: GpoStore = globalGpoStore) {
    this.gpoStore = gpoStore;
  }

  /**
   * Constructs the LSDOU hierarchy path for a given target OU/domain path.
   * e.g., 'OU=Workstations,DC=NEXORA,DC=LOCAL' ->
   * [
   *   { level: 'Domain', containerPath: 'DC=NEXORA,DC=LOCAL', blockInheritance: false },
   *   { level: 'ChildOU', containerPath: 'OU=Workstations,DC=NEXORA,DC=LOCAL', blockInheritance: false }
   * ]
   */
  public resolveContainerScopes(targetContainerPath: string): ContainerScope[] {
    const scopes: ContainerScope[] = [];
    const normTarget = targetContainerPath.toUpperCase().trim();

    // 1. Domain Level
    const domainPath = 'DC=NEXORA,DC=LOCAL';
    scopes.push({
      level: 'Domain',
      containerPath: domainPath,
      blockInheritance: this.gpoStore.isOuBlockingInheritance(domainPath),
    });

    // 2. OU Levels (Parent -> Child if nested)
    if (normTarget.includes('OU=')) {
      // Extract all OU components in the order they appear in the DN (most specific to least specific)
      const parts = normTarget.split(',').filter((p) => p.startsWith('OU='));
      
      // Process from least specific (closest to domain root) to most specific (the target)
      // e.g. ['OU=FINANCE', 'OU=WORKSTATIONS'] -> ['OU=WORKSTATIONS', 'OU=FINANCE']
      const ouPartsOrdered = [...parts].reverse();
      
      let currentPath = domainPath;
      for (let i = 0; i < ouPartsOrdered.length; i++) {
        const ouPart = ouPartsOrdered[i];
        currentPath = `${ouPart},${currentPath}`;
        
        scopes.push({
          level: i === ouPartsOrdered.length - 1 ? 'ChildOU' : 'ParentOU',
          containerPath: currentPath,
          blockInheritance: this.gpoStore.isOuBlockingInheritance(currentPath),
        });
      }
    }

    return scopes;
  }

  /**
   * Resolves ordered GPO candidates following LSDOU rules, handling Link Order,
   * Link Enabled/Disabled, Enforced (No Override), and Block Inheritance.
   */
  public resolveCandidateGpos(targetContainerPath: string): {
    orderedGpos: { gpo: GroupPolicyObject; link: GpoLink; scope: ContainerScope }[];
  } {
    const scopes = this.resolveContainerScopes(targetContainerPath);
    const candidateList: { gpo: GroupPolicyObject; link: GpoLink; scope: ContainerScope }[] = [];

    for (let i = 0; i < scopes.length; i++) {
      const scope = scopes[i];
      const links = this.gpoStore.getLinksForContainer(scope.containerPath);

      // Check if any scope below this one has blockInheritance
      let blockedFromBelow = false;
      for (let j = i + 1; j < scopes.length; j++) {
        if (scopes[j].blockInheritance) {
          blockedFromBelow = true;
          break;
        }
      }

      // In LSDOU, higher linkOrder number is processed FIRST, so linkOrder 1 is processed LAST (and wins).
      // Sort links in descending order of linkOrder for processing order.
      const sortedLinks = [...links].sort((a, b) => b.linkOrder - a.linkOrder);

      for (const link of sortedLinks) {
        const gpo = this.gpoStore.getGpo(link.gpoId);
        if (!gpo) continue;

        const isEnforced = link.enforced || gpo.enforced;

        // If inheritance is blocked at a lower level, skip non-enforced GPOs
        if (blockedFromBelow && !isEnforced) {
          continue;
        }

        candidateList.push({ gpo, link, scope });
      }
    }

    return { orderedGpos: candidateList };
  }
}

export const globalGpoLinkResolver = new GpoLinkResolver();
