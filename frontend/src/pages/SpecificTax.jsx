import { useState, useContext, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { CalcShell, CalcCard, NumInput, ResultBox, ResultRow, FormulaBox, SectionTitle } from "../components/UI";
import { Zap } from "lucide-react";

const CATEGORIES = [
  { value: "spirits",       en: "Spirits",               kh: "ស្រា",              rate: 0.35, color: "#7c3aed" },
  { value: "beer",          en: "Beer",                  kh: "ស្រាបៀរ",           rate: 0.30, color: "#2563eb" },
  { value: "tobacco",       en: "Tobacco",               kh: "បារី",              rate: 0.20, color: "#64748b" },
  { value: "softdrinks",    en: "Soft Drinks",           kh: "ភេសជ្ជៈ",           rate: 0.10, color: "#06b6d4" },
  { value: "entertainment", en: "Entertainment Services", kh: "សេវាកម្មកម្សាន្ត", rate: 0.10, color: "#f59e0b" },
];

// ── Animated donut chart ──────────────────────────────────────────────────────
function DonutChart({ result, fmt, tr, dark }) {
  const animRef  = useRef(null);
  const prevRef  = useRef({ stp: 0, vat: 0, net: 0 });
  const [anim, setAnim] = useState({ stp: 0, vat: 0, net: 0 });

  const vat = result.price - result.exVAT;
  const net = result.exSTP;        // net base (excl. VAT & STP)
  const stp = result.stp;
  const total = result.price;

  useEffect(() => {
    const from = { ...prevRef.current };
    const to   = { stp, vat, net };
    const dur  = 520;
    const t0   = performance.now();

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const tick = (now) => {
      const p    = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);          // cubic ease-out
      setAnim({
        stp: from.stp + (to.stp - from.stp) * ease,
        vat: from.vat + (to.vat - from.vat) * ease,
        net: from.net + (to.net - from.net) * ease,
      });
      if (p < 1) animRef.current = requestAnimationFrame(tick);
      else        prevRef.current = to;
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [stp, vat, net]);

  // SVG donut geometry
  const cx = 80, cy = 80, r = 58, sw = 20;
  const circ = 2 * Math.PI * r;

  const segments = [
    { key: "net", value: anim.net, color: result.color, label: tr("stpNetBase") },
    { key: "stp", value: anim.stp, color: "#f43f5e",    label: tr("stpPayable") },
    { key: "vat", value: anim.vat, color: "#10b981",    label: "VAT (10%)"      },
  ];

  let cumPct = 0;
  const arcs = segments.map(seg => {
    const pct    = total > 0 ? seg.value / total : 0;
    const dash   = pct * circ;
    const offset = circ * (1 - cumPct) + circ * 0.25; // start from top (−90°)
    cumPct += pct;
    return { ...seg, dash, offset };
  });

  const stpPct = total > 0 ? ((stp / total) * 100).toFixed(1) : "—";

  return (
    <CalcCard>
      <SectionTitle>{tr("pltBreakdown")}</SectionTitle>
      <div className="flex items-center gap-5">

        {/* Donut */}
        <div className="relative flex-shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160">
            {/* track ring */}
            <circle cx={cx} cy={cy} r={r} fill="none"
              stroke={dark ? "#1f2937" : "#f1f5f9"} strokeWidth={sw} />
            {arcs.map(arc => (
              <circle key={arc.key}
                cx={cx} cy={cy} r={r} fill="none"
                stroke={arc.color}
                strokeWidth={sw}
                strokeLinecap="butt"
                strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
                strokeDashoffset={arc.offset}
              />
            ))}
            {/* centre */}
            <text x={cx} y={cy - 9} textAnchor="middle" fontSize="10"
              fill={dark ? "#6b7280" : "#9ca3af"} fontFamily="sans-serif">STP</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize="15" fontWeight="800"
              fill={dark ? "#f9fafb" : "#111827"} fontFamily="sans-serif">
              {stpPct}{typeof stpPct === "string" ? "" : "%"}
            </text>
            <text x={cx} y={cy + 24} textAnchor="middle" fontSize="9"
              fill={dark ? "#4b5563" : "#d1d5db"} fontFamily="sans-serif">of price</text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 flex-1 min-w-0">
          {[
            { color: result.color, label: "NetBase", value: net },
            { color: "#f43f5e",    label: "STP Payable", value: stp },
            { color: "#10b981",    label: "VAT (10%)",      value: vat },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }} />
              <span className={`text-xs flex-1 truncate ${dark ? "text-gray-400" : "text-gray-500"}`}>
                {item.label}
              </span>
              <span className={`text-xs font-semibold font-mono flex-shrink-0 ${dark ? "text-gray-200" : "text-gray-700"}`}>
                {fmt(item.value)}
              </span>
            </div>
          ))}
          <div className={`border-t mt-1 pt-2 ${dark ? "border-gray-800" : "border-gray-100"}`}>
            <div className="flex items-center gap-2">
              <span className={`text-xs flex-1 font-semibold ${dark ? "text-gray-300" : "text-gray-600"}`}>
                Price Incl. VAT
              </span>
              <span className={`text-xs font-bold font-mono ${dark ? "text-white" : "text-gray-900"}`}>
                {fmt(result.price)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </CalcCard>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SpecificTax() {
  const { tr, fmt, dark, lang } = useContext(AppContext);
  const [price, setPrice]   = useState(0);
  const [cat, setCat]       = useState("spirits");
  const [result, setResult] = useState(null);

  const getLabel = (c) => lang === "kh" ? c.kh : c.en;

  useEffect(() => {
    const found = CATEGORIES.find(c => c.value === cat);
    if (!found || !price || price <= 0) { setResult(null); return; }
    const rate   = found.rate;
    const exVAT  = price / 1.1;
    const exSTP  = exVAT / (1 + rate);
    const base90 = exSTP * 0.90;
    const stp    = base90 * rate;
    setResult({ price, exVAT, exSTP, base90, stp, rate, label: getLabel(found), color: found.color });
  }, [price, cat, lang]);

  const activeCat = CATEGORIES.find(c => c.value === cat);

  return (
    <CalcShell title={tr("stp")} badge="STP" color="#8b5cf6" lightBg="#f5f3ff" darkBg="#2e1065" icon={Zap}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left column ── */}
        <div className="space-y-5">
          <CalcCard>
            <SectionTitle>{tr("category")}</SectionTitle>
            <div className="grid grid-cols-1 gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCat(c.value)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all
                    ${cat === c.value
                      ? "border-transparent shadow-sm"
                      : dark ? "border-gray-800 hover:border-gray-700" : "border-gray-100 hover:border-gray-200"
                    }`}
                  style={cat === c.value ? { backgroundColor: c.color + "15", borderColor: c.color + "40" } : {}}
                >
                  <span className={`text-sm font-semibold ${dark ? "text-white" : "text-gray-800"}`}>
                    {getLabel(c)}
                  </span>
                  <span className="text-sm font-black" style={{ color: c.color }}>
                    {(c.rate * 100).toFixed(0)}%
                  </span>
                </button>
              ))}
            </div>
          </CalcCard>

          <CalcCard>
            <SectionTitle>{tr("productPrice")}</SectionTitle>
            <NumInput value={price} onChange={setPrice} />
            {activeCat && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: activeCat.color + "20", color: activeCat.color }}>
                  {tr("stpRateLabel")}: {(activeCat.rate * 100).toFixed(0)}%
                </span>
                <span className={`text-xs ${dark ? "text-gray-600" : "text-gray-400"}`}>
                  {tr("stpRule90")}
                </span>
              </div>
            )}
          </CalcCard>

          <CalcCard>
            <SectionTitle>{tr("formula")}</SectionTitle>
            <FormulaBox  formula={`Ex-VAT  = Price / 1.1\nEx-STP  = Ex-VAT / (1 + Rate)\nBase    = Ex-STP × 90%\nSTP     = Base × Rate`} />
           </CalcCard>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">
          {result ? (
            <>
              {/* Summary boxes */}
              <CalcCard className="grid grid-cols-2 gap-3">
                <ResultBox label={tr("stpTaxBase")} value={fmt(result.base90)} />
                <ResultBox label={tr("stpPayable")} value={fmt(result.stp)} accent />
              </CalcCard>

              {/* Donut chart */}
              <DonutChart result={result} fmt={fmt} tr={tr} dark={dark} />

              {/* Calculation steps */}
              <CalcCard>
                <SectionTitle>{tr("stpCalcSteps")}</SectionTitle>
                <ResultRow label={tr("category")}                                           value={result.label} />
                <ResultRow label={tr("stpRate")}                                            value={`${(result.rate * 100).toFixed(0)}%`} />
                <ResultRow label={tr("stpPriceInclVAT")}                                    value={fmt(result.price)} />
                <ResultRow label={tr("stpExclVAT")}                                         value={fmt(result.exVAT)} />
                <ResultRow label={` ${tr("stpExclSTP")} (${(result.rate * 100).toFixed(0)}%)`} value={fmt(result.exSTP)} />
                <ResultRow label={tr("stpLocalRule")}                                       value={fmt(result.base90)} />
                <ResultRow label={`${tr("stpPayable")} ${(result.rate * 100).toFixed(0)}%`} value={fmt(result.stp)} bold />
              </CalcCard>
            </>
          ) : (
            <CalcCard className="flex flex-col items-center justify-center min-h-64 text-center">
              <Zap size={40} className={`mb-4 ${dark ? "text-gray-800" : "text-gray-200"}`} />
              <p className={`font-semibold ${dark ? "text-gray-600" : "text-gray-400"}`}>
                {tr("stpPlaceholder")}
              </p>
            </CalcCard>
          )}
        </div>
      </div>
    </CalcShell>
  );
}