const languageMap: Record<string, string> = {
  en: "English",
  sw: "Swahili",
  en_sw: "English/Swahili",
};

const swahiliKeywords = [
  "habari",
  "shamba",
  "mkulima",
  "mazao",
  "bei",
  "soko",
  "mbolea",
  "mvua",
  "kilimo",
  "udongo",
  "kuuza",
  "kununua",
  "wagonjwa",
  "wadudu",
  "umwagiliaji",
  "mavuno",
];

export function detectLanguage(text: string): "en" | "sw" {
  const lower = text.toLowerCase();
  const swMatches = swahiliKeywords.filter((kw) => lower.includes(kw)).length;
  return swMatches >= 1 ? "sw" : "en";
}

export function getLanguageName(code: string): string {
  return languageMap[code] || "English";
}
