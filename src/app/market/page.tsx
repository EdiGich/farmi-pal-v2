"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Minus, MapPin, ArrowUpRight } from "lucide-react";

interface MarketData {
  crop: string;
  region: string;
  currency: string;
  unit: string;
  current_price: number;
  price_change_7d: number;
  price_change_30d: number;
  trend: string;
  volatility: string;
  regional_rank: number;
  best_nearby_market: {
    name: string;
    price: number;
    distance_km: number;
  };
  narrative: string;
  history: { date: string; price: number }[];
  updated_at: string;
}

export default function MarketPage() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [crop, setCrop] = useState("maize");
  const [region, setRegion] = useState("nakuru");
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback((c: string, r: string) => {
    setLoading(true);
    setError(null);
    fetch(`/api/market?crop=${c}&region=${r}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setMarketData(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError("Could not load market data. Please try again.");
      });
  }, []);

  useEffect(() => {
    fetchData(crop, region);
  }, [crop, region, fetchData]);

  const handleRefresh = () => {
    fetchData(crop, region);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <a href="/" className="text-sm text-gray-500 hover:text-[#2D5A27] transition-colors">← Back to Home</a>
            <h1 className="text-xl font-bold text-gray-800">Market Trends</h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="animate-pulse flex gap-4">
              <div className="h-10 bg-gray-200 rounded-lg w-32" />
              <div className="h-10 bg-gray-200 rounded-lg w-32" />
              <div className="h-10 bg-gray-200 rounded-lg w-20" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <a href="/" className="text-sm text-gray-500 hover:text-[#2D5A27] transition-colors">← Back to Home</a>
            <h1 className="text-xl font-bold text-gray-800">Market Trends</h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={handleRefresh} className="mt-4 bg-[#2D5A27] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1E3F1A] transition-colors">
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!marketData) {
    return null;
  }

  const maxPrice = Math.max(...marketData.history.map((h) => h.price));
  const minPrice = Math.min(...marketData.history.map((h) => h.price));

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <a href="/" className="text-sm text-gray-500 hover:text-[#2D5A27] transition-colors">
            ← Back to Home
          </a>
          <h1 className="text-xl font-bold text-gray-800">Market Trends</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="maize">Maize</option>
              <option value="wheat">Wheat</option>
              <option value="potato">Potato</option>
              <option value="tomato">Tomato</option>
              <option value="cassava">Cassava</option>
              <option value="beans">Beans</option>
              <option value="rice">Rice</option>
              <option value="sugarcane">Sugarcane</option>
              <option value="coffee">Coffee</option>
              <option value="tea">Tea</option>
              <option value="banana">Banana</option>
              <option value="avocado">Avocado</option>
              <option value="mango">Mango</option>
              <option value="onion">Onion</option>
              <option value="sukuma_wiki">Sukuma Wiki</option>
              <option value="cabbage">Cabbage</option>
              <option value="carrot">Carrot</option>
              <option value="pepper">Pepper</option>
              <option value="millet">Millet</option>
              <option value="sorghum">Sorghum</option>
              <option value="sweet_potato">Sweet Potato</option>
              <option value="cowpea">Cowpea</option>
              <option value="groundnut">Groundnut</option>
              <option value="green_gram">Green Gram</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="nairobi">Nairobi</option>
              <option value="nakuru">Nakuru</option>
              <option value="mombasa">Mombasa</option>
              <option value="kisumu">Kisumu</option>
              <option value="eldoret">Eldoret (Uasin Gishu)</option>
              <option value="kiambu">Kiambu</option>
              <option value="meru">Meru</option>
              <option value="nyeri">Nyeri</option>
              <option value="machakos">Machakos</option>
              <option value="kisii">Kisii</option>
              <option value="kakamega">Kakamega</option>
              <option value="bungoma">Bungoma</option>
              <option value="baringo">Baringo</option>
              <option value="bomet">Bomet</option>
              <option value="busia">Busia</option>
              <option value="elgeyo_marakwet">Elgeyo-Marakwet</option>
              <option value="embu">Embu</option>
              <option value="garissa">Garissa</option>
              <option value="homa_bay">Homa Bay</option>
              <option value="isiolo">Isiolo</option>
              <option value="kajiado">Kajiado</option>
              <option value="kericho">Kericho</option>
              <option value="kilifi">Kilifi</option>
              <option value="kirinyaga">Kirinyaga</option>
              <option value="kitui">Kitui</option>
              <option value="kwale">Kwale</option>
              <option value="laikipia">Laikipia</option>
              <option value="lamu">Lamu</option>
              <option value="makueni">Makueni</option>
              <option value="mandera">Mandera</option>
              <option value="marsabit">Marsabit</option>
              <option value="migori">Migori</option>
              <option value="muranga">Murang'a</option>
              <option value="nandi">Nandi</option>
              <option value="narok">Narok</option>
              <option value="nyamira">Nyamira</option>
              <option value="nyandarua">Nyandarua</option>
              <option value="samburu">Samburu</option>
              <option value="siaya">Siaya</option>
              <option value="taita_taveta">Taita-Taveta</option>
              <option value="tana_river">Tana River</option>
              <option value="tharaka_nithi">Tharaka-Nithi</option>
              <option value="trans_nzoia">Trans Nzoia</option>
              <option value="turkana">Turkana</option>
              <option value="vihiga">Vihiga</option>
              <option value="wajir">Wajir</option>
              <option value="west_pokot">West Pokot</option>
            </select>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-[#2D5A27] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1E3F1A] transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Current Price Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 capitalize">
                {marketData.crop} in {marketData.region}
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {marketData.currency} {marketData.current_price.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">per {marketData.unit}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm">
                {marketData.price_change_7d > 0 ? (
                  <TrendingUp size={16} className="text-green-600" />
                ) : marketData.price_change_7d < 0 ? (
                  <TrendingDown size={16} className="text-red-500" />
                ) : (
                  <Minus size={16} className="text-gray-400" />
                )}
                <span
                  className={`font-semibold ${
                    marketData.price_change_7d > 0
                      ? "text-green-600"
                      : marketData.price_change_7d < 0
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {marketData.price_change_7d > 0 ? "+" : ""}
                  {marketData.price_change_7d}% (7d)
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm mt-1">
                <span
                  className={`font-semibold ${
                    marketData.price_change_30d > 0
                      ? "text-green-600"
                      : marketData.price_change_30d < 0
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {marketData.price_change_30d > 0 ? "+" : ""}
                  {marketData.price_change_30d}% (30d)
                </span>
              </div>
            </div>
          </div>

          {/* Trend Chart (Simple Bar) */}
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Price History (30 days)
            </h4>
            <div className="flex items-end gap-1 h-24">
              {marketData.history.map((point, i) => {
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
                      {point.date}: KES {point.price}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex gap-1 mt-1">
              {marketData.history.map((point, i) => (
                <div key={i} className="flex-1 text-center text-[8px] text-gray-400 truncate">
                  {point.date.slice(5)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Narrative Card */}
        {marketData.narrative && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#2D5A27]" />
              Market Narrative
            </h4>
            <p className="text-gray-700 leading-relaxed">{marketData.narrative}</p>
          </div>
        )}

        {/* Best Nearby Market */}
        {marketData.best_nearby_market && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ArrowUpRight size={18} className="text-[#F27D26]" />
              Better Price Nearby
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-800">{marketData.best_nearby_market.name}</p>
                  <p className="text-xs text-gray-500">{marketData.best_nearby_market.distance_km}km away</p>
                </div>
              </div>
              <p className="font-bold text-[#2D5A27] text-lg">
                KES {marketData.best_nearby_market.price.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Volatility: {marketData.volatility}</span>
          <span>Regional rank: {marketData.regional_rank}</span>
          <span>Updated: {new Date(marketData.updated_at).toLocaleDateString()}</span>
        </div>
      </main>
    </div>
  );
}
