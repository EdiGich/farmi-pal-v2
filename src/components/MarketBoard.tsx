"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, MapPin, Package, Info } from 'lucide-react';

const marketData = [
  {
    location: 'Wakulima (Nairobi)',
    items: [
      { name: 'Potatoes (50kg)', price: '3200 KES', trend: 'up' },
      { name: 'Tomatoes (Crate)', price: '4500 KES', trend: 'down' },
      { name: 'Onions (1kg)', price: '120 KES', trend: 'stable' },
    ]
  },
  {
    location: 'Kibuye (Kisumu)',
    items: [
      { name: 'Tilapia (Medium)', price: '450 KES', trend: 'up' },
      { name: 'Maize (90kg)', price: '5200 KES', trend: 'stable' },
      { name: 'Green Grams (1kg)', price: '140 KES', trend: 'up' },
    ]
  },
  {
    location: 'Municipal (Eldoret)',
    items: [
      { name: 'Maize (90kg)', price: '3800 KES', trend: 'down' },
      { name: 'Wheat (90kg)', price: '4600 KES', trend: 'stable' },
      { name: 'Milk (1 Litre)', price: '55 KES', trend: 'up' },
    ]
  }
];

export default function MarketBoard() {
  const [trends, setTrends] = useState<number[][]>([]);

  useEffect(() => {
    // Generate random percentages for each item in each market
    setTrends(marketData.map(m => m.items.map(() => Math.floor(Math.random() * 15) + 1)));
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-sm text-gray-800 uppercase tracking-tight flex items-center gap-2">
          <TrendingUp size={16} className="text-[#2D5A27]" />
          Bei za Masoko ya Kenya
        </h3>
        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded tracking-tighter">NATIONAL</span>
      </div>

      <div className="space-y-8">
        {marketData.map((market, mIdx) => (
          <div key={mIdx} className="space-y-3">
            <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
              <MapPin size={10} />
              {market.location}
            </h4>
            <div className="space-y-2">
              {market.items.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (mIdx * 3 + i) * 0.1 }}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100/50 hover:bg-gray-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {item.name.includes('Potato') ? '🥔' : item.name.includes('Tomato') ? '🍅' : item.name.includes('Maize') ? '🌽' : item.name.includes('Tilapia') ? '🐟' : item.name.includes('Milk') ? '🥛' : '📦'}
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-gray-800 leading-none mb-1">{item.name}</p>
                      <p className={`text-[9px] font-medium ${
                        item.trend === 'up' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {item.trend === 'up' ? '↑' : '↓'} {trends[mIdx]?.[i] || '--'}% tangu jana
                      </p>
                    </div>
                  </div>
                  <p className="font-mono font-bold text-[#2D5A27] text-sm">{item.price}/-</p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="p-3 bg-[#FFF9E6] rounded-xl border border-[#F27D26]/10 flex gap-3">
          <Info size={16} className="text-[#F27D26] shrink-0 mt-0.5" />
          <p className="text-[10px] text-gray-700 leading-relaxed italic">
            <strong>Kumbuka:</strong> Bei za soko hubadilika. Uliza FarmiPal mbinu za ku-negotiate na mabroker.
          </p>
        </div>
      </div>
    </div>
  );
}
