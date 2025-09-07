import type { NextRequest } from "next/server"
import OpenAI from "openai"
import { z } from "zod"

const OutputSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      text: z.string().min(1),
      estimates: z
        .object({
          mentions: z.number().int().nonnegative(),
          likes: z.number().int().nonnegative(),
          retweets: z.number().int().nonnegative(),
        })
        .nullable(), // required by parent but may be null
    })
  ),
})

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { twitterId, tone, count, analytics } = await req.json()

    // Light derivations you can use to steer estimates (optional)
    const totalMentions = Number(analytics?.total_mentions ?? 0)
    const totalLikes = Number(analytics?.total_likes ?? 0)
    const days = Array.isArray(analytics?.mentions_by_date)
      ? Math.max(1, analytics.mentions_by_date.length)
      : 1

    const avgMentionsPerDay = days ? totalMentions / days : 0
    const likesPerMention = totalMentions > 0 ? totalLikes / totalMentions : 0

    // Map engagement to infer RT ratio if present
    const ebt = Array.isArray(analytics?.engagement_by_type)
      ? analytics.engagement_by_type
      : []
    const totalEng = ebt.reduce((s: number, e: any) => s + (e?.value || 0), 0)
    const shares =
      ebt.find((e: any) =>
        String(e?.name || "")
          .toLowerCase()
          .includes("share")
      )?.value || 0
    const retweetRatio =
      totalEng > 0 ? Math.max(0, Math.min(0.8, shares / totalEng)) : 0

    const sys =
      "You write concise, high-signal Twitter posts for startups. One tweet per idea (not a thread). Use at most 2 truly relevant hashtags. Avoid emoji spam. Return only fields required by the schema."

    // Inline analytics JSON as context for the model
    const context = JSON.stringify(
      {
        twitterId,
        analytics,
        derived: {
          avgMentionsPerDay,
          likesPerMention,
          retweetRatio,
        },
      },
      null,
      2
    )

    const user = [
      `Generate ${Number(count || 5)} tweet ideas.`,
      tone ? `Desired tone: ${tone}` : "",
      "Context JSON follows. Use it to align topics and avoid unrealistic claims.",
      context,
      // Estimation guidance:
      totalMentions === 0 && totalLikes === 0
        ? "Given zero recent activity, do NOT fabricate numbers. Set estimates to null and focus tweets on kickstarting engagement (questions, small announcements, lightweight calls-to-action)."
        : "If you can infer plausible numeric engagement based on the context, include estimates aligned to the magnitude suggested by the derived baselines. Avoid exaggerated numbers.",
    ].join("\n\n")

    // Strict structured outputs
    const resp = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "buzz_tweets",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    id: { type: "string" },
                    text: { type: "string" },
                    // required but nullable → model must output the key,
                    // and can set it to null when it can't infer numbers.
                    estimates: {
                      type: ["object", "null"],
                      additionalProperties: false,
                      properties: {
                        mentions: { type: "integer", minimum: 0 },
                        likes: { type: "integer", minimum: 0 },
                        retweets: { type: "integer", minimum: 0 },
                      },
                      required: ["mentions", "likes", "retweets"],
                    },
                  },
                  // IMPORTANT: include every key, i.e., id, text, estimates
                  required: ["id", "text", "estimates"],
                },
              },
            },
            required: ["items"],
          },
        },
      },
    })

    // Extract parsed JSON from Responses API
    const first = (resp as any)?.output?.[0]
    const textItem = first?.content?.find?.(
      (c: any) => c.type === "output_text"
    )
    const parsed = textItem?.text?.parsed as unknown

    const data =
      parsed ??
      (() => {
        const raw = textItem?.text?.content ?? (resp as any)?.output_text
        return raw ? JSON.parse(raw) : undefined
      })()

    const validated = OutputSchema.parse(data)
    return new Response(JSON.stringify(validated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    console.error("generate-buzz-tweets error:", err)
    return new Response(
      JSON.stringify({
        error: "Failed to generate tweets",
        detail:
          err?.issues?.map?.((i: any) => i?.message).join?.("; ") ??
          err?.message ??
          String(err),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
