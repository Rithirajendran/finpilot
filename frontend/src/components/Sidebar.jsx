import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  // =========================================================
  // LOGOUT
  // =========================================================
  const handleLogout = () => {
    localStorage.removeItem("finpilot_token");
    localStorage.removeItem("finpilot_user");

    navigate("/login", { replace: true });
  };

  // =========================================================
  // NAVIGATION ITEM
  // =========================================================
  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "▣",
    },
    {
      path: "/transactions",
      label: "Transactions",
      icon: "↔",
    },
    {
      path: "/upload",
      label: "Upload Statement",
      icon: "↑",
    },
    {
      path: "/subscriptions",
      label: "Subscriptions",
      icon: "↻",
    },
    {
      path: "/budgets",
      label: "Budgets",
      icon: "◫",
    },
    {
      path: "/goals",
      label: "Savings Goals",
      icon: "◎",
    },
    {
      path: "/ai-assistant",
      label: "AI Assistant",
      icon: "✦",
    },
  ];

  // =========================================================
  // USER INFORMATION
  // =========================================================
  let user = null;

  try {
    const savedUser =
      localStorage.getItem("finpilot_user");

    if (savedUser) {
      user = JSON.parse(savedUser);
    }
  } catch (error) {
    console.error(
      "Unable to read FinPilot user:",
      error
    );
  }

  const userName =
    user?.name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "User";

  const userEmail =
    user?.email ||
    "";

  const userInitial =
    userName.charAt(0).toUpperCase();

  return (
    <aside className="finpilot-sidebar">

      {/* =====================================================
          LOGO
      ====================================================== */}
      <div className="sidebar-logo">

        <div className="logo-icon">
          F
        </div>

        <div className="logo-content">
          <h2>FINPILOT</h2>

          <span>
            AI FINANCE
          </span>
        </div>

      </div>


      {/* =====================================================
          NAVIGATION
      ====================================================== */}
      <nav className="sidebar-navigation">

        <div className="navigation-label">
          MAIN MENU
        </div>

        {navItems.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-nav-link ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >

            <span className="nav-icon">
              {item.icon}
            </span>

            <span className="nav-label">
              {item.label}
            </span>

          </NavLink>

        ))}

      </nav>


      {/* =====================================================
          BOTTOM SECTION
      ====================================================== */}
      <div className="sidebar-bottom">

        {/* USER PROFILE */}
        <div className="sidebar-user">

          <div className="user-avatar">
            {userInitial}
          </div>

          <div className="user-details">

            <strong>
              {userName}
            </strong>

            {userEmail && (
              <span>
                {userEmail}
              </span>
            )}

          </div>

        </div>


        {/* LOGOUT BUTTON */}
        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >

          <span className="logout-icon">
            ↪
          </span>

          <span>
            Logout
          </span>

        </button>

      </div>

    </aside>
  );
}

export default Sidebar;