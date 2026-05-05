# 🌱 FarmiPal

> An AI-powered agricultural assistant designed to help farmers diagnose crop diseases, access market insights, and get real-time guidance — built with a modern, scalable full-stack architecture.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Pages & Features](#pages--features)
- [API Reference](#api-reference)
- [Development Workflow](#development-workflow)
- [GPU Integration (Upcoming)](#gpu-integration-upcoming)
- [Pre-GPU Checklist](#pre-gpu-checklist)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Overview

FarmiPal is a farmer-first AI platform that provides:

- **Crop Disease Diagnosis** — Upload a photo of a crop and receive an AI-powered diagnosis with actionable guidance.
- **AI Chat Assistant** — A conversational interface for farming advice, pest management, soil health, and more.
- **Market Insights** — Real-time and trend-based pricing information to help farmers make informed selling decisions.

The system is designed with a **separation of concerns** between the UI layer (Next.js) and the core backend logic (Django), making it scalable from a prototype to a production-grade AI platform.

---

## Architecture

FarmiPal uses a layered architecture that keeps the frontend fast and the backend powerful:

```
┌─────────────────────────────────┐
│        Next.js (Frontend)       │
│  UI + Lightweight API Routes    │
│         (BFF Layer)             │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│       Django REST API           │
│  Core Backend — AI Orchestration│
│  Data Persistence, File Uploads │
│  Async Jobs (Celery, later)     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│         AI Services             │
│  Crop Disease Models (Vision)   │
│  LLM Chat Interface             │
│  AMD GPU Inference (Upcoming)   │
└─────────────────────────────────┘
```

### Design Rationale

| Layer | Responsibility | Why |
|---|---|---|
| **Next.js** | UI, routing, lightweight API proxy | Fast iteration, great DX, SSR support |
| **Django** | Business logic, file handling, AI orchestration | Mature ecosystem, Celery support, ORM |
| **AI Services** | Model inference | Decoupled, swappable, GPU-ready |

> **Important:** Next.js API routes act as a **Backend For Frontend (BFF)** — they are proxies and lightweight handlers, not where AI logic lives. All heavy lifting goes to Django.

---

## Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| [Next.js 14+](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe development |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |

### Backend
| Tool | Purpose |
|---|---|
| [Django](https://www.djangoproject.com/) | Core API and data layer |
| [Django REST Framework](https://www.django-rest-framework.org/) | RESTful API endpoints |
| [Celery](https://docs.celeryq.dev/) *(planned)* | Async job queue for AI tasks |

### AI & Inference
| Tool | Purpose |
|---|---|
| Vision Model *(TBD)* | Crop disease image classification |
| LLM *(TBD)* | Conversational farming assistant |
| AMD GPU *(upcoming)* | On-premise model inference |

---

## Project Structure

```
farmipal-web/              ← Next.js frontend
├── app/
│   ├── page.tsx           ← Landing page
│   ├── diagnose/
│   │   └── page.tsx       ← Image upload & diagnosis
│   ├── chat/
│   │   └── page.tsx       ← AI chat assistant
│   ├── market/
│   │   └── page.tsx       ← Market price insights
│   └── api/
│       └── analyze-image/
│           └── route.ts   ← API route (BFF proxy to Django)
├── components/            ← Reusable UI components
├── lib/                   ← Utility functions & API client
├── public/                ← Static assets
├── tailwind.config.ts
├── tsconfig.json
└── package.json

farmipal-api/              ← Django backend (separate repo/folder)
├── core/
│   ├── views.py           ← API views
│   ├── models.py          ← Data models
│   ├── serializers.py     ← DRF serializers
│   └── urls.py            ← URL routing
├── ai/
│   ├── inference.py       ← AI model integration
│   └── prompts.py         ← LLM prompt templates
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

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/farmipal.git
cd farmipal
```

---

### 2. Set Up the Next.js Frontend

```bash
# If starting fresh
npx create-next-app@latest farmipal-web
cd farmipal-web

# Or install dependencies in existing project
npm install
```

When prompted by `create-next-app`, select:

- ✅ TypeScript
- ✅ App Router
- ✅ Tailwind CSS
- ✅ ESLint

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

### 3. Set Up the Django Backend

```bash
cd farmipal-api

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the development server
python manage.py runserver
```

The API will be available at `http://localhost:8000`.

---

### 4. Environment Variables

Create a `.env.local` file in the `farmipal-web` directory:

```env
# Django backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# (Future) AI model endpoint
AI_MODEL_ENDPOINT=http://your-gpu-server/api
```

---

## Pages & Features

### 🏠 Landing Page (`/`)

The entry point for the application. Introduces FarmiPal's core features and directs users to the key tools.

---

### 📸 Crop Diagnosis (`/diagnose`)

Allows farmers to upload a photo of a potentially diseased crop and receive an AI-powered diagnosis.

**Flow:**
1. User selects or captures an image.
2. Image is previewed in the browser.
3. User submits — the image is sent to `/api/analyze-image`.
4. The API returns a diagnosis label and explanation.
5. Result is displayed to the user.

**Example Component:**

```tsx
"use client";

import { useState } from "react";

export default function DiagnosePage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/api/analyze-image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Crop Diagnosis</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        className="mt-4 bg-green-600 text-white p-2 rounded"
      >
        Analyze
      </button>

      {result && (
        <div className="mt-6 p-4 border rounded bg-green-50">
          <h2 className="font-semibold text-lg">{result.label}</h2>
          <p className="text-gray-700 mt-2">{result.explanation}</p>
        </div>
      )}
    </div>
  );
}
```

---

### 💬 AI Chat (`/chat`)

A conversational assistant for farming questions — pest control, soil health, irrigation, planting seasons, and more.

**Features:**
- Text input with message history
- Streaming or standard responses (depending on backend)
- Multilingual support (including Swahili for East African users)

---

### 📊 Market Insights (`/market`)

Displays current crop prices and trend indicators to help farmers decide when and where to sell.

**Features (current):**
- Mock price data by crop type
- Trend arrows (up/down/stable)
- Region-based filtering *(planned)*

**Features (planned):**
- Live market data API integration
- Historical price charts
- SMS alerts for price thresholds

---

## API Reference

### `POST /api/analyze-image`

Accepts an image file and returns a crop disease diagnosis.

**Request:**

```
Content-Type: multipart/form-data

Body:
  image: <File>
```

**Response:**

```json
{
  "label": "Maize Leaf Blight",
  "explanation": "Hii inaonekana kama leaf blight. Inaweza sababishwa na fungi. Tumia fungicide na epuka unyevu mwingi.",
  "confidence": 0.91,
  "recommendations": [
    "Apply copper-based fungicide",
    "Improve field drainage",
    "Remove and destroy infected leaves"
  ]
}
```

**Current Implementation (Mock):**

```ts
// app/api/analyze-image/route.ts
export async function POST(req: Request) {
  return Response.json({
    label: "Maize Leaf Blight",
    explanation:
      "Hii inaonekana kama leaf blight. Inaweza sababishwa na fungi. Tumia fungicide na epuka unyevu mwingi.",
  });
}
```

> This mock response allows full UI development and testing without requiring the AI backend to be running. Replace the mock with a Django proxy call when the backend is ready.

---

### Future: Proxying to Django

When Django is ready, update the route to forward requests:

```ts
// app/api/analyze-image/route.ts
export async function POST(req: Request) {
  const formData = await req.formData();

  const djangoRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze-image/`, {
    method: "POST",
    body: formData,
  });

  const data = await djangoRes.json();
  return Response.json(data);
}
```

No changes to the frontend UI are needed — only this one file changes.

---

## Development Workflow

### Mock-First Development

FarmiPal follows a **mock-first** development strategy:

1. Define the API contract (request/response shape).
2. Implement mock API routes in Next.js.
3. Build the full UI against the mock.
4. Swap mocks for real Django endpoints once the backend is ready.

This approach means the UI can be 100% complete before a single AI model is running.

---

### Adding a New Feature

1. **Define the data shape** — what does the API request and response look like?
2. **Create the mock API route** under `/app/api/your-feature/route.ts`.
3. **Build the UI page** under `/app/your-feature/page.tsx`.
4. **Connect UI to API** using `fetch` or a shared API client in `/lib`.
5. **Implement the real backend** in Django when ready.
6. **Swap the API URL** — no UI changes required.

---

### Connecting Next.js → Django

Replace mock fetches with Django-backed ones:

```ts
// Before (mock)
fetch("/api/analyze-image")

// After (real)
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze-image/`)
```

---

## GPU Integration (Upcoming)

FarmiPal is designed for on-premise AMD GPU inference. When GPU access is available:

1. AI models will be deployed to the GPU server.
2. Django will route inference requests to the GPU endpoint.
3. Celery will handle async job queuing for longer-running tasks.
4. **No changes to the Next.js UI will be needed.**

### Why Django for AI Orchestration?

| Requirement | Why Django Wins |
|---|---|
| Large file uploads | Handles multipart efficiently |
| Async AI jobs | Native Celery integration |
| Model versioning | Easy to manage via Django admin |
| Data persistence | ORM + migrations out of the box |
| GPU job queuing | Redis + Celery queue ready |

---

## Pre-GPU Checklist

Before AMD GPU access, ensure the following are complete:

### ✅ UI
- [ ] Landing page with feature highlights
- [ ] Image upload page with preview and result display
- [ ] Chat page with input and message history
- [ ] Market insights page with mock price data

### ✅ API (Mocked)
- [ ] `POST /api/analyze-image` — returns mock diagnosis
- [ ] `POST /api/chat` — returns mock chat reply
- [ ] `GET /api/market` — returns mock price data

### ✅ Data Contracts Defined
- [ ] Diagnosis response shape locked in
- [ ] Chat message format defined
- [ ] Market price object schema documented

### ✅ Django Backend
- [ ] Django project initialized
- [ ] DRF installed and configured
- [ ] Placeholder views created for all endpoints
- [ ] File upload endpoint scaffolded

---

## Roadmap

### Phase 1 — Foundation *(current)*
- [x] Next.js project setup with TypeScript + Tailwind
- [x] Core page structure (diagnose, chat, market)
- [x] Mock API routes
- [ ] Mobile-first UI polish
- [ ] Django API scaffold

### Phase 2 — AI Integration
- [ ] Django + AI model connected
- [ ] Real image inference via vision model
- [ ] LLM chat backend integrated
- [ ] Swahili language support refined

### Phase 3 — Scale & Productionize
- [ ] AMD GPU inference deployed
- [ ] Celery async job queue
- [ ] User authentication (farmer profiles)
- [ ] SMS/USSD interface for low-connectivity users
- [ ] Live market data API integration

---

## Contributing

Contributions are welcome! To get started:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request.

Please ensure all UI changes are tested on mobile viewport sizes, as FarmiPal is designed to be **mobile-first**.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

> **FarmiPal** — Built for farmers, powered by AI. 🌾