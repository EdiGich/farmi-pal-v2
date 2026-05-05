import { AlertTriangle, CloudRain, MapPin, TrendingDown, Package } from "lucide-react";

interface SurplusRiskCardProps {
  risk_score: number;
  risk_level: "low" | "medium" | "high";
  risk_reasons: string[];
  narrative: string;
  weather_summary?: {
    forecast_rainfall_14d_mm: number;
    anomaly_pct: number;
    outlook: string;
  };
  alternatives?: {
    type: string;
    label: string;
    rationale: string;
    action: string;
  }[];
  best_alternative_market?: {
    name: string;
    price_premium_pct: number;
    distance_km: number;
    saturation_risk: string;
  };
}

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

export default function SurplusRiskCard({
  risk_score,
  risk_level,
  risk_reasons,
  narrative,
  weather_summary,
  alternatives,
  best_alternative_market,
}: SurplusRiskCardProps) {
  return (
    <div className="space-y-6">
      {/* Risk Score */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <AlertTriangle
              size={20}
              className={
                risk_level === "high"
                  ? "text-red-500"
                  : risk_level === "medium"
                  ? "text-yellow-500"
                  : "text-green-500"
              }
            />
            Surplus Risk Assessment
          </h3>
          <span className={`text-sm font-bold px-4 py-1.5 rounded-full border ${riskColor[risk_level]}`}>
            {risk_level.toUpperCase()} RISK
          </span>
        </div>

        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full bg-gradient-to-r ${riskBgColor[risk_level]}`}
              style={{ width: `${risk_score}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">Risk score: {risk_score}/100</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {risk_reasons.map((reason, i) => (
            <span
              key={i}
              className="text-xs font-medium px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200"
            >
              {reason.replace(/_/g, " ")}
            </span>
          ))}
        </div>

        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
          {narrative}
        </p>
      </div>

      {/* Weather */}
      {weather_summary && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CloudRain size={18} className="text-blue-500" />
            Weather Summary
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-700">{weather_summary.forecast_rainfall_14d_mm}mm</p>
              <p className="text-xs text-blue-600 mt-1">14-day rainfall</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl">
              <p className="text-2xl font-bold text-orange-700">+{weather_summary.anomaly_pct}%</p>
              <p className="text-xs text-orange-600 mt-1">vs. normal</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-600">{weather_summary.outlook.slice(0, 40)}...</p>
              <p className="text-xs text-gray-400 mt-1">Outlook</p>
            </div>
          </div>
        </div>
      )}

      {/* Alternatives */}
      {alternatives && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={18} className="text-[#2D5A27]" />
            Recommended Alternatives
          </h4>
          <div className="space-y-3">
            {alternatives.map((alt, i) => (
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
      {best_alternative_market && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin size={18} className="text-[#2D5A27]" />
            Best Alternative Market
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-xl">
              <p className="text-lg font-bold text-green-700">{best_alternative_market.name}</p>
              <p className="text-xs text-green-600 mt-1">Market</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <p className="text-lg font-bold text-green-700">+{best_alternative_market.price_premium_pct}%</p>
              <p className="text-xs text-green-600 mt-1">Price premium</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <p className="text-lg font-bold text-green-700">{best_alternative_market.distance_km}km</p>
              <p className="text-xs text-green-600 mt-1">Distance</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
