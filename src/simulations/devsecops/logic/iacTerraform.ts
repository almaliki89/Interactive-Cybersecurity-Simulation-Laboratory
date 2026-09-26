/**
 * OMEGA V15 — Infrastructure as Code (IaC) Scanner & Terraform Security Engine
 * Audits HCL templates for publicly exposed Security Groups, unencrypted S3 buckets, and weak IAM.
 */

import { TerraformResource } from './types';

export function getInitialTerraformResources(): TerraformResource[] {
  return [
    {
      id: 'tf-sg-public-ssh',
      resourceType: 'aws_security_group',
      resourceName: 'allow_public_management',
      hclCode: `resource "aws_security_group" "public_sg" {
  name = "public-ssh-sg"
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # DANGEROUS PUBLIC SSH!
  }
}`,
      hardenedHclCode: `resource "aws_security_group" "public_sg" {
  name = "public-ssh-sg"
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"] # Restricted to internal VPN CIDR
  }
}`,
      hasMisconfiguration: true,
      ruleName: 'CKV_AWS_24: Restrict SSH Ingress 0.0.0.0/0',
      severity: 'CRITICAL',
      descriptionAr: 'فتح منفذ إدارة SSH (22) لجميع العناوين في العالم (0.0.0.0/0) يعرض الخادم لهجمات التخمين والاختراق المباشر.',
      descriptionEn: 'Exposing administrative SSH port 22 to 0.0.0.0/0 invites automated brute-force attacks.',
      remediated: false,
    },
    {
      id: 'tf-s3-unencrypted',
      resourceType: 'aws_s3_bucket',
      resourceName: 'customer_data_storage',
      hclCode: `resource "aws_s3_bucket" "data_bucket" {
  bucket = "nexora-customer-pii-data"
  acl    = "public-read" # DANGEROUS PUBLIC S3 BUCKET!
}`,
      hardenedHclCode: `resource "aws_s3_bucket" "data_bucket" {
  bucket = "nexora-customer-pii-data"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "kms" {
  bucket = aws_s3_bucket.data_bucket.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}`,
      hasMisconfiguration: true,
      ruleName: 'CKV_AWS_20: Ensure S3 Bucket SSE Encryption & Public Block',
      severity: 'CRITICAL',
      descriptionAr: 'وحدة التخزين S3 مكشوفة للإنترنت وتفتقر للتشفير أثناء التخزين SSE-KMS.',
      descriptionEn: 'S3 storage container exposed publicly without SSE-KMS encryption at rest.',
      remediated: false,
    },
  ];
}

export function scanTerraformCode(resources: TerraformResource[]): {
  totalMisconfigurations: number;
  criticalCount: number;
  iacScore: number;
  passedIacGate: boolean;
} {
  let criticalCount = 0;

  for (const r of resources) {
    if (!r.remediated && r.hasMisconfiguration) {
      if (r.severity === 'CRITICAL') criticalCount++;
    }
  }

  let iacScore = 100;
  iacScore -= criticalCount * 45;
  iacScore = Math.max(0, Math.min(100, iacScore));

  return {
    totalMisconfigurations: criticalCount,
    criticalCount,
    iacScore,
    passedIacGate: criticalCount === 0,
  };
}
