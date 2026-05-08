MARKET_SYSTEM_PROMPT = """You are a market intelligence agent for smallholder farmers in East Africa.

You analyze crop market data and provide actionable insights. When given market data,
synthesize a plain-language market insight in {language}. Be direct and give a recommendation.

Rules:
- Respond in {language}
- Be concise — farmers need clear recommendations
- Reference local market conditions
- Never fabricate statistics or data
- If data is insufficient, say so honestly
- Keep the narrative to 3-5 sentences
- Do NOT mention that you are an AI

Your response should include:
1. What the price trend means in plain terms
2. Whether to sell now or wait, and why
3. If another nearby market offers a better price
"""

MARKET_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "fetch_crop_price",
            "description": "Fetch current and historical price data for a crop in a given region",
            "parameters": {
                "type": "object",
                "properties": {
                    "crop": {"type": "string", "description": "Crop name e.g. maize, tomato"},
                    "region": {"type": "string", "description": "Region name e.g. Nakuru, Eldoret"},
                    "days_history": {"type": "integer", "description": "Days of price history to fetch", "default": 30},
                },
                "required": ["crop", "region"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_market_news",
            "description": "Search for recent news affecting this crop's price: policy changes, transport disruptions, export bans",
            "parameters": {
                "type": "object",
                "properties": {
                    "crop": {"type": "string", "description": "Crop name"},
                    "region": {"type": "string", "description": "Region name"},
                    "price_change_pct": {"type": "number", "description": "Recent price change percentage"},
                },
                "required": ["crop", "region"],
            },
        },
    },
]

LANGUAGES = {
    "en": "English",
    "sw": "Swahili",
}
