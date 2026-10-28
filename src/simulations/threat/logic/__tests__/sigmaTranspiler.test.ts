import { describe, it, expect } from 'vitest';
import {
  generateSigmaYaml,
  generateSplunkSpl,
  generateElasticKql,
  generateSentinelKql,
  generateChronicleYaraL,
  transpileDetectionRule,
} from '../sigmaTranspiler';
import { DetectionRule } from '../types';

describe('Sigma Rule Transpiler & Multi-SIEM Code Generator', () => {
  const sampleRule: DetectionRule = {
    id: 'DET-HUNT-01-BRUTE-FORCE',
    huntId: 'HUNT-01',
    nameEn: 'Brute Force & Credential Compromise Detection',
    nameAr: 'رصد تكرار محاولات تسجيل الدخول الفاشلة',
    descriptionEn: 'Detects repetitive authentication failures followed by suspicious activity.',
    descriptionAr: 'رصد تكرار محاولات تسجيل الدخول الفاشلة التي يعقبها نشاط مشبوه.',
    severity: 'HIGH',
    dataSources: ['WINDOWS', 'IDENTITY'],
    conditions: [
      { field: 'category', operator: 'EQUALS', value: 'AUTHENTICATION' },
      { field: 'outcome', operator: 'EQUALS', value: 'FAILURE' },
    ],
    mitreTechniques: ['T1110 (Brute Force)'],
    status: 'VALIDATED',
    createdAtVirtualTime: 50,
    ruleType: 'THRESHOLD',
    threshold: 5,
    windowVirtualSeconds: 120,
    exclusions: {
      hosts: ['IT-MGMT-01', 'QA-RUNNER'],
      users: ['it_admin_rob'],
    },
  };

  it('generates valid standard Sigma YAML with metadata, logsource, and detection blocks', () => {
    const yaml = generateSigmaYaml(sampleRule);

    expect(yaml).toContain('title: Brute Force & Credential Compromise Detection');
    expect(yaml).toContain('status: test');
    expect(yaml).toContain('category: authentication');
    expect(yaml).toContain('product: windows');
    expect(yaml).toContain('filter_noise:');
    expect(yaml).toContain('- "IT-MGMT-01"');
    expect(yaml).toContain('- "it_admin_rob"');
    expect(yaml).toContain('timeframe: 120s');
    expect(yaml).toContain('selection and not filter_noise | count() by user.name > 5');
    expect(yaml).toContain('attack.t1110');
  });

  it('generates valid Splunk SPL query with exclusion filters and threshold aggregation', () => {
    const spl = generateSplunkSpl(sampleRule);

    expect(spl).toContain('index=* sourcetype="wineventlog:security"');
    expect(spl).toContain('ComputerName!="IT-MGMT-01"');
    expect(spl).toContain('ComputerName!="QA-RUNNER"');
    expect(spl).toContain('TargetUserName!="it_admin_rob"');
    expect(spl).toContain('bin _time span=120s');
    expect(spl).toContain('where failure_count >= 5');
  });

  it('generates valid Elasticsearch KQL query with boolean logic and negation filters', () => {
    const kql = generateElasticKql(sampleRule);

    expect(kql).toContain('event.category: "authentication" and event.outcome: "failure"');
    expect(kql).toContain('not (host.name: ("IT-MGMT-01" or "QA-RUNNER"))');
    expect(kql).toContain('not (user.name: ("it_admin_rob"))');
  });

  it('generates valid Microsoft Sentinel / Azure Monitor KQL query', () => {
    const sentinel = generateSentinelKql(sampleRule);

    expect(sentinel).toContain('SecurityEvent');
    expect(sentinel).toContain('where EventID == 4625');
    expect(sentinel).toContain('where Computer !in~ ("IT-MGMT-01", "QA-RUNNER")');
    expect(sentinel).toContain('where TargetUserName !in~ ("it_admin_rob")');
    expect(sentinel).toContain('bin(TimeGenerated, 120s)');
    expect(sentinel).toContain('where FailureCount >= 5');
  });

  it('generates valid Google Chronicle YARA-L rule specification', () => {
    const yaraL = generateChronicleYaraL(sampleRule);

    expect(yaraL).toContain('rule det_hunt_01_brute_force_detection');
    expect(yaraL).toContain('USER_LOGIN');
    expect(yaraL).toContain('$auth.security_result.action = "BLOCK"');
    expect(yaraL).toContain('not $auth.principal.hostname in ["IT-MGMT-01", "QA-RUNNER"]');
    expect(yaraL).toContain('not $auth.target.user.userid in ["it_admin_rob"]');
    expect(yaraL).toContain('#auth >= 5');
  });

  it('transpileDetectionRule bundles all 5 SIEM formats cleanly', () => {
    const bundle = transpileDetectionRule(sampleRule);

    expect(bundle).toHaveProperty('sigmaYaml');
    expect(bundle).toHaveProperty('splunkSpl');
    expect(bundle).toHaveProperty('elasticKql');
    expect(bundle).toHaveProperty('sentinelKql');
    expect(bundle).toHaveProperty('chronicleYaraL');
  });
});
