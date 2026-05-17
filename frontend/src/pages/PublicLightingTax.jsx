import { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { CalcShell, CalcCard, Label, ResultBox, ResultRow, FormulaBox, SectionTitle, TabSwitch } from "../components/UI";
import { Lightbulb } from "lucide-react";

export default function PublicLightingTax() {
  const { tr, fmt, dark } = useContext(AppContext);
  const [price, setPrice] = useState(0);
  const [priceDisplay, setPriceDisplay] = useState("");
  const [mode, setMode] = useState("producer"); // "producer" or "reseller"
  const [result, setResult] = useState(null);

  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/,/g, "");
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value) || 0;
      setPrice(numValue);
      setPriceDisplay(value === "" ? "" : numValue.toLocaleString());
    }
  };

  // Auto-calculate whenever price or mode changes
  useEffect(() => {
    if (price > 0) {
      const vat = price - (price / 1.1);
      const exVAT = price / 1.1;
      const stp = exVAT - (exVAT / 1.05);
      const exSTP = exVAT / 1.05;

      if (mode === "producer") {
        // Producer/Importer: no 20% rule, PLT Base = price - VAT - STP
        const pltBase = price - vat - stp;
        const plt = pltBase * 0.05;
        setResult({ price, vat, stp, exVAT, exSTP, pltBase, plt, mode: "producer" });
      } else {
        // Reseller: PLT Base = (price - VAT - STP) × 20%
        const pltBase = (price - vat - stp) * 0.20;
        const plt = pltBase * 0.05;
        setResult({ price, vat, stp, exVAT, exSTP, pltBase, plt, mode: "reseller" });
      }
    } else {
      setResult(null);
    }
  }, [price, mode]);

  return (
    <CalcShell title={tr("plt")} badge="PLT" color="#f59e0b" lightBg="#fffbeb" darkBg="#451a03" icon={Lightbulb}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <CalcCard>
            <SectionTitle>{tr("calcMode")}</SectionTitle>
            <TabSwitch
              value={mode}
              onChange={setMode}
              options={[
                { value: "producer", label: tr("producerImporter") },
                { value: "reseller", label: tr("resellerWholesale") }
              ]}
            />
          </CalcCard>

          <CalcCard>
            <SectionTitle>{tr("productPrice")}</SectionTitle>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={priceDisplay}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className={`w-full px-4 py-3 rounded-xl text-lg font-semibold transition-colors ${
                    dark
                      ? "bg-gray-800 text-white border-gray-700 focus:border-amber-500"
                      : "bg-gray-50 text-gray-900 border-gray-200 focus:border-amber-500"
                  } border-2 outline-none`}
                />
              </div>
              <div className={`p-3 rounded-xl text-xs ${dark ? "bg-amber-900/20 text-amber-400 border border-amber-800/30" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                <strong>{tr("pltNoteLabel")}:</strong> {tr("pltNote")}
              </div>
            </div>
          </CalcCard>

          <CalcCard>
            <SectionTitle>{tr("formula")}</SectionTitle>
            {mode === "producer" ? (
              <FormulaBox formula={tr("formulaProducer")} />
            ) : (
              <FormulaBox formula={tr("formulaReseller")} />
            )}
          </CalcCard>
        </div>

        <div className="space-y-5">
          {result ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <CalcCard>
                  <ResultBox label={tr("pltBase")} value={fmt(result.pltBase)} />
                </CalcCard>
                <CalcCard>
                  <ResultBox label={tr("pltPayable")} value={fmt(result.plt)} accent />
                </CalcCard>
              </div>

              {/* Donut Chart */}
              <CalcCard>
                <SectionTitle>{tr("pltBreakdownChart")}</SectionTitle>
                <div className="flex items-center justify-center py-6">
                  <svg viewBox="0 0 200 200" className="w-48 h-48">
                    {(() => {
                      const total = result.price;
                      const vatPercent = (result.vat / total) * 100;
                      const stpPercent = (result.stp / total) * 100;
                      const pltPercent = (result.plt / total) * 100;
                      const basePercent = 100 - vatPercent - stpPercent - pltPercent;

                      let currentAngle = -90;
                      const radius = 80;
                      const innerRadius = 50;
                      const centerX = 100;
                      const centerY = 100;

                      const createArc = (percentage, color) => {
                        const angle = (percentage / 100) * 360;
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + angle;

                        const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                        const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
                        const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                        const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
                        const x3 = centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180);
                        const y3 = centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180);
                        const x4 = centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180);
                        const y4 = centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180);

                        const largeArc = angle > 180 ? 1 : 0;

                        currentAngle = endAngle;

                        return (
                          <path
                            d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`}
                            fill={color}
                          />
                        );
                      };

                      return (
                        <>
                          {createArc(basePercent, dark ? "#6b7280" : "#d1d5db")}
                          {createArc(vatPercent, "#3b82f6")}
                          {createArc(stpPercent, "#8b5cf6")}
                          {createArc(pltPercent, "#f59e0b")}
                        </>
                      );
                    })()}
                  </svg>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${dark ? "bg-gray-600" : "bg-gray-300"}`}></div>
                      <span>Net Price</span>
                    </div>
                    <span className="font-semibold">{fmt(result.exSTP)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-500"></div>
                      <span>VAT (10%)</span>
                    </div>
                    <span className="font-semibold">{fmt(result.vat)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-purple-500"></div>
                      <span>STP (5%)</span>
                    </div>
                    <span className="font-semibold">{fmt(result.stp)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-amber-500"></div>
                      <span>PLT ({mode === "producer" ? "5%" : "1%"})</span>
                    </div>
                    <span className="font-semibold">{fmt(result.plt)}</span>
                  </div>
                </div>
              </CalcCard>

              <CalcCard>
                <SectionTitle>{tr("pltBreakdown")}</SectionTitle>
                <ResultRow label={tr("priceInclVAT")} value={fmt(result.price)} />
                <ResultRow label="VAT (10%)" value={fmt(result.vat)} />
                <ResultRow label="STP (5%)" value={fmt(result.stp)} />
                <ResultRow label={tr("pltBase")} value={fmt(result.pltBase)} />
                <ResultRow label={tr("pltPayable")} value={fmt(result.plt)} bold />
              </CalcCard>
            </>
          ) : (
            <CalcCard className="flex flex-col items-center justify-center min-h-64 text-center">
              <Lightbulb size={40} className={`mb-4 ${dark ? "text-gray-800" : "text-gray-200"}`} />
              <p className={`font-semibold ${dark ? "text-gray-600" : "text-gray-400"}`}>{tr("pltEnterPrice")}</p>
            </CalcCard>
          )}
        </div>
      </div>
    </CalcShell>
  );
}