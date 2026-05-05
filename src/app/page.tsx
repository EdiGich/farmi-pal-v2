"use client";

import { useState } from 'react';
import Chat from '@/components/Chat';
import MarketBoard from '@/components/MarketBoard';
import AgriTips from '@/components/AgriTips';
import AgriTutorChat from '@/components/AgriTutorChat';
import SurplusFinder from '@/components/SurplusFinder';
import { Menu } from 'lucide-react';

type Tab = 'chat' | 'market' | 'agri' | 'surplus';

const navItems: { id: Tab; emoji: string; label: string }[] = [
  { id: 'chat',    emoji: '💬', label: 'Mjadala (Chat)' },
  { id: 'market',  emoji: '📊', label: 'Bei za Soko' },
  { id: 'agri',    emoji: '🎓', label: 'Agri-Tutor' },
  { id: 'surplus', emoji: '🚛', label: 'Surplus Zones' },
];

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  const handleNav = (tab: Tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const tabLabel: Record<Tab, string> = {
    chat:    'Mjadala — National Chat',
    market:  'Bei za Soko — Market Prices',
    agri:    'Agri-Tutor — Agricultural Education',
    surplus: 'Surplus Zones — Find Excess Supply',
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#2D5A27] text-white flex flex-col p-6 shadow-xl
        transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#F27D26] rounded-lg flex items-center justify-center text-xl font-bold text-white">
            F
          </div>
          <h1 className="text-xl font-bold tracking-tight">FarmiPal</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors text-left ${
                activeTab === item.id
                  ? 'bg-white/20 text-white font-semibold'
                  : 'hover:bg-white/5 text-white/80 hover:text-white'
              }`}
            >
              <span className={`text-lg ${activeTab === item.id ? 'opacity-100' : 'opacity-70'}`}>
                {item.emoji}
              </span>
              <span className="font-medium">{item.label}</span>
              {activeTab === item.id && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F27D26]" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-black/10 rounded-xl border border-white/10 shrink-0">
          <p className="text-[10px] text-white/60 mb-1 uppercase tracking-wider">Hali ya Hewa: Nairobi</p>
          <p className="text-lg font-semibold flex items-center gap-2">
            24°C <span className="text-xl">🌤️</span>
          </p>
          <p className="text-[10px] text-white/40 mt-2 italic">Active: Kenya National</p>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 px-6 lg:px-8 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-gray-500 hidden sm:inline">
                {tabLabel[activeTab]}
              </span>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <button className="px-4 py-1.5 border border-[#2D5A27] text-[#2D5A27] rounded-md text-sm font-bold hover:bg-[#2D5A27]/5 transition-colors hidden sm:block">
              Msaada wa Haraka
            </button>
            <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-gray-600">
              USER
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-hidden">

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="h-full grid grid-cols-12 gap-6">
              <section className="col-span-12 lg:col-span-7 h-full flex flex-col overflow-hidden">
                <Chat />
              </section>
              <section className="hidden lg:flex lg:col-span-5 flex-col gap-6 overflow-y-auto no-scrollbar pb-6">
                <MarketBoard />
                <AgriTips />
              </section>
            </div>
          )}

          {/* Market Tab */}
          {activeTab === 'market' && (
            <div className="h-full overflow-y-auto no-scrollbar">
              <div className="max-w-2xl mx-auto">
                <MarketBoard />
              </div>
            </div>
          )}

          {/* Agri-Tutor Tab */}
          {activeTab === 'agri' && (
            <div className="h-full grid grid-cols-12 gap-6">
              <section className="col-span-12 lg:col-span-7 h-full flex flex-col overflow-hidden">
                <AgriTutorChat />
              </section>
              <section className="hidden lg:flex lg:col-span-5 flex-col gap-6 overflow-y-auto no-scrollbar pb-6">
                <SurplusFinder />
                <AgriTips />
              </section>
            </div>
          )}

          {/* Surplus Tab */}
          {activeTab === 'surplus' && (
            <div className="h-full overflow-y-auto no-scrollbar">
              <div className="max-w-2xl mx-auto space-y-6 pb-10">
                <SurplusFinder />
                <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-lg">📢</span> Surplus Information
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Data hii huonyesha maeneo ambapo mavuno ni mengi kuliko mahitaji. Hii ni nafasi nzuri kwa wafanyabiashara kupata bidhaa kwa bei nafuu, na kwa wakulima kutafuta soko mbadala au kuanza kukausha mazao ili yasiharibike.
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
