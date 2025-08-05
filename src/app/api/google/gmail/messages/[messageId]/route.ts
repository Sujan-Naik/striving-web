// app/api/messages/[messageId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

async function callProviderApi(provider: string, url: string, options: any) {
  // Your implementation here
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
    },
    ...options
  });
  return response.json();
}

export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') as "full" | "metadata" | "minimal") || "full";

    const message = await callProviderApi(
      "google",
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${params.messageId}`,
      { params: { format } }
    );

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch message' }, { status: 500 });
  }
}