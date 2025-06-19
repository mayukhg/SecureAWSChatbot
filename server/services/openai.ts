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
    
    // Fallback response
    return {
      content: `<p>I apologize, but I'm experiencing technical difficulties at the moment. Please try your question again.</p>
                <p class="mt-2 text-sm">If the issue persists, please contact your system administrator.</p>`,
      sources: [{ name: "System", color: "red", type: "general" }]
    };
  }
}
