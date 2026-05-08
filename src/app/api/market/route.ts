const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CROP_DATA: Record<string, { basePrice: number; unit: string; volatility: string; priceRange: number }> = {
  maize: { basePrice: 3200, unit: "90kg bag", volatility: "medium", priceRange: 400 },
  wheat: { basePrice: 4600, unit: "90kg bag", volatility: "low", priceRange: 200 },
  potato: { basePrice: 3200, unit: "50kg bag", volatility: "high", priceRange: 500 },
  tomato: { basePrice: 4500, unit: "crate", volatility: "high", priceRange: 800 },
  cassava: { basePrice: 2500, unit: "90kg bag", volatility: "medium", priceRange: 300 },
  beans: { basePrice: 5500, unit: "90kg bag", volatility: "medium", priceRange: 400 },
  rice: { basePrice: 4000, unit: "50kg bag", volatility: "low", priceRange: 200 },
  sugarcane: { basePrice: 3500, unit: "tonne", volatility: "low", priceRange: 300 },
  coffee: { basePrice: 12000, unit: "50kg bag", volatility: "high", priceRange: 1500 },
  tea: { basePrice: 8000, unit: "50kg bag", volatility: "low", priceRange: 500 },
  banana: { basePrice: 2000, unit: "bunch", volatility: "medium", priceRange: 300 },
  avocado: { basePrice: 3000, unit: "90kg bag", volatility: "high", priceRange: 600 },
  mango: { basePrice: 1800, unit: "90kg bag", volatility: "medium", priceRange: 400 },
  onion: { basePrice: 3500, unit: "50kg bag", volatility: "high", priceRange: 500 },
  sukuma_wiki: { basePrice: 500, unit: "bundle", volatility: "medium", priceRange: 100 },
  cabbage: { basePrice: 800, unit: "head", volatility: "medium", priceRange: 150 },
  carrot: { basePrice: 2500, unit: "50kg bag", volatility: "medium", priceRange: 300 },
  pepper: { basePrice: 4000, unit: "crate", volatility: "high", priceRange: 600 },
  millet: { basePrice: 3800, unit: "90kg bag", volatility: "low", priceRange: 200 },
  sorghum: { basePrice: 3500, unit: "90kg bag", volatility: "low", priceRange: 200 },
  sweet_potato: { basePrice: 2200, unit: "50kg bag", volatility: "medium", priceRange: 300 },
  cowpea: { basePrice: 4500, unit: "90kg bag", volatility: "medium", priceRange: 300 },
  groundnut: { basePrice: 6000, unit: "50kg bag", volatility: "medium", priceRange: 500 },
  green_gram: { basePrice: 5000, unit: "90kg bag", volatility: "medium", priceRange: 400 },
};

const ALL_REGIONS = [
  "baringo", "bomet", "bungoma", "busia", "elgeyo_marakwet", "embu", "garissa", "homa_bay",
  "isiolo", "kajiado", "kakamega", "kericho", "kiambu", "kilifi", "kirinyaga", "kisii",
  "kisumu", "kitui", "kwale", "laikipia", "lamu", "machakos", "makueni", "mandera",
  "marsabit", "meru", "migori", "mombasa", "muranga", "nairobi", "nakuru", "nandi",
  "narok", "nyamira", "nyandarua", "nyeri", "samburu", "siaya", "taita_taveta",
  "tana_river", "tharaka_nithi", "trans_nzoia", "turkana", "uasin_gishu", "vihiga",
  "wajir", "west_pokot",
];

const REGION_DISPLAY: Record<string, string> = {
  baringo: "Baringo", bomet: "Bomet", bungoma: "Bungoma", busia: "Busia",
  elgeyo_marakwet: "Elgeyo-Marakwet", embu: "Embu", garissa: "Garissa",
  homa_bay: "Homa Bay", isiolo: "Isiolo", kajiado: "Kajiado", kakamega: "Kakamega",
  kericho: "Kericho", kiambu: "Kiambu", kilifi: "Kilifi", kirinyaga: "Kirinyaga",
  kisii: "Kisii", kisumu: "Kisumu", kitui: "Kitui", kwale: "Kwale", laikipia: "Laikipia",
  lamu: "Lamu", machakos: "Machakos", makueni: "Makueni", mandera: "Mandera",
  marsabit: "Marsabit", meru: "Meru", migori: "Migori", mombasa: "Mombasa",
  muranga: "Murang'a", nairobi: "Nairobi", nakuru: "Nakuru", nandi: "Nandi",
  narok: "Narok", nyamira: "Nyamira", nyandarua: "Nyandarua", nyeri: "Nyeri",
  samburu: "Samburu", siaya: "Siaya", taita_taveta: "Taita-Taveta",
  tana_river: "Tana River", tharaka_nithi: "Tharaka-Nithi", trans_nzoia: "Trans Nzoia",
  turkana: "Turkana", uasin_gishu: "Uasin Gishu", vihiga: "Vihiga", wajir: "Wajir",
  west_pokot: "West Pokot",
};

function regionMultiplier(region: string): number {
  const urban = ["nairobi", "mombasa", "kisumu", "nakuru", "eldoret"];
  const key = region.toLowerCase();
  if (key === "nairobi") return 1.15;
  if (urban.includes(key)) return 1.05;
  return 1.0;
}

