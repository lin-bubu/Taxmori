import { useState, useContext, useEffect, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { CalcShell, CalcCard, NumInput, ResultBox, ResultRow, FormulaBox, SectionTitle } from "../components/UI";
import { Building2 } from "lucide-react";

// ── Animated donut chart ──────────────────────────────────────────────────────
function DonutChart({ result, fmt, tr, dark }) {
  const animRef = useRef(null);
  const prevRef = useRef({ at: 0, atBase: 0, vat: 0 });
  const [anim, setAnim] = useState({ at: 0, atBase: 0, vat: 0 });

  const vat    = result.rate - result.exVAT;     // VAT portion
  const atBase = result.taxBase;                 // tax base (excl. VAT & AT)
  const at     = result.at;                      // AT payable
  // atBase + at = exVAT; exVAT + vat = rate ✓
  const total  = result.rate;

  useEffect(() => {
    const from = { ...prevRef.current };
    const to   = { at, atBase, vat };
    const dur  = 520;
    const t0   = performance.now();
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const tick = (now) => {
      const p    = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setAnim({
        at:     from.at     + (to.at     - from.at)     * ease,
        atBase: from.atBase + (to.atBase - from.atBase) * ease,
        vat:    from.vat    + (to.vat    - from.vat)    * ease,
      });
      if (p < 1) animRef.current = requestAnimationFrame(tick);
      else        prevRef.current = to;
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [at, atBase, vat]);

  const cx = 80, cy = 80, r = 58, sw = 20;
  const circ = 2 * Math.PI * r;

  const segments = [
    { key: "atBase", value: anim.atBase, color: "#ef4444", label: tr("atTaxBase") },
    { key: "at",     value: anim.at,     color: "#f43f5e", label: tr("atPayable") },
    { key: "vat",    value: anim.vat,    color: "#10b981", label: "VAT (10%)"     },
  ];

  let cumPct = 0;
  const arcs = segments.map(seg => {
    const pct    = total > 0 ? seg.value / total : 0;
    const dash   = pct * circ;
    const offset = circ * (1 - cumPct) + circ * 0.25;
    cumPct += pct;
    return { ...seg, dash, offset };
  });

  const atPct = total > 0 ? ((at / total) * 100).toFixed(1) : "—";

  return (
    <CalcCard>
      <SectionTitle>{tr("atBreakdown")}</SectionTitle>
      <div className="flex items-center gap-5">
        <div className="flex-shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx={cx} cy={cy} r={r} fill="none"
              stroke={dark ? "#1f2937" : "#f1f5f9"} strokeWidth={sw} />
            {arcs.map(arc => (
              <circle key={arc.key}
                cx={cx} cy={cy} r={r} fill="none"
                stroke={arc.color} strokeWidth={sw} strokeLinecap="butt"
                strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
                strokeDashoffset={arc.offset}
              />
            ))}
            <text x={cx} y={cy - 9} textAnchor="middle" fontSize="10"
              fill={dark ? "#6b7280" : "#9ca3af"} fontFamily="sans-serif">AT</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize="15" fontWeight="800"
              fill={dark ? "#f9fafb" : "#111827"} fontFamily="sans-serif">{atPct}%</text>
            <text x={cx} y={cy + 24} textAnchor="middle" fontSize="9"
              fill={dark ? "#4b5563" : "#d1d5db"} fontFamily="sans-serif">of rate</text>
          </svg>
        </div>

        <div className="flex flex-col gap-2.5 flex-1 min-w-0">
          {[
            { color: "#ef4444", label: tr("atTaxBase"), value: atBase },
            { color: "#f43f5e", label: tr("atPayable"), value: at     },
            { color: "#10b981", label: "VAT (10%)",     value: vat    },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className={`text-xs flex-1 truncate ${dark ? "text-gray-400" : "text-gray-500"}`}>{item.label}</span>
              <span className={`text-xs font-semibold font-mono flex-shrink-0 ${dark ? "text-gray-200" : "text-gray-700"}`}>{fmt(item.value)}</span>
            </div>
          ))}
          <div className={`border-t mt-1 pt-2 ${dark ? "border-gray-800" : "border-gray-100"}`}>
            <div className="flex items-center gap-2">
              <span className={`text-xs flex-1 font-semibold ${dark ? "text-gray-300" : "text-gray-600"}`}>{tr("roomRate")}</span>
              <span className={`text-xs font-bold font-mono ${dark ? "text-white" : "text-gray-900"}`}>{fmt(result.rate)}</span>
            </div>
          </div>
        </div>
      </div>
    </CalcCard>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AccommodationTax() {
  const { tr, fmt, dark } = useContext(AppContext);
  const [rate, setRate]     = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!rate || rate <= 0) { setResult(null); return; }
    const exVAT   = rate / 1.1;
    const taxBase = exVAT / 1.02;
    const at      = taxBase * 0.02;
    setResult({ rate, exVAT, taxBase, at });
  }, [rate]);

  return (
    <CalcShell title={tr("at")} badge="AT" color="#ef4444" lightBg="#fef2f2" darkBg="#450a0a" icon={Building2}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left column ── */}
        <div className="space-y-5">
          <CalcCard>
            <SectionTitle>{tr("atRoomRateLabel")}</SectionTitle>
            <NumInput value={rate} onChange={setRate} />
            <div className={`mt-3 p-3 rounded-xl text-xs ${dark ? "bg-red-900/20 text-red-400 border border-red-800/30" : "bg-red-50 text-red-700 border border-red-100"}`}>
              {tr("atNote")}
            </div>
          </CalcCard>

          <CalcCard>
            <SectionTitle>{tr("formula")}</SectionTitle>
          <FormulaBox formula={`Ex-VAT   = Room Rate / 1.1\nTax Base = Ex-VAT / 1.02\nAT       = Tax Base × 2%`} />
          </CalcCard>
          <CalcCard>
            <SectionTitle>{tr("atAbout")}</SectionTitle>
            <ul className={`text-sm space-y-2 ${dark ? "text-gray-400" : "text-gray-500"}`}>
              <li>• {tr("atAboutLine1")}</li>
              <li>• {tr("atAboutLine2")}</li>
              <li>• {tr("atAboutLine3")}</li>
              <li>• {tr("atAboutLine4")}</li>
            </ul>
          </CalcCard>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">
          {result ? (
            <>
              <CalcCard className="grid grid-cols-2 gap-3">
                <ResultBox label={tr("atTaxBase")} value={fmt(result.taxBase)} />
                <ResultBox label={tr("atPayable")} value={fmt(result.at)} accent />
              </CalcCard>

              <DonutChart result={result} fmt={fmt} tr={tr} dark={dark} />

              <CalcCard>
                <SectionTitle>{tr("atCalcSteps")}</SectionTitle>
                <ResultRow label={tr("atRoomRateInclVAT")} value={fmt(result.rate)} />
                <ResultRow label={tr("atExclVAT")}         value={fmt(result.exVAT)} />
                <ResultRow label={tr("atDivTaxBase")}      value={fmt(result.taxBase)} />
                <ResultRow label={tr("atMulPayable")}      value={fmt(result.at)} bold />
              </CalcCard>
            </>
          ) : (
            <CalcCard className="flex flex-col items-center justify-center min-h-64 text-center">
              <Building2 size={40} className={`mb-4 ${dark ? "text-gray-800" : "text-gray-200"}`} />
              <p className={`font-semibold ${dark ? "text-gray-600" : "text-gray-400"}`}>
                {tr("atPlaceholder")}
              </p>
            </CalcCard>
          )}
        </div>
      </div>
    </CalcShell>
  );
}