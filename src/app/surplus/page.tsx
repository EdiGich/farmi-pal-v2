"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import SeasonBanner from "@/components/surplus/SeasonBanner";
import RegionalHeatmap from "@/components/surplus/RegionalHeatmap";
import AtRiskCropsStrip from "@/components/surplus/AtRiskCropsStrip";
import CheckYourCropForm from "@/components/surplus/CheckYourCropForm";
import SurplusRiskCard from "@/components/SurplusRiskCard";

interface AnalyticsData {
  season_summary: string;
  season_crops: string[];
  region_risk: Record<
    string,
    { level: "low" | "medium" | "high"; label: string; crops: string[]; note: string }
  >;
  at_risk_crops: {
    crop: string;
    emoji: string;
    risk: "low" | "medium" | "high";
    reason: string;
    counties: number;
  }[];
  generated_at: string;
}

interface EnsoData {
  phase: string;
  oni_value: number;
  trend: string;
  interpretation: string;
}

interface TriggeredFactor {
  rule: string;
  reason: string;
}

interface SurplusResult {
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  confidence?: string;
  risk_reasons: string[];
  narrative: string;
  weather_summary: {
    forecast_rainfall_14d_mm: number;
    anomaly_pct: number;
    outlook: string;
  };
  enso_data?: EnsoData;
  season?: string;
  alternatives: {
    type: string;
    label: string;
    rationale: string;
    action: string;
  }[];
  best_alternative_market: {
    name: string;
    price_premium_pct: number;
    distance_km: number;
    saturation_risk: string;
  };
  triggered_factors?: TriggeredFactor[];
}

export default function SurplusPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(false);

  const [formData, setFormData] = useState({
    crop: "maize",
    region: "nakuru",
    planting_date: "2025-02-15",
    estimated_harvest_date: "2025-06-20",
    language: "en",
  });

  const [result, setResult] = useState<SurplusResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState(false);

  useEffect(() => {
    fetch("/api/surplus/analytics")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch analytics");
        return res.json();
      })
      .then((data) => {
        setAnalytics(data);
        setAnalyticsLoading(false);
      })
      .catch(() => {
        setAnalyticsError(true);
        setAnalyticsLoading(false);
      });
  }, []);

  const handleRegionSelect = (key: string, region: { crops: string[] }) => {
    setFormData((prev) => ({
      ...prev,
      region: key,
      crop: region.crops[0] ?? prev.crop,
    }));
    setResult(null);
    setCheckError(false);
  };

  const handleCropSelect = (crop: { crop: string }) => {
    setFormData((prev) => ({
      ...prev,
      crop: crop.crop.toLowerCase(),
    }));
    setResult(null);
    setCheckError(false);
  };

  const handleFormChange = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setResult(null);
    setCheckError(false);
  };

  const handleCheck = async () => {
    setChecking(true);
    setResult(null);
    setCheckError(false);

    try {
      const res = await fetch("/api/surplus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const json = await res.json();
      setResult(json);
    } catch {
      setCheckError(true);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-[#2D5A27] transition-colors"
          >
            ← Back to Home
          </a>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Surplus Insights</h1>
            <p className="text-xs text-gray-500">Know before the market floods</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {analyticsLoading ? (
          <div className="space-y-6">
            <div className="h-20 bg-white rounded-2xl border border-gray-200 animate-pulse" />
            <div className="h-64 bg-white rounded-2xl border border-gray-200 animate-pulse" />
            <div className="h-32 bg-white rounded-2xl border border-gray-200 animate-pulse" />
          </div>
        ) : analyticsError ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Regional data unavailable — you can still check your crop below.
          </p>
        ) : (
          analytics && (
            <>
              <SeasonBanner summary={analytics.season_summary} />
              <RegionalHeatmap
                regionRisk={analytics.region_risk}
                onRegionSelect={handleRegionSelect}
              />
              <AtRiskCropsStrip
                crops={analytics.at_risk_crops}
                onCropSelect={handleCropSelect}
              />
            </>
          )
        )}

        <CheckYourCropForm
          value={formData}
          onChange={handleFormChange}
          onSubmit={handleCheck}
          loading={checking}
        />

        {checkError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-sm text-red-600">
              Something went wrong while checking your risk. Please try again.
            </p>
            <button
              onClick={handleCheck}
              className="mt-2 text-sm font-semibold text-red-700 underline hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {result && (
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-[#2D5A27]" />
              <h2 className="text-lg font-semibold text-gray-800">
                Your Personalized Risk Assessment
              </h2>
            </div>
            <SurplusRiskCard
              risk_score={result.risk_score}
              risk_level={result.risk_level}
              confidence={result.confidence}
              risk_reasons={result.risk_reasons}
              narrative={result.narrative}
              weather_summary={result.weather_summary}
              enso_data={result.enso_data}
              season={result.season}
              alternatives={result.alternatives}
              best_alternative_market={result.best_alternative_market}
              triggered_factors={result.triggered_factors}
            />
          </div>
        )}
      </main>
    </div>
  );
}
