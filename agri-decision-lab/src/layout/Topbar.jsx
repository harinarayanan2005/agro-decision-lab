import { useLocation } from "react-router-dom";

export default function Topbar() {
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case "/":
        return { name: "Crop Profit Planner", icon: "🌾", category: "Core AI" };
      case "/analytics":
        return { name: "Market & Mandi Analytics", icon: "📊", category: "Insights" };
      case "/disease-ai":
        return { name: "Crop Disease Scanner", icon: "🍃", category: "Vision AI" };
      case "/fertilizer-ai":
        return { name: "Fertilizer Advisory System", icon: "🧪", category: "Agronomy" };
      case "/supply-chain":
        return { name: "Supply Chain & Batch Traceability", icon: "🔗", category: "Logistics" };
      case "/agri-ai":
        return { name: "Agri AI Smart Assistant", icon: "🤖", category: "GenAI Chat" };
      default:
        return { name: "Dashboard", icon: "🌱", category: "Overview" };
    }
  };

  const page = getPageTitle(location.pathname);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="breadcrumb-badge">
          <span>{page.category}</span>
          <span>/</span>
          <span className="active-route">
            {page.icon} {page.name}
          </span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="weather-widget">
          <span>🌦️</span>
          <span>Tamil Nadu:</span>
          <span className="temp">29°C</span>
          <span style={{ color: "#34d399", fontSize: "0.75rem" }}>• Optimal Humidity</span>
        </div>

        <button className="icon-button" title="System Notifications" onClick={() => alert("All 6 AI Microservices are healthy and synchronized.")}>
          <span>🔔</span>
          <span className="notif-dot" />
        </button>

        <div className="user-profile-btn" title="Logged in as Agronomist / Farm Manager">
          <div className="user-avatar-circle">AG</div>
          <div className="user-meta">
            <span className="user-meta-name">Agro Lead</span>
            <span className="user-meta-role">TN Cluster #15</span>
          </div>
        </div>
      </div>
    </header>
  );
}