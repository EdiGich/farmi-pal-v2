# FarmiPal

> An AI-powered agricultural assistant designed to help farmers diagnose crop diseases, access market insights, detect surplus risks, and get real-time guidance — built with a modern, scalable full-stack architecture.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
  - [📸 Image Diagnosis](#-feature-1-image-diagnosis)
  - [💬 Smart Chat](#-feature-2-smart-chat)
  - [📊 Market Trends](#-feature-3-market-trends)
  - [🌍 Surplus Insights](#-feature-4-surplus-insights)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Development Workflow](#development-workflow)
- [GPU Integration (Upcoming)](#gpu-integration-upcoming)
- [Pre-GPU Checklist](#pre-gpu-checklist)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Overview

FarmiPal is a farmer-first AI platform built to close the information gap between smallholder farmers and the tools they need to make better decisions. It does this through four tightly integrated features:

| Feature | What It Does | AI Method |
|---|---|---|
| 📸 **Image Diagnosis** | Identifies crop diseases from photos | Pretrained vision model + LLM explanation |
| 💬 **Smart Chat** | Answers farming questions conversationally | RAG pipeline + localization |
| 📊 **Market Trends** | Shows price trends and interprets them | Simple analytics + LLM narrative |
| 🌍 **Surplus Insights** | Predicts regional oversupply risk | Heuristics + weather data + LLM explanation |

The system uses **Next.js** as a fast, mobile-first UI layer and **Django** as the core backend for AI orchestration, data persistence, and async job handling. All AI logic is decoupled and GPU-ready.

---

## Core Features

---

## 📸 Feature 1: Image Diagnosis

> **"Take a photo. Know what's wrong. Know what to do."**

### What It Does

A farmer photographs a crop showing signs of disease or stress. FarmiPal runs the image through a pretrained vision model to classify the condition, then passes the classification result to an LLM to generate a practical, localized explanation with specific action steps.

### Why Two Models?

The vision model is fast and accurate at classification but produces only a label (e.g., `"maize_leaf_blight"`). That label alone is not useful to a farmer. The LLM converts it into a full explanation: what caused it, how serious it is, what to do today, and what to watch for next week — in the farmer's language.

```
Image Upload
     │
     ▼
┌──────────────────────────────┐
│   Pretrained Vision Model    │  ← ResNet / EfficientNet / PlantVillage-based
│   (Classification)           │
│   Input:  image file         │
│   Output: label + confidence │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       LLM Explanation        │  ← Prompted with label + crop context
│   Input:  label, crop, lang  │
│   Output: explanation + steps│
└──────────────────────────────┘
               │
               ▼
        Farmer sees:
        - Disease name
        - Plain-language explanation
        - Step-by-step action plan
        - Severity indicator
```

### Vision Model Details

| Property | Details |
|---|---|
| **Base architecture** | EfficientNet-B0 or ResNet-50 (TBD based on GPU specs) |
| **Dataset** | PlantVillage + regional crop disease extensions |
| **Input** | RGB image, resized to 224×224 |
| **Output** | Class label + softmax confidence score |
| **Supported crops** | Maize, tomato, cassava, bean, potato *(expandable)* |
| **Inference target** | < 2 seconds on AMD GPU |

### LLM Prompt Strategy

The LLM is not given the raw image — only the structured classification output. This keeps inference fast and the explanation controllable.

```python
# ai/prompts.py

DIAGNOSIS_PROMPT = """
You are an agricultural expert assistant helping smallholder farmers in East Africa.

A crop image was analyzed and the result is:
- Disease: {label}
- Confidence: {confidence}%
- Crop type: {crop_type}
- Farmer's language: {language}

Respond in {language}. Be clear and practical. Include:
1. What this disease is (1-2 sentences)
2. What causes it
3. How serious it is right now (mild / moderate / severe)
4. Exactly what the farmer should do in the next 48 hours
5. What to watch for over the next 2 weeks

Keep the tone calm, helpful, and actionable. Avoid technical jargon.
"""
```

### API Contract

**Request:**
```
POST /api/diagnose/
Content-Type: multipart/form-data

{
  image:     <File>         (required)
  crop_type: "maize"        (optional — improves accuracy)
  language:  "sw"           (optional — defaults to "en", supports "sw", "en")
}
```

**Response:**
```json
{
  "label": "Maize Leaf Blight",
  "label_key": "maize_leaf_blight",
  "confidence": 0.91,
  "severity": "moderate",
  "explanation": "Ugonjwa huu unaitwa Leaf Blight...",
  "steps": [
    "Ondoa majani yaliyoathirika mara moja.",
    "Tumia dawa ya ukungu (fungicide) kama Mancozeb.",
    "Epuka kumwagilia maji juu ya majani."
  ],
  "watch_for": "Angalia mabadiliko ndani ya siku 14.",
  "model_version": "v1.2.0"
}
```

### Mock Implementation (Current)

```ts
// app/api/diagnose/route.ts
export async function POST(req: Request) {
  return Response.json({
    label: "Maize Leaf Blight",
    label_key: "maize_leaf_blight",
    confidence: 0.91,
    severity: "moderate",
    explanation: "Ugonjwa huu unaitwa Leaf Blight. Unasababishwa na kuvu na hali ya hewa yenye unyevu mwingi.",
    steps: [
      "Ondoa majani yaliyoathirika mara moja.",
      "Tumia dawa ya ukungu kama Mancozeb.",
      "Epuka kumwagilia maji juu ya majani."
    ],
    watch_for: "Angalia mabadiliko ndani ya siku 14.",
    model_version: "v1.2.0"
  });
}
```

---

## 💬 Feature 2: Smart Chat

> **"Ask anything. Get an answer that makes sense for your farm."**

### What It Does

A conversational assistant that answers farming questions — soil health, pest identification, irrigation timing, planting calendars, input costs, and more. Unlike generic chatbots, FarmiPal's chat is grounded in a **retrieval-augmented generation (RAG)** pipeline that pulls from a curated agricultural knowledge base before generating an answer.

### Why RAG?

A general-purpose LLM has broad knowledge but is not specialized in smallholder East African farming. It may give advice calibrated to large-scale Western agriculture — wrong soil conditions, unavailable inputs, incorrect planting seasons. RAG fixes this by first retrieving relevant documents from a local knowledge base (extension guides, agronomist notes, regional almanacs), then passing them to the LLM as context.

```
User Message
     │
     ▼
┌────────────────────────────────┐
│        Query Embedding         │  ← text-embedding model
│   Converts question to vector  │
└──────────────┬─────────────────┘
               │
               ▼
┌────────────────────────────────┐
│       Vector Store Search      │  ← ChromaDB / pgvector
│   Top-K relevant documents     │
│   from agricultural knowledge  │
│   base (extension guides, FAO, │
│   regional almanacs, etc.)     │
└──────────────┬─────────────────┘
               │
               ▼
┌────────────────────────────────┐
│       LLM (with context)       │  ← Prompted with retrieved docs
│   Generates grounded answer    │
│   in farmer's language         │
└────────────────────────────────┘
               │
               ▼
        Farmer sees:
        - Direct answer
        - Source references (optional)
        - Follow-up suggestions
```

### Knowledge Base Sources

| Source Type | Examples | Format |
|---|---|---|
| Government extension guides | Kenya Ministry of Agriculture bulletins | PDF → chunked text |
| FAO crop guides | Maize, cassava, tomato production manuals | PDF → chunked text |
| Regional almanacs | Planting calendars by county/region | Structured JSON |
| Agronomist Q&A | Curated expert answers to common questions | Plain text |
| Input product sheets | Common fertilizers, pesticides available locally | Structured JSON |

### Localization Strategy

FarmiPal supports Swahili and English natively. Localization operates at two levels:

**Level 1 — Response language:** The LLM is instructed to respond in the user's detected or selected language. Language detection runs on the incoming message before the RAG query.

**Level 2 — Knowledge retrieval:** The vector store contains documents in both English and Swahili. Embeddings capture semantic meaning across languages, so a Swahili question can retrieve an English document and the LLM will respond in Swahili.

```python
# ai/chat.py

CHAT_SYSTEM_PROMPT = """
You are FarmiPal, an agricultural assistant helping smallholder farmers in East Africa.

You will be given context documents retrieved from a trusted agricultural knowledge base.
Use ONLY this context to answer. If the answer is not in the context, say so honestly.

Rules:
- Respond in {language}
- Be concise and practical — farmers need actionable advice
- Reference local conditions (soil types, rainfall patterns, available inputs)
- Avoid recommending products or inputs unavailable in East Africa
- Never fabricate statistics or research citations
"""
```

### Conversation State

Chat history is maintained client-side and sent with each request, giving the LLM full conversation context without server-side session storage.

```ts
// lib/chat.ts
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// Sent with each API call:
{
  messages: Message[],   // full history
  language: "sw" | "en"
}
```

### API Contract

**Request:**
```
POST /api/chat/
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Niambie kuhusu mbolea ya urea" }
  ],
  "language": "sw"
}
```

**Response:**
```json
{
  "reply": "Urea ni mbolea yenye nitrojeni nyingi (46%)...",
  "sources": [
    { "title": "Maize Production Guide", "page": 12 }
  ],
  "suggested_followups": [
    "Ni wakati gani mzuri kutumia urea?",
    "Urea inaathirije udongo wa pH ya chini?"
  ],
  "language": "sw"
}
```

---

## 📊 Feature 3: Market Trends

> **"Know what your crop is worth — and why."**

### What It Does

FarmiPal collects and displays crop price data across markets and regions, visualizes trends over time, and uses an LLM to generate a plain-language interpretation of what the numbers mean for a farmer making selling decisions today.

### Why LLM Explanation on Top of Analytics?

Raw price data is not enough. A farmer seeing "maize price down 12% this week" needs to know: *Is this a blip or a trend? Should I hold or sell? Are other farmers in my county flooding the market?* The LLM turns numbers into narrative.

```
Market Price Data (raw)
         │
         ▼
┌─────────────────────────────┐
│     Analytics Engine        │
│  - % change (7d, 30d)       │
│  - Trend direction          │
│  - Regional comparison      │
│  - Price volatility score   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      LLM Interpretation     │  ← Prompted with structured analytics output
│  Generates market narrative │
│  in farmer's language       │
└─────────────────────────────┘
               │
               ▼
        Farmer sees:
        - Current price
        - Trend chart (7d / 30d)
        - Plain-English/Swahili summary
        - "Sell now or wait?" guidance
```

### Analytics Computed (Before LLM)

These are calculated deterministically — not by AI — giving the LLM accurate data to reason from:

| Metric | Formula | Purpose |
|---|---|---|
| `price_change_7d` | `(current - price_7d_ago) / price_7d_ago` | Short-term trend |
| `price_change_30d` | `(current - price_30d_ago) / price_30d_ago` | Seasonal trend |
| `regional_rank` | Price vs. other counties | Where to sell |
| `volatility_score` | Std deviation over 30d | Stability signal |
| `volume_estimate` | Market throughput (if available) | Supply signal |

### LLM Prompt Strategy

```python
# ai/prompts.py

MARKET_PROMPT = """
You are a market analyst helping a smallholder farmer in {region}, {country}.

Here is today's market data for {crop_type}:
- Current price: {currency} {price} per {unit}
- 7-day change: {change_7d}%
- 30-day change: {change_30d}%
- Regional rank: {regional_rank} out of {total_regions} counties
- Volatility: {volatility_label} (low / medium / high)

In 3-4 sentences in {language}:
1. Explain what the price trend means in plain terms
2. Tell the farmer whether to sell now or wait, and why
3. Mention if another nearby market offers a better price

Be direct. Do not hedge excessively. Farmers need a clear recommendation.
"""
```

### Data Sources

| Source | Type | Notes |
|---|---|---|
| National market boards | Official price data | Kenya AMIS, Tanzania NFRA |
| Local broker network *(future)* | Crowdsourced | Farmer-reported prices |
| Commodity exchange feeds *(future)* | Structured API | EAX, AFEX |

### API Contract

**Request:**
```
GET /api/market/?crop=maize&region=nakuru&lang=sw
```

**Response:**
```json
{
  "crop": "maize",
  "region": "Nakuru",
  "currency": "KES",
  "unit": "90kg bag",
  "current_price": 3200,
  "price_change_7d": -4.1,
  "price_change_30d": 8.5,
  "trend": "falling_short_rising_long",
  "volatility": "medium",
  "regional_rank": 2,
  "best_nearby_market": {
    "name": "Eldoret",
    "price": 3450,
    "distance_km": 90
  },
  "narrative": "Bei ya mahindi imeshuka kidogo wiki hii...",
  "history": [
    { "date": "2025-05-01", "price": 3340 },
    { "date": "2025-04-24", "price": 3280 }
  ],
  "updated_at": "2025-05-05T08:00:00Z"
}
```

---

## 🌍 Feature 4: Surplus Insights

> **"Before everyone else floods the market, you'll know it's coming."**

### What It Is — and Why It's the Differentiator

Surplus Insights is FarmiPal's most unique feature. While other agri-apps tell farmers what prices are *today*, Surplus Insights tells them what will likely happen *next month* — by detecting early signals of regional oversupply before prices collapse.

Most smallholder farmers lose money not because they grew bad crops, but because they harvested at the same time as everyone else in their region and flooded the local market. Surplus Insights gives them a 3–6 week head start to plan differently.

### How It Works

Surplus Insights uses a heuristic engine — a set of explicit, auditable rules — combined with weather and seasonal data, scored to produce a surplus risk estimate. The LLM then explains the risk in terms farmers understand and suggests concrete alternatives.

```
Inputs:
  - Crop type + planting dates (user-reported or regional average)
  - Region + current season
  - Weather forecast (rainfall, temperature)
  - Historical harvest calendar
  - Recent market price trend

         │
         ▼
┌────────────────────────────────────┐
│        Heuristic Engine            │
│                                    │
│  Rule 1: Is this a peak harvest    │
│          month for this crop in    │
│          this region?              │
│                                    │
│  Rule 2: Is rainfall above         │
│          seasonal average?         │
│          (implies good yields)     │
│                                    │
│  Rule 3: Is market price already   │
│          trending down? (supply    │
│          pressure starting)        │
│                                    │
│  Rule 4: Are multiple neighboring  │
│          counties in same harvest  │
│          window?                   │
│                                    │
│  Rule 5: Is transport/road access  │
│          limited this season?      │
│                                    │
│  → Score: 0–100 (surplus risk)     │
└──────────────┬─────────────────────┘
               │
               ▼
┌────────────────────────────────────┐
│      Weather API Integration       │
│  - 14-day rainfall forecast        │
│  - Temperature anomaly             │
│  - Historical seasonal baseline    │
└──────────────┬─────────────────────┘
               │
               ▼
┌────────────────────────────────────┐
│       LLM Explanation              │
│  Input: heuristic scores + weather │
│  Output:                           │
│  - Plain-language risk summary     │
│  - Specific alternatives           │
│  - "What to do if you can't sell"  │
└────────────────────────────────────┘
               │
               ▼
        Farmer sees:
        - Surplus risk score (Low / Medium / High)
        - Why the risk is high
        - 3 alternatives (sell early, store, process)
        - Nearby markets with lower saturation
```

### Heuristic Scoring Engine

```python
# surplus/heuristics.py

def compute_surplus_risk(crop, region, weather, market_data, season_calendar):
    score = 0
    reasons = []

    # Rule 1: Peak harvest alignment
    if season_calendar.is_peak_harvest(crop, region):
        score += 30
        reasons.append("peak_harvest_month")

    # Rule 2: Above-average rainfall → better-than-normal yields
    if weather.rainfall_anomaly_pct > 15:
        score += 20
        reasons.append("high_rainfall_good_yield")

    # Rule 3: Price already declining
    if market_data.price_change_7d < -5:
        score += 20
        reasons.append("price_already_falling")

    # Rule 4: Neighboring counties also harvesting
    neighbor_count = season_calendar.harvesting_neighbors(crop, region)
    if neighbor_count >= 3:
        score += 20
        reasons.append(f"{neighbor_count}_counties_harvesting_simultaneously")

    # Rule 5: Transport disruption (long rains reduce road access)
    if season_calendar.is_road_season_risk(region):
        score += 10
        reasons.append("road_access_limited_rainy_season")

    return {
        "score": min(score, 100),
        "risk_level": classify_risk(score),
        "reasons": reasons
    }

def classify_risk(score):
    if score >= 60: return "high"
    if score >= 35: return "medium"
    return "low"
```

### Weather Data Integration

```python
# surplus/weather.py

class WeatherService:
    """
    Integrates with Open-Meteo (free, no API key required for basic use)
    or Tomorrow.io for premium forecasts.
    """

    def get_forecast(self, lat: float, lon: float) -> WeatherData:
        # 14-day daily forecast
        # Returns: rainfall_mm[], temp_max[], temp_min[]
        ...

    def get_seasonal_anomaly(self, lat: float, lon: float, month: int) -> float:
        # % deviation from 10-year average rainfall for this month
        ...
```

| Weather Provider | Cost | Data |
|---|---|---|
| [Open-Meteo](https://open-meteo.com/) | Free | 14-day forecast, historical |
| [Tomorrow.io](https://tomorrow.io/) | Freemium | Higher resolution, alerts |
| [CHIRPS](https://www.chc.ucsb.edu/data/chirps) | Free | Historical rainfall for Africa |

### LLM Prompt Strategy

```python
# ai/prompts.py

SURPLUS_PROMPT = """
You are an agricultural market advisor helping farmers in {region}, {country}.

Surplus risk analysis for {crop_type}:
- Risk score: {score}/100 ({risk_level} risk)
- Reasons: {reasons_list}
- Expected rainfall next 14 days: {rainfall_forecast}mm ({anomaly}% vs. normal)
- Counties harvesting simultaneously: {neighbor_counties}
- Current market price trend: {price_trend}

In {language}, provide:
1. A clear 2-sentence explanation of the surplus risk in plain terms
2. Three specific, practical alternatives the farmer can take RIGHT NOW:
   a) If they want to sell sooner
   b) If they have storage capacity
   c) If they can add value (drying, milling, etc.)
3. The nearest market with lower supply pressure: {best_alternative_market}

Tone: calm, practical, not alarmist. Farmers need clarity, not panic.
"""
```

### Alternatives Engine

When surplus risk is medium or high, the system generates structured alternatives:

```json
{
  "alternatives": [
    {
      "type": "sell_early",
      "label": "Sell within 2 weeks",
      "rationale": "Before peak market saturation hits",
      "action": "Contact Eldoret market traders now. Price is 8% higher than Nakuru today."
    },
    {
      "type": "store",
      "label": "Use certified storage (WBSCM)",
      "rationale": "Wait 8-10 weeks for post-harvest price recovery",
      "action": "Nearest certified warehouse: Nakuru NCPB depot, 12km away."
    },
    {
      "type": "process",
      "label": "Mill into flour",
      "rationale": "Adds ~40% value, avoids direct commodity market",
      "action": "Smallholder milling cooperatives active in your area."
    }
  ]
}
```

### API Contract

**Request:**
```
POST /api/surplus/
Content-Type: application/json

{
  "crop": "maize",
  "region": "nakuru",
  "lat": -0.3031,
  "lon": 36.0800,
  "planting_date": "2025-02-15",
  "estimated_harvest_date": "2025-06-20",
  "language": "sw"
}
```

**Response:**
```json
{
  "crop": "maize",
  "region": "Nakuru",
  "risk_score": 70,
  "risk_level": "high",
  "risk_reasons": [
    "peak_harvest_month",
    "high_rainfall_good_yield",
    "price_already_falling",
    "4_counties_harvesting_simultaneously"
  ],
  "weather_summary": {
    "forecast_rainfall_14d_mm": 142,
    "anomaly_pct": 22,
    "outlook": "Wetter than average — yields expected above normal across region"
  },
  "narrative": "Kwa sababu ya mvua nyingi na mavuno mazuri katika kaunti nyingi...",
  "alternatives": [
    {
      "type": "sell_early",
      "label": "Uza ndani ya wiki 2",
      "rationale": "Kabla soko halijajaa",
      "action": "Wasiliana na wafanyabiashara wa Eldoret sasa hivi."
    },
    {
      "type": "store",
      "label": "Hifadhi ghalani iliyoidhinishwa",
      "rationale": "Subiri bei ipande baada ya wiki 8-10",
      "action": "Ghala la karibu: NCPB Nakuru, km 12."
    },
    {
      "type": "process",
      "label": "Saga unga",
      "rationale": "Ongeza thamani ~40%, epuka soko la malighafi",
      "action": "Vikundi vya kusaga vipo katika eneo lako."
    }
  ],
  "best_alternative_market": {
    "name": "Eldoret",
    "price_premium_pct": 8,
    "distance_km": 90,
    "saturation_risk": "low"
  },
  "generated_at": "2025-05-05T10:30:00Z"
}
```

---

## Architecture

FarmiPal uses a layered architecture that keeps the frontend fast and the backend powerful:

```
┌────────────────────────────────────────────┐
│          Next.js (Frontend + BFF)          │
│  UI — Diagnose / Chat / Market / Surplus   │
│  Lightweight API proxy routes              │
└──────────────────┬─────────────────────────┘
                   │  HTTP / REST
                   ▼
┌────────────────────────────────────────────┐
│            Django REST API                 │
│  ┌─────────┐ ┌────────┐ ┌──────────────┐  │
│  │ Diagnose│ │  Chat  │ │Market/Surplus│  │
│  │ View    │ │ View   │ │ Views        │  │
│  └────┬────┘ └───┬────┘ └──────┬───────┘  │
│       │          │             │           │
│  ┌────▼──────────▼─────────────▼────────┐  │
│  │         AI Orchestration Layer       │  │
│  │  RAG pipeline / Prompt builder       │  │
│  │  Heuristic engine (surplus)          │  │
│  └────────────────────┬─────────────────┘  │
└───────────────────────┼────────────────────┘
                        │
          ┌─────────────┼──────────────┐
          ▼             ▼              ▼
   ┌─────────────┐ ┌──────────┐ ┌───────────┐
   │Vision Model │ │   LLM    │ │ Vector DB │
   │(crop disease│ │(explain- │ │(ChromaDB/ │
   │ classifier) │ │  ation)  │ │ pgvector) │
   └─────────────┘ └──────────┘ └───────────┘
   AMD GPU (upcoming)           Weather API
```

### Layer Responsibilities

| Layer | Responsibility | Why |
|---|---|---|
| **Next.js** | UI, routing, lightweight API proxy (BFF) | Fast iteration, great DX, SSR/mobile-first |
| **Django** | Business logic, file handling, AI orchestration | Mature ecosystem, Celery, ORM, DRF |
| **Vision Model** | Image classification | Specialized, fast, GPU-acceleratable |
| **LLM** | Explanation generation in any language | Flexible, context-aware, localizable |
| **Vector DB** | Semantic search for RAG | Efficient retrieval over large knowledge bases |
| **Heuristic Engine** | Surplus risk scoring | Transparent, auditable, no training data needed |

---

## Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| [Next.js 14+](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe development |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first mobile-first styling |

### Backend
| Tool | Purpose |
|---|---|
| [Django](https://www.djangoproject.com/) | Core API and data layer |
| [Django REST Framework](https://www.django-rest-framework.org/) | RESTful API endpoints |
| [Celery](https://docs.celeryq.dev/) *(planned)* | Async job queue for AI tasks |
| [Redis](https://redis.io/) *(planned)* | Celery broker + caching |

### AI & Data
| Tool | Purpose |
|---|---|
| EfficientNet / ResNet | Crop disease vision model |
| LLM *(Llama 3 / Mistral — TBD)* | Explanation, chat, narratives |
| [ChromaDB](https://www.trychroma.com/) / pgvector | Vector store for RAG |
| [Open-Meteo](https://open-meteo.com/) | Weather forecast data (free) |
| AMD GPU *(upcoming)* | On-premise model inference |

---

## Project Structure

```
farmipal-web/                     ← Next.js frontend
├── app/
│   ├── page.tsx                  ← Landing page
│   ├── diagnose/
│   │   └── page.tsx              ← Image upload & diagnosis UI
│   ├── chat/
│   │   └── page.tsx              ← AI chat assistant UI
│   ├── market/
│   │   └── page.tsx              ← Market trends & price UI
│   ├── surplus/
│   │   └── page.tsx              ← Surplus insights UI
│   └── api/
│       ├── diagnose/route.ts     ← BFF proxy → Django /diagnose/
│       ├── chat/route.ts         ← BFF proxy → Django /chat/
│       ├── market/route.ts       ← BFF proxy → Django /market/
│       └── surplus/route.ts      ← BFF proxy → Django /surplus/
├── components/
│   ├── DiagnosisResult.tsx
│   ├── ChatMessage.tsx
│   ├── PriceChart.tsx
│   └── SurplusRiskCard.tsx
├── lib/
│   ├── api.ts                    ← Shared API client
│   └── language.ts               ← Language detection + i18n
└── public/

farmipal-api/                     ← Django backend
├── diagnose/
│   ├── views.py                  ← Image upload + vision model call
│   ├── models.py                 ← DiagnosisRecord
│   └── serializers.py
├── chat/
│   ├── views.py                  ← RAG pipeline entrypoint
│   ├── rag.py                    ← Retriever + prompt assembly
│   └── vector_store.py           ← ChromaDB / pgvector interface
├── market/
│   ├── views.py                  ← Price analytics + LLM narrative
│   ├── analytics.py              ← Deterministic metric calculations
│   └── data_sources.py           ← Market data ingestion connectors
├── surplus/
│   ├── views.py                  ← Surplus risk API endpoint
│   ├── heuristics.py             ← Rule-based scoring engine
│   └── weather.py                ← Open-Meteo integration
├── ai/
│   ├── llm.py                    ← LLM client (abstracted, swappable)
│   ├── prompts.py                ← All prompt templates
│   └── vision.py                 ← Vision model inference wrapper
├── manage.py
└── requirements.txt
```

---

## Getting Started

### Prerequisites

- Node.js `>= 18.x`
- Python `>= 3.10`
- npm or yarn
- pip + virtualenv

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/farmipal.git
cd farmipal
```

### 2. Set Up the Next.js Frontend

```bash
npx create-next-app@latest farmipal-web
cd farmipal-web
npm install
npm run dev
# → http://localhost:3000
```

Select when prompted: ✅ TypeScript · ✅ App Router · ✅ Tailwind CSS · ✅ ESLint

### 3. Set Up the Django Backend

```bash
cd farmipal-api
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# → http://localhost:8000
```

### 4. Environment Variables

```env
# farmipal-web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000

# farmipal-api/.env
SECRET_KEY=your-django-secret-key
DEBUG=True
LLM_ENDPOINT=http://your-llm-server/api
LLM_API_KEY=your-key
WEATHER_API_KEY=your-open-meteo-key   # Often not required for basic use
VECTOR_DB_PATH=./chroma_db
```

---

## API Reference

| Endpoint | Method | Feature | Description |
|---|---|---|---|
| `/api/diagnose/` | POST | Image Diagnosis | Accepts image, returns label + LLM explanation |
| `/api/chat/` | POST | Smart Chat | Accepts message history, returns RAG-grounded reply |
| `/api/market/` | GET | Market Trends | Returns price data + analytics + LLM narrative |
| `/api/surplus/` | POST | Surplus Insights | Returns heuristic risk score + weather + alternatives |

Full request/response schemas for each endpoint are documented in the [Core Features](#core-features) section above.

---

## Development Workflow

### Mock-First Strategy

All four features start as mocked API routes. This lets the entire UI be built, tested, and demoed before any AI model is running.

```
Step 1: Define API contract (request + response shape)
Step 2: Create mock Next.js API route
Step 3: Build full UI against the mock
Step 4: Implement real Django backend
Step 5: Swap mock → Django proxy (one-line change per route)
```

### Adding a New Feature

1. Define the data shape — what does the request and response look like?
2. Create the mock route under `/app/api/your-feature/route.ts`
3. Build the UI page under `/app/your-feature/page.tsx`
4. Connect UI to the mock via `fetch` or the shared API client in `/lib/api.ts`
5. Implement the real backend in Django
6. Update the route to proxy to Django — no UI changes needed

### Swapping a Mock for a Real Endpoint

```ts
// Before (mock — no backend needed)
export async function POST(req: Request) {
  return Response.json({ label: "Maize Leaf Blight", ... });
}

// After (proxies to Django — no UI changes needed)
export async function POST(req: Request) {
  const body = await req.formData();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/diagnose/`, {
    method: "POST",
    body,
  });
  return Response.json(await res.json());
}
```

---

## GPU Integration (Upcoming)

FarmiPal is designed for on-premise AMD GPU inference. When access is available:

- The vision model (crop disease classifier) runs GPU-accelerated inference via ROCm
- The LLM moves to self-hosted AMD GPU for low-latency, private inference
- Celery queues handle async inference jobs so the API stays responsive
- **Zero changes required in the Next.js UI**

### Why Django for AI Orchestration?

| Requirement | Django Solution |
|---|---|
| Large image uploads | `django-storages` + multipart handling |
| Async model inference | Celery + Redis task queue |
| RAG pipeline | Python-native (LangChain or custom) |
| Model versioning | Django admin + migration-tracked config |
| Weather API caching | Django cache framework + Redis |

---

## Pre-GPU Checklist

### ✅ UI (All four pages)
- [ ] `/diagnose` — image upload, preview, severity badge, result display
- [ ] `/chat` — message input, history rendering, language toggle
- [ ] `/market` — price display, trend chart, narrative card, "sell now?" indicator
- [ ] `/surplus` — risk score card, reasoning tags, alternatives list, weather strip

### ✅ Mock APIs
- [ ] `POST /api/diagnose` — mock label, severity, steps, explanation
- [ ] `POST /api/chat` — mock reply, sources, suggested followups
- [ ] `GET /api/market` — mock price data, trend history, narrative
- [ ] `POST /api/surplus` — mock risk score, weather summary, alternatives

### ✅ Data Contracts Finalized
- [ ] Diagnosis response shape locked in
- [ ] Chat message + source format defined
- [ ] Market price + narrative schema documented
- [ ] Surplus risk + alternatives + weather schema documented

### ✅ Django Scaffolded
- [ ] All four Django apps initialized (`diagnose`, `chat`, `market`, `surplus`)
- [ ] DRF serializers written for all contracts
- [ ] Placeholder views returning mock-shaped data
- [ ] Weather API client tested with Open-Meteo
- [ ] Vector store initialized with at least one sample document set

---

## Roadmap

### Phase 1 — Foundation *(current)*
- [x] Architecture and API contracts defined
- [x] Feature specifications documented
- [ ] Next.js project with all four pages and mock routes
- [ ] Django project scaffolded with placeholder views
- [ ] Mobile-first UI polish across all pages

### Phase 2 — AI Integration
- [ ] Vision model integrated (crop disease classification)
- [ ] LLM explanation pipeline connected for `/diagnose`
- [ ] RAG pipeline built with agricultural knowledge base for `/chat`
- [ ] Market analytics engine + LLM narrative for `/market`
- [ ] Surplus heuristic engine + weather API for `/surplus`
- [ ] Swahili localization tested end-to-end across all features

### Phase 3 — Scale & Productionize
- [ ] AMD GPU inference deployed (ROCm stack)
- [ ] Celery async job queue for vision and LLM jobs
- [ ] Farmer profiles + diagnosis history
- [ ] SMS/USSD interface for low-connectivity users
- [ ] Live market data feed integration (Kenya AMIS, EAX)
- [ ] Surplus alert push notifications and SMS

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit with conventional commits: `git commit -m "feat(surplus): add weather anomaly scoring"`
4. Push and open a Pull Request

All UI must be tested on a **375px mobile viewport**. FarmiPal is mobile-first — most farmers will access it on an entry-level Android device.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

> **FarmiPal** — Built for farmers, powered by AI. 🌾
