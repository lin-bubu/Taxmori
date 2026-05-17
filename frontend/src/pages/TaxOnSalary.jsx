import { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { CalcShell, CalcCard, Label, NumInput, Toggle, TabSwitch, CalcButton, ResultBox, ResultRow, FormulaBox, SectionTitle } from "../components/UI";
import { Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const BRACKETS = [
  { min: 0, max: 1500000, rate: 0, offset: 0 },
  { min: 1500001, max: 2000000, rate: 0.05, offset: 75000 },
  { min: 2000001, max: 8500000, rate: 0.10, offset: 175000 },
  { min: 8500001, max: 12500000, rate: 0.15, offset: 600000 },
  { min: 12500001, max: Infinity, rate: 0.20, offset: 1225000 },
];

const BRACKET_COLORS = ["#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8"];

function calcProgressive(income) {
  const bracket = BRACKETS.find(b => income >= b.min && income <= b.max);
  
  if (!bracket) return { tax: 0, bkd: [] };
  
  const tax = Math.max(0, income * bracket.rate - bracket.offset);
  const bkd = tax > 0 ? [{ rate: bracket.rate, amount: income, tax }] : [];
  
  return { tax, bkd };
}

export default function TaxOnSalary() {
  const { tr, fmt, dark } = useContext(AppContext);
  const [resident, setResident] = useState(true);
  const [salary, setSalary] = useState(0);
  const [salaryDisplay, setSalaryDisplay] = useState("");
  const [spouse, setSpouse] = useState(0);
  const [kids, setKids] = useState(0);
  const [result, setResult] = useState(null);

  // Auto-calculate whenever inputs change
  useEffect(() => {
    calculate();
  }, [salary, spouse, kids, resident]);

  const calculate = () => {
    const gross = salary;
    
    let salaryTax = 0;
    let spouseRebate = 0;
    let childRebate = 0;
    let deductions = 0;
    let taxable = 0;
    let bkd = [];
    
    if (resident) {
      spouseRebate = spouse * 150000;
      childRebate = kids * 150000;
      deductions = spouseRebate + childRebate;
      taxable = Math.max(0, gross - deductions);
      const r = calcProgressive(taxable);
      salaryTax = r.tax;
      bkd = r.bkd;
    } else {
      taxable = gross;
      salaryTax = gross * 0.20;
      bkd = [{ rate: 0.20, amount: gross, tax: salaryTax }];
    }
    
    const totalTax = salaryTax;
    const net = gross - totalTax;
    const effRate = gross > 0 ? (totalTax / gross) * 100 : 0;
    
    setResult({ 
      gross, 
      spouseRebate, 
      childRebate, 
      deductions, 
      taxable, 
      salaryTax,
      totalTax,
      net, 
      effRate, 
      bkd 
    });
  };

  const handleSalaryChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = value === '' ? 0 : parseInt(value, 10);
      setSalary(numValue);
      setSalaryDisplay(value === '' ? '' : numValue.toLocaleString());
    }
  };

  const reset = () => {
    setSalary(0);
    setSalaryDisplay("");
    setSpouse(0);
    setKids(0);
  };

  const donutData = result && result.gross > 0 ? [
    { name: "Net Salary", value: result.net, color: "#10b981", percentage: ((result.net / result.gross) * 100).toFixed(0) },
    { name: "Salary Tax", value: result.salaryTax, color: "#ef4444", percentage: ((result.salaryTax / result.gross) * 100).toFixed(0) },
    ...(result.deductions > 0 ? [{ name: "Deductions", value: result.deductions, color: "#f59e0b", percentage: ((result.deductions / result.gross) * 100).toFixed(0) }] : []),
  ] : [];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className={`px-3 py-2 rounded-xl shadow-lg text-xs font-semibold border ${dark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-100 text-gray-800"}`}>
        <p>{data.name}</p>
        <p className="font-black mt-0.5" style={{ color: data.color }}>{data.percentage}%</p>
        <p className={`text-xs mt-1 ${dark ? "text-gray-500" : "text-gray-400"}`}>{fmt(data.value)}</p>
      </div>
    );
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex flex-col gap-3 justify-center h-full">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: entry.color }}></div>
            <span className={`text-sm font-medium ${dark ? "text-gray-300" : "text-gray-700"}`}>
              {entry.value} {entry.payload.percentage}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <CalcShell title={tr("tos")} badge="TOS" color="#3b82f6" lightBg="#eff6ff" darkBg="#1e3a5f" icon={Calculator}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="space-y-5">
          <CalcCard>
            <SectionTitle>Employee Type</SectionTitle>
            <TabSwitch
              value={resident ? "resident" : "nonresident"}
              onChange={v => setResident(v === "resident")}
              options={[{ value: "resident", label: tr("resident") }, { value: "nonresident", label: tr("nonResident") }]}
            />
          </CalcCard>

          <CalcCard>
            <h3 className={`text-2xl font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>Enter your salary</h3>
            <div className="space-y-4">
              <div>
                <Label>Monthly Salary (KHR)</Label>
                <input
                  type="text"
                  value={salaryDisplay}
                  onChange={handleSalaryChange}
                  placeholder="0"
                  className={`w-full px-4 py-3 rounded-xl text-lg font-semibold transition-colors ${
                    dark 
                      ? "bg-gray-800 text-white border-gray-700 focus:border-blue-500" 
                      : "bg-gray-50 text-gray-900 border-gray-200 focus:border-blue-500"
                  } border-2 outline-none`}
                />
              </div>
            </div>
          </CalcCard>

          {resident && (
            <CalcCard>
              <h3 className={`text-2xl font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>Deductions</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className={`text-base font-semibold ${dark ? "text-white" : "text-gray-900"}`}>Dependent Children</p>
                      <p className={`text-sm ${dark ? "text-gray-500" : "text-gray-500"}`}>Children under 14 or students under 25</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setKids(Math.max(0, kids - 1))}
                        className={`w-10 h-10 rounded-lg font-bold text-lg transition-colors ${dark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>−</button>
                      <span className={`text-xl font-bold w-8 text-center ${dark ? "text-white" : "text-gray-900"}`}>{kids}</span>
                      <button onClick={() => setKids(kids + 1)}
                        className={`w-10 h-10 rounded-lg font-bold text-lg transition-colors ${dark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>+</button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <p className={`text-base font-semibold ${dark ? "text-white" : "text-gray-900"}`}>Dependent Spouse</p>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSpouse(Math.max(0, spouse - 1))}
                        className={`w-10 h-10 rounded-lg font-bold text-lg transition-colors ${dark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>−</button>
                      <span className={`text-xl font-bold w-8 text-center ${dark ? "text-white" : "text-gray-900"}`}>{spouse}</span>
                      <button onClick={() => setSpouse(Math.min(1, spouse + 1))}
                        className={`w-10 h-10 rounded-lg font-bold text-lg transition-colors ${dark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            </CalcCard>
          )}

          <CalcCard>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${dark ? "text-gray-600" : "text-gray-500"}`}>Tax Brackets</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>0 - 1,500,000</span>
                <span className={`text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}>0%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>1,500,001 - 2,000,000</span>
                <span className={`text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}>5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>2,000,001 - 8,500,000</span>
                <span className={`text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}>10%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>8,500,001 - 12,500,000</span>
                <span className={`text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}>15%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>12,500,001+</span>
                <span className={`text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}>20%</span>
              </div>
            </div>
          </CalcCard>
        </div>

        <div className="space-y-5">
          {result && result.gross > 0 ? (
            <>
              <CalcCard>
                <SectionTitle>Salary Breakdown</SectionTitle>
                <div className="flex items-center justify-center gap-8">
                  <div style={{ width: '200px', height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={donutData} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={60} 
                          outerRadius={85} 
                          paddingAngle={2} 
                          dataKey="value"
                        >
                          {donutData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3">
                    {donutData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: entry.color }}></div>
                        <span className={`text-sm font-medium ${dark ? "text-gray-300" : "text-gray-700"}`}>
                          {entry.name} {entry.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CalcCard>

              <CalcCard>
                <SectionTitle>Breakdown</SectionTitle>
                <ResultRow label={tr("grossSalary")} value={fmt(result.gross)} />
                {result.spouseRebate > 0 && <ResultRow label={tr("spouseRebate")} value={`– ${fmt(result.spouseRebate)}`} />}
                {result.childRebate > 0 && <ResultRow label={`${tr("childRebate")} ×${kids}`} value={`– ${fmt(result.childRebate)}`} />}
                {resident && <ResultRow label={tr("deductions")} value={fmt(result.deductions)} />}
                <ResultRow label={tr("taxableIncome")} value={fmt(result.taxable)} />
                <ResultRow label="Salary Tax" value={fmt(result.salaryTax)} bold />
                <ResultRow label={tr("netSalary")} value={fmt(result.net)} bold />
              </CalcCard>

              <CalcCard>
                <p className={`text-xs font-bold uppercase tracking-wider ${dark ? "text-gray-600" : "text-gray-400"}`}>{tr("annualEst")}</p>
                <p className={`text-xl font-black mt-1 ${dark ? "text-white" : "text-gray-900"}`}>{fmt(result.totalTax * 12)}</p>
                <p className={`text-xs mt-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>Based on current monthly tax</p>
              </CalcCard>
            </>
          ) : (
            <CalcCard className="flex flex-col items-center justify-center min-h-64 text-center">
              <Calculator size={40} className={`mb-4 ${dark ? "text-gray-800" : "text-gray-200"}`} />
              <p className={`font-semibold ${dark ? "text-gray-600" : "text-gray-400"}`}>Enter salary details</p>
              <p className={`text-sm mt-1 ${dark ? "text-gray-700" : "text-gray-300"}`}>Results will appear here</p>
            </CalcCard>
          )}
        </div>
      </div>
    </CalcShell>
  );
}