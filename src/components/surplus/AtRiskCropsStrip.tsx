import { motion } from "motion/react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

type RiskLevel = "low" | "medium" | "high";

interface AtRiskCrop {
  crop: string;
  emoji: string;
  risk: RiskLevel;
  reason: string;
  counties: number;
}

interface AtRiskCropsStripProps {
  crops: AtRiskCrop[];
  onCropSelect?: (crop: AtRiskCrop) => void;
}

const riskBadge: Record<RiskLevel, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const riskIcon: Record<RiskLevel, typeof ArrowUp> = {
  high: ArrowUp,
  medium: ArrowUp,
  low: Minus,
};

const riskIconColor: Record<RiskLevel, string> = {
  high: "text-red-500",
  medium: "text-yellow-500",
  low: "text-green-500",
};

export default function AtRiskCropsStrip({
  crops,
  onCropSelect,
}: AtRiskCropsStripProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight mb-4">
        At-Risk Crops This Week
      </h3>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {crops.map((crop, i) => {
          const Icon = riskIcon[crop.risk];
          return (
            <motion.button
              key={crop.crop}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => onCropSelect?.(crop)}
              className="shrink-0 w-40 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-[#2D5A27]/30 hover:bg-white transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{crop.emoji}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskBadge[crop.risk]}`}
                >
                  {crop.risk.toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-1">
                {crop.crop}
              </p>
              <div className="flex items-center gap-1 mb-1">
                <Icon
                  size={12}
                  className={riskIconColor[crop.risk]}
                />
                <p className="text-[11px] text-gray-500 leading-tight">
                  {crop.reason}
                </p>
              </div>
              <p className="text-[10px] text-gray-400">
                {crop.counties} {crop.counties === 1 ? "county" : "counties"}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
