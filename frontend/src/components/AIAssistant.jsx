import { useState, useRef, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Bot, X, Send, Sparkles } from "lucide-react";

export default function AIAssistant() {
  const { dark, lang } = useContext(AppContext);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: lang === "kh"
        ? "សួស្ដី! ខ្ញុំជាជំនួយការ AI ពន្ធ Taxmori KH។ សួរខ្ញុំអំពី TOS, PPT, PLT, STP, AT, WHT!"
        : "Hi! I'm Taxmori KH's AI Tax Assistant. Ask me anything about Cambodia's tax system — TOS, PPT, PLT, STP, AT, or WHT!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are Taxmori KH, an expert AI assistant for Cambodia's tax system (GDT 2026). You know:
- TOS: Tax on Salary — progressive 0–20% for residents (brackets: 0 at ≤1.5M, 5% 1.5–2M, 10% 2–8.5M, 15% 8.5–12.5M, 20% >12.5M KHR), 20% flat for non-residents. Deductions: spouse 150K, child 150K.
- PPT: Prepayment Profit Tax — 1% of monthly revenue (excl. VAT). Real Regime enterprises only. QIP may be exempt.
- PLT: Public Lighting Tax — 5% on alcohol/tobacco. Formula: (price/1.1/1.05 × 20%) × 5%
- STP: Specific Tax — Spirits 35%, Beer 30%, Tobacco 20%, Soft Drinks 10%, Entertainment 10%. 90% rule for local products.
- AT: Accommodation Tax — 2% on room rates. Formula: (rate/1.1/1.02) × 2%
- WHT: Withholding Tax — Resident: Dividends 0%, Interest/Royalties/Services 15%, Rent 10%. Non-resident: 14% standard, 10% DTA. Circular 024 (2026): exempt if <50K KHR or services with VAT invoice.
- Monthly deadline: 20th (25th for e-filing).
Answer in ${lang === "kh" ? "Khmer" : "English"}. Be concise and practical.`,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(c => c.text || "").join("") || "Sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm temporarily unavailable. Please check your API connection." }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300
          ${open ? "bg-gray-700 rotate-0" : "bg-rose-500 hover:bg-rose-600 hover:scale-110"}
          shadow-rose-500/30`}
      >
        {open ? <X size={20} className="text-white" /> : <Bot size={22} className="text-white" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className={`fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-all duration-300
          ${dark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
          style={{ height: 480 }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="font-black text-white text-sm">Taxmori AI</p>
              <p className="text-white/70 text-xs">Cambodia Tax Expert · 2026</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/70 text-xs">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <Bot size={13} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${m.role === "user"
                    ? "bg-rose-500 text-white rounded-br-md"
                    : dark ? "bg-gray-800 text-gray-200 rounded-bl-md" : "bg-gray-100 text-gray-800 rounded-bl-md"
                  }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shrink-0">
                  <Bot size={13} className="text-white" />
                </div>
                <div className={`px-3.5 py-3 rounded-2xl rounded-bl-md flex gap-1.5 ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className={`p-3 border-t ${dark ? "border-gray-800" : "border-gray-100"}`}>
            <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors
              ${dark ? "bg-gray-800 border-gray-700 focus-within:border-rose-500/50" : "bg-gray-50 border-gray-200 focus-within:border-rose-400"}`}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder={lang === "kh" ? "សួរអំពីពន្ធ..." : "Ask about Cambodia taxes..."}
                className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 dark:text-white"
              />
              <button onClick={send} disabled={loading || !input.trim()}
                className="w-8 h-8 bg-rose-500 disabled:opacity-30 hover:bg-rose-600 rounded-lg flex items-center justify-center transition-colors shrink-0">
                <Send size={13} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
