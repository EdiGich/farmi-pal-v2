// app/api/diagnose/route.ts
// Mock implementation — swap return body for Django proxy when backend is ready

export async function POST(req: Request) {
  // TODO: replace with Django proxy
  // const body = await req.formData();
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/diagnose/`, {
  //   method: "POST",
  //   body,
  // });
  // return Response.json(await res.json());

  return Response.json({
    label: "Maize Leaf Blight",
    label_key: "maize_leaf_blight",
    confidence: 0.91,
    severity: "moderate",
    explanation:
      "Ugonjwa huu unaitwa Leaf Blight. Unasababishwa na kuvu na hali ya hewa yenye unyevu mwingi.",
    steps: [
      "Ondoa majani yaliyoathirika mara moja.",
      "Tumia dawa ya ukungu kama Mancozeb.",
      "Epuka kumwagilia maji juu ya majani.",
    ],
    watch_for: "Angalia mabadiliko ndani ya siku 14.",
    model_version: "v1.2.0",
  });
}
