import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Calculator, TrendingUp, Lightbulb, Zap, Building2, CreditCard, ArrowRight } from "lucide-react";

const TAX_ITEMS = [
  { id: "tos", icon: Calculator, color: "#3b82f6", bg: "#eff6ff", darkBg: "#1e3a5f", badge: "TOS", labelKey: "tos", descKey: "tosDesc", rate: "0–20%" },
  { id: "ppt", icon: TrendingUp, color: "#10b981", bg: "#ecfdf5", darkBg: "#064e3b", badge: "PPT", labelKey: "ppt", descKey: "pptDesc", rate: "1%" },
  { id: "plt", icon: Lightbulb, color: "#f59e0b", bg: "#fffbeb", darkBg: "#451a03", badge: "PLT", labelKey: "plt", descKey: "pltDesc", rate: "5%" },
  { id: "stp", icon: Zap, color: "#8b5cf6", bg: "#f5f3ff", darkBg: "#2e1065", badge: "STP", labelKey: "stp", descKey: "stpDesc", rate: "10–35%" },
  { id: "at", icon: Building2, color: "#ef4444", bg: "#fef2f2", darkBg: "#450a0a", badge: "AT", labelKey: "at", descKey: "atDesc", rate: "2%" },
  { id: "wht", icon: CreditCard, color: "#06b6d4", bg: "#ecfeff", darkBg: "#083344", badge: "WHT", labelKey: "wht", descKey: "whtDesc", rate: "0–15%" },
];

export default function Home({ setActivePage }) {
  const { dark, tr } = useContext(AppContext);

  return (
    <div className={`min-h-screen ${dark ? "bg-gray-950" : "bg-gray-50"}`}>
      {/* Hero */}
      <div className={`border-b ${dark ? "border-gray-800 bg-gray-950" : "border-gray-100 bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6 border
            ${dark ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-rose-50 border-rose-100 text-rose-600"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Tax · 2026
          </div>
          <h1 className={`text-4xl sm:text-6xl font-black tracking-tight mb-4 ${dark ? "text-white" : "text-gray-900"}`}>
            Cambodia Tax<br />
            <span className="text-rose-500">Made Simple</span>
          </h1>
          <p className={`text-base sm:text-lg max-w-xl mx-auto mb-8 ${dark ? "text-gray-400" : "text-gray-500"}`}>
            Instant, accurate calculations for all 6 Cambodian tax types. Bilingual support, real-time results.
          </p>
          <button
            onClick={() => setActivePage("tos")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-full transition-all shadow-lg shadow-rose-500/25 hover:scale-105"
          >
            Start Calculating
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Tax Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <p className={`text-xs font-bold uppercase tracking-widest mb-6 ${dark ? "text-gray-600" : "text-gray-400"}`}>
          All Tax Calculators
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TAX_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`group text-left p-6 rounded-2xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-xl
                  ${dark
                    ? "bg-gray-900 border-gray-800 hover:border-gray-700"
                    : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-gray-100"
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: dark ? item.darkBg : item.bg }}>
                    <Icon size={20} style={{ color: item.color }} />
                  </div>
                  <span className="text-xs font-mono font-black px-2 py-1 rounded-lg"
                    style={{ backgroundColor: dark ? item.darkBg : item.bg, color: item.color }}>
                    {item.badge}
                  </span>
                </div>
                <h3 className={`font-bold text-base mb-1 ${dark ? "text-white" : "text-gray-900"}`}>
                  {tr(item.labelKey)}
                </h3>
                <p className={`text-sm mb-4 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                  {tr(item.descKey)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: item.color }}>
                    Rate: {item.rate}
                  </span>
                  <ArrowRight size={14} className={`transition-transform group-hover:translate-x-1 ${dark ? "text-gray-600" : "text-gray-300"}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Deadline banner */}
        <div className={`mt-8 p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center gap-3
          ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0 mt-1 sm:mt-0" />
          <div>
            <p className={`text-sm font-semibold ${dark ? "text-white" : "text-gray-800"}`}>
              Monthly Filing Deadline
            </p>
            <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>
              Standard: <strong>20th</strong> of the following month &nbsp;·&nbsp; GDT E-Filing: <strong>25th</strong> of the following month  
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
