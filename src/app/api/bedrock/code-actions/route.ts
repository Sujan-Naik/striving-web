import { NextResponse } from "next/server";
import OpenAI from "openai";

const PRICING: Record<string, { prompt: number; completion: number }> = {
  "o4-mini": { prompt: 1.10, completion: 4.40 },
  "gpt-4o": { prompt: 2.50, completion: 10.00 },
  "gpt-4o-mini": { prompt: 0.15, completion: 0.60 },
};

const client = new OpenAI({ apiKey: process.env.OPENAI_TEST_KEY });

export async function POST(request: Request) {
  const {
    query: userQuery = "Hello",
    owner,
    repo,
    branch = "main",
    codebase = [],
  } = await request.json();

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

  const model = "o4-mini";
  const price = PRICING[model];

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
      max_completion_tokens: 30000,
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
    console.error("Parse error:", err);
    return NextResponse.json(
      { error: `Parse error: ${err.message ?? err}` },
      { status: 500 }
    );
  }
}