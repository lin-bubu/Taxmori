import { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { CalcShell, CalcCard, Label, Toggle, ResultBox, ResultRow, FormulaBox, SectionTitle } from "../components/UI";
import { TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ── Comma-formatted number input ──────────────────────────────
function NumInput({ value, onChange, placeholder = "0" }) {
  const { dark } = useContext(AppContext);
  const [display, setDisplay] = useState(value ? Number(value).toLocaleString("en-US") : "");

  // Sync when parent resets value to 0
  useEffect(() => {
    if (!value || value === 0) setDisplay("");
    else setDisplay(Number(value).toLocaleString("en-US"));
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || raw === ".") { setDisplay(raw); onChange(0); return; }
    if (!/^\d*\.?\d*$/.test(raw)) return; // block non-numeric chars
    const num = parseFloat(raw);
    onChange(isNaN(num) ? 0 : num);
    // Preserve trailing dot while user is still typing decimals
    const formatted = raw.includes(".")
      ? Number(raw.split(".")[0]).toLocaleString("en-US") + "." + raw.split(".")[1]
      : Number(raw).toLocaleString("en-US");
    setDisplay(formatted);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
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

// ── Main calculator ───────────────────────────────────────────
export default function PrepaymentProfitTax() {
  const { tr, fmt, dark } = useContext(AppContext);
  const [revenue, setRevenue] = useState(0);
  const [includesVAT, setIncludesVAT] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!revenue || revenue <= 0) { setResult(null); return; }
    const gross = revenue;
    const base = includesVAT ? gross / 1.1 : gross;
    const vat = includesVAT ? gross - base : 0;
    const ppt = base * 0.01;
    const annual = ppt * 12;
    setResult({ gross, base, vat, ppt, annual });
  }, [revenue, includesVAT]);

  const pieData = result
    ? [
        { name: tr("pieRevenue"), value: Math.round(result.base), color: "#10b981" },
        { name: tr("pieVAT"),     value: Math.round(result.vat),  color: "#f59e0b" },
        { name: tr("piePPT"),     value: Math.round(result.ppt),  color: "#3b82f6" },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <CalcShell title={tr("ppt")} badge="PPT" color="#10b981" lightBg="#ecfdf5" darkBg="#064e3b" icon={TrendingUp}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left column ── */}
        <div className="space-y-5">
          <CalcCard>
            <SectionTitle>{tr("revenueDetails")}</SectionTitle>
            <div className="space-y-4">
              <div><Label>{tr("revenue")}</Label><NumInput value={revenue} onChange={setRevenue} /></div>
              <Toggle label={tr("includesVAT")} checked={includesVAT} onChange={setIncludesVAT} />
            </div>
          </CalcCard>

          <CalcCard>
            <SectionTitle>{tr("formula")}</SectionTitle>
            <FormulaBox formula={tr("formula_ppt")} />
          </CalcCard>

          <CalcCard>
            <SectionTitle>{tr("aboutPPT")}</SectionTitle>
            <ul className={`text-sm space-y-2 ${dark ? "text-gray-400" : "text-gray-500"}`}>
              {["aboutLine1","aboutLine2","aboutLine3","aboutLine4"].map((k, i) => (
                <li key={i}>• {tr(k)}</li>
              ))}
            </ul>
          </CalcCard>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">
          {result ? (
            <>
              <CalcCard>
                <div className="grid grid-cols-2 gap-3">
                  <ResultBox label={tr("taxBase")} value={fmt(result.base)} />
                  <ResultBox label={tr("PPTPayable")} value={fmt(result.ppt)} accent />
                </div>
              </CalcCard>

              {pieData.length > 0 && (
                <CalcCard>
                  <SectionTitle>{tr("revenueBreakdown")}</SectionTitle>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={3}>
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 12, border: "none", background: dark ? "#111827" : "#fff", fontSize: 12 }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CalcCard>
              )}

              <CalcCard>
                <SectionTitle>{tr("breakdown")}</SectionTitle>
                <ResultRow label={tr("grossRevenue")}   value={fmt(result.gross)} />
                <ResultRow label={tr("revenueExclVAT")} value={fmt(result.base)} />
                <ResultRow label={tr("pptPayable")}      value={fmt(result.ppt)}    bold />
                <ResultRow label={tr("annualEst")}       value={fmt(result.annual)} bold />
              </CalcCard>
            </>
          ) : (
            <CalcCard className="flex flex-col items-center justify-center min-h-64 text-center">
              <TrendingUp size={40} className={`mb-4 ${dark ? "text-gray-800" : "text-gray-200"}`} />
              <p className={`font-semibold ${dark ? "text-gray-600" : "text-gray-400"}`}>{tr("enterRevenue")}</p>
            </CalcCard>
          )}
        </div>

      </div>
    </CalcShell>
  );
}