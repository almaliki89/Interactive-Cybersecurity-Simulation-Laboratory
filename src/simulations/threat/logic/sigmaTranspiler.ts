/**
 * Sigma Rule Transpiler & Multi-SIEM Query Generator
 * Transpiles DetectionRule specifications into canonical Sigma YAML, Splunk SPL,
 * Elasticsearch KQL, Microsoft Sentinel KQL, and Google Chronicle YARA-L.
 */

import { DetectionRule } from './types';

export interface TranspiledSIEMOutputs {
  sigmaYaml: string;
  splunkSpl: string;
  elasticKql: string;
  sentinelKql: string;
  chronicleYaraL: string;
}

/**
 * Sanitizes an identifier for safe code generation
 */
function sanitizeId(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9_]/g, '_');
}

/**
 * Transpiles a DetectionRule into canonical Sigma YAML
 */
export function generateSigmaYaml(rule: DetectionRule): string {
  const ruleId = sanitizeId(rule.id);
  const status = rule.status === 'PUBLISHED' ? 'production' : rule.status === 'VALIDATED' ? 'test' : 'experimental';
  const level = (rule.severity || 'high').toLowerCase();

  const exclusions = rule.exclusions || {};
  const excludedHosts = (exclusions.hosts || []).filter(Boolean);
  const excludedUsers = (exclusions.users || []).filter(Boolean);

  let selectionYaml = '        category: "authentication"\n        outcome: "failure"';
  if (rule.conditions && rule.conditions.length > 0) {
    selectionYaml = rule.conditions
      .map((c) => `        ${c.field}: "${c.value}"`)
      .join('\n');
  }

  let filterSection = '';
  let conditionStr = 'selection';

  if (excludedHosts.length > 0 || excludedUsers.length > 0) {
    filterSection = '\n    filter_noise:';
    if (excludedHosts.length > 0) {
      filterSection += `\n        host.name:\n${excludedHosts.map((h) => `            - "${h}"`).join('\n')}`;
    }
    if (excludedUsers.length > 0) {
      filterSection += `\n        user.name:\n${excludedUsers.map((u) => `            - "${u}"`).join('\n')}`;
    }
    conditionStr = 'selection and not filter_noise';
  }

  if (rule.ruleType === 'THRESHOLD' && rule.threshold && rule.threshold > 1) {
    conditionStr = `${conditionStr} | count() by user.name > ${rule.threshold}`;
  }

  const tags = (rule.mitreTechniques || ['T1110'])
    .map((t) => {
      const match = t.match(/T\d+(\.\d+)?/i);
      const tagId = match ? match[0].toLowerCase() : t.toLowerCase().replace(/\s+/g, '_');
      return `    - attack.${tagId}`;
    })
    .join('\n');

  return `title: ${rule.nameEn}
id: sigma-${ruleId}
status: ${status}
description: ${rule.descriptionEn || 'Generic detection rule engineered in ICSL laboratory.'}
author: Security Operations Analyst (ICSL)
references:
    - https://attack.mitre.org/techniques/${(rule.mitreTechniques?.[0] || 'T1110').replace(/[^a-zA-Z0-9]/g, '')}/
tags:
${tags}
logsource:
    category: authentication
    product: windows
detection:
    selection:
${selectionYaml}${filterSection}
    timeframe: ${rule.windowVirtualSeconds || 120}s
    condition: ${conditionStr}
falsepositives:
    - Known automated administrative maintenance tasks
    - Legitimate batch jobs with service accounts
level: ${level}
`;
}

/**
 * Transpiles a DetectionRule into Splunk SPL
 */
export function generateSplunkSpl(rule: DetectionRule): string {
  const exclusions = rule.exclusions || {};
  const excludedHosts = (exclusions.hosts || []).filter(Boolean);
  const excludedUsers = (exclusions.users || []).filter(Boolean);

  let spl = 'index=* sourcetype="wineventlog:security" (EventCode=4625 OR EventCode=4624)';

  if (excludedHosts.length > 0) {
    const hostConditions = excludedHosts.map((h) => `ComputerName!="${h}"`).join(' ');
    spl += ` ${hostConditions}`;
  }

  if (excludedUsers.length > 0) {
    const userConditions = excludedUsers.map((u) => `TargetUserName!="${u}"`).join(' ');
    spl += ` ${userConditions}`;
  }

  const windowSec = rule.windowVirtualSeconds || 120;
  const threshold = rule.threshold || 5;

  if (rule.ruleType === 'THRESHOLD') {
    spl += `\n| bin _time span=${windowSec}s\n| stats count as failure_count, values(ComputerName) as targets by TargetUserName, _time\n| where failure_count >= ${threshold}\n| sort - failure_count`;
  } else {
    spl += `\n| table _time, TargetUserName, ComputerName, Status, FailureReason\n| head 100`;
  }

  return spl;
}

