import { NextResponse } from 'next/server'
import {
  BedrockRuntimeClient,
  ConverseStreamCommand,
  Message,
} from "@aws-sdk/client-bedrock-runtime";

export async function GET() {
  const client = new BedrockRuntimeClient({
    region: "eu-west-2",
    credentials: {
      accessKeyId: process.env.BEDROCK_ACCESS_KEY_ID!,
      secretAccessKey: process.env.BEDROCK_SECRET_ACCESS_KEY!,
    }
  });

  const modelId = "anthropic.claude-3-7-sonnet-20250219-v1:0";
  const userMessage = "Describe the purpose of a 'hello world' program in one line.";
  const conversation: Message[] = [
    {
      role: "user",
      content: [{ text: userMessage }],
    },
  ];

  const response = await client.send(
    new ConverseStreamCommand({
      modelId,
      messages: conversation,
      inferenceConfig: { maxTokens: 512, temperature: 0.5, topP: 0.9 },
    })
  );

  // Return the stream as a readable stream
  const stream = new ReadableStream({
    async start(controller) {
      for await (const item of response.stream!) {
        if (item.contentBlockDelta) {
          const text = item.contentBlockDelta.delta?.text!;
          controller.enqueue(new TextEncoder().encode(text));
        }
      }
      controller.close();
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
}