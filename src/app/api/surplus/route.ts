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
    return "FarmiPal is currently unable to connect to the AI model. Please ensure the backend server is running and try again.";
  }

  return err || "An unexpected error occurred. Please try again.";
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const djangoRes = await fetch(`${API_URL}/api/surplus/`, {
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
  } catch {
    return Response.json(
      { error: "FarmiPal is currently unable to connect to the AI model. Please ensure the backend server is running and try again." },
      { status: 503 }
    );
  }
}
