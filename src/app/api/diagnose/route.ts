function sanitizeDjangoError(body: Record<string, unknown>): string {
  const err = (body?.error as string) || "";
  const detail = (body?.detail as string) || "";
  const combined = (err + " " + detail).toLowerCase();

  if (
    combined.includes("connection") ||
    combined.includes("timeout") ||
    combined.includes("max retries") ||
    combined.includes("connecttimeout") ||
    combined.includes("econnrefused")
  ) {
    return "FarmiPal is currently unable to connect to the AI model. Please try again later.";
  }

  return err || "An unexpected error occurred. Please try again.";
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const djangoRes = await fetch(`${API_URL}/api/diagnose/`, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(30000),
      });
      if (!djangoRes.ok) {
        const body = await djangoRes.json().catch(() => ({}));
        return Response.json({ error: sanitizeDjangoError(body) }, { status: 503 });
      }
      return Response.json(await djangoRes.json());
    }

    const body = await req.json();
    const djangoRes = await fetch(`${API_URL}/api/diagnose/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    if (!djangoRes.ok) {
      const errBody = await djangoRes.json().catch(() => ({}));
      return Response.json({ error: sanitizeDjangoError(errBody) }, { status: 503 });
    }
    return Response.json(await djangoRes.json());
  } catch (err) {
    return Response.json(
      { error: "FarmiPal is currently unable to connect to the AI model. Please ensure the backend server is running and try again." },
      { status: 503 }
    );
  }
}

export async function GET() {
  try {
    const djangoRes = await fetch(`${API_URL}/api/health/`, {
      signal: AbortSignal.timeout(10000),
    });
    return Response.json(await djangoRes.json(), { status: djangoRes.status });
  } catch {
    return Response.json(
      { error: "Backend service unreachable" },
      { status: 503 }
    );
  }
}
