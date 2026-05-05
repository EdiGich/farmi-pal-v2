export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const crop = searchParams.get("crop") || "maize";
  const region = searchParams.get("region") || "nakuru";

  return Response.json({
    crop,
    region: region.charAt(0).toUpperCase() + region.slice(1),
    currency: "KES",
    unit: "90kg bag",
    current_price: 3200,
    price_change_7d: -4.1,
    price_change_30d: 8.5,
    trend: "falling_short_rising_long",
    volatility: "medium",
    regional_rank: 2,
    best_nearby_market: {
      name: "Eldoret",
      price: 3450,
      distance_km: 90,
    },
    narrative: "Bei ya mahindi imeshuka kidogo wiki hii lakini inaonyesha upendeleo wa kuongezeka katika siku 30. Hii inaweza kuwa sababu ya msimu wa mavuno. Bei bora kwa sasa iko Eldoret.",
    history: [
      { date: "2025-05-05", price: 3200 },
      { date: "2025-05-01", price: 3340 },
      { date: "2025-04-24", price: 3280 },
      { date: "2025-04-17", price: 3100 },
      { date: "2025-04-10", price: 2950 },
      { date: "2025-04-03", price: 2980 },
      { date: "2025-03-27", price: 3020 },
    ],
    updated_at: "2025-05-05T08:00:00Z",
  });
}
