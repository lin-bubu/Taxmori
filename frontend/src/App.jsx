import { useState, useContext } from "react";
import { AppProvider, AppContext } from "./context/AppContext";
import Navbar from "./components/Navbar";
import AIAssistant from "./components/AIAssistant";
import Home from "./pages/Home";
import TaxOnSalary from "./pages/TaxOnSalary";
import PrepaymentProfitTax from "./pages/PrepaymentProfitTax";
import PublicLightingTax from "./pages/PublicLightingTax";
import SpecificTax from "./pages/SpecificTax";
import AccommodationTax from "./pages/AccommodationTax";
import WithholdingTax from "./pages/WithholdingTax";

function AppContent() {
  const { dark } = useContext(AppContext);
  const [page, setPage] = useState("home");

  const pages = {
    home: <Home setActivePage={setPage} />,
    tos: <TaxOnSalary />,
    ppt: <PrepaymentProfitTax />,
    plt: <PublicLightingTax />,
    stp: <SpecificTax />,
    at: <AccommodationTax />,
    wht: <WithholdingTax />,
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className={`min-h-screen font-sans transition-colors duration-300 ${dark ? "bg-gray-950" : "bg-gray-50"}`}>
        <Navbar activePage={page} setActivePage={setPage} />
        <main>
          {pages[page] ?? <Home setActivePage={setPage} />}
        </main>
        <AIAssistant />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
