"use client";

import { useState } from "react";
import { AlertTriangle, CloudRain, MapPin, TrendingDown } from "lucide-react";

export default function SurplusPage() {
  const [formData, setFormData] = useState({
    crop: "maize",
    region: "nakuru",
    planting_date: "2025-02-15",
    estimated_harvest_date: "2025-06-20",
    language: "en",
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const riskColor: Record<string, string> = {
    low: "bg-green-100 text-green-800 border-green-300",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    high: "bg-red-100 text-red-800 border-red-300",
  };

  const riskBgColor: Record<string, string> = {
    low: "from-green-500 to-green-600",
    medium: "from-yellow-500 to-yellow-600",
    high: "from-red-500 to-red-600",
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/surplus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      console.error("Surplus analysis error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <a href="/" className="text-sm text-gray-500 hover:text-[#2D5A27] transition-colors">
            ← Back to Home
          </a>
          <h1 className="text-xl font-bold text-gray-800">Surplus Insights</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Analyze Surplus Risk</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
              <select
                value={formData.crop}
                onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="maize">Maize</option>
                <option value="wheat">Wheat</option>
                <option value="potato">Potato</option>
                <option value="rice">Rice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="nakuru">Nakuru</option>
                <option value="eldoret">Eldoret</option>
                <option value="kitale">Kitale</option>
                <option value="nairobi">Nairobi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="en">English</option>
                <option value="sw">Swahili</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date</label>
              <input
                type="date"
                value={formData.planting_date}
                onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Harvest</label>
              <input
                type="date"
                value={formData.estimated_harvest_date}
                onChange={(e) => setFormData({ ...formData, estimated_harvest_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 bg-[#F27D26] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#d96b1e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Analyzing..." : "Check Surplus Risk"}
          </button>
        </div>

        {result && (
          <div className="space-y-6">
            {/* Risk Score Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Surplus Risk Assessment</h3>
                <span
                  className={`text-sm font-bold px-4 py-1.5 rounded-full border ${riskColor[result.risk_level]}`}
                >
                  {result.risk_level.toUpperCase()} RISK
                </span>
              </div>

              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${riskBgColor[result.risk_level]}`}
                    style={{ width: `${result.risk_score}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Risk score: {result.risk_score}/100
                </p>
              </div>

              {/* Reasoning Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {result.risk_reasons.map((reason: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200"
                  >
                    {reason.replace(/_/g, " ")}
                  </span>
                ))}
              </div>

              {/* Narrative */}
              {result.narrative && (
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {result.narrative}
                </p>
              )}
            </div>

            {/* Weather Summary */}
            {result.weather_summary && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CloudRain size={18} className="text-blue-500" />
                  Weather Summary
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-700">
                      {result.weather_summary.forecast_rainfall_14d_mm}mm
                    </p>
                    <p className="text-xs text-blue-600 mt-1">14-day rainfall</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <p className="text-2xl font-bold text-orange-700">
                      +{result.weather_summary.anomaly_pct}%
                    </p>
                    <p className="text-xs text-orange-600 mt-1">vs. normal</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-600 font-medium">
                      {result.weather_summary.outlook.length > 40
                        ? result.weather_summary.outlook.slice(0, 40) + "..."
                        : result.weather_summary.outlook}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Outlook</p>
                  </div>
                </div>
              </div>
            )}

            {/* Alternatives */}
            {result.alternatives && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h4 className="font-semibold text-gray-800 mb-4">Recommended Alternatives</h4>
                <div className="space-y-3">
                  {result.alternatives.map((alt: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#2D5A27]/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{alt.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{alt.rationale}</p>
                        </div>
                        {alt.type === "sell_early" && (
                          <TrendingDown size={16} className="text-red-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-2 italic">{alt.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Best Alternative Market */}
            {result.best_alternative_market && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MapPin size={18} className="text-[#2D5A27]" />
                  Best Alternative Market
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-xl">
                    <p className="text-lg font-bold text-green-700">
                      {result.best_alternative_market.name}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Market</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <p className="text-lg font-bold text-green-700">
                      +{result.best_alternative_market.price_premium_pct}%
                    </p>
                    <p className="text-xs text-green-600 mt-1">Price premium</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <p className="text-lg font-bold text-green-700">
                      {result.best_alternative_market.distance_km}km
                    </p>
                    <p className="text-xs text-green-600 mt-1">Distance</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
