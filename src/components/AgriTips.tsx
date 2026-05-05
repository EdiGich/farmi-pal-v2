"use client";

import { motion } from 'motion/react';
import { BookOpen, Droplets, Sun, Sprout, ShieldAlert } from 'lucide-react';

const tips = [
  {
    title: 'Afya ya Udongo',
    sheng: 'Soil "Chama"',
    desc: 'Consider nutrients as savings. If you don\'t put organic manure, your "savings" will run out and the plants won\'t grow well.',
    icon: Sprout,
    color: '#5d7a50'
  },
  {
    title: 'Kugawa Maji',
    sheng: 'Fair Irrigation',
    desc: 'Don\'t drown your plants like guests at a wedding. Just enough water at the roots ensures everyone is happy.',
    icon: Droplets,
    color: '#4e6d8a'
  },
  {
    title: 'Wageni Wasioalikwa',
    sheng: 'Uninvited Pests',
    desc: 'Instead of chemicals, use "pilipili" spray to chase away aphids without poisoning the soil.',
    icon: ShieldAlert,
    color: '#a64d4d'
  }
];

export default function AgriTips() {
  return (
    <div className="bg-[#2D5A27] text-white rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col group">
      {/* Decorative Icon */}
      <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl transform group-hover:scale-110 transition-transform">
        🎓
      </div>

      <div className="relative z-10">
        <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
          <BookOpen size={16} className="text-[#F27D26]" />
          Agri-Tutor: Lesson ya Leo
        </h3>

        <div className="space-y-4">
          {tips.slice(0, 2).map((tip, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="p-3 bg-white/10 rounded-xl border border-white/10 hover:bg-white/15 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-[#F27D26] uppercase tracking-tighter">
                  Topic: {tip.title}
                </p>
                <tip.icon size={12} className="text-white/40" />
              </div>
              <p className="text-[13px] leading-snug font-medium italic text-white/90">
                "{tip.desc}"
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group-hover:bg-white/10 cursor-pointer transition-all">
            <div>
              <p className="text-[10px] font-bold text-[#F27D26] uppercase tracking-tighter mb-0.5">Next Step:</p>
              <p className="text-[11px] text-white/70">Mbinu za kupalilia bila sumu...</p>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-[10px]">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
