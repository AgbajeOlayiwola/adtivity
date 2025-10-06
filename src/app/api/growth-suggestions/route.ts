// app/api/growth-suggestions/route.ts
import { NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "nodejs" as const

type ReqBody = { prompt?: string }

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { prompt } = (await req.json()) as ReqBody

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Missing 'prompt' in request body." },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set on the server." },
        { status: 500 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are a seasoned growth analyst. Output concise, actionable bullet points with [Insight] + [Action] + [Expected impact].",
        },
        { role: "user", content: prompt },
      ],
    })

    const suggestions =
      completion.choices?.[0]?.message?.content?.trim() ??
      "• [Insight] Not enough data\n• [Action] Provide more context\n• [Expected impact] —"

    return NextResponse.json({ suggestions }, { status: 200 })
  } catch (err: any) {
    console.error("growth-suggestions error:", err)
    return NextResponse.json(
      { error: err?.message ?? "Unexpected server error." },
      { status: 500 }
    )
  }
}
