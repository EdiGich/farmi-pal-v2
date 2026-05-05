export async function POST(req: Request) {
  return Response.json({
    reply: "Sema Mkulima! Urea ni mbolea yenye nitrojeni nyingi (46%). Inatumika zaidi kwenye mahindi na mpunga.",
    sources: [
      { title: "Maize Production Guide", page: 12 },
      { title: "Kenya Fertilizer Guide", page: 5 },
    ],
    suggested_followups: [
      "Ni wakati gani mzuri kutumia urea?",
      "Urea inaathirije udongo wa pH ya chini?",
    ],
    language: "sw",
  });
}
