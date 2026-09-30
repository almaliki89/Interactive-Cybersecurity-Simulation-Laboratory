/**
 * OMEGA ULTRA REALITY V1.5 — Resultant Set of Policy (RSOP) Engine
 * Computes the unified RSOP data model exposing winning source GPOs, precedence, and effective values.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import { RsopResult } from './types';
import { PolicyProcessor, globalPolicyProcessor, MachinePolicyContext, UserPolicyContext } from './PolicyProcessor';

export class RsopEngine {
  private processor: PolicyProcessor;

  constructor(processor: PolicyProcessor = globalPolicyProcessor) {
    this.processor = processor;
  }

  public getRsop(machineCtx: MachinePolicyContext, userCtx?: UserPolicyContext, vTime = 0): RsopResult {
    return this.processor.processPolicy(machineCtx, userCtx, vTime);
  }
}

export const globalRsopEngine = new RsopEngine();
