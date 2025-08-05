import { NextRequest } from "next/server"
import {callGitHubGraphQL} from "@/lib/api-client";

export async function POST(request: NextRequest) {
  try {
    const { query, variables } = await request.json()

    if (!query) {
      return Response.json({ error: "Query is required" }, { status: 400 })
    }

    const result = await callGitHubGraphQL(query, variables)

    if (!result.success) {
      return Response.json({ error: result.error }, { status: result.status || 500 })
    }

    return Response.json(result.data)
  } catch (error) {
    return Response.json(
      { error: "Failed to execute GraphQL query" },
      { status: 500 }
    )
  }
}