function nearestMarket(region: string): { name: string; price: number; distance: number } {
  const neighbours: Record<string, string[]> = {
    nakuru: ["eldoret", "nairobi", "nyeri"],
    eldoret: ["nakuru", "kisumu"],
    nairobi: ["kiambu", "nakuru", "machakos"],
    kisumu: ["eldoret", "homa_bay", "siaya"],
  };
  const n = neighbours[region] || ["nairobi"];
  const name = n[Math.floor(Math.random() * n.length)];
  const dist = 50 + Math.floor(Math.random() * 200);
  return { name: REGION_DISPLAY[name] || name, price: 0, distance: dist };
}

function trendLabel(change7d: number, change30d: number): string {
  if (change7d > 5 && change30d > 10) return "rising_sharply";
  if (change7d > 2 || change30d > 5) return "rising";
  if (change7d < -5 && change30d < -5) return "falling_sharply";
  if (change7d < -2 || change30d < -3) return "falling";
  if (change7d < 0 && change30d > 0) return "falling_short_rising_long";
  return "stable";
}

function narrative(cropName: string, region: string, price: number, change7d: number, trend: string, bestMarket: { name: string; price: number; distance: number }): string {
  const c = cropName;
  const r = region;

  if (trend === "rising_sharply") {
    const templates = [
      `Bei ya ${c} ${r} imepanda sana wiki hii! Ugavi mdogo ndio sababu. Soko la ${bestMarket.name} lina bei bora zaidi.`,
      `${c} ${r} ina bei ya juu sana sasa hivi! Wakati mzuri wa kuuza kabla bei haijaanza kushuka.`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }
  if (trend === "rising") {
    const templates = [
      `${c} ${r} ina bei nzuri na inapanda. Soko linapanda taratibu — wakati mzuri wa kuuza.`,
      `Bei ya ${c} ${r} imepanda kidogo wiki hii. Mahitaji ni mazuri. ${bestMarket.name} ina bei bora kwa sasa.`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }
  if (trend === "falling_sharply") {
    const templates = [
      `Bei ya ${c} ${r} imeshuka sana. Wakulima wengi wameleta mavuno kwa wakati mmoja. ${bestMarket.name} ina bei bora.`,
      `${c} ${r} bei imeshuka kwa kasi. Ugavi mwingi sokoni. Fikiria kusafirisha hadi ${bestMarket.name}.`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }
  if (trend === "falling") {
    const templates = [
      `Bei ya ${c} ${r} imeshuka kidogo wiki hii. Uzidi wa ugavi ndio sababu. ${bestMarket.name} ina bei bora zaidi.`,
      `${c} ${r} inashuka bei. Subiri wiki moja au peleka ${bestMarket.name}.`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }
  if (trend === "falling_short_rising_long") {
    return `Bei ya ${c} ${r} imeshuka kidogo wiki hii lakini kwa mwezi mzima imepanda. Upepo unabadilika — subiri au uuze ${bestMarket.name} kwa bei bora.`;
  }

  const templates = [
    `Bei ya ${c} ${r} imetulia. Siko haraka wala si polepole. Inawezekana kupata bei bora ${bestMarket.name}.`,
    `${c} ${r} bei ni thabiti. Mahitaji mazuri lakini sio ya kusisimua.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateMockData(crop: string, region: string) {
  const c = crop.toLowerCase();
  const r = region.toLowerCase();
  const data = CROP_DATA[c];
  if (!data) return generateMockData("maize", region);

  const mult = regionMultiplier(r);
  const base = Math.round(data.basePrice * mult);
  const range = data.priceRange;
  const price = base + Math.floor(Math.random() * range - range / 2);

  const change7d = parseFloat((Math.random() * 10 - 5 + (Math.random() * 4 - 2)).toFixed(1));
  const change30d = parseFloat((change7d + Math.random() * 8 - 4).toFixed(1));
  const trend = trendLabel(change7d, change30d);

  const bestMarketNeighbour = nearestMarket(r);
  const bestMarketPrice = Math.round(price * (1 + (Math.random() * 0.2 - 0.05)));
  const bestMarket = { ...bestMarketNeighbour, price: bestMarketPrice };

  const regionName = REGION_DISPLAY[r] || r;
  const cropName = c.replace(/_/g, " ");

  const start = new Date();
  start.setDate(start.getDate() - 29);
  const history = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().slice(0, 10),
      price: price + Math.floor(Math.random() * range - range / 2),
    };
  });

  return {
    crop: cropName,
    region: regionName,
    currency: "KES",
    unit: data.unit,
    current_price: price,
    price_change_7d: change7d,
    price_change_30d: change30d,
    trend,
    volatility: data.volatility,
    regional_rank: Math.floor(Math.random() * 47) + 1,
    best_nearby_market: bestMarket,
    narrative: narrative(cropName, regionName, price, change7d, trend, bestMarket),
    history,
    updated_at: new Date().toISOString(),
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const queryStr = searchParams.toString();
  const crop = searchParams.get("crop") || "maize";
  const region = searchParams.get("region") || "nakuru";

  try {
    const djangoRes = await fetch(
      `${API_URL}/api/market/?${queryStr}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!djangoRes.ok) {
      return Response.json(generateMockData(crop, region));
    }
    return Response.json(await djangoRes.json());
  } catch {
    return Response.json(generateMockData(crop, region));
  }
}
