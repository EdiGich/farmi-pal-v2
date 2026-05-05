"use client";

import { useState } from "react";

export default function DiagnosePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cropType, setCropType] = useState("maize");
  const [language, setLanguage] = useState("en");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("crop_type", cropType);
    formData.append("language", language);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const severityColors: Record<string, string> = {
    mild: "bg-green-100 text-green-800 border-green-200",
    moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
    severe: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <a href="/" className="text-sm text-gray-500 hover:text-[#2D5A27] transition-colors">
            ← Back to Home
          </a>
          <h1 className="text-xl font-bold text-gray-800">Crop Diagnosis</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Crop Image</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="maize">Maize</option>
                <option value="tomato">Tomato</option>
                <option value="cassava">Cassava</option>
                <option value="bean">Bean</option>
                <option value="potato">Potato</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="en">English</option>
                <option value="sw">Swahili</option>
              </select>
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#2D5A27] file:text-white hover:file:bg-[#1E3F1A] file:cursor-pointer"
          />

          {preview && (
            <div className="mt-4">
              <img src={preview} alt="Preview" className="max-h-64 rounded-xl border border-gray-200" />
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{result.label}</h2>
                {result.label_key && (
                  <p className="text-sm text-gray-500 font-mono mt-0.5">{result.label_key}</p>
                )}
              </div>
              {result.severity && (
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${severityColors[result.severity] || "bg-gray-100 text-gray-800 border-gray-200"}`}
                >
                  {result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}
                </span>
              )}
            </div>

            {result.confidence && (
              <p className="text-sm text-gray-600 mb-3">
                Confidence: <span className="font-semibold">{(result.confidence * 100).toFixed(1)}%</span>
              </p>
            )}

            {result.explanation && (
              <p className="text-gray-700 leading-relaxed mb-4">{result.explanation}</p>
            )}

            {result.steps && result.steps.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Action Steps (Next 48 Hours):</h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  {result.steps.map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {result.watch_for && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Watch for:</span> {result.watch_for}
                </p>
              </div>
            )}

            {result.model_version && (
              <p className="text-xs text-gray-400 mt-4">Model: {result.model_version}</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
