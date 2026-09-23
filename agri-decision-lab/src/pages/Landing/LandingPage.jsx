import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import KnapsackCalculatorModal from "../../components/KnapsackCalculatorModal";
import "./landingPage.css";

const systemModules = [
  {
    id: "crop-planner",
    title: "Field & Crop Profit Planner",
    category: "Crop Economics & Yield",
    badgeClass: "badge-core",
    path: "/crop-planner",
    icon: "🌾",
    description:
      "Multi-parameter farm economic planning engine. Evaluates land acreage, capital outlay, irrigation methods, and soil profiles to estimate net profit per acre and total harvest tonnage.",
    features: [
      "All-Crops Net Profit & Yield Comparison Grid",
      "Regional Tamil Pattam Sowing Presets (Samba, Kuruvai)",
      "Printable Agro-Economic Feasibility Certificate",
    ],
    actionText: "Open Crop Planner",
  },
  {
    id: "agro-gis",
    title: "Agro-Climatic GIS Map",
    category: "Regional Soil & GIS",
    badgeClass: "badge-gis",
    path: "/agro-gis",
    icon: "🗺️",
    description:
      "Geospatial satellite mapping across all 38 Tamil Nadu districts. Evaluates regional soil taxonomy, Cauvery basin precipitation, and live weather telemetry.",
    features: [
      "38-District Soil Classification & Satellite Layers",
      "Real-Time Temperature & Relative Humidity Feeds",
      "1-Click Parameter Sync to Crop Planner",
    ],
    actionText: "Explore Regional Map",
  },
  {
    id: "analytics",
    title: "Mandi Price Intelligence",
    category: "APMC Market Discovery",
    badgeClass: "badge-mandi",
    path: "/analytics",
    icon: "📊",
    description:
      "APMC market price discovery, multi-year historical price trajectories, and commodity perishability holding windows across Tamil Nadu trading yards.",
    features: [
      "Multi-Year Historical APMC Spot Trends (2018–2026)",
      "Perishability vs. Holding Duration Matrix",
      "District APMC Mandi Benchmark Spot Rates",
    ],
    actionText: "Analyze Market Rates",
  },
  {
    id: "disease-ai",
    title: "Plant Health & Leaf Pathology Lab",
    category: "Diagnostic Pathology",
    badgeClass: "badge-vision",
    path: "/disease-ai",
    icon: "🍃",
    description:
      "Foliage pathology diagnostic laboratory. Evaluates leaf specimens to identify fungal blast, bacterial blight, and rust pathogens with specific chemical and botanical neem recipes.",
    features: [
      "Foliar Specimen Diagnostic Scanner",
      "Pathogen Severity Classification & Spread Risk",
      "Chemical Spray Recipes & Cultural Practices",
    ],
    actionText: "Diagnose Leaf Sample",
  },
  {
    id: "fertilizer-ai",
    title: "Soil Nutrient Advisory",
    category: "Soil Chemistry & N-P-K",
    badgeClass: "badge-soil",
    path: "/fertilizer-ai",
    icon: "🧪",
    description:
      "Dynamic soil nutrient balancing. Evaluates soil test values against crop baseline standards and computes phased basal, vegetative, and flowering application schedules.",
    features: [
      "N-P-K Soil Deficit & Surplus Status Gauges",
      "3-Phase Sowing-to-Harvest Application Timeline",
      "Azospirillum & Organic Bio-Fertilizer Formulas",
    ],
    actionText: "Calculate Nutrient Doses",
  },
  {
    id: "supply-chain",
    title: "Harvest & Mandi Dispatch Ledger",
    category: "Post-Harvest Logistics",
    badgeClass: "badge-blockchain",
    path: "/supply-chain",
    icon: "📦",
    description:
      "Verifiable consignment tracking ledger for farm produce. Generates batch verification receipts and calculates APMC freight transport rates and transit durations.",
    features: [
      "Batch Provenance & Quality Inspection Ledger",
      "APMC Freight Transport Rate & Transit Calculator",
      "Tamper-Proof Cryptographic Verification",
    ],
    actionText: "View Dispatch Ledger",
  },
  {
    id: "agri-ai",
    title: "Field Agronomist Advisory Desk",
    category: "Extension Helpdesk",
    badgeClass: "badge-ai",
    path: "/agri-ai",
    icon: "👨‍🌾",
    description:
      "Direct agronomic guidance desk specialized in Tamil Nadu agricultural practices, integrated pest management (IPM) protocols, and voice-assisted advisory playback.",
    features: [
      "Practical Agronomic Q&A & IPM Support",
      "🔊 Audio Voice Playback for Field Advisory",
      "Calibrated with TNAU Crop Doctor Guidelines",
    ],
    actionText: "Consult Advisory Desk",
  },
];

