import MarkdownText from "./MarkdownText";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex flex-col ${role === "user" ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
          role === "user"
            ? "bg-[#2D5A27] text-white rounded-tr-none"
            : "bg-gray-100 text-gray-800 rounded-tl-none"
        }`}
      >
        <MarkdownText text={content} />
      </div>
      <span className="text-[10px] mt-1 text-gray-400 font-medium lowercase px-1">{time}</span>
    </div>
  );
}
