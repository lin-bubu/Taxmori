import { useContext, useState, useRef, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { ChevronDown, Moon, Sun, Calculator, TrendingUp, Lightbulb, Zap, Building2, CreditCard } from "lucide-react";

const TAX_ITEMS = [
  { id: "tos", icon: Calculator, color: "#3b82f6", badge: "TOS", descKey: "tosDesc", labelKey: "tos" },
  { id: "ppt", icon: TrendingUp, color: "#10b981", badge: "PPT", descKey: "pptDesc", labelKey: "ppt" },
  { id: "plt", icon: Lightbulb, color: "#f59e0b", badge: "PLT", descKey: "pltDesc", labelKey: "plt" },
  { id: "stp", icon: Zap, color: "#8b5cf6", badge: "STP", descKey: "stpDesc", labelKey: "stp" },
  { id: "at", icon: Building2, color: "#ef4444", badge: "AT", descKey: "atDesc", labelKey: "at" },
  { id: "wht", icon: CreditCard, color: "#06b6d4", badge: "WHT", descKey: "whtDesc", labelKey: "wht" },
];

export default function Navbar({ activePage, setActivePage }) {
  const { dark, setDark, lang, setLang, currency, setCurrency, tr } = useContext(AppContext);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (id) => {
    setActivePage(id);
    setDropOpen(false);
    setMobileOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300
        ${dark
          ? "bg-gray-950/95 border-gray-800 backdrop-blur-md"
          : "bg-white/95 border-gray-100 backdrop-blur-md shadow-sm"
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => setActivePage("home")}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-xs tracking-tight">KH</span>
            </div>
            <span className={`font-black text-lg tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>
              Tax<span className="text-rose-500">mori</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">

            {/* Calculators Dropdown */}
            <div ref={dropRef} className="relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
                  ${dropOpen
                    ? dark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
                    : dark ? "text-gray-300 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
              >
                {tr("calculators")}
                <ChevronDown size={14} className={`transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Mega Dropdown */}
              {dropOpen && (
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[680px] rounded-2xl shadow-2xl border overflow-hidden z-50
                  ${dark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"}`}>

                  {/* Header */}
                  <div className={`px-6 py-4 border-b ${dark ? "border-gray-800" : "border-gray-100"}`}>
                    <p className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-gray-500" : "text-gray-400"}`}>
                      Cambodia Tax Calculators — GDT 2026
                    </p>
                  </div>

                  {/* Grid of all 6 tax types */}
                  <div className="grid grid-cols-2 p-3 gap-1">
                    {TAX_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive = activePage === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item.id)}
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-150 group
                            ${isActive
                              ? dark ? "bg-gray-800" : "bg-gray-50"
                              : dark ? "hover:bg-gray-800" : "hover:bg-gray-50"
                            }`}
                        >
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                            style={{ backgroundColor: item.color + "20" }}>
                            <Icon size={16} style={{ color: item.color }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
                                {tr(item.labelKey)}
                              </span>
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: item.color + "20", color: item.color }}>
                                {item.badge}
                              </span>
                            </div>
                            <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                              {tr(item.descKey)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className={`px-6 py-3 border-t ${dark ? "border-gray-800 bg-gray-900/50" : "border-gray-100 bg-gray-50/50"}`}>
                    <p className={`text-xs ${dark ? "text-gray-600" : "text-gray-400"}`}>
                      Monthly filing deadline: <span className="font-semibold">20th</span> of following month · E-filing: <span className="font-semibold">25th</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className={`w-px h-5 mx-1 ${dark ? "bg-gray-700" : "bg-gray-200"}`} />

            {/* Language Toggle */}
            <div className={`flex items-center rounded-full p-0.5 ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
              {["en", "kh"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200
                    ${lang === l
                      ? dark ? "bg-white text-gray-900" : "bg-white text-gray-900 shadow-sm"
                      : dark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {l === "en" ? "EN" : "ខ្មែរ"}
                </button>
              ))}
            </div>

            {/* Currency Toggle */}
            <div className={`flex items-center rounded-full p-0.5 ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
              {["KHR", "USD"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200
                    ${currency === c
                      ? "bg-rose-500 text-white shadow-sm shadow-rose-500/30"
                      : dark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {c === "KHR" ? "៛" : "$"}
                </button>
              ))}
            </div>

            {/* Dark Mode */}
            <button
              onClick={() => setDark(!dark)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
                ${dark ? "bg-gray-800 text-amber-400 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden w-9 h-9 rounded-full flex items-center justify-center ${dark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700"}`}
          >
            <div className="flex flex-col gap-1.5 w-4">
              <span className={`block h-0.5 rounded transition-all ${dark ? "bg-white" : "bg-gray-700"} ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 rounded transition-all ${dark ? "bg-white" : "bg-gray-700"} ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 rounded transition-all ${dark ? "bg-white" : "bg-gray-700"} ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className={`md:hidden border-t ${dark ? "bg-gray-950 border-gray-800" : "bg-white border-gray-100"}`}>
            <div className="p-4 space-y-1">
              {TAX_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors
                      ${dark ? "hover:bg-gray-800" : "hover:bg-gray-50"}`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: item.color + "20" }}>
                      <Icon size={15} style={{ color: item.color }} />
                    </div>
                    <span className={`text-sm font-semibold ${dark ? "text-white" : "text-gray-800"}`}>{tr(item.labelKey)}</span>
                    <span className="ml-auto text-xs font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: item.color + "20", color: item.color }}>{item.badge}</span>
                  </button>
                );
              })}
            </div>
            <div className={`flex items-center justify-between px-4 py-3 border-t ${dark ? "border-gray-800" : "border-gray-100"}`}>
              <div className={`flex items-center rounded-full p-0.5 ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
                {["en", "kh"].map((l) => (
                  <button key={l} onClick={() => setLang(l)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${lang === l ? dark ? "bg-white text-gray-900" : "bg-white text-gray-900 shadow-sm" : dark ? "text-gray-400" : "text-gray-500"}`}>
                    {l === "en" ? "EN" : "ខ្មែរ"}
                  </button>
                ))}
              </div>
              <div className={`flex items-center rounded-full p-0.5 ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
                {["KHR", "USD"].map((c) => (
                  <button key={c} onClick={() => setCurrency(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${currency === c ? "bg-rose-500 text-white" : dark ? "text-gray-400" : "text-gray-500"}`}>
                    {c === "KHR" ? "៛ KHR" : "$ USD"}
                  </button>
                ))}
              </div>
              <button onClick={() => setDark(!dark)}
                className={`w-9 h-9 rounded-full flex items-center justify-center ${dark ? "bg-gray-800 text-amber-400" : "bg-gray-100 text-gray-600"}`}>
                {dark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>
          </div>
        )}
      </nav>
      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
