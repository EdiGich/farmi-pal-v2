"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, BookOpen, Sprout, Droplets, ShieldAlert, Leaf } from 'lucide-react';
import MarkdownText from './MarkdownText';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AGRI_SYSTEM_INSTRUCTION = `
You are FarmiPal's Agri-Tutor — a dedicated agricultural education specialist for farmers across Kenya.

PERSONALITY & LANGUAGE:
- Tone: Patient, encouraging, educational, and practical.
- Language: Use a natural blend of English, Swahili, and Sheng.
- Teaching Style: Break down complex concepts using relatable local analogies from across Kenya (Highlands, Rift Valley, Lake Basin, and Coast).

YOUR ROLE — EDUCATIONAL LOCALIZATION:
- Explain complex agricultural concepts in simple terms:
  - Soil science (pH, nitrogen cycle, organic matter)
  - Crop management (planting seasons, spacing, rotation)
  - Pest & Disease Management (Integrated Pest Management - IPM)
  - Water & Irrigation techniques
  - Post-harvest handling and storage
  - Organic farming practices

ANALOGY RULES (Use these frameworks):
- Nutrients/Fertilizers = "Chama savings" — you must deposit to withdraw.
- Soil pH = "Mood ya udongo" — too acidic or too alkaline = stressed plants.
- Pests = "Wageni wasioalikwa" — manage, don't just kill.
- Crop rotation = "Kupumzisha shamba" — resting and renewing the field.
- Grafting = "Kuunganisha nguvu" — combining the best of two worlds.
- Composting = "Dawa ya bure" — free medicine for the soil.

RESPONSE FORMAT:
- Start with a friendly greeting in Swahili or Sheng.
- Use **bold** for key terms and action steps.
- Use ### for section headings.
- End with a practical tip or "Hatua inayofuata" (Next Step).
`;

const quickTopics = [
  { icon: Sprout, label: "Afya ya Udongo", prompt: "Nifundishe kuhusu afya ya udongo na jinsi ya kuijua pH ya shamba langu." },
  { icon: Droplets, label: "Umwagiliaji", prompt: "Niambie mbinu bora za kumwagilia mazao yangu bila kupoteza maji mengi." },
  { icon: ShieldAlert, label: "Wadudu & Magonjwa", prompt: "Jinsi ya kudhibiti wadudu na magonjwa ya mazao bila kutumia dawa za sumu nyingi?" },
  { icon: Leaf, label: "Kilimo Hai", prompt: "Nielezewe jinsi ya kuanza kilimo hai (organic farming) kwenye shamba langu la pwani." },
];

export default function AgriTutorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          systemInstruction: AGRI_SYSTEM_INSTRUCTION,
        }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', text: data.text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: 'Ai, kuna shida kidogo. Jaribu tena.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#2D5A27]/5 to-transparent shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2D5A27] rounded-lg flex items-center justify-center">
            <BookOpen size={14} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Agri-Tutor</h3>
            <p className="text-[10px] text-gray-400">Masomo ya Kilimo • Agricultural Education</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-5">
            <div className="w-16 h-16 bg-[#2D5A27]/10 rounded-2xl flex items-center justify-center">
              <BookOpen size={28} className="text-[#2D5A27]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-800 text-lg">Karibu Agri-Tutor!</h3>
              <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
                Niulize swali lolote kuhusu kilimo — udongo, wadudu, umwagiliaji, au mazao yako.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {quickTopics.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(topic.prompt)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200 text-left text-xs hover:border-[#2D5A27] hover:bg-white transition-all text-gray-700 font-medium shadow-sm"
                >
                  <topic.icon size={14} className="text-[#2D5A27] shrink-0" />
                  {topic.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'bg-[#2D5A27] text-white rounded-tr-none'
                    : 'bg-[#F0F7EE] border border-[#2D5A27]/10 text-gray-800 rounded-tl-none'
                }`}
              >
                <MarkdownText text={m.text} />
              </div>
              <span className="text-[10px] mt-1 text-gray-400 px-1">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-[#F0F7EE] border border-[#2D5A27]/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-3">
              <Loader2 className="animate-spin text-[#2D5A27]" size={16} />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                Agri-Tutor anafikiria...
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0">
        <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-[#2D5A27]/20 transition-all">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Uliza swali la kilimo (Swahili au English)..."
            className="flex-1 bg-transparent border-none px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="bg-[#2D5A27] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#1E3F1A] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Send size={14} /> Tuma
          </button>
        </div>
      </div>
    </div>
  );
}
