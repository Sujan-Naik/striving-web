// app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const client = new OpenAI({ apiKey: process.env.OPENAI_TEST_KEY });

// Marker your client listens for
const USAGE_MARKER = "[[USAGE]]";

//per 1k
const MODEL_PRICING = {
  "gpt-4o": { input: 0.0025, output: 0.01 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
} as const;

type ModelName = keyof typeof MODEL_PRICING;

interface StreamRequest {
  query?: string;
  model?: ModelName;
  messages?: ChatCompletionMessageParam[];
  temperature?: number;
  maxTokens?: number;
}

interface UsageInfo {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  latencyMs: number;
  model: string;
}

export async function POST(request: Request) {
  const body: StreamRequest = await request.json();
  const {
    query: userQuery = "Hello",
    model = "gpt-4o-mini",
    messages = [],
    temperature = 0.7,
    maxTokens,
  } = body;

  if (!MODEL_PRICING[model]) {
    return NextResponse.json({ error: `Unknown model: ${model}` }, { status: 400 });
  }

  const systemPrompt: ChatCompletionMessageParam = {
    role: "system",
    content:
      "You are a helpful, concise assistant. Be brief unless more detail is requested - give responses in markdown. " +
      "Wrap code in code brackets.",
  };

  const userMessage: ChatCompletionMessageParam = {
    role: "user",
    content: userQuery,
  };

  const start = Date.now();

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [systemPrompt, ...messages, userMessage],
      stream: true,
      temperature,
      max_tokens: maxTokens,
      stream_options: { include_usage: true },
    });

    let finalUsage:
      | { prompt_tokens: number; completion_tokens: number; total_tokens: number }
      | undefined;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        for await (const chunk of response) {
          const content = chunk.choices?.[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(encoder.encode(content));
          }

          if ((chunk as any)?.usage) {
            finalUsage = (chunk as any).usage;
          }
        }

        const pricing = MODEL_PRICING[model];
        const inputTokens = finalUsage?.prompt_tokens ?? 0;
        const outputTokens = finalUsage?.completion_tokens ?? 0;
        const totalTokens =
          finalUsage?.total_tokens ?? inputTokens + outputTokens;

        const inputCost = (inputTokens / 1000) * pricing.input;
        const outputCost = (outputTokens / 1000) * pricing.output;
        const totalCost = inputCost + outputCost;

        const latencyMs = Date.now() - start;

        const usageInfo: UsageInfo = {
          inputTokens,
          outputTokens,
          totalTokens,
          inputCost,
          outputCost,
          totalCost,
          latencyMs,
          model,
        };

        controller.enqueue(encoder.encode(USAGE_MARKER + JSON.stringify(usageInfo)));
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
