import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import KnapsackCalculatorModal from "../components/KnapsackCalculatorModal";

export default function Topbar() {
  const location = useLocation();
  const [showSprayerModal, setShowSprayerModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("agro_theme") || "forest-dark";
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Apply theme attribute to root <html> tag
  useEffect(() => {
    if (currentTheme === "forest-dark") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", "field-day");
    }
    localStorage.setItem("agro_theme", currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === "field-day" ? "forest-dark" : "field-day"));
  };

  // Click outside to close profile popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case "/":
        return { name: "Field Overview", icon: "🏠", category: "Extension Directorate" };
      case "/crop-planner":
      case "/planner":
        return { name: "Crop Profit Planner", icon: "🌾", category: "Agronomic Planning" };
      case "/agro-gis":
        return { name: "GIS Map & Live Weather", icon: "🗺️", category: "Spatial GIS" };
      case "/analytics":
        return { name: "Mandi Market Spot Intel", icon: "📊", category: "APMC Markets" };
      case "/disease-ai":
        return { name: "Leaf Pathology Lab", icon: "🍃", category: "Diagnostic Lab" };
      case "/fertilizer-ai":
        return { name: "Soil Balancing & NPK", icon: "🧪", category: "Soil Chemistry" };
      case "/supply-chain":
        return { name: "Harvest & Dispatch", icon: "📦", category: "Logistics" };
      case "/agri-ai":
        return { name: "Agronomist Advisory Desk", icon: "👨‍🌾", category: "Agronomy Extension" };
      default:
        return { name: "Agro DecisionLab", icon: "🌱", category: "Overview" };
    }
  };

  const page = getPageTitle(location.pathname);
  const isLight = currentTheme === "field-day";

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <div className="breadcrumb-badge">
            <span className="breadcrumb-category">{page.category}</span>
            <span className="breadcrumb-separator">/</span>
            <span className="active-route">
              {page.icon} {page.name}
            </span>
          </div>
        </div>

        <div className="topbar-right">
          {/* Quick Farmer Sprayer Tool Button */}
          <button
            className="btn-secondary btn-sm sprayer-quick-btn"
            onClick={() => setShowSprayerModal(true)}
            title="Knapsack Sprayer Tank & Dilution Calculator (கரைசல் கணக்கீடு)"
          >
            <span>🎒</span>
            <span className="sprayer-btn-text" style={{ color: "var(--accent-amber)", fontWeight: 600 }}>Sprayer Calc</span>
          </button>

          {/* 2-Theme Instant Agricultural Switcher */}
          <button
            type="button"
            className="theme-trigger-btn"
            onClick={toggleTheme}
            title={isLight ? "Switch to Signature Forest Dark Theme" : "Switch to Field Day Daylight Light Theme"}
            aria-label="Theme toggle"
          >
            <span>{isLight ? "🌿" : "☀️"}</span>
            <span className="theme-trigger-label">
              {isLight ? "Forest Dark" : "Daylight Mode"}
            </span>
          </button>

          <div className="topbar-divider" />

          {/* Weather Widget */}
          <div className="weather-widget" title="Live Delta Agro-Climatic Data">
            <span>🌦️</span>
            <span>Cauvery Basin:</span>
            <span className="temp">29°C</span>
            <span className="weather-desc">• Favorable</span>
          </div>

          <div className="topbar-divider" />

          {/* Notifications */}
          <button
            className="icon-button"
            title="Regional Agronomic Bulletins (TNAU / Cauvery Basin)"
            onClick={() => alert("Tamil Nadu Agriculture Advisory: Favorable rainfall conditions expected for Samba/Thaladi sowing.")}
          >
            <span>🔔</span>
            <span className="notif-dot" />
          </button>

          {/* Clean User Profile Trigger */}
          <div className="user-profile-wrapper" ref={userMenuRef}>
            <div
              className="user-profile-btn"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              title="Official Terminal Profile"
            >
              <div className="user-avatar-circle">👤</div>
            </div>

            {userMenuOpen && (
              <div className="user-popover-menu">
                <div className="user-popover-header">
                  <div className="user-popover-avatar">👤</div>
                  <div className="user-popover-title-group">
                    <h4>Agro DecisionLab Terminal</h4>
                    <p>Extension Directorate Officer</p>
                  </div>
                </div>

                <div className="user-popover-meta-list">
                  <div className="user-popover-meta-item">
                    <span className="user-popover-meta-label">Terminal:</span>
                    <span>Cauvery Delta KVK Hub</span>
                  </div>
                  <div className="user-popover-meta-item">
                    <span className="user-popover-meta-label">Status:</span>
                    <span style={{ color: "var(--accent-leaf)", fontWeight: 600 }}>● Active Session</span>
                  </div>
                </div>

                <div className="user-popover-actions">
                  <button
                    type="button"
                    className="user-popover-btn"
                    onClick={() => {
                      setUserMenuOpen(false);
                      alert("Officer Profile Session Active.\nAgro DecisionLab Platform.");
                    }}
                  >
                    <span>ID Credentials Verified</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Interactive Knapsack Sprayer Modal */}
      <KnapsackCalculatorModal
        isOpen={showSprayerModal}
        onClose={() => setShowSprayerModal(false)}
      />
    </>
  );
}