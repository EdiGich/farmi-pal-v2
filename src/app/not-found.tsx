import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-[#2D5A27]/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-[#2D5A27] font-bold">F</span>
        </div>
        <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-xl font-semibold text-gray-700 mb-2">Ukurasa haukupatikana</p>
        <p className="text-gray-500 text-sm mb-2">Page not found</p>
        <p className="text-gray-400 text-sm mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#2D5A27] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1E3F1A] transition-colors shadow-sm"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
