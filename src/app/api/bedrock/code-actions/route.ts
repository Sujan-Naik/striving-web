import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_TEST_KEY });

export async function POST(request: Request) {
  const {
    query: userQuery = "Hello",
    owner,
    repo,
    branch = "main",
    codebase = [],
  } = await request.json();

  let systemPrompt = `Analyze ${owner}/${repo} (branch: ${branch}).  
    Return ONLY valid JSON:  
    {
      "explanation": "Brief change summary",
      "actions": [
        {
          "type": "create|update|delete",
          "path": "file/path",
          "content": "file content (for create/update)",
          "message": "description of this change"
        }
      ],
      "commitMessage": "Overall commit message"
    }  
    No extra text, no markdown fences.
    `;

  if (codebase?.length) {
    const codebaseContext = codebase
      .map((file: any) => `File: ${file.path}\n${file.content}`)
      .join("\n\n---\n\n");
    systemPrompt += `\nCurrent codebase:\n${codebaseContext}`;
  }

  try {
    const start = Date.now();
    const response = await client.chat.completions.create({
      model: "gpt-5", // Or "gpt-4o" if you prefer
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery },
      ],
      max_completion_tokens: 30000,
    });

    const usage = response.usage;
    const inputTokens = usage?.prompt_tokens || 0;
    const outputTokens = usage?.completion_tokens || 0;
    const totalTokens = usage?.total_tokens || inputTokens + outputTokens;

    const inputCost = (inputTokens * 1.25) / 1_000_000;
    const outputCost = (outputTokens * 10.0) / 1_000_000;
    const totalCost = inputCost + outputCost;

    console.log("Input tokens:", inputTokens, `($${inputCost.toFixed(4)})`);
    console.log("Output tokens:", outputTokens, `($${outputCost.toFixed(4)})`);
    console.log("Total tokens:", totalTokens, `($${totalCost.toFixed(4)})`);
    console.log("Latency:", Date.now() - start, "ms");

    let jsonStr = response.choices[0].message?.content?.trim() || "";

    // Strip code fences if present
    const jsonMatch = jsonStr.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) jsonStr = jsonMatch[1];

    const startIdx = jsonStr.indexOf("{");
    const lastIdx = jsonStr.lastIndexOf("}");
    if (startIdx !== -1 && lastIdx !== -1) {
      jsonStr = jsonStr.substring(startIdx, lastIdx + 1);
    }

    const parsedResponse = JSON.parse(jsonStr);
    return NextResponse.json(parsedResponse);
  } catch (err: any) {
    console.error("Error:", err);
    return NextResponse.json({ error: `Parse error: ${err}` }, { status: 500 });
  }
}
