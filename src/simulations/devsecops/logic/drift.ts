/**
 * OMEGA V15 — Infrastructure Drift Detection Engine
 * Detects manual, out-of-band cloud infrastructure modifications vs declared Terraform state.
 */

import { InfrastructureDriftFinding } from './types';

export function getInitialDriftFindings(): InfrastructureDriftFinding[] {
  return [
    {
      resourceId: 'aws_security_group.sg_app_ingress',
      expectedTerraformState: 'ingress { from_port = 443, to_port = 443, cidr = ["10.0.0.0/8"] }',
      actualCloudLiveState: 'ingress { from_port = 22, to_port = 22, cidr = ["0.0.0.0/0"] } # MANUAL OUT-OF-BAND CHANGE!',
      driftType: 'UNAUTHORIZED_PORT_OPENED',
      riskAr: 'تم فتح منفذ SSH عبر وحدة تحكم السحابة يدوياً دون توثيقه في كود Terraform، مما يخرق قواعد الحوكمة.',
      riskEn: 'Manual out-of-band AWS console SSH port open bypassing Terraform code review.',
      autoRemediated: false,
    },
  ];
}
