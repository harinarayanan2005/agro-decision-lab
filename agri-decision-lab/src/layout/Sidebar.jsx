import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const navItems = [
    { to: "/", label: "Overview & Bulletins", icon: "🏠" },
    { to: "/crop-planner", label: "Field & Crop Planner", icon: "🌾" },
    { to: "/agro-gis", label: "Agro-Climatic GIS Map", icon: "🗺️" },
    { to: "/analytics", label: "Mandi Price Intelligence", icon: "📊" },
    { to: "/disease-ai", label: "Plant Health & Pathology", icon: "🍃" },
    { to: "/fertilizer-ai", label: "Soil Nutrient Advisory", icon: "🧪" },
    { to: "/supply-chain", label: "Harvest & Mandi Dispatch", icon: "📦" },
    { to: "/agri-ai", label: "Agronomist Advisory Desk", icon: "👨‍🌾" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon-wrap">
            <span>🌱</span>
          </div>
          <div className="logo-text-group">
            <h1 className="logo-text">Agro DecisionLab</h1>
            <span className="logo-subtext">Agricultural Decision Intelligence</span>
          </div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-label">Decision Modules</div>
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
            <span>TN Agro-Climatic Zone</span>
          </div>
          <span className="ai-engine-tag">Samba 2026</span>
        </div>
      </div>
    </aside>
  );
}