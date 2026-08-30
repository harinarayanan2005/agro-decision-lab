import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const navItems = [
    { to: "/", label: "Crop Planner", icon: "🌾", badge: "AI Core" },
    { to: "/analytics", label: "Market Analytics", icon: "📊" },
    { to: "/disease-ai", label: "Disease AI", icon: "🍃", badge: "Scanner" },
    { to: "/fertilizer-ai", label: "Fertilizer Advisory", icon: "🧪" },
    { to: "/supply-chain", label: "Supply Chain", icon: "🔗" },
    { to: "/agri-ai", label: "Agri AI Assistant", icon: "🤖", badge: "Live" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon-wrap">
            <span>🌱</span>
          </div>
          <div className="logo-text-group">
            <h1 className="logo-text">AgriAI</h1>
            <span className="logo-subtext">Decision Intelligence</span>
          </div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-label">AI Decision Suite</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="system-status-card">
          <div className="status-left">
            <div className="status-pulse" />
            <span>ML Engine Active</span>
          </div>
          <span className="ai-engine-tag">v2.4</span>
        </div>
      </div>
    </aside>
  );
}