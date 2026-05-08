import { NextResponse } from "next/server";

const COUNTY_HARVEST_CALENDAR: Record<string, { peak_harvest: number[]; planting: number[]; season: string }> = {
  trans_nzoia: { peak_harvest: [11, 12], planting: [3, 4], season: "unimodal" },
  uasin_gishu: { peak_harvest: [10, 11], planting: [3, 4], season: "unimodal" },
  elgeyo_marakwet: { peak_harvest: [10, 11], planting: [3, 4], season: "unimodal" },
  nandi: { peak_harvest: [10, 11], planting: [3, 4], season: "unimodal" },
  west_pokot: { peak_harvest: [10, 11], planting: [3, 4], season: "unimodal" },
  nakuru: { peak_harvest: [10, 11], planting: [3, 4], season: "unimodal" },
  laikipia: { peak_harvest: [10, 11], planting: [3, 4], season: "unimodal" },
  kakamega: { peak_harvest: [7, 8, 1, 2], planting: [3, 4, 10, 11], season: "bimodal" },
  bungoma: { peak_harvest: [7, 8, 1, 2], planting: [3, 4, 10, 11], season: "bimodal" },
  busia: { peak_harvest: [7, 8, 1, 2], planting: [3, 4, 10, 11], season: "bimodal" },
  vihiga: { peak_harvest: [7, 8, 1, 2], planting: [3, 4, 10, 11], season: "bimodal" },
  kisumu: { peak_harvest: [7, 8, 1, 2], planting: [3, 4, 10, 11], season: "bimodal" },
  siaya: { peak_harvest: [7, 8, 1, 2], planting: [3, 4, 10, 11], season: "bimodal" },
  kisii: { peak_harvest: [7, 8, 1, 2], planting: [3, 4, 10, 11], season: "bimodal" },
  migori: { peak_harvest: [7, 8, 1, 2], planting: [3, 4, 10, 11], season: "bimodal" },
  machakos: { peak_harvest: [6, 7, 1, 2], planting: [3, 4, 10, 11], season: "bimodal" },
  makueni: { peak_harvest: [6, 7, 1, 2], planting: [3, 4, 10, 11], season: "bimodal" },
  kitui: { peak_harvest: [6, 7, 1, 2], planting: [3, 4, 10, 11], season: "bimodal" },
  nyeri: { peak_harvest: [8, 9, 1, 2], planting: [3, 4, 10, 11], season: "bimodal" },
  kirinyaga: { peak_harvest: [8, 9, 1, 2], planting: [3, 4, 10, 11], season: "bimodal" },
  muranga: { peak_harvest: [8, 9, 1, 2], planting: [3, 4, 10, 11], season: "bimodal" },
};

function getSeasonSummary(month: number): { summary: string; crops: string[]; season: string } {
  if (month >= 3 && month <= 5) {
    return {
      season: "long_rains",
      summary: "Long rains season (MAM). Planting underway across Rift Valley and Western Kenya. North Rift counties (Trans Nzoia, Uasin Gishu, Nakuru) planting maize for Nov-Dec harvest.",
      crops: ["maize", "beans", "potato"],
    };
  }
  if (month >= 6 && month <= 9) {
    return {
      season: "long_rains_harvest",
      summary: "Long rains harvest season underway across Central, Western, and Nyanza. Maize and beans at highest surplus risk. Bimodal regions (Kakamega, Kisumu) in peak harvest now.",
      crops: ["maize", "beans", "potato"],
    };
  }
  if (month >= 10 && month <= 12) {
    return {
      season: "short_rains",
      summary: "Short rains season (OND). North Rift unimodal zones harvesting now — Trans Nzoia, Nakuru, Uasin Gishu at peak surplus risk. This is Kenya's main maize harvest window.",
      crops: ["maize", "wheat", "tomato"],
    };
  }
  return {
    season: "dry",
    summary: "Dry season — irrigated crops dominate. Tomatoes and leafy greens face price volatility in urban markets. Short rains harvest coming in from Western Kenya.",
    crops: ["tomato", "kale", "rice"],
  };
}

