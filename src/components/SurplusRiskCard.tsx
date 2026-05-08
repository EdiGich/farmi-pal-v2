import { AlertTriangle, CloudRain, MapPin, TrendingDown, Package, Thermometer, BarChart3 } from "lucide-react";

interface TriggeredFactor {
  rule: string;
  reason: string;
}

interface EnsoData {
  phase: string;
  oni_value: number;
  trend: string;
  interpretation: string;
}

interface SurplusRiskCardProps {
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  confidence?: string;
  risk_reasons: string[];
  narrative: string;
  weather_summary?: {
    forecast_rainfall_14d_mm: number;
    anomaly_pct: number;
    outlook: string;
  };
  enso_data?: EnsoData;
  season?: string;
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
  triggered_factors?: TriggeredFactor[];
}

const riskColor: Record<string, string> = {
  low: "bg-green-100 text-green-800 border-green-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  high: "bg-red-100 text-red-800 border-red-300",
  critical: "bg-red-200 text-red-900 border-red-400",
};

const riskBgColor: Record<string, string> = {
  low: "from-green-500 to-green-600",
  medium: "from-yellow-500 to-yellow-600",
  high: "from-red-500 to-red-600",
  critical: "from-red-700 to-red-800",
};

const confidenceColor: Record<string, string> = {
  high: "text-green-600 bg-green-50 border-green-200",
  medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  low: "text-gray-500 bg-gray-50 border-gray-200",
};

const factorEmoji: Record<string, string> = {
  peak_harvest_month: "\uD83C\uDF3E",
  harvest_imminent: "\u23F3",
  rainfall_above_average: "\uD83C\uDF27\uFE0F",
  enso_surplus_signal: "\uD83C\uDF0D",
  no_drought_stress: "\u2705",
  neighbor_counties_harvesting: "\uD83D\uDCCB",
  regional_countries_harvesting: "\uD83C\uDF0D",
  price_already_falling: "\uD83D\uDCC9",
  road_access_risk: "\uD83D\uDEA6",
  high_fertilizer_uptake: "\uD83E\uDDCA",
};

export default function SurplusRiskCard({
  risk_score,
  risk_level,
  confidence,
  risk_reasons,
  narrative,
  weather_summary,
  enso_data,
  alternatives,
  best_alternative_market,
  triggered_factors,
}: SurplusRiskCardProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <AlertTriangle
              size={20}
              className={
                risk_level === "critical" || risk_level === "high"
                  ? "text-red-500"
                  : risk_level === "medium"
                  ? "text-yellow-500"
                  : "text-green-500"
              }
            />
            Surplus Risk Assessment
          </h3>
          <div className="flex items-center gap-2">
            {confidence && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${confidenceColor[confidence]}`}>
                {confidence.toUpperCase()} confidence
              </span>
            )}
            <span className={`text-sm font-bold px-4 py-1.5 rounded-full border ${riskColor[risk_level]}`}>
              {risk_level.toUpperCase()}
              {risk_level === "critical" ? " OVERLOAD" : " RISK"}
            </span>
          </div>
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

      {triggered_factors && triggered_factors.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#2D5A27]" />
            Risk Factors Triggered
          </h4>
          <div className="space-y-2">
            {triggered_factors.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-lg shrink-0">{factorEmoji[f.rule as keyof typeof factorEmoji] || "\u2022"}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{f.rule.replace(/_/g, " ")}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {enso_data && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Thermometer size={18} className="text-blue-500" />
            ENSO Climate Signal
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 rounded-xl text-center">
              <p className="text-lg font-bold text-blue-700 capitalize">{enso_data.phase.replace(/_/g, " ")}</p>
              <p className="text-xs text-blue-600 mt-1">Phase</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-center">
              <p className="text-lg font-bold text-blue-700">{enso_data.oni_value > 0 ? "+" : ""}{enso_data.oni_value}°C</p>
              <p className="text-xs text-blue-600 mt-1">ONI Index</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-center">
              <p className="text-lg font-bold text-blue-700 capitalize">{enso_data.trend}</p>
              <p className="text-xs text-blue-600 mt-1">Trend</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 italic">{enso_data.interpretation}</p>
        </div>
      )}

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
              <p className="text-2xl font-bold text-orange-700">{weather_summary.anomaly_pct > 0 ? "+" : ""}{weather_summary.anomaly_pct}%</p>
              <p className="text-xs text-orange-600 mt-1">vs. normal</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-600 leading-tight">{weather_summary.outlook}</p>
              <p className="text-xs text-gray-400 mt-1">Outlook</p>
            </div>
          </div>
        </div>
      )}

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
