export async function chatWithFarmiPal(
  message: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[] = []
) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return data.text as string;
  } catch (error) {
    console.error("Chat service error:", error);
    return "Ai, kuna shida kwa network maze. Hebu check kama bundles zimeisha kiasi.";
  }
}
