// app/api/diagnose/route.ts
// Proxies uploads to Django backend which forwards to vLLM

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const djangoRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/diagnose/`,
      { method: "POST", body: formData }
    );
    return Response.json(await djangoRes.json(), { status: djangoRes.status });
  }

  const body = await req.json();
  const djangoRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/diagnose/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  return Response.json(await djangoRes.json(), { status: djangoRes.status });
}

export async function GET() {
  const djangoRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/health/`
  );
  return Response.json(await djangoRes.json(), { status: djangoRes.status });
}
