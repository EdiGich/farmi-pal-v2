"use client";

import { motion } from "motion/react";

interface PriceChartProps {
  history: { date: string; price: number }[];
  currency?: string;
}

export default function PriceChart({ history, currency = "KES" }: PriceChartProps) {
  if (history.length === 0) return null;

  const maxPrice = Math.max(...history.map((h) => h.price));
  const minPrice = Math.min(...history.map((h) => h.price));

  return (
    <div className="mt-6">
      <div className="flex items-end gap-1 h-24">
        {history.map((point, i) => {
          const height = ((point.price - minPrice) / (maxPrice - minPrice || 1)) * 100;
          return (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(height, 8)}%` }}
              transition={{ delay: i * 0.05 }}
              className="flex-1 bg-[#2D5A27]/80 rounded-t hover:bg-[#2D5A27] transition-colors relative group cursor-default"
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                {point.date}: {currency} {point.price}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex gap-1 mt-1">
        {history.map((point, i) => (
          <div key={i} className="flex-1 text-center text-[8px] text-gray-400 truncate">
            {point.date.slice(5)}
          </div>
        ))}
      </div>
    </div>
  );
}
