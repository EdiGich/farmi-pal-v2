"use client";

import { TreePalm } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mx-auto mb-6">
          <TreePalm size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
        <p className="text-gray-500 text-sm mb-2">
          Samahani, tatizo limetokea. Tafadhali jaribu tena.
        </p>
        <p className="text-gray-400 text-xs mb-8">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-[#2D5A27] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1E3F1A] transition-colors shadow-sm"
        >
          Try Again / Jaribu Tena
        </button>
      </div>
    </div>
  );
}
