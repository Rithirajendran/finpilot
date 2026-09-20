import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Transactions from "./pages/Transactions";
import Subscriptions from "./pages/Subscriptions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Insights from "./pages/Insights";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import Obligations from "./pages/Obligations";
import FinancialInsights from "./pages/FinancialInsights";

import "./App.css";

function Layout() {
  return (
    <div className="app-layout">

      <aside className="sidebar">

        <div className="logo">
          FinPilot
        </div>

        <nav>

          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/upload"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Upload Statement
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Transactions
          </NavLink>

          <NavLink
            to="/subscriptions"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Subscriptions
          </NavLink>

          <NavLink
            to="/budgets"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Budgets
          </NavLink>

          <NavLink
            to="/goals"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Goals
          </NavLink>

          <NavLink
            to="/insights"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Insights
          </NavLink>

          <NavLink
            to="/ai-assistant"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            AI Assistant
          </NavLink>

          <NavLink
            to="/obligations"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Obligations
          </NavLink>
          <NavLink
            to="/financial-insights"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Financial Insights
          </NavLink>

          <NavLink
            to="/Settings"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Settings
          </NavLink>

        </nav>

      </aside>

      <main className="main-content">

        <Routes>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/upload"
            element={<Upload />}
          />

          <Route
            path="/transactions"
            element={<Transactions />}
          />

          <Route
            path="/subscriptions"
            element={<Subscriptions />}
          />

          <Route
            path="/budgets"
            element={<Budgets />}
          />

          <Route
            path="/goals"
            element={<Goals />}
          />

          <Route
            path="/insights"
            element={<Insights />}
          />

          <Route
            path="/ai-assistant"
            element={<AIAssistant />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />
          <Route
             path="/obligations"
             element={<Obligations />}
           />
           <Route
            path="/financial-insights"
            element={<FinancialInsights />}
          /> 

        </Routes>

      </main>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;