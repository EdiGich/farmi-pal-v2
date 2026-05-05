import React from 'react';

interface MarkdownTextProps {
  text: string;
}

export default function MarkdownText({ text }: MarkdownTextProps) {
  // Split into lines to handle block-level elements like ###
  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, lineIdx) => {
        // Handle headings (###)
        if (line.startsWith('### ')) {
          return (
            <h3 key={lineIdx} className="font-bold text-base mt-3 mb-1 text-gray-800">
              <MarkdownTextInline text={line.slice(4)} />
            </h3>
          );
        }

        // Handle regular lines with inline formatting
        return (
          <div key={lineIdx} className="min-h-[1em]">
            <MarkdownTextInline text={line} />
          </div>
        );
      })}
    </>
  );
}

function MarkdownTextInline({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-extrabold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i} className="italic">{part.slice(1, -1)}</em>;
        }
        return part;
      })}
    </>
  );
}