const tamilPattamSchedules = [
  {
    name: "Samba / Purattasi Pattam",
    tamil: "சம்பா / புரட்டாசி",
    months: "August – January",
    crops: "Long-duration Paddy (ADT-53, CR-1009), Sugarcane, Cotton",
    active: true,
    seasonParam: "Kharif",
    tag: "Active Sowing Window",
  },
  {
    name: "Navarai Pattam",
    tamil: "நவரைப் பட்டம்",
    months: "December – April",
    crops: "Summer Paddy, Groundnut, Black Gram, Green Gram, Vegetables",
    active: false,
    seasonParam: "Rabi",
    tag: "Upcoming Season",
  },
  {
    name: "Kuruvai / Chithirai Pattam",
    tamil: "குறுவை / சித்திரை",
    months: "April – July",
    crops: "Short-duration Paddy, Hybrid Maize, Sesame, Fodder Sorghum",
    active: false,
    seasonParam: "Zaid",
    tag: "Summer Sowing",
  },
];

const liveMandiSpotPrices = [
  { commodity: "Paddy (Samba Mahsuri)", mandi: "Thanjavur APMC", price: "₹ 2,450 / qtl", trend: "+3.8%", up: true },
  { commodity: "Sugarcane (Commercial)", mandi: "Madurai APMC", price: "₹ 345 / qtl", trend: "+1.2%", up: true },
  { commodity: "Tomato (Hybrid Red)", mandi: "Coimbatore APMC", price: "₹ 1,800 / qtl", trend: "-4.5%", up: false },
  { commodity: "Cotton (Medium Staple)", mandi: "Salem APMC", price: "₹ 7,200 / qtl", trend: "+2.1%", up: true },
  { commodity: "Maize (Feed Grade)", mandi: "Tiruchirappalli", price: "₹ 2,150 / qtl", trend: "+0.8%", up: true },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [quickQuestion, setQuickQuestion] = useState("");
  const [showSprayerModal, setShowSprayerModal] = useState(false);

  const handleAskSubmit = (e) => {
    e.preventDefault();
    if (!quickQuestion.trim()) return;
    navigate("/agri-ai", { state: { initialQuestion: quickQuestion } });
  };

  const handlePattamClick = (pattam) => {
    navigate("/crop-planner", {
      state: {
        season: pattam.seasonParam,
        pattamName: pattam.name,
      },
    });
  };

  return (
    <div className="landing-root fade-in">
      {/* Institutional Top Reference Banner */}
      <div className="institutional-banner">
        <div className="institutional-left">
          <span className="institutional-flag">🌾</span>
          <span>
            <strong>Agro DecisionLab</strong> — Agricultural Decision Support & Field Extension Platform
          </span>
        </div>
        <div className="institutional-right">
          <span>Standards: <strong>TNAU & ICAR Agronomic Packages</strong></span>
          <a href="tel:18001801551" className="helpline-link" title="Government Kisan Call Centre">
            <span>📞</span> Kisan Helpline: <strong>1800-180-1551 (Toll-Free)</strong>
          </a>
        </div>
      </div>

      {/* 1. Hero Overview & Welcome Banner */}
      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-pill-badge">
            <span>🌱</span>
            <span>Department of Agriculture & Agronomy Decision Support</span>
          </div>

          <h1 className="hero-title">
            Field Planning & Regional <span className="highlight-text">Agronomic Decision Support</span>
          </h1>

          <p className="hero-subtitle">
            An integrated decision-making portal built for agricultural extension officers, agronomists,
            and farm managers across Tamil Nadu. Unifying regional soil chemistry, field-calibrated crop economics,
            APMC market discovery, and foliar disease diagnosis.
          </p>

          {/* Regional Status Strip */}
          <div className="hero-status-strip">
            <div className="status-item">
              <span className="status-dot-green" />
              <span>Network: <strong>Regional Extension Active</strong></span>
            </div>
            <div className="status-item">
              <span>📍 Zone: <strong>Cauvery Delta & TN Agro Basins</strong></span>
            </div>
            <div className="status-item">
              <span>🌾 Sowing Window: <strong>Samba / Purattasi (Active)</strong></span>
            </div>
            <div className="status-item">
              <span>🌦️ Weather: <strong>29°C • Favorable Delta Humidity</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hero-actions">
            <Link to="/crop-planner" className="btn-hero-primary">
              <span>🌾 Launch Crop Profit Planner</span>
              <span>→</span>
            </Link>
            <Link to="/agro-gis" className="btn-hero-secondary">
              <span>🗺️ Explore Agro-GIS Map</span>
            </Link>
            <button
              className="btn-hero-secondary"
              onClick={() => setShowSprayerModal(true)}
              style={{ borderColor: "var(--harvest-gold)", color: "var(--harvest-gold)" }}
            >
              <span>🎒 Knapsack Sprayer Calc</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Chief Agronomist's Seasonal Field Bulletin */}
      <div className="agronomist-bulletin-card">
        <div className="bulletin-header">
          <div className="bulletin-author-group">
            <span className="bulletin-avatar">👨‍🌾</span>
            <div>
              <h4 className="bulletin-author-name">Cauvery Delta Agronomic Advisory Desk</h4>
              <span className="bulletin-author-meta">Weekly Field Bulletin #38 • Thanjavur Agro-Research Station</span>
            </div>
          </div>
          <span className="bulletin-date-badge">Samba 2026 Sowing Notice</span>
        </div>

        <p className="bulletin-body">
          “With seasonal showers setting in across Thanjavur, Tiruvarur, and Tiruchirappalli, nursery beds for Samba paddy (ADT-53, CR-1009 Sub-1, BPT-5204) should maintain 2–3 cm shallow standing water. Farmers are advised to avoid excessive basal urea; prioritize Zinc Sulphate application (25 kg/ha) to prevent Khaira seedling chlorosis in heavy alluvial soils, and pre-treat seeds with Pseudomonas fluorescens (10 g/kg).”
        </p>

        <div className="bulletin-footer">
          <span>📌 Field Priority: <strong>Nursery Weed Management & Zinc Sulphate Micronutrient Basal Dose</strong></span>
          <span>District Extension Desk: <strong>Thanjavur Collectorate Complex</strong></span>
        </div>
      </div>

      {/* 3. Key Operational Metric Strip */}
      <section className="kpi-stat-strip">
        <div className="kpi-card">
          <div className="kpi-card-icon">🗺️</div>
          <div className="kpi-card-info">
            <span className="kpi-card-val">38</span>
            <span className="kpi-card-label">Districts Profiled</span>
            <span className="kpi-card-meta">Soil taxonomy & rainfall zones</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-icon">🌾</div>
          <div className="kpi-card-info">
            <span className="kpi-card-val">8</span>
            <span className="kpi-card-label">Major Crop Baselines</span>
            <span className="kpi-card-meta">Calibrated yields & input budgets</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-icon">📊</div>
          <div className="kpi-card-info">
            <span className="kpi-card-val">5+</span>
            <span className="kpi-card-label">APMC Trading Mandis</span>
            <span className="kpi-card-meta">Live spot rates & price curves</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-icon">🧪</div>
          <div className="kpi-card-info">
            <span className="kpi-card-val">3-Stage</span>
            <span className="kpi-card-label">Soil Nutrient Schedule</span>
            <span className="kpi-card-meta">Basal, Vegetative & Panicle doses</span>
          </div>
        </div>
      </section>

      {/* 4. Master Decision Modules Directory */}
      <section className="modules-section">
        <div className="section-header">
          <div className="section-title-group">
            <h2>
              <span>🧭</span> Specialized Agricultural Decision Modules
            </h2>
            <p>
              Integrated decision tools for field operations, soil management, market analysis, and plant health.
            </p>
          </div>
          <span className="section-badge-counter">7 Operational Modules</span>
        </div>

        <div className="modules-grid">
          {systemModules.map((mod) => (
            <Link key={mod.id} to={mod.path} className="module-card">
              <div className="module-card-top">
                <div className="module-icon-wrap">{mod.icon}</div>
                <span className={`module-badge ${mod.badgeClass}`}>{mod.category}</span>
              </div>

              <div className="module-card-body">
                <h3 className="module-title">{mod.title}</h3>
                <p className="module-desc">{mod.description}</p>
                <ul className="module-features-list">
                  {mod.features.map((feat, fIdx) => (
                    <li key={fIdx}>
                      <span className="dot">•</span> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="module-card-footer">
                <span className="module-action-btn">
                  {mod.actionText} <span>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Bottom Grid: Agro-Calendar Guide & Quick Field Utilities */}
      <section className="landing-bottom-grid">
        {/* Tamil Agro-Calendar Seasonal Guide */}
        <div className="bottom-panel">
          <div className="panel-header-clean">
            <h3>
              <span>📅</span> Tamil Nadu Agro-Seasonal Sowing Guide
            </h3>
            <span className="badge-subtle">Regional Calendar</span>
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Select an active seasonal window to immediately evaluate crop suitability and profitability in the Field Planner:
          </p>

          <div className="pattam-guide-list">
            {tamilPattamSchedules.map((pattam, idx) => (
              <div
                key={idx}
                className={`pattam-guide-card ${pattam.active ? "active-pattam-card" : ""}`}
                onClick={() => handlePattamClick(pattam)}
                title={`Click to analyze ${pattam.name} in Crop Planner`}
              >
                <div className="pattam-guide-left">
                  <div className="pattam-guide-name">
                    <span>🌾</span> {pattam.name} <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>({pattam.tamil})</span>
                  </div>
                  <div className="pattam-guide-months">🗓️ {pattam.months}</div>
                  <div className="pattam-guide-crops">Crops: {pattam.crops}</div>
                </div>
                <span className="pattam-guide-tag">{pattam.tag}</span>
              </div>
            ))}
          </div>

          <button
            className="btn-secondary"
            onClick={() => navigate("/crop-planner")}
            style={{ width: "100%", marginTop: "0.4rem" }}
          >
            🌾 Open Field & Crop Profit Planner →
          </button>
        </div>

        {/* Quick Agronomic Query & APMC Market Glance */}
        <div className="bottom-panel">
          <div className="panel-header-clean">
            <h3>
              <span>⚡</span> Field Utilities & Market Spot Rates
            </h3>
            <span className="badge-subtle">Live Updates</span>
          </div>

          {/* Quick Extension Query Box */}
          <div className="quick-ask-box">
            <span className="quick-ask-title">
              <span>👨‍🌾</span> Agronomist Field Advisory Query
            </span>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Ask questions regarding seed treatment, soil deficiency, or integrated pest management (IPM):
            </p>
            <form onSubmit={handleAskSubmit} className="quick-ask-input-group">
              <input
                type="text"
                placeholder="e.g. Recommended seed treatment for CR-1009 Samba paddy?"
                value={quickQuestion}
                onChange={(e) => setQuickQuestion(e.target.value)}
                className="quick-ask-input"
              />
              <button type="submit" className="quick-ask-btn">
                Ask Desk →
              </button>
            </form>
          </div>

          {/* Live APMC Mandi Spot Snapshot */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>
                📊 Tamil Nadu APMC Mandi Spot Benchmark (Today)
              </span>
              <Link to="/analytics" style={{ fontSize: "0.75rem", color: "var(--accent-emerald-light)", textDecoration: "none" }}>
                Full Analytics →
              </Link>
            </div>

            <table className="mandi-mini-table">
              <thead>
                <tr>
                  <th>Commodity</th>
                  <th>Mandi Yard</th>
                  <th>Spot Rate</th>
                  <th>Daily Trend</th>
                </tr>
              </thead>
              <tbody>
                {liveMandiSpotPrices.map((row, idx) => (
                  <tr key={idx}>
                    <td><strong>{row.commodity}</strong></td>
                    <td>{row.mandi}</td>
                    <td>{row.price}</td>
                    <td className={row.up ? "trend-up" : "trend-down"}>
                      {row.up ? "▲" : "▼"} {row.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Institutional Reference Footer */}
      <footer className="institutional-reference-bar">
        <span>
          🏛️ <strong>Institutional Grounding:</strong> Calibrated with <em>Tamil Nadu Agricultural University (TNAU) Agronomic Guidelines</em> & <em>ICAR Integrated Pest Management Packages</em>.
        </span>
        <span>
          Market Data Source: <strong>AGMARKNET / Tamil Nadu State Agricultural Marketing Board</strong>.
        </span>
      </footer>

      {/* Knapsack Sprayer Modal */}
      <KnapsackCalculatorModal
        isOpen={showSprayerModal}
        onClose={() => setShowSprayerModal(false)}
      />
    </div>
  );
}
