// api/bedrock/code-actions route (assuming this is the file, e.g., app/api/bedrock/code-actions/route.ts)
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Note: xAI SDK is hypothetical here; in reality, you'd install and import the xAI client library.
// For this example, I'm assuming it's similar to OpenAI's API structure.
// Replace with actual xAI SDK if available (e.g., npm install @xai/xai-sdk or similar).
// Also, ensure process.env.XAI_API_KEY is set in your environment.
class XAI {
  chat: { completions: { create: (options: any) => Promise<any> } };

  constructor({ apiKey }: { apiKey: string }) {
    // Placeholder for xAI client initialization
    // In reality: this.chat = new xAIClient(apiKey).chat;
    this.chat = {
      completions: {
        create: async (options: any) => {
          // Simulate xAI API call (replace with actual fetch or SDK call)
          // Example using fetch to a hypothetical xAI endpoint:
          const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(options),
          });
          if (!response.ok) throw new Error('xAI API error');
          return response.json();
        },
      },
    };
  }
}

const PRICING: Record<string, { prompt: number; completion: number }> = {
  // OpenAI
  "gpt-5": { prompt: 1.25, completion: 10.00 },
  "gpt-5-mini": { prompt: 0.25, completion: 2.00 },
  "gpt-5-nano": { prompt: 0.05, completion: 0.40 },
  "gpt-5-chat-latest": { prompt: 1.25, completion: 10.00 },
  "gpt-4.1": { prompt: 2.00, completion: 8.00 },
  "gpt-4.1-mini": { prompt: 0.40, completion: 1.60 },
  "gpt-4.1-nano": { prompt: 0.10, completion: 0.40 },
  "gpt-4o": { prompt: 2.50, completion: 10.00 },
  "gpt-4o-2024-05-13": { prompt: 5.00, completion: 15.00 },
  "gpt-4o-mini": { prompt: 0.15, completion: 0.60 },
  "o3": { prompt: 2.00, completion: 8.00 },
  "o4-mini": { prompt: 1.10, completion: 4.40 },
  "o3-mini": { prompt: 1.10, completion: 4.40 },
  "o1-mini": { prompt: 1.10, completion: 4.40 },
  "gpt-4-turbo": { prompt: 10.00, completion: 30.00 },
  "gpt-3.5-turbo": { prompt: 0.50, completion: 1.50 },
  // Grok
  "grok-code-fast-1": { prompt: 0.20, completion: 1.50 },
  "grok-4-fast-reasoning": { prompt: 0.20, completion: 0.80 },
  "grok-4-fast-non-reasoning": { prompt: 0.20, completion: 0.80 },
  "grok-4-0709": { prompt: 5.00, completion: 15.00 },
  "grok-3-mini": { prompt: 0.30, completion: 0.50 },
  "grok-3": { prompt: 3.00, completion: 15.00 },
};

export async function POST(request: Request) {
  const {
    query: userQuery = "Hello",
    owner,
    repo,
    branch = "main",
    codebase = [],
    model = "o4-mini", // Default model
  } = await request.json();

  // Determine provider based on model
  const provider = model.startsWith('grok-') ? 'xAI' : 'OpenAI';

  let client: any;
  if (provider === 'OpenAI') {
    client = new OpenAI({ apiKey: process.env.OPENAI_TEST_KEY });
  } else if (provider === 'xAI') {
    if (!process.env.XAI_API_KEY) {
      return NextResponse.json({ error: 'xAI API key not configured' }, { status: 500 });
    }
    client = new XAI({ apiKey: process.env.XAI_API_KEY });
  } else {
    return NextResponse.json({ error: `Unsupported provider for model: ${model}` }, { status: 400 });
  }

  const systemPrompt = `
  Analyze ${owner}/${repo} (branch: ${branch}).
Return ONLY valid JSON:
  {
  "explanation": "Brief change summary",
  "actions": [
    {
      "type": "create|update|delete",
      "path": "file/path",
      "content": "file content",
      "message": "description"
    }
  ],
  "commitMessage": "Overall commit message"
  }
  No extra text, no markdown fences.
${codebase.length > 0 ? `\nCurrent codebase:\n${codebase
    .map((f: any) => `File: ${f.path}\n${f.content}`)
    .join("\n\n---\n\n")}` : ""}
  `.trim();

  const price = PRICING[model as keyof typeof PRICING];

  if (!price) {
    return NextResponse.json(
      { error: `No pricing for model: ${model}` },
      { status: 400 }
    );
  }

  try {
    const startMs = Date.now();
    const resp = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery },
      ],
      max_completion_tokens: 30000, // Adjust as needed for xAI if different
    });

    const { prompt_tokens: inT = 0, completion_tokens: outT = 0, total_tokens: totT } =
      resp.usage ?? {};

    const inCost = (inT * price.prompt) / 1_000_000;
    const outCost = (outT * price.completion) / 1_000_000;
    const totalCost = inCost + outCost;

    console.log(
      `Tokens → in: ${inT}, out: ${outT}, total: ${totT ?? inT + outT}`
    );
    console.log(`Cost → in: $${inCost.toFixed(4)}, out: $${outCost.toFixed(4)}, total: $${totalCost.toFixed(4)}`);
    console.log(`Latency: ${Date.now() - startMs} ms`);

    // ✅ FIX: The content is a STRING, not an object. Must parse it.
    const rawContent = resp.choices[0].message?.content || "{}";

    // Strip any potential markdown fences (shouldn't happen with json_object mode, but safety first)
    let jsonStr = rawContent.trim();
    const fenceMatch = jsonStr.match(/```json\n?([\s\S]*?)\n?```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1];
    }

    // Extract JSON if there's extra text
    const startIdx = jsonStr.indexOf("{");
    const lastIdx = jsonStr.lastIndexOf("}");
    if (startIdx !== -1 && lastIdx !== -1) {
      jsonStr = jsonStr.substring(startIdx, lastIdx + 1);
    }

    const parsedPayload = JSON.parse(jsonStr);
    return NextResponse.json(parsedPayload);
  } catch (err: any) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: `Error: ${err.message ?? err}` },
      { status: 500 }
    );
  }
}