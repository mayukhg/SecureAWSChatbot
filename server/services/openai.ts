import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-api-key-here"
});

export interface AIResponse {
  content: string;
  sources: Array<{
    name: string;
    color: string;
    type: 'aws_waf' | 'confluence' | 'general';
  }>;
}

export async function generateSecurityResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<AIResponse> {
  // Check if OpenAI API is available
  const hasValidApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');
  
  if (hasValidApiKey) {
    try {
      const systemPrompt = `You are SecureAWS, an expert AWS security assistant integrated into Microsoft Teams. You help users with AWS security best practices, configurations, and policies.

Your knowledge sources include:
1. AWS Well-Architected Framework (source: "AWS WAF", color: "blue")
2. Internal Confluence documentation (source: "Confluence", color: "purple") 
3. General AWS security knowledge (source: "General", color: "gray")

Guidelines:
- Provide specific, actionable security advice
- Include code examples when relevant
- Cite your sources using the format above
- Format responses with HTML for rich text display
- Use <ul>, <li>, <p>, <h4>, <strong> tags for structure
- Include code blocks with <div class="code-block font-code text-sm"><pre class="text-green-400">code here</pre></div>
- For internal policies, use: <div class="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400"><p class="text-sm"><strong>Internal Policy:</strong> policy text</p></div>
- For warnings, use: <div class="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400"><p class="text-sm"><strong>Note:</strong> warning text</p></div>

Respond with JSON in this format:
{
  "content": "HTML formatted response",
  "sources": [{"name": "AWS WAF", "color": "blue", "type": "aws_waf"}]
}`;

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: userMessage }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        response_format: { type: "json_object" },
        max_tokens: 1500,
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content!);
      
      return {
        content: result.content,
        sources: result.sources || [{ name: "General", color: "gray", type: "general" }]
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      if ((error as any).code === 'insufficient_quota') {
        return generateDemoResponse(userMessage);
      }
      
      // Other API errors
      return {
        content: `<p>I apologize, but I'm experiencing technical difficulties at the moment. Please try your question again.</p>
                  <p class="mt-2 text-sm">If the issue persists, please contact your system administrator.</p>`,
        sources: [{ name: "System", color: "red", type: "general" }]
      };
    }
  } else {
    // No valid API key, use demo responses
    return generateDemoResponse(userMessage);
  }
}

function generateDemoResponse(userMessage: string): AIResponse {
  const query = userMessage.toLowerCase();
  
  // S3 Security Questions
  if (query.includes('s3') || query.includes('bucket') || query.includes('storage')) {
    return {
      content: `<p>Here are the essential S3 security best practices:</p>
                <ul class="list-disc ml-4 space-y-1 text-sm mt-2">
                  <li><strong>Block Public Access:</strong> Enable "Block all public access" unless specifically required for your use case</li>
                  <li><strong>Enable Encryption:</strong> Use SSE-S3, SSE-KMS, or SSE-C for data at rest</li>
                  <li><strong>Bucket Policies:</strong> Implement least privilege access with proper IAM policies</li>
                  <li><strong>Access Logging:</strong> Enable CloudTrail and S3 access logs for monitoring</li>
                  <li><strong>MFA Delete:</strong> Require multi-factor authentication for object deletion</li>
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
                <div class="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400 mt-3">
                  <p class="text-sm"><strong>Internal Policy:</strong> All S3 buckets must have encryption enabled and public access blocked unless approved by security team.</p>
                </div>`,
      sources: [
        { name: "AWS WAF", color: "blue", type: "aws_waf" },
        { name: "Confluence", color: "purple", type: "confluence" }
      ]
    };
  }
  
  // IAM Security Questions
  if (query.includes('iam') || query.includes('policy') || query.includes('permission') || query.includes('role')) {
    return {
      content: `<p>IAM security follows these core principles:</p>
                <ul class="list-disc ml-4 space-y-1 text-sm mt-2">
                  <li><strong>Least Privilege:</strong> Grant only the minimum permissions needed</li>
                  <li><strong>Use Roles:</strong> Prefer IAM roles over IAM users for applications</li>
                  <li><strong>Enable MFA:</strong> Require multi-factor authentication for all human users</li>
                  <li><strong>Rotate Keys:</strong> Regularly rotate access keys and passwords</li>
                  <li><strong>Temporary Credentials:</strong> Use STS for temporary access when possible</li>
                </ul>
                <div class="code-block font-code text-sm mt-3">
                  <pre class="text-green-400">{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::example-bucket/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    }
  ]
}</pre>
                </div>
                <div class="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400 mt-3">
                  <p class="text-sm"><strong>Internal Policy:</strong> All production IAM policies must be reviewed and approved by the security team before deployment.</p>
                </div>`,
      sources: [
        { name: "AWS WAF", color: "blue", type: "aws_waf" },
        { name: "Confluence", color: "purple", type: "confluence" }
      ]
    };
  }
  
  // VPC/Network Security Questions
  if (query.includes('vpc') || query.includes('network') || query.includes('security group') || query.includes('nacl')) {
    return {
      content: `<p>VPC network security configuration guidelines:</p>
                <ul class="list-disc ml-4 space-y-1 text-sm mt-2">
                  <li><strong>Private Subnets:</strong> Place application resources in private subnets</li>
                  <li><strong>Security Groups:</strong> Configure stateful firewall rules at instance level</li>
                  <li><strong>Network ACLs:</strong> Add subnet-level stateless firewall rules</li>
                  <li><strong>VPC Flow Logs:</strong> Enable logging for network traffic monitoring</li>
                  <li><strong>NAT Gateway:</strong> Use NAT Gateways for secure outbound internet access</li>
                </ul>
                <div class="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400 mt-3">
                  <p class="text-sm"><strong>Note:</strong> Ensure all production VPCs follow our internal networking standards documented in Confluence.</p>
                </div>
                <div class="code-block font-code text-sm mt-3">
                  <pre class="text-green-400"># Security Group allowing HTTPS only
aws ec2 authorize-security-group-ingress \\
  --group-id sg-12345678 \\
  --protocol tcp \\
  --port 443 \\
  --cidr 0.0.0.0/0</pre>
                </div>`,
      sources: [
        { name: "AWS WAF", color: "blue", type: "aws_waf" },
        { name: "General", color: "gray", type: "general" }
      ]
    };
  }
  
  // Default response for other questions
  return {
    content: `<p>I can help you with AWS security best practices covering:</p>
              <ul class="list-disc ml-4 space-y-1 text-sm mt-2">
                <li><strong>Identity & Access Management (IAM)</strong> - Policies, roles, and permissions</li>
                <li><strong>Network Security</strong> - VPC, Security Groups, and NACLs</li>
                <li><strong>Data Protection</strong> - S3 encryption, KMS, and access controls</li>
                <li><strong>Monitoring & Logging</strong> - CloudTrail, CloudWatch, and VPC Flow Logs</li>
                <li><strong>Compliance</strong> - Well-Architected Framework security pillar</li>
              </ul>
              <p class="mt-3">Please ask me a specific question about any of these AWS security topics, and I'll provide detailed guidance with examples.</p>
              <div class="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400 mt-3">
                <p class="text-sm"><strong>Demo Mode:</strong> This is a demonstration response. For AI-powered responses, please ensure your OpenAI API key has available quota.</p>
              </div>`,
    sources: [
      { name: "AWS Expert", color: "blue", type: "general" }
    ]
  };
}
