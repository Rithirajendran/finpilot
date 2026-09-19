import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Subscriptions from "./pages/Subscriptions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Insights from "./pages/Insights";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Dashboard />} />

        <Route path="/transactions" element={<Transactions />} />

        <Route path="/subscriptions" element={<Subscriptions />} />

        <Route path="/budgets" element={<Budgets />} />

        <Route path="/goals" element={<Goals />} />

        <Route path="/insights" element={<Insights />} />

        <Route path="/ai-assistant" element={<AIAssistant />} />

        <Route path="/settings" element={<Settings />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;