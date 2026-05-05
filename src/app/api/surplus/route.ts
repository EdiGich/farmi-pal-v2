export async function POST(req: Request) {
  return Response.json({
    crop: "maize",
    region: "Nakuru",
    risk_score: 70,
    risk_level: "high",
    risk_reasons: [
      "peak_harvest_month",
      "high_rainfall_good_yield",
      "price_already_falling",
      "4_counties_harvesting_simultaneously",
    ],
    weather_summary: {
      forecast_rainfall_14d_mm: 142,
      anomaly_pct: 22,
      outlook: "Wetter than average — yields expected above normal across region",
    },
    narrative:
      "Kwa sababu ya mvua nyingi na mavuno mazuri katika kaunti nyingi, bei inatarajiwa kushuka zaidi wiki zijazo. Fikiria kuuza mapema au kuhifadhi mazao yako.",
    alternatives: [
      {
        type: "sell_early",
        label: "Uza ndani ya wiki 2",
        rationale: "Kabla soko halijajaa",
        action: "Wasiliana na wafanyabiashara wa Eldoret sasa hivi.",
      },
      {
        type: "store",
        label: "Hifadhi ghalani iliyoidhinishwa",
        rationale: "Subiri bei ipande baada ya wiki 8-10",
        action: "Ghala la karibu: NCPB Nakuru, km 12.",
      },
      {
        type: "process",
        label: "Saga unga",
        rationale: "Ongeza thamani ~40%, epuka soko la malighafi",
        action: "Vikundi vya kusaga vipo katika eneo lako.",
      },
    ],
    best_alternative_market: {
      name: "Eldoret",
      price_premium_pct: 8,
      distance_km: 90,
      saturation_risk: "low",
    },
    generated_at: "2025-05-05T10:30:00Z",
  });
}
