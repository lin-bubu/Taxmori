import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export function CalcShell({ title, badge, color, darkBg, lightBg, icon: Icon, children }) {
  const { dark } = useContext(AppContext);
  return (
    <div className={`min-h-[calc(100vh-64px)] ${dark ? "bg-gray-950" : "bg-gray-50"}`}>
      {/* Page header */}
      <div className={`border-b ${dark ? "bg-gray-950 border-gray-800" : "bg-white border-gray-100"}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: dark ? darkBg : lightBg }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className={`text-xl font-black ${dark ? "text-white" : "text-gray-900"}`}>{title}</h1>
                <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: dark ? darkBg : lightBg, color }}>{badge}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </div>
    </div>
  );
}

export function CalcCard({ children, className = "" }) {
  const { dark } = useContext(AppContext);
  return (
    <div className={`rounded-2xl border p-6 ${className}
      ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
      {children}
    </div>
  );
}

export function Label({ children }) {
  const { dark } = useContext(AppContext);
  return (
    <label className={`block text-xs font-bold uppercase tracking-wider mb-2
      ${dark ? "text-gray-400" : "text-gray-500"}`}>
      {children}
    </label>
  );
}

export function NumInput({ value, onChange, placeholder = "0.00" }) {
  const { dark } = useContext(AppContext);
  return (
    <input
      type="number"
      min="0"
      value={value || ""}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none
        focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400
        ${dark
          ? "bg-gray-800 border-gray-700 text-white placeholder-gray-600"
          : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-300"
        }`}
    />
  );
}

export function SelectInput({ value, onChange, options }) {
  const { dark } = useContext(AppContext);
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none
        focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400
        ${dark
          ? "bg-gray-800 border-gray-700 text-white"
          : "bg-gray-50 border-gray-200 text-gray-900"
        }`}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function Toggle({ label, hint, checked, onChange }) {
  const { dark } = useContext(AppContext);
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className={`text-sm font-semibold ${dark ? "text-gray-200" : "text-gray-700"}`}>{label}</p>
        {hint && <p className={`text-xs mt-0.5 ${dark ? "text-gray-600" : "text-gray-400"}`}>{hint}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ml-4
          ${checked ? "bg-rose-500" : dark ? "bg-gray-700" : "bg-gray-200"}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200
          ${checked ? "translate-x-7" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

export function TabSwitch({ options, value, onChange }) {
  const { dark } = useContext(AppContext);
  return (
    <div className={`inline-flex rounded-xl p-1 ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
            ${value === o.value
              ? dark ? "bg-white text-gray-900 shadow-sm" : "bg-white text-gray-900 shadow-sm"
              : dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
            }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function CalcButton({ onClick, children, variant = "primary" }) {
  if (variant === "ghost") {
    return (
      <button onClick={onClick}
        className="px-5 py-3 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        {children}
      </button>
    );
  }
  return (
    <button onClick={onClick}
      className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 text-sm">
      {children}
    </button>
  );
}

export function ResultBox({ label, value, sub, accent = false, large = false }) {
  const { dark } = useContext(AppContext);
  return (
    <div className={`rounded-xl p-4 ${accent
      ? "bg-rose-500 text-white"
      : dark ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${accent ? "text-rose-100" : dark ? "text-gray-500" : "text-gray-400"}`}>
        {label}
      </p>
      <p className={`font-black ${large ? "text-2xl" : "text-xl"} ${accent ? "text-white" : dark ? "text-white" : "text-gray-900"}`}>
        {value}
      </p>
      {sub && <p className={`text-xs mt-1 ${accent ? "text-rose-200" : dark ? "text-gray-600" : "text-gray-400"}`}>{sub}</p>}
    </div>
  );
}

export function ResultRow({ label, value, bold = false }) {
  const { dark } = useContext(AppContext);
  return (
    <div className={`flex justify-between items-center py-2.5 border-b last:border-0
      ${dark ? "border-gray-800" : "border-gray-100"}`}>
      <span className={`text-sm ${bold ? "font-bold" : ""} ${dark ? "text-gray-400" : "text-gray-500"}`}>{label}</span>
      <span className={`text-sm font-bold ${bold ? (dark ? "text-white" : "text-gray-900") : (dark ? "text-gray-200" : "text-gray-700")}`}>{value}</span>
    </div>
  );
}

export function FormulaBox({ formula }) {
  const { dark } = useContext(AppContext);
  return (
    <div className={`rounded-xl p-4 font-mono text-xs leading-relaxed
      ${dark ? "bg-gray-800 text-emerald-400 border border-gray-800" : "bg-gray-50 text-emerald-700 border border-gray-100"}`}>
      <pre className="whitespace-pre-wrap">{formula}</pre>
    </div>
  );
}

export function SectionTitle({ children }) {
  const { dark } = useContext(AppContext);
  return (
    <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${dark ? "text-gray-600" : "text-gray-400"}`}>
      {children}
    </p>
  );
}
