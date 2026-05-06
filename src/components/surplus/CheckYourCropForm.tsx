import { Search } from "lucide-react";

interface FormValue {
  crop: string;
  region: string;
  planting_date: string;
  estimated_harvest_date: string;
  language: string;
}

interface CheckYourCropFormProps {
  value: FormValue;
  onChange: (data: Partial<FormValue>) => void;
  onSubmit: () => void;
  loading: boolean;
}

const cropOptions = [
  { value: "maize", label: "Maize" },
  { value: "wheat", label: "Wheat" },
  { value: "potato", label: "Potato" },
  { value: "rice", label: "Rice" },
  { value: "beans", label: "Beans" },
  { value: "tomato", label: "Tomato" },
  { value: "kale", label: "Kale" },
  { value: "cabbage", label: "Cabbage" },
  { value: "avocado", label: "Avocado" },
];

const regionOptions = [
  { value: "nakuru", label: "Nakuru" },
  { value: "eldoret", label: "Eldoret" },
  { value: "kitale", label: "Kitale" },
  { value: "nairobi", label: "Nairobi" },
  { value: "muranga", label: "Murang'a" },
  { value: "meru", label: "Meru" },
  { value: "kisumu", label: "Kisumu" },
  { value: "nyeri", label: "Nyeri" },
];

export default function CheckYourCropForm({
  value,
  onChange,
  onSubmit,
  loading,
}: CheckYourCropFormProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
        <Search size={18} className="text-[#F27D26]" />
        Check Your Crop
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Select your details to get a personalized surplus risk score
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Crop
          </label>
          <select
            value={value.crop}
            onChange={(e) => onChange({ crop: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/30 focus:border-[#2D5A27]"
          >
            {cropOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Region
          </label>
          <select
            value={value.region}
            onChange={(e) => onChange({ region: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/30 focus:border-[#2D5A27]"
          >
            {regionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Planting Date
          </label>
          <input
            type="date"
            value={value.planting_date}
            onChange={(e) => onChange({ planting_date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/30 focus:border-[#2D5A27]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Harvest Month
          </label>
          <input
            type="date"
            value={value.estimated_harvest_date}
            onChange={(e) => onChange({ estimated_harvest_date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/30 focus:border-[#2D5A27]"
          />
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={loading}
        className="mt-5 bg-[#F27D26] text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-[#d96b1e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>Check My Risk \u2192</>
        )}
      </button>
    </div>
  );
}
