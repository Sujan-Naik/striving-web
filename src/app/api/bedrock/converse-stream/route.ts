// app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_TEST_KEY });

// Marker your client listens for
const USAGE_MARKER = "[[USAGE]]";

export async function POST(request: Request) {
  const { query: userQuery = "Hello" } = await request.json();

  const systemPrompt =
    "You are a helpful, concise assistant. Be brief unless more detail is requested - give responses in markdown. " +
    "Wrap code in code brackets.";

  const start = Date.now();

  try {
    const response = await client.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery },
      ],
      stream: true,
      // IMPORTANT: include usage in stream chunks
      stream_options: { include_usage: true },
    });

    let finalUsage:
      | { prompt_tokens: number; completion_tokens: number; total_tokens: number }
      | undefined;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Stream assistant content
        for await (const chunk of response) {
          const content = chunk.choices?.[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(encoder.encode(content));
          }

          // Capture usage when provided (typically final chunk)
          if ((chunk as any)?.usage) {
            finalUsage = (chunk as any).usage;
          }
        }

        // Compute costs once stream is done
        const inputTokens = finalUsage?.prompt_tokens || 0;
        const outputTokens = finalUsage?.completion_tokens || 0;
        const totalTokens = finalUsage?.total_tokens || inputTokens + outputTokens;

        const inputCost = (inputTokens * 1.25) / 1_000_000;
        const outputCost = (outputTokens * 10.0) / 1_000_000;
        const totalCost = inputCost + outputCost;

        const latencyMs = Date.now() - start;

        // Log (optional)
        console.log("Input tokens:", inputTokens, `($${inputCost.toFixed(4)})`);
        console.log("Output tokens:", outputTokens, `($${outputCost.toFixed(4)})`);
        console.log("Total tokens:", totalTokens, `($${totalCost.toFixed(4)})`);
        console.log("Latency:", latencyMs, "ms");

        // Append usage payload for the client to parse
        const payload = {
          inputTokens,
          outputTokens,
          totalTokens,
          inputCost,
          outputCost,
          totalCost,
          latencyMs,
        };

        controller.enqueue(encoder.encode(USAGE_MARKER + JSON.stringify(payload)));
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: any) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}