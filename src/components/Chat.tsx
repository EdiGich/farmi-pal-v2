"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Loader2, TrendingUp, BookOpen, ArrowLeft, TreePalm } from 'lucide-react';
import { chatWithFarmiPal } from '../services/geminiService';
import MarkdownText from './MarkdownText';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await chatWithFarmiPal(input, history);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Chat Header Info */}
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
        <h3 className="font-bold text-gray-700 uppercase text-[10px] tracking-widest">Mjadala na FarmiPal</h3>
        <span className="text-[10px] text-gray-400 font-medium">Regional Context: Pwani / Coast</span>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 no-scrollbar"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#2D5A27]">
              <TreePalm size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-gray-800 text-xl">Sema Mkulima!</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                Naitwa FarmiPal. Labda unataka ku-negotiate na mabroker wa Kongowea au unahitaji tech tips za shamba leo?
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 w-full max-w-md">
              <button 
                onClick={() => setInput("Broker ananipea 2k kwa magunia tano ya mnazi. Hiyo ni fair?")}
                className="text-left p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs hover:border-[#2D5A27] hover:bg-white transition-all text-gray-700 font-medium shadow-sm"
              >
                "Broker ananipea 2k kwa magunia tano ya mnazi. Hiyo ni fair?"
              </button>
              <button 
                onClick={() => setInput("Pest gani hizi zinakula majani ya miwa yangu?")}
                className="text-left p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs hover:border-[#2D5A27] hover:bg-white transition-all text-gray-700 font-medium shadow-sm"
              >
                "Pest gani hizi zinakula majani ya miwa yangu?"
              </button>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-[#2D5A27] text-white rounded-tr-none' 
                    : m.text.includes('usia') || m.text.includes('Step')
                      ? 'bg-[#FFF9E6] border border-[#F27D26]/20 text-gray-800 rounded-tl-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}
              >
                <MarkdownText text={m.text} />
              </div>
              <span className="text-[10px] mt-1 text-gray-400 font-medium lowercase px-1">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-3">
              <Loader2 className="animate-spin text-[#2D5A27]" size={16} />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">FarmiPal anachambua info...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-[#2D5A27]/20 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Andika hapa (Sheng au English)..."
            className="flex-1 bg-transparent border-none px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-[#2D5A27] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#1E3F1A] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            Tuma
          </button>
        </div>
      </div>
    </div>
  );
}
