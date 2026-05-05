import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F27D26] rounded-lg flex items-center justify-center text-xl font-bold text-white">
              F
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800">FarmiPal</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-600 hover:text-[#2D5A27] transition-colors">
              Features
            </a>
            <a href="#about" className="text-sm text-gray-600 hover:text-[#2D5A27] transition-colors">
              About
            </a>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            Your AI-Powered
            <span className="text-[#2D5A27]"> Farming Assistant</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Diagnose crop diseases, access market insights, detect surplus risks, and get real-time farming guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/diagnose"
              className="bg-[#2D5A27] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1E3F1A] transition-colors shadow-md"
            >
              Diagnose Crop Disease
            </Link>
            <Link
              href="/chat"
              className="bg-white text-[#2D5A27] border-2 border-[#2D5A27] px-8 py-3 rounded-lg font-semibold hover:bg-[#2D5A27]/5 transition-colors"
            >
              Chat with FarmiPal
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">Core Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl mb-4">
              📸
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Image Diagnosis</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Take a photo of your crop and get an AI-powered diagnosis with actionable treatment steps.
            </p>
            <Link href="/diagnose" className="inline-block mt-4 text-[#2D5A27] font-semibold text-sm hover:underline">
              Try it now →
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4">
              💬
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Smart Chat</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Ask farming questions — pest control, soil health, irrigation — get answers grounded in local knowledge.
            </p>
            <Link href="/chat" className="inline-block mt-4 text-[#2D5A27] font-semibold text-sm hover:underline">
              Start chatting →
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl mb-4">
              📊
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Market Trends</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              See price trends across markets and get plain-language guidance on when and where to sell.
            </p>
            <Link href="/market" className="inline-block mt-4 text-[#2D5A27] font-semibold text-sm hover:underline">
              View prices →
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl mb-4">
              🌍
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Surplus Insights</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Detect regional oversupply risks before prices collapse. Get alternatives — sell early, store, or process.
            </p>
            <Link href="/surplus" className="inline-block mt-4 text-[#2D5A27] font-semibold text-sm hover:underline">
              Check risk →
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h3 className="text-3xl font-bold text-gray-800">Built for Farmers, Powered by AI</h3>
            <p className="text-gray-600 leading-relaxed">
              FarmiPal uses a layered architecture — Next.js for a fast, mobile-first UI and Django for AI orchestration,
              data persistence, and async job handling. All AI logic is decoupled and GPU-ready.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our mock-first development means the entire UI is complete and testable before any AI model is running.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-400">FarmiPal — Built for farmers, powered by AI. 🌾</p>
          <p className="text-xs text-gray-500 mt-2">MIT License</p>
        </div>
      </footer>
    </div>
  );
}
