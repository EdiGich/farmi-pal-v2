export async function GET() {
  const now = new Date();
  const month = now.getMonth();

  // Kenya agricultural seasons
  // Long rains: March-May, harvest ~June-August
  // Short rains: Oct-Dec, harvest ~Jan-March
  let seasonSummary: string;
  let seasonCrops: string[];

  if (month >= 5 && month <= 7) {
    seasonSummary =
      "Long rains harvest season is underway across Central and Rift Valley. Maize and beans are at highest surplus risk in the next 4\u20136 weeks.";
    seasonCrops = ["maize", "beans", "potato"];
  } else if (month >= 8 && month <= 9) {
    seasonSummary =
      "Post-harvest period. Prices stabilizing but surplus pressure remains in high-yield zones.";
    seasonCrops = ["maize", "wheat"];
  } else if (month >= 10 || month <= 1) {
    seasonSummary =
      "Short rains season. Early planting underway; monitor weather patterns for crop planning.";
    seasonCrops = ["tomato", "kale", "cabbage"];
  } else {
    seasonSummary =
      "Dry season\u2014irrigated crops dominate. Tomatoes and leafy greens face price volatility in urban markets.";
    seasonCrops = ["tomato", "kale", "rice"];
  }

  // Regional heatmap data: counties with risk levels
  const regionRisk: Record<
    string,
    {
      level: "low" | "medium" | "high";
      label: string;
      crops: string[];
      note: string;
    }
  > = {
    nakuru: {
      level: "high",
      label: "Nakuru",
      crops: ["maize", "potato", "cabbage"],
      note: "4 counties harvesting simultaneously",
    },
    eldoret: {
      level: "high",
      label: "Eldoret",
      crops: ["maize", "wheat"],
      note: "Peak harvest month \u2014 prices falling",
    },
    kitale: {
      level: "medium",
      label: "Kitale",
      crops: ["maize", "beans"],
      note: "Harvest starting, glut expected in 2 weeks",
    },
    nairobi: {
      level: "medium",
      label: "Nairobi",
      crops: ["tomato", "kale"],
      note: "Urban glut forming from inbound surplus",
    },
    muranga: {
      level: "low",
      label: "Murang'a",
      crops: ["avocado", "coffee"],
      note: "Stable this week \u2014 off-season for staples",
    },
    meru: {
      level: "low",
      label: "Meru",
      crops: ["tea", "miraa"],
      note: "Tree crops buffer against grain surplus",
    },
    kisumu: {
      level: "medium",
      label: "Kisumu",
      crops: ["rice", "maize"],
      note: "Rice harvest peaking next month",
    },
    nyeri: {
      level: "low",
      label: "Nyeri",
      crops: ["potato", "dairy"],
      note: "Below-average rainfall limits oversupply",
    },
  };

  // At-risk crops this week
  const atRiskCrops: {
    crop: string;
    emoji: string;
    risk: "low" | "medium" | "high";
    reason: string;
    counties: number;
  }[] = [
    {
      crop: "Maize",
      emoji: "\ud83c\udf3d",
      risk: "high",
      reason: "4 counties harvesting",
      counties: 4,
    },
    {
      crop: "Tomato",
      emoji: "\ud83c\udf45",
      risk: "medium",
      reason: "Nairobi glut forming",
      counties: 2,
    },
    {
      crop: "Potato",
      emoji: "\ud83e\udd54",
      risk: "high",
      reason: "Molo/Njoro surplus peak",
      counties: 3,
    },
    {
      crop: "Kale",
      emoji: "\ud83e\udd6c",
      risk: "low",
      reason: "Stable this week",
      counties: 1,
    },
    {
      crop: "Beans",
      emoji: "\ud83c\udf31",
      risk: "medium",
      reason: "Harvest overlap in Central",
      counties: 2,
    },
  ];

  return Response.json({
    season_summary: seasonSummary,
    season_crops: seasonCrops,
    region_risk: regionRisk,
    at_risk_crops: atRiskCrops,
    generated_at: now.toISOString(),
  });
}