function computeRegionalRisk(month: number): Record<string, { level: "low" | "medium" | "high"; label: string; crops: string[]; note: string }> {
  const isPeakHarvest = (key: string) => {
    const cal = COUNTY_HARVEST_CALENDAR[key];
    return cal && cal.peak_harvest.includes(month);
  };

  const northRiftPeak = ["trans_nzoia", "uasin_gishu", "nandi", "nakuru"].filter(isPeakHarvest);
  const westernPeak = ["kakamega", "bungoma", "busia", "vihiga"].filter(isPeakHarvest);
  const nyanzaPeak = ["kisumu", "siaya", "kisii", "migori"].filter(isPeakHarvest);
  const easternPeak = ["machakos", "makueni", "kitui"].filter(isPeakHarvest);
  const centralPeak = ["nyeri", "kirinyaga", "muranga"].filter(isPeakHarvest);

  return {
    nakuru: {
      level: northRiftPeak.includes("nakuru") ? (northRiftPeak.length >= 3 ? "high" : "medium") : "low",
      label: "Nakuru", crops: ["maize", "potato", "cabbage"],
      note: northRiftPeak.includes("nakuru")
        ? `${northRiftPeak.length - 1} neighboring counties also harvesting`
        : "Off-peak season for staples",
    },
    eldoret: {
      level: northRiftPeak.includes("uasin_gishu") ? "high" : "low",
      label: "Eldoret", crops: ["maize", "wheat"],
      note: northRiftPeak.includes("uasin_gishu") ? "Peak harvest — prices under pressure" : "Post-harvest, prices stabilizing",
    },
    kitale: {
      level: northRiftPeak.includes("trans_nzoia") ? "high" : "medium",
      label: "Kitale", crops: ["maize", "beans"],
      note: northRiftPeak.includes("trans_nzoia") ? "Peak harvest — glut expected" : "Harvest starting in 4-6 weeks",
    },
    nairobi: {
      level: northRiftPeak.length >= 2 || westernPeak.length >= 2 ? "medium" : "low",
      label: "Nairobi", crops: ["tomato", "kale"],
      note: "Urban market — inbound surplus from harvest zones",
    },
    muranga: {
      level: centralPeak.includes("muranga") ? "medium" : "low",
      label: "Murang'a", crops: ["avocado", "coffee"],
      note: centralPeak.includes("muranga") ? "Harvest active" : "Tree crops buffer grain surplus",
    },
    meru: {
      level: "low",
      label: "Meru", crops: ["tea", "miraa"],
      note: "Tree crops — low surplus risk this season",
    },
    kisumu: {
      level: nyanzaPeak.length >= 2 || westernPeak.length >= 2 ? "high" : westernPeak.length >= 1 ? "medium" : "low",
      label: "Kisumu", crops: ["rice", "maize"],
      note: nyanzaPeak.length >= 2 ? "Rice and maize peaking — high surplus" : "Harvest starting next month",
    },
    nyeri: {
      level: centralPeak.includes("nyeri") ? "medium" : "low",
      label: "Nyeri", crops: ["potato", "dairy"],
      note: centralPeak.includes("nyeri") ? "Potato harvest active" : "Below-average rainfall limits oversupply",
    },
  };
}

function computeAtRiskCrops(month: number): Array<{ crop: string; emoji: string; risk: "low" | "medium" | "high"; reason: string; counties: number }> {
  const northRiftHarvesting = ["trans_nzoia", "uasin_gishu", "nandi", "nakuru"].filter((k) => COUNTY_HARVEST_CALENDAR[k]?.peak_harvest.includes(month));
  const westernHarvesting = ["kakamega", "bungoma", "busia", "vihiga"].filter((k) => COUNTY_HARVEST_CALENDAR[k]?.peak_harvest.includes(month));
  const nyanzaHarvesting = ["kisumu", "siaya", "kisii", "migori"].filter((k) => COUNTY_HARVEST_CALENDAR[k]?.peak_harvest.includes(month));
  const centralHarvesting = ["nyeri", "kirinyaga", "muranga"].filter((k) => COUNTY_HARVEST_CALENDAR[k]?.peak_harvest.includes(month));

  const totalMaize = northRiftHarvesting.length + westernHarvesting.length + nyanzaHarvesting.length;
  const totalBeans = westernHarvesting.length + nyanzaHarvesting.length;
  const totalPotato = northRiftHarvesting.length + centralHarvesting.length;

  return [
    {
      crop: "Maize", emoji: "\uD83C\uDF3D",
      risk: totalMaize >= 4 ? "high" : totalMaize >= 2 ? "medium" : "low",
      reason: `${totalMaize} counties harvesting`,
      counties: totalMaize,
    },
    {
      crop: "Tomato", emoji: "\uD83C\uDF45",
      risk: "medium",
      reason: "Urban glut forming from inbound surplus",
      counties: 2,
    },
    {
      crop: "Potato", emoji: "\uD83E\uDD54",
      risk: totalPotato >= 3 ? "high" : totalPotato >= 1 ? "medium" : "low",
      reason: totalPotato >= 3 ? "Rift Valley surplus peaking" : "Moderate supply",
      counties: totalPotato,
    },
    {
      crop: "Kale", emoji: "\uD83E\uDD6C",
      risk: "low",
      reason: "Stable this week",
      counties: 1,
    },
    {
      crop: "Beans", emoji: "\uD83C\uDF31",
      risk: totalBeans >= 3 ? "medium" : "low",
      reason: totalBeans >= 3 ? "Harvest overlap in Western" : "Limited supply pressure",
      counties: totalBeans,
    },
  ];
}

export async function GET() {
  const now = new Date();
  const month = now.getMonth() + 1;

  const seasonInfo = getSeasonSummary(month);
  const regionRisk = computeRegionalRisk(month);
  const atRiskCrops = computeAtRiskCrops(month);

  return NextResponse.json({
    season_summary: seasonInfo.summary,
    season: seasonInfo.season,
    season_crops: seasonInfo.crops,
    region_risk: regionRisk,
    at_risk_crops: atRiskCrops,
    generated_at: now.toISOString(),
  });
}
