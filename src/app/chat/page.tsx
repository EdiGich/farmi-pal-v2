"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Loader2, TreePalm, BookOpen, ExternalLink, MessageSquare } from "lucide-react";
import MarkdownText from "@/components/MarkdownText";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatResponse {
  reply: string;
  sources?: { title: string; page: number }[];
  suggested_followups?: string[];
  language: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<"en" | "sw">("en");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          language,
        }),
      });
      const data: ChatResponse = await res.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ai, kuna shida kidogo. Jaribu tena.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <a href="/" className="text-sm text-gray-500 hover:text-[#2D5A27] transition-colors">
            ← Back to Home
          </a>
          <h1 className="text-xl font-bold text-gray-800">AI Chat Assistant</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 h-[calc(100vh-80px)]">
        <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
            <h3 className="font-bold text-gray-700 uppercase text-[10px] tracking-widest">
              Mjadala na FarmiPal
            </h3>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "sw")}
              className="text-[10px] font-medium text-gray-500 bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="sw">Swahili</option>
            </select>
          </div>

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
                    Ask about pest control, soil health, irrigation, planting seasons, or market strategies.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                  <button
                    onClick={() =>
                      setInput("Broker ananipea 2k kwa magunia tano ya mnazi. Hiyo ni fair?")
                    }
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
                  className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "bg-[#2D5A27] text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    <MarkdownText text={m.content} />
                  </div>
                  <span className="text-[10px] mt-1 text-gray-400 font-medium lowercase px-1">
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    FarmiPal anachambua info...
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100 shrink-0">
            <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-[#2D5A27]/20 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Andika hapa (Sheng au English)..."
                className="flex-1 bg-transparent border-none px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-[#2D5A27] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-[#1E3F1A] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Tuma
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
