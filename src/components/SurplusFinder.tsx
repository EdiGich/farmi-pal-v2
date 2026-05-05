import { motion } from 'motion/react';
import { PackageSearch, MapPin, AlertCircle, TrendingDown } from 'lucide-react';

const surplusData = [
  { region: 'Molo/Njoro', crop: 'Potatoes (Warua)', status: 'High Surplus', price: 'Low', icon: '🥔' },
  { region: 'Mwea', crop: 'Pishori Rice', status: 'Harvest Peak', price: 'Fair', icon: '🌾' },
  { region: 'Kitale/Trans-Nzoia', crop: 'Maize', status: 'High Surplus', price: 'Low', icon: '🌽' },
  { region: 'Murang\'a', crop: 'Avocados', status: 'Peak Season', price: 'Low', icon: '🥑' },
  { region: 'Kinangop', crop: 'Cabbage', status: 'High Surplus', price: 'Very Low', icon: '🥬' },
];

export default function SurplusFinder() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-sm text-gray-800 uppercase tracking-tight flex items-center gap-2">
          <PackageSearch size={16} className="text-[#F27D26]" />
          Maeneo ya Ziada (Surplus Zones)
        </h3>
        <span className="text-[10px] font-bold text-[#F27D26] bg-[#FFF9E6] px-2 py-0.5 rounded tracking-tighter uppercase">Opportunities</span>
      </div>

      <div className="space-y-3">
        {surplusData.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#F27D26]/30 hover:bg-white transition-all cursor-default"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl bg-white w-10 h-10 flex items-center justify-center rounded-lg shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <div>
                <p className="text-[11px] font-bold text-gray-800 leading-none mb-1">{item.crop}</p>
                <div className="flex items-center gap-1 text-[9px] text-gray-500 font-medium">
                  <MapPin size={10} />
                  {item.region}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                item.price === 'Low' || item.price === 'Very Low' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'
              }`}>
                {item.price} Price
              </span>
              <p className="text-[8px] mt-1 font-medium text-gray-400 uppercase tracking-wider">{item.status}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
          <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-700 leading-relaxed italic">
            <strong>Mzalendo Tip:</strong> Maeneo haya yana ziada kubwa. Hii ni nafasi nzuri ya kununua kwa bei ya chini au kuanza value addition (kama kukausha au kusaga).
          </p>
        </div>
      </div>
    </div>
  );
}
