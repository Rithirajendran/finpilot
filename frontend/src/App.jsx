import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

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
import ExpenseComparison from "./pages/ExpenseComparison";

import "./App.css";


function Layout() {
  return (
    <div className="app-layout">

      {/* ============================= */}
      {/* SIDEBAR */}
      {/* ============================= */}

      <aside className="sidebar">

        <div className="logo">
          FinPilot
        </div>

        <nav>

          {/* Dashboard */}

          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            Dashboard
          </NavLink>


          {/* Upload */}

          <NavLink
            to="/upload"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            Upload Statement
          </NavLink>


          {/* Transactions */}

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            Transactions
          </NavLink>


          {/* Subscriptions */}

          <NavLink
            to="/subscriptions"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            Subscriptions
          </NavLink>


          {/* Budgets */}

          <NavLink
            to="/budgets"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            Budgets
          </NavLink>


          {/* Goals */}

          <NavLink
            to="/goals"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            Goals
          </NavLink>


          {/* Insights */}

          <NavLink
            to="/insights"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            Insights
          </NavLink>


          {/* AI Assistant */}

          <NavLink
            to="/ai-assistant"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            AI Assistant
          </NavLink>


          {/* Obligations */}

          <NavLink
            to="/obligations"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            Obligations
          </NavLink>


          {/* Financial Insights */}

          <NavLink
            to="/financial-insights"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            Financial Insights
          </NavLink>


          {/* Expense Comparison */}

          <NavLink
            to="/expense-comparison"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            Expense Comparison
          </NavLink>


          {/* Settings */}

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            Settings
          </NavLink>

        </nav>

      </aside>


      {/* ============================= */}
      {/* MAIN CONTENT */}
      {/* ============================= */}

      <main className="main-content">

        <Routes>

          {/* Dashboard */}

          <Route
            path="/"
            element={<Dashboard />}
          />


          {/* Upload */}

          <Route
            path="/upload"
            element={<Upload />}
          />


          {/* Transactions */}

          <Route
            path="/transactions"
            element={<Transactions />}
          />


          {/* Subscriptions */}

          <Route
            path="/subscriptions"
            element={<Subscriptions />}
          />


          {/* Budgets */}

          <Route
            path="/budgets"
            element={<Budgets />}
          />


          {/* Goals */}

          <Route
            path="/goals"
            element={<Goals />}
          />


          {/* Insights */}

          <Route
            path="/insights"
            element={<Insights />}
          />


          {/* AI Assistant */}

          <Route
            path="/ai-assistant"
            element={<AIAssistant />}
          />


          {/* Obligations */}

          <Route
            path="/obligations"
            element={<Obligations />}
          />


          {/* Financial Insights */}

          <Route
            path="/financial-insights"
            element={<FinancialInsights />}
          />


          {/* Expense Comparison */}

          <Route
            path="/expense-comparison"
            element={<ExpenseComparison />}
          />


          {/* Settings */}

          <Route
            path="/settings"
            element={<Settings />}
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