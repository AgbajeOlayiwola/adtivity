import type { NextRequest } from "next/server"
import OpenAI from "openai"
import { z } from "zod"

const OutputSchema = z.object({
  recommendation: z.string().min(1),
  fit_score: z.number().int().min(1).max(10),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
})

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { kol_data, brand_goals, additional_context } = await req.json()

    if (!kol_data || !brand_goals || !Array.isArray(brand_goals)) {
      return new Response(
        JSON.stringify({
          error: "Invalid request",
          detail: "kol_data and brand_goals (array) are required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Extract key metrics from KOL data
    const profile = kol_data.profile || {}
    const analysisSummary = kol_data.analysis_summary || {}

    const metrics = {
      username: profile.username || "Unknown",
      name: profile.name || "Unknown",
      followers: profile.followers_count || 0,
      following: profile.following_count || 0,
      verified: profile.verified || false,
      engagementRate: analysisSummary.engagement_rate_percent || 0,
      totalEngagement: analysisSummary.total_engagement || 0,
      avgEngagement: analysisSummary.avg_engagement_per_tweet || 0,
      tweetsAnalyzed: analysisSummary.total_tweets_analyzed || 0,
      mentionsFetched: analysisSummary.total_mentions_fetched || 0,
    }

    // Map goals to readable format
    const goalMapping: Record<string, string> = {
      brand_awareness: "Brand Awareness",
      engagement: "Engagement & Community Building",
      customer_acquisition: "Customer Acquisition",
      sales_conversion: "Sales & Conversion",
      community_growth: "Community Growth",
      thought_leadership: "Thought Leadership & Authority",
    }

    const formattedGoals = brand_goals
      .map((g: string) => goalMapping[g] || g)
      .join(", ")

    const sys = `You are an expert marketing analyst specializing in influencer partnerships and brand collaborations.
You provide data-driven, honest, and actionable recommendations for KOL (Key Opinion Leader) partnerships.
Your analysis should be balanced - highlighting both strengths and potential concerns.
Return only the fields required by the schema with no extra text.`

    const context = JSON.stringify(
      {
        kol_metrics: metrics,
        brand_goals: formattedGoals,
        additional_context: additional_context || "None provided",
        top_performing_tweets: analysisSummary.top_performing_tweets
          ?.slice(0, 3)
          .map((t: any) => ({
            text: t.text?.substring(0, 100) + "...",
            likes: t.likes,
            retweets: t.retweets,
          })) || [],
      },
      null,
      2
    )

    const user = `Analyze the following KOL data and provide a recommendation for brand partnership.

${context}

Provide:
1. A comprehensive analysis (2-3 paragraphs, 150-250 words) on whether this KOL is a good fit for the brand goals. Discuss their engagement quality, audience alignment, content style, and potential ROI.

2. A fit score from 1-10 where:
   - 1-3: Poor fit, not recommended
   - 4-5: Below average fit, proceed with caution
   - 6-7: Good fit with some reservations
   - 8-9: Strong fit, recommended
   - 10: Exceptional fit, highly recommended

3. 3-5 key strengths this KOL brings to the partnership

4. 2-4 potential concerns or considerations

Be honest and data-driven. Consider:
- Engagement rate vs follower count (quality vs quantity)
- Audience size relative to brand goals (micro vs macro influencer)
- Content authenticity (original content vs retweets)
- Potential risks (controversial content, audience mismatch, etc.)

If engagement rate is exceptionally high (>100%), note this as unusual but explain it positively if the KOL has strong viral content.
If follower count is low (<1000), acknowledge this as micro-influencer tier and discuss the benefits/limitations.`

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
          name: "kol_recommendation",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              recommendation: {
                type: "string",
                description:
                  "Comprehensive analysis of the KOL fit (150-250 words)",
              },
              fit_score: {
                type: "integer",
                minimum: 1,
                maximum: 10,
                description: "Overall fit score from 1-10",
              },
              strengths: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 5,
                description: "Key strengths of this KOL partnership",
              },
              concerns: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 4,
                description:
                  "Potential concerns or considerations for the partnership",
              },
            },
            required: ["recommendation", "fit_score", "strengths", "concerns"],
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
    console.error("kol-recommendation error:", err)
    return new Response(
      JSON.stringify({
        error: "Failed to generate KOL recommendation",
        detail:
          err?.issues?.map?.((i: any) => i?.message).join?.("; ") ??
          err?.message ??
          String(err),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
