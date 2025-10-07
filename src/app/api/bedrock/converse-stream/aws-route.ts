import {NextResponse} from 'next/server'
import {BedrockRuntimeClient, ConverseStreamCommand, Message,} from "@aws-sdk/client-bedrock-runtime";

export async function POST(request: Request) {
    const {query: userQuery = 'Hello'} = await request.json();

    const client = new BedrockRuntimeClient({
        region: "us-east-1",
        // region: "eu-west-2",
        // credentials: {
        //   accessKeyId: process.env.BEDROCK_ACCESS_KEY_ID!,
        //   secretAccessKey: process.env.BEDROCK_SECRET_ACCESS_KEY!,
        // }
    });

    const modelId = "us.anthropic.claude-sonnet-4-20250514-v1:0";
    // const modelId = "anthropic.claude-3-7-sonnet-20250219-v1:0";
    // const modelId = "us.deepseek.r1-v1:0";

    const conversation: Message[] = [
        {
            role: "assistant",
            content: [{
                text: "Be concise. For code: Don't provide a lot of styling unless requested."
            }],
        },
        {
            role: "user",
            content: [{text: userQuery}],
        },
    ];

    const response = await client.send(
        new ConverseStreamCommand({
            modelId,
            messages: conversation,
            inferenceConfig: {maxTokens: 8096, temperature: 0.5, topP: 0.9},
        })
    );

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