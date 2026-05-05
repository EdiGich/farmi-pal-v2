const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchFromDjango(endpoint: string, options?: RequestInit) {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function diagnoseImage(image: File, crop_type?: string, language?: string) {
  const formData = new FormData();
  formData.append("image", image);
  if (crop_type) formData.append("crop_type", crop_type);
  if (language) formData.append("language", language);

  return fetchFromDjango("/api/diagnose/", {
    method: "POST",
    body: formData,
  });
}

export async function sendChatMessage(messages: { role: string; content: string }[], language?: string) {
  return fetchFromDjango("/api/chat/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, language }),
  });
}

export async function getMarketData(crop?: string, region?: string, lang?: string) {
  const params = new URLSearchParams();
  if (crop) params.set("crop", crop);
  if (region) params.set("region", region);
  if (lang) params.set("lang", lang);
  const query = params.toString();
  return fetchFromDjango(`/api/market/${query ? `?${query}` : ""}`);
}

export async function getSurplusRisk(data: {
  crop: string;
  region: string;
  lat?: number;
  lon?: number;
  planting_date?: string;
  estimated_harvest_date?: string;
  language?: string;
}) {
  return fetchFromDjango("/api/surplus/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
