import { Calendar } from "lucide-react";

interface SeasonBannerProps {
  summary: string;
}

export default function SeasonBanner({ summary }: SeasonBannerProps) {
  return (
    <div className="bg-gradient-to-r from-[#2D5A27] to-[#3a7333] text-white rounded-2xl p-5 flex items-start gap-3">
      <Calendar size={20} className="shrink-0 mt-0.5 opacity-80" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">
          This Season
        </p>
        <p className="text-sm leading-relaxed">{summary}</p>
      </div>
    </div>
  );
}
