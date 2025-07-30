import { NextResponse } from 'next/server';
import {
  BedrockRuntimeClient,
  ConverseCommand,
  Message,
} from "@aws-sdk/client-bedrock-runtime";

export async function POST(request: Request) {
  const { query: userQuery = 'Hello' } = await request.json();

  const client = new BedrockRuntimeClient({region: "us-east-1"});
  const modelId = "us.anthropic.claude-sonnet-4-20250514-v1:0";

  const systemPrompt = `You are a code assistant. You MUST respond with ONLY valid JSON in this exact form:
  {
    "explanation": "Brief explanation of changes",
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
  Do not include any text before or after the JSON. Do not wrap in markdown code blocks
  `;

  const conversation: Message[] = [
    {
      role: "assistant",
      content: [{text: systemPrompt}]
    },
    {
      role: "user",
      content: [{text: userQuery}],
    },
  ];

  const command = new ConverseCommand({
    modelId,
    messages: conversation,
    inferenceConfig: {maxTokens: 20000, temperature: 0.5, topP: 0.9},
  });

  try {
  const response = await client.send(command);
  const responseText = response.output!.message!.content![0]!.text!;

  // Extract JSON from response text
  let jsonStr = responseText.trim();

  // Look for JSON block if wrapped in markdown
  const jsonMatch = jsonStr.match(/```json\n?([\s\S]*?)\n?```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  // Find JSON object boundaries
  const startIdx = jsonStr.indexOf('{');
  const lastIdx = jsonStr.lastIndexOf('}');

  if (startIdx !== -1 && lastIdx !== -1) {
    jsonStr = jsonStr.substring(startIdx, lastIdx + 1);
  }

  const parsedResponse = JSON.parse(jsonStr);
  return NextResponse.json(parsedResponse);

} catch (err) {
  // Log the actual response for debugging
  // console.error('Raw response:', response?.output?.message?.content?.[0]?.text);
  return NextResponse.json(
    { error: `Parse error: ${err}` },
    { status: 500 }
  );
}
}