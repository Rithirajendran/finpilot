import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Transactions from "./pages/Transactions";
import Subscriptions from "./pages/Subscriptions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import Obligations from "./pages/Obligations";
import FinancialInsights from "./pages/FinancialInsights";
import ExpenseComparison from "./pages/ExpenseComparison";
import MonthlyFinancialSummary from "./pages/MonthlyFinancialSummary";

import "./App.css";


/* =========================================================
   SIDEBAR + MAIN APPLICATION LAYOUT
   ========================================================= */

function Layout() {
  return (
    <div className="app-layout">

      {/* ===================================================
          SIDEBAR
          =================================================== */}

      <aside className="sidebar">

        <div className="logo">
          FinPilot
        </div>

        <nav>

          {/* Dashboard */}

          <NavLink
            to="/dashboard"
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


          {/* Monthly Summary */}

          <NavLink
            to="/monthly-summary"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            Monthly Summary
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


      {/* ===================================================
          MAIN CONTENT
          =================================================== */}

      <main className="main-content">

        <Routes>

          {/* ===============================================
              DASHBOARD
              =============================================== */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />


          {/* ===============================================
              UPLOAD
              =============================================== */}

          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />


          {/* ===============================================
              TRANSACTIONS
              =============================================== */}

          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />


          {/* ===============================================
              SUBSCRIPTIONS
              =============================================== */}

          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <Subscriptions />
              </ProtectedRoute>
            }
          />


          {/* ===============================================
              BUDGETS
              =============================================== */}

          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <Budgets />
              </ProtectedRoute>
            }
          />


          {/* ===============================================
              GOALS
              =============================================== */}

          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            }
          />


          {/* ===============================================
              AI ASSISTANT
              =============================================== */}

          <Route
            path="/ai-assistant"
            element={
              <ProtectedRoute>
                <AIAssistant />
              </ProtectedRoute>
            }
          />


          {/* ===============================================
              OBLIGATIONS
              =============================================== */}

          <Route
            path="/obligations"
            element={
              <ProtectedRoute>
                <Obligations />
              </ProtectedRoute>
            }
          />


          {/* ===============================================
              FINANCIAL INSIGHTS
              =============================================== */}

          <Route
            path="/financial-insights"
            element={
              <ProtectedRoute>
                <FinancialInsights />
              </ProtectedRoute>
            }
          />


          {/* ===============================================
              EXPENSE COMPARISON
              =============================================== */}

          <Route
            path="/expense-comparison"
            element={
              <ProtectedRoute>
                <ExpenseComparison />
              </ProtectedRoute>
            }
          />


          {/* ===============================================
              MONTHLY SUMMARY
              =============================================== */}

          <Route
            path="/monthly-summary"
            element={
              <ProtectedRoute>
                <MonthlyFinancialSummary />
              </ProtectedRoute>
            }
          />


          {/* ===============================================
              SETTINGS
              =============================================== */}

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

        </Routes>

      </main>

    </div>
  );
}


/* =========================================================
   MAIN APP
   ========================================================= */

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            LOGIN
            No Sidebar
            ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =================================================
            REGISTER
            No Sidebar
            ================================================= */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =================================================
            APPLICATION
            Sidebar + Protected Pages
            ================================================= */}

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            ROOT
            Send user to Login
            ================================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;