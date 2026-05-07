// app/api/chat/route.ts
// Proxies chat requests to Django backend which forwards to vLLM

export async function POST(req: Request) {
  const body = await req.json();
  const djangoRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chat/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  return Response.json(await djangoRes.json(), { status: djangoRes.status });
}