/**
 * Transpiles a DetectionRule into Elasticsearch KQL
 */
export function generateElasticKql(rule: DetectionRule): string {
  const exclusions = rule.exclusions || {};
  const excludedHosts = (exclusions.hosts || []).filter(Boolean);
  const excludedUsers = (exclusions.users || []).filter(Boolean);

  const parts: string[] = ['event.category: "authentication" and event.outcome: "failure"'];

  if (excludedHosts.length > 0) {
    const hostsQuery = excludedHosts.map((h) => `"${h}"`).join(' or ');
    parts.push(`not (host.name: (${hostsQuery}))`);
  }

  if (excludedUsers.length > 0) {
    const usersQuery = excludedUsers.map((u) => `"${u}"`).join(' or ');
    parts.push(`not (user.name: (${usersQuery}))`);
  }

  return parts.join(' and ');
}

/**
 * Transpiles a DetectionRule into Microsoft Sentinel / Azure Monitor KQL
 */
export function generateSentinelKql(rule: DetectionRule): string {
  const exclusions = rule.exclusions || {};
  const excludedHosts = (exclusions.hosts || []).filter(Boolean);
  const excludedUsers = (exclusions.users || []).filter(Boolean);

  const windowSec = rule.windowVirtualSeconds || 120;
  const threshold = rule.threshold || 5;

  let kql = `SecurityEvent\n| where EventID == 4625`;

  if (excludedHosts.length > 0) {
    kql += `\n| where Computer !in~ (${excludedHosts.map((h) => `"${h}"`).join(', ')})`;
  }

  if (excludedUsers.length > 0) {
    kql += `\n| where TargetUserName !in~ (${excludedUsers.map((u) => `"${u}"`).join(', ')})`;
  }

  if (rule.ruleType === 'THRESHOLD') {
    kql += `\n| summarize FailureCount = count(), TargetHosts = make_set(Computer) by TargetUserName, bin(TimeGenerated, ${windowSec}s)\n| where FailureCount >= ${threshold}\n| project TimeGenerated, TargetUserName, FailureCount, TargetHosts`;
  } else {
    kql += `\n| project TimeGenerated, Computer, TargetUserName, SubStatus, Activity`;
  }

  return kql;
}

/**
 * Transpiles a DetectionRule into Google Chronicle YARA-L 2.0
 */
export function generateChronicleYaraL(rule: DetectionRule): string {
  const ruleId = sanitizeId(rule.id);
  const exclusions = rule.exclusions || {};
  const excludedHosts = (exclusions.hosts || []).filter(Boolean);
  const excludedUsers = (exclusions.users || []).filter(Boolean);
  const threshold = rule.threshold || 5;
  const windowSec = rule.windowVirtualSeconds || 120;

  let filterLines = '';
  if (excludedHosts.length > 0) {
    filterLines += `\n    not $auth.principal.hostname in [${excludedHosts.map((h) => `"${h}"`).join(', ')}]`;
  }
  if (excludedUsers.length > 0) {
    filterLines += `\n    not $auth.target.user.userid in [${excludedUsers.map((u) => `"${u}"`).join(', ')}]`;
  }

  return `rule ${ruleId}_detection {
  meta:
    author = "ICSL Security Analyst"
    description = "${rule.descriptionEn || 'Threat hunting rule engineered in ICSL'}"
    severity = "${rule.severity || 'HIGH'}"
    technique = "${rule.mitreTechniques?.[0] || 'T1110'}"

  events:
    $auth.metadata.event_type = "USER_LOGIN"
    $auth.security_result.action = "BLOCK"${filterLines}
    $auth.target.user.userid = $user

  match:
    $user over ${windowSec}s

  condition:
    #auth >= ${threshold}
}`;
}

/**
 * Transpiles a DetectionRule into all supported SIEM formats
 */
export function transpileDetectionRule(rule: DetectionRule): TranspiledSIEMOutputs {
  return {
    sigmaYaml: generateSigmaYaml(rule),
    splunkSpl: generateSplunkSpl(rule),
    elasticKql: generateElasticKql(rule),
    sentinelKql: generateSentinelKql(rule),
    chronicleYaraL: generateChronicleYaraL(rule),
  };
}
