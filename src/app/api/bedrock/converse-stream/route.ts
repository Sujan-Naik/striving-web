// app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const client = new OpenAI({ apiKey: process.env.OPENAI_TEST_KEY });

// Marker your client listens for
const USAGE_MARKER = "[[USAGE]]";

// Prices per MILLION tokens (MTok)
const MODEL_PRICING = {
  "gpt-5": { input: 1.25, output: 10.00 },
  "gpt-5-mini": { input: 0.25, output: 2.00 },
  "gpt-5-nano": { input: 0.05, output: 0.40 },
  "gpt-5-chat-latest": { input: 1.25, output: 10.00 },
  "gpt-4.1": { input: 2.00, output: 8.00 },
  "gpt-4.1-mini": { input: 0.40, output: 1.60 },
  "gpt-4.1-nano": { input: 0.10, output: 0.40 },
  "gpt-4o": { input: 2.50, output: 10.00 },
  "gpt-4o-2024-05-13": { input: 5.00, output: 15.00 },
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  // "o1": { input: 15.00, output: 60.00 },
  // "o1-pro": { input: 150.00, output: 600.00 },
  // "o3-pro": { input: 20.00, output: 80.00 },
  "o3": { input: 2.00, output: 8.00 },
  "o4-mini": { input: 1.10, output: 4.40 }, // restored
  // "o3-deep-research": { input: 10.00, output: 40.00 },
  "o3-mini": { input: 1.10, output: 4.40 },
  "o1-mini": { input: 1.10, output: 4.40 },
  "gpt-4-turbo": { input: 10.00, output: 30.00 },
  "gpt-3.5-turbo": { input: 0.50, output: 1.50 },
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

// MODEL_CAPABILITIES (includes o4-mini)
const MODEL_CAPABILITIES: Record<
  string,
  { supportsTemperature: boolean; tokenParam: "max_tokens" | "max_completion_tokens" }
> = {
  "gpt-5": { supportsTemperature: false, tokenParam: "max_completion_tokens" },
  "gpt-5-mini": { supportsTemperature: false, tokenParam: "max_completion_tokens" },
  "gpt-5-nano": { supportsTemperature: false, tokenParam: "max_completion_tokens" },
  "gpt-5-chat-latest": { supportsTemperature: false, tokenParam: "max_completion_tokens" },
  "gpt-4.1": { supportsTemperature: true, tokenParam: "max_tokens" },
  "gpt-4.1-mini": { supportsTemperature: true, tokenParam: "max_tokens" },
  "gpt-4.1-nano": { supportsTemperature: true, tokenParam: "max_tokens" },
  "gpt-4o": { supportsTemperature: true, tokenParam: "max_tokens" },
  "gpt-4o-2024-05-13": { supportsTemperature: true, tokenParam: "max_tokens" },
  "gpt-4o-mini": { supportsTemperature: true, tokenParam: "max_tokens" },
  "gpt-4-turbo": { supportsTemperature: true, tokenParam: "max_tokens" },
  "gpt-3.5-turbo": { supportsTemperature: true, tokenParam: "max_tokens" },
  "o3": { supportsTemperature: false, tokenParam: "max_completion_tokens" },
  "o4-mini": { supportsTemperature: false, tokenParam: "max_completion_tokens" }, // restored
  "o3-mini": { supportsTemperature: false, tokenParam: "max_completion_tokens" },
  "o1-mini": { supportsTemperature: false, tokenParam: "max_completion_tokens" },
};


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
    const caps = MODEL_CAPABILITIES[model];
    if (!caps) {
      return NextResponse.json(
        { error: `No capability map for model: ${model}` },
        { status: 400 }
      );
    }

    // Build request dynamically
    const requestPayload: any = {
      model,
      messages: [systemPrompt, ...messages, userMessage],
      stream: true,
      stream_options: { include_usage: true },
    };

    if (maxTokens) {
      requestPayload[caps.tokenParam] = maxTokens;
    }

    if (caps.supportsTemperature && typeof temperature === "number") {
      requestPayload.temperature = temperature;
    }

    const response = await client.chat.completions.create(requestPayload);

    // ✅ Guard: ensure this is a stream
    if (!(Symbol.asyncIterator in response)) {
      throw new Error(
        `Model ${model} did not return a streaming response. ` +
          `Check if it supports 'stream: true'.`
      );
    }

    let finalUsage:
      | { prompt_tokens: number; completion_tokens: number; total_tokens: number }
      | undefined;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        for await (const chunk of response as any) {
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

        // Calculate costs per MILLION tokens
        const inputCost = (inputTokens / 1_000_000) * pricing.input;
        const outputCost = (outputTokens / 1_000_000) * pricing.output;
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

        controller.enqueue(
          encoder.encode(USAGE_MARKER + JSON.stringify(usageInfo))
        );
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