import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { CalcShell, CalcCard, Label, NumInput, SelectInput, Toggle, TabSwitch, CalcButton, ResultBox, ResultRow, FormulaBox, SectionTitle } from "../components/UI";
import { CreditCard } from "lucide-react";

const RESIDENT_RATES = {
  dividends: { rate: 0.00, label: "Dividends / ភាគលាភ" },
  interest: { rate: 0.15, label: "Interest / ការប្រាក់" },
  royalties: { rate: 0.15, label: "Royalties / រ៉ូយ៉ាល់ទី" },
  rent: { rate: 0.10, label: "Rent / ការជួល" },
  services: { rate: 0.15, label: "Services / សេវាកម្ម" },
};

export default function WithholdingTax() {
  const { tr, fmt, dark } = useContext(AppContext);
  const [isResident, setIsResident] = useState(true);
  const [paymentType, setPaymentType] = useState("interest");
  const [amount, setAmount] = useState(0);
  const [useDTA, setUseDTA] = useState(false);
  const [result, setResult] = useState(null);

  const getRate = () => {
    if (!isResident) return useDTA ? 0.10 : 0.14;
    return RESIDENT_RATES[paymentType]?.rate ?? 0.15;
  };

  const calculate = () => {
    if (amount < 50000) {
      setResult({ exempt: true, amount });
      return;
    }
    const rate = getRate();
    const withheld = amount * rate;
    const net = amount - withheld;
    setResult({ exempt: false, amount, rate, withheld, net });
  };

  const currentRate = getRate();

  return (
    <CalcShell title={tr("wht")} badge="WHT" color="#06b6d4" lightBg="#ecfeff" darkBg="#083344" icon={CreditCard}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          {/* Resident / Non-Resident */}
          <CalcCard>
            <SectionTitle>Recipient Type</SectionTitle>
            <TabSwitch
              value={isResident ? "resident" : "nonresident"}
              onChange={v => setIsResident(v === "resident")}
              options={[{ value: "resident", label: tr("resident") }, { value: "nonresident", label: tr("nonResident") }]}
            />
          </CalcCard>

          {/* Payment type for resident */}
          {isResident && (
            <CalcCard>
              <SectionTitle>{tr("paymentType")}</SectionTitle>
              <div className="space-y-2">
                {Object.entries(RESIDENT_RATES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setPaymentType(key)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all
                      ${paymentType === key
                        ? dark ? "bg-cyan-900/20 border-cyan-700/40" : "bg-cyan-50 border-cyan-200"
                        : dark ? "border-gray-800 hover:border-gray-700" : "border-gray-100 hover:border-gray-200"
                      }`}
                  >
                    <span className={`text-sm font-semibold ${dark ? "text-white" : "text-gray-800"}`}>{val.label}</span>
                    <span className={`text-sm font-black ${val.rate === 0 ? "text-emerald-500" : "text-cyan-500"}`}>
                      {val.rate === 0 ? "Exempt (0%)" : `${(val.rate * 100).toFixed(0)}%`}
                    </span>
                  </button>
                ))}
              </div>
            </CalcCard>
          )}

          {/* DTA for non-resident */}
          {!isResident && (
            <CalcCard>
              <SectionTitle>Non-Resident Rate</SectionTitle>
              <Toggle
                label={tr("applyDTA")}
                hint="Double Tax Agreement — reduced 10% rate"
                checked={useDTA}
                onChange={setUseDTA}
              />
              <div className={`mt-3 p-3 rounded-xl text-xs font-bold ${dark ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
                Current rate: <span className="text-cyan-500">{(currentRate * 100).toFixed(0)}%</span>
                {useDTA ? " (DTA reduced)" : " (standard)"}
              </div>
            </CalcCard>
          )}

          {/* Amount */}
          <CalcCard>
            <Label>{tr("paymentAmount")} (KHR)</Label>
            <NumInput value={amount} onChange={setAmount} />
            {amount > 0 && amount < 50000 && (
              <p className="mt-2 text-xs font-bold text-emerald-500">
                ✓ Under 50,000 ៛ — exempt per Circular 024 (2026)
              </p>
            )}
          </CalcCard>

          <div className="flex gap-3">
            <CalcButton onClick={calculate}>{tr("calculate")}</CalcButton>
            <CalcButton onClick={() => { setAmount(0); setResult(null); }} variant="ghost">{tr("reset")}</CalcButton>
          </div>
          <FormulaBox formula={`WHT = Gross Payment × Rate\nNet = Gross − WHT\n\nExemptions (Circular 024, 2026):\n• Payments < 50,000 KHR\n• Services with VAT invoice\n• Dividends to residents (0%)`} />
        </div>

        <div className="space-y-5">
          {result ? (
            result.exempt ? (
              <div className={`rounded-2xl border p-8 text-center ${dark ? "bg-emerald-900/20 border-emerald-800/40" : "bg-emerald-50 border-emerald-100"}`}>
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-black">✓</span>
                </div>
                <p className="font-black text-emerald-500 text-xl mb-2">Exempt</p>
                <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>{tr("exemptMsg")}</p>
                <p className={`text-lg font-black mt-4 ${dark ? "text-white" : "text-gray-900"}`}>{fmt(result.amount)}</p>
                <p className={`text-xs ${dark ? "text-gray-600" : "text-gray-400"}`}>Full amount goes to recipient</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <ResultBox label={tr("gross")} value={fmt(result.amount)} />
                  <ResultBox label={tr("withheld")} value={fmt(result.withheld)} accent />
                  <ResultBox label={tr("netPayment")} value={fmt(result.net)} />
                </div>
                <CalcCard>
                  <SectionTitle>Details</SectionTitle>
                  <ResultRow label="Recipient Type" value={isResident ? tr("resident") : tr("nonResident")} />
                  {isResident && <ResultRow label={tr("paymentType")} value={RESIDENT_RATES[paymentType]?.label.split(" / ")[0]} />}
                  {!isResident && <ResultRow label="DTA Applied" value={useDTA ? "Yes (10%)" : "No (14%)"} />}
                  <ResultRow label="WHT Rate" value={`${(result.rate * 100).toFixed(0)}%`} />
                  <ResultRow label="Gross Payment" value={fmt(result.amount)} />
                  <ResultRow label={tr("withheld")} value={fmt(result.withheld)} bold />
                  <ResultRow label={tr("netPayment")} value={fmt(result.net)} bold />
                </CalcCard>

                {/* WHT Rates reference */}
                <CalcCard>
                  <SectionTitle>WHT Rate Reference</SectionTitle>
                  <div className="space-y-1">
                    {Object.entries(RESIDENT_RATES).map(([k, v]) => (
                      <div key={k} className={`flex justify-between py-1.5 border-b last:border-0 text-xs
                        ${dark ? "border-gray-800" : "border-gray-100"}`}>
                        <span className={dark ? "text-gray-400" : "text-gray-500"}>{v.label}</span>
                        <span className={`font-bold ${v.rate === 0 ? "text-emerald-500" : dark ? "text-white" : "text-gray-900"}`}>
                          {(v.rate * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                    <div className={`flex justify-between py-1.5 border-b text-xs ${dark ? "border-gray-800" : "border-gray-100"}`}>
                      <span className={dark ? "text-gray-400" : "text-gray-500"}>Non-Resident (standard)</span>
                      <span className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>14%</span>
                    </div>
                    <div className={`flex justify-between py-1.5 text-xs`}>
                      <span className={dark ? "text-gray-400" : "text-gray-500"}>Non-Resident (DTA)</span>
                      <span className={`font-bold ${dark ? "text-white" : "text-gray-900"}`}>10%</span>
                    </div>
                  </div>
                </CalcCard>
              </>
            )
          ) : (
            <CalcCard className="flex flex-col items-center justify-center min-h-64 text-center">
              <CreditCard size={40} className={`mb-4 ${dark ? "text-gray-800" : "text-gray-200"}`} />
              <p className={`font-semibold ${dark ? "text-gray-600" : "text-gray-400"}`}>Enter payment details to calculate WHT</p>
            </CalcCard>
          )}
        </div>
      </div>
    </CalcShell>
  );
}
