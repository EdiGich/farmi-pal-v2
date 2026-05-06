import { motion } from "motion/react";
import { MapPin } from "lucide-react";

type RiskLevel = "low" | "medium" | "high";

interface RegionRisk {
  level: RiskLevel;
  label: string;
  crops: string[];
  note: string;
}

interface RegionalHeatmapProps {
  regionRisk: Record<string, RegionRisk>;
  onRegionSelect?: (regionKey: string, region: RegionRisk) => void;
}

const riskColor: Record<RiskLevel, string> = {
  high: "bg-red-100 border-red-300 text-red-800",
  medium: "bg-yellow-100 border-yellow-300 text-yellow-800",
  low: "bg-green-100 border-green-300 text-green-800",
};

const riskDot: Record<RiskLevel, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

export default function RegionalHeatmap({
  regionRisk,
  onRegionSelect,
}: RegionalHeatmapProps) {
  const regions = Object.entries(regionRisk);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight flex items-center gap-2">
          <MapPin size={16} className="text-[#2D5A27]" />
          Regional Surplus Risk
        </h3>
        <div className="flex items-center gap-3 text-[10px] font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Low
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            High
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {regions.map(([key, region], i) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onRegionSelect?.(key, region)}
            className={`relative p-4 rounded-xl border text-left transition-all hover:shadow-md hover:scale-[1.02] ${riskColor[region.level]}`}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${riskDot[region.level]}`} />
              <span className="text-sm font-bold">{region.label}</span>
            </div>
            <p className="text-[11px] opacity-80 leading-snug mb-2">
              {region.note}
            </p>
            <div className="flex flex-wrap gap-1">
              {region.crops.map((crop) => (
                <span
                  key={crop}
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white/60 capitalize"
                >
                  {crop}
                </span>
              ))}
            </div>
            <span className="absolute top-2 right-2 text-[9px] font-bold uppercase opacity-50">
              {region.level}
            </span>
          </motion.button>
        ))}
      </div>

      <p className="text-[10px] text-gray-400 mt-3 text-center italic">
        Tap a region to pre-fill the risk checker below
      </p>
    </div>
  );
}
