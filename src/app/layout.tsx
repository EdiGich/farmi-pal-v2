import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FarmiPal - Your AI Farming Companion",
  description: "AI-powered assistant for Kenyan farmers. Get market prices, agricultural tips, and negotiate better deals in Sheng and English.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
