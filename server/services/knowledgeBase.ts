import { MessageSource } from "@shared/schema";

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  sources: MessageSource[];
  keywords: string[];
}

// Mock knowledge base with AWS security content
export const awsSecurityKnowledge: KnowledgeItem[] = [
  {
    id: 's3-security',
    title: 'S3 Security Best Practices',
    content: `
      <p>Essential S3 security configurations:</p>
      <ul class="list-disc ml-4 space-y-1 text-sm mt-2">
        <li>Block all public access unless specifically required</li>
        <li>Enable default encryption (SSE-S3, SSE-KMS, or SSE-C)</li>
        <li>Configure bucket policies with least privilege</li>
        <li>Enable access logging and CloudTrail</li>
        <li>Use MFA Delete for critical buckets</li>
      </ul>
      <div class="code-block font-code text-sm mt-3">
        <pre class="text-green-400">{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyInsecureConnections",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::your-bucket/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}</pre>
      </div>
    `,
    sources: [
      { name: 'AWS WAF', color: 'blue', type: 'aws_waf' },
      { name: 'Confluence', color: 'purple', type: 'confluence' }
    ],
    keywords: ['s3', 'bucket', 'storage', 'encryption', 'policy']
  },
  {
    id: 'iam-practices',
    title: 'IAM Security Best Practices',
    content: `
      <p>Core IAM security principles:</p>
      <ul class="list-disc ml-4 space-y-1 text-sm mt-2">
        <li>Apply principle of least privilege</li>
        <li>Use IAM roles instead of users for applications</li>
        <li>Enable MFA for all human users</li>
        <li>Rotate access keys regularly</li>
        <li>Use temporary credentials when possible</li>
      </ul>
      <div class="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400 mt-3">
        <p class="text-sm"><strong>Internal Policy:</strong> All production IAM policies must be reviewed by the security team before deployment.</p>
      </div>
    `,
    sources: [
      { name: 'AWS WAF', color: 'blue', type: 'aws_waf' },
      { name: 'Confluence', color: 'purple', type: 'confluence' }
    ],
    keywords: ['iam', 'identity', 'access', 'policy', 'role', 'permission']
  },
  {
    id: 'vpc-security',
    title: 'VPC Network Security',
    content: `
      <p>VPC security configuration guidelines:</p>
      <ul class="list-disc ml-4 space-y-1 text-sm mt-2">
        <li>Use private subnets for application resources</li>
        <li>Implement Network ACLs and Security Groups</li>
        <li>Enable VPC Flow Logs for monitoring</li>
        <li>Use NAT Gateways for outbound internet access</li>
        <li>Segment networks by environment and application</li>
      </ul>
      <div class="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400 mt-3">
        <p class="text-sm"><strong>Note:</strong> Ensure all production VPCs follow our internal networking standards documented in Confluence.</p>
      </div>
    `,
    sources: [
      { name: 'AWS WAF', color: 'blue', type: 'aws_waf' },
      { name: 'General', color: 'gray', type: 'general' }
    ],
    keywords: ['vpc', 'network', 'subnet', 'security group', 'nacl', 'flow logs']
  }
];

export function searchKnowledge(query: string): KnowledgeItem[] {
  const searchTerms = query.toLowerCase().split(' ');
  
  return awsSecurityKnowledge.filter(item => {
    const searchText = `${item.title} ${item.keywords.join(' ')}`.toLowerCase();
    return searchTerms.some(term => searchText.includes(term));
  });
}

export function getQuickActions(): Array<{ label: string; query: string }> {
  return [
    { label: 'S3 Security Best Practices', query: 'What are the security best practices for S3 bucket configuration?' },
    { label: 'IAM Policy Examples', query: 'Show me IAM policy examples for least privilege access' },
    { label: 'VPC Security Configuration', query: 'How do I configure VPC security groups and NACLs?' }
  ];
}
