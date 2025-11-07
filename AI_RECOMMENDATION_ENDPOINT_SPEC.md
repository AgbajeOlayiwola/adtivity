# AI KOL Recommendation Endpoint Specification

## Overview
This document specifies the endpoint needed for the ChatGPT-powered KOL brand fit analysis feature.

## Endpoint Details

### URL
```
POST /twitter/kol/recommendation
```

### Request Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body
```json
{
  "kol_data": {
    // The complete KOL analysis data from /twitter/kol/analyze
    "username": "string",
    "profile": {
      "id": "string",
      "username": "string",
      "name": "string",
      "description": "string",
      "profile_image_url": "string",
      "verified": boolean,
      "followers_count": number,
      "following_count": number,
      "tweets_count": number,
      "created_at": "string"
    },
    "user_tweets": [...],
    "mentions": [...],
    "analysis_summary": {
      "total_tweets_analyzed": number,
      "total_mentions_fetched": number,
      "total_engagement": number,
      "engagement_rate_percent": number,
      "avg_engagement_per_tweet": number,
      "top_hashtags": [...],
      "top_performing_tweets": [...]
    }
  },
  "brand_goals": [
    "brand_awareness",
    "engagement",
    "customer_acquisition",
    "sales_conversion",
    "community_growth",
    "thought_leadership"
  ],
  "additional_context": "string (optional)"
}
```

### Brand Goals Options
- `brand_awareness` - Increase brand visibility and reach
- `engagement` - Drive interactions and conversations
- `customer_acquisition` - Attract new customers
- `sales_conversion` - Drive sales and conversions
- `community_growth` - Build and grow community
- `thought_leadership` - Establish authority and expertise

### Expected Response
```json
{
  "recommendation": "string - Comprehensive AI analysis text explaining if the KOL is a good fit",
  "fit_score": number (1-10),
  "strengths": [
    "string - Key strength 1",
    "string - Key strength 2",
    ...
  ],
  "concerns": [
    "string - Potential concern 1",
    "string - Potential concern 2",
    ...
  ]
}
```

## Backend Implementation Guide

### 1. ChatGPT Integration

You'll need to integrate with OpenAI's API:

```python
import openai

openai.api_key = "your-api-key"

def generate_kol_recommendation(kol_data, brand_goals, additional_context=None):
    # Prepare the prompt
    prompt = f"""
    You are an expert marketing analyst specializing in influencer partnerships and brand collaborations.

    Analyze the following KOL (Key Opinion Leader) data and determine if they would be a good fit for a brand with these goals:

    Brand Goals: {', '.join(brand_goals)}
    {f'Additional Context: {additional_context}' if additional_context else ''}

    KOL Profile:
    - Username: @{kol_data['profile']['username']}
    - Name: {kol_data['profile']['name']}
    - Followers: {kol_data['profile']['followers_count']:,}
    - Engagement Rate: {kol_data['analysis_summary']['engagement_rate_percent']:.2f}%
    - Total Engagement: {kol_data['analysis_summary']['total_engagement']:,}
    - Average Engagement per Tweet: {kol_data['analysis_summary']['avg_engagement_per_tweet']:.2f}

    Recent Tweet Performance:
    {format_top_tweets(kol_data['analysis_summary']['top_performing_tweets'])}

    Provide:
    1. A comprehensive analysis (2-3 paragraphs) on whether this KOL is a good fit
    2. A fit score from 1-10
    3. 3-5 key strengths
    4. 2-4 potential concerns or considerations

    Format your response as JSON with keys: recommendation, fit_score, strengths (array), concerns (array)
    """

    response = openai.ChatCompletion.create(
        model="gpt-4",  # or "gpt-3.5-turbo" for faster/cheaper
        messages=[
            {"role": "system", "content": "You are a marketing analytics expert specializing in influencer partnerships."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=1000
    )

    return json.loads(response.choices[0].message.content)
```

### 2. Example Endpoint (FastAPI)

```python
from fastapi import APIRouter, Depends
from typing import List, Optional
import openai

router = APIRouter()

@router.post("/twitter/kol/recommendation")
async def get_kol_recommendation(
    request: KOLRecommendationRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        # Generate AI recommendation
        recommendation = await generate_kol_recommendation(
            kol_data=request.kol_data,
            brand_goals=request.brand_goals,
            additional_context=request.additional_context
        )

        return {
            "recommendation": recommendation["recommendation"],
            "fit_score": recommendation["fit_score"],
            "strengths": recommendation["strengths"],
            "concerns": recommendation["concerns"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 3. Prompt Engineering Tips

For better results, consider:
- Including more context about the brand's industry, target audience
- Analyzing tweet sentiment and topics
- Comparing against industry benchmarks
- Including historical campaign performance if available

### 4. Response Example

```json
{
  "recommendation": "Based on the analysis, @Ola_199x shows strong potential for brands focused on community engagement and thought leadership in the tech/crypto space. With an engagement rate of 2910.35%, this KOL demonstrates exceptional audience interaction, far exceeding industry averages. The profile shows consistent activity with a focus on political and social commentary, which could align well with brands seeking authentic, socially-conscious voices.\n\nHowever, the relatively modest follower count (367) suggests a micro-influencer tier, which may limit reach for pure brand awareness campaigns but could provide highly engaged, niche audience access. The content mix shows heavy reliance on retweets rather than original content, which may impact perceived authenticity for some campaigns.",
  "fit_score": 7,
  "strengths": [
    "Exceptional engagement rate (2910.35%) indicates highly active and responsive audience",
    "Consistent posting activity with focus on tech, crypto, and social issues",
    "Authentic voice with strong opinions - good for brands seeking credibility",
    "Micro-influencer tier often provides better ROI and more genuine connections"
  ],
  "concerns": [
    "Limited follower count (367) may restrict overall reach for mass awareness campaigns",
    "High percentage of retweets vs original content could affect perceived authenticity",
    "Strong political/social commentary may not align with all brand values",
    "Volatile engagement metrics suggest audience may be topic-specific rather than loyal to the influencer"
  ]
}
```

## Frontend Integration Status

✅ **Completed:**
- Redux mutation endpoint configured
- UI for goal selection with 6 predefined goals
- Optional additional context textarea
- AI recommendation display with:
  - Comprehensive analysis text
  - Visual fit score (1-10) with progress bar
  - Strengths list
  - Concerns list
- Loading states and error handling
- Beautiful gradient design matching the KOL analysis theme

## Testing

Test the endpoint with the provided KOL data structure to ensure ChatGPT generates useful, actionable recommendations.

## Rate Limiting Considerations

Consider implementing:
- Caching for repeated analyses of same KOL
- Rate limiting per user
- Cost tracking for OpenAI API usage
