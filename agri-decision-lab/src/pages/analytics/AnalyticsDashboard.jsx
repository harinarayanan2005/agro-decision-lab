import { useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import "./analytics.css";

export default function AnalyticsDashboard() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [tab, setTab] = useState("mandi-trends");
  const [selectedCrop, setSelectedCrop] = useState("Rice (Paddy)");

  // Historical Mandi Price Trend Data (2018 - 2026)
  const mandiPriceHistory = [
    { year: "2018", Rice: 1750, Wheat: 1840, Sugarcane: 2750, Cotton: 5150, Tomato: 1200 },
    { year: "2019", Rice: 1815, Wheat: 1925, Sugarcane: 2750, Cotton: 5255, Tomato: 1450 },
    { year: "2020", Rice: 1868, Wheat: 1975, Sugarcane: 2850, Cotton: 5515, Tomato: 1600 },
    { year: "2021", Rice: 1940, Wheat: 2015, Sugarcane: 2900, Cotton: 5726, Tomato: 1850 },
    { year: "2022", Rice: 2040, Wheat: 2125, Sugarcane: 3050, Cotton: 6080, Tomato: 2100 },
    { year: "2023", Rice: 2183, Wheat: 2275, Sugarcane: 3150, Cotton: 6620, Tomato: 2450 },
    { year: "2024", Rice: 2300, Wheat: 2400, Sugarcane: 3300, Cotton: 7120, Tomato: 2800 },
    { year: "2025", Rice: 2450, Wheat: 2550, Sugarcane: 3450, Cotton: 7520, Tomato: 3100 },
    { year: "2026 (Est)", Rice: 2620, Wheat: 2710, Sugarcane: 3600, Cotton: 7950, Tomato: 3400 },
  ];

  // District-wise Tamil Nadu Mandi Spot Price Benchmark (₹ / Quintal)
  const districtPrices = [
    { district: "Thanjavur", price: 2650, arrivals: "1,200 MT", trend: "+4.2%" },
    { district: "Madurai", price: 2580, arrivals: "850 MT", trend: "+2.8%" },
    { district: "Coimbatore", price: 2710, arrivals: "1,450 MT", trend: "+5.1%" },
    { district: "Tiruchirappalli", price: 2600, arrivals: "920 MT", trend: "+1.9%" },
    { district: "Salem", price: 2680, arrivals: "1,100 MT", trend: "+3.6%" },
    { district: "Tirunelveli", price: 2550, arrivals: "740 MT", trend: "-0.5%" },
  ];

  // Volatility & Risk Indices
  const volatilityData = [
    { crop: "Rice", volatility: 12, storageLifeMonths: 18, demandScore: 95 },
    { crop: "Wheat", volatility: 14, storageLifeMonths: 12, demandScore: 90 },
    { crop: "Sugarcane", volatility: 8, storageLifeMonths: 6, demandScore: 88 },
    { crop: "Cotton", volatility: 22, storageLifeMonths: 24, demandScore: 82 },
    { crop: "Tomato", volatility: 48, storageLifeMonths: 1, demandScore: 98 },
    { crop: "Potato", volatility: 26, storageLifeMonths: 8, demandScore: 85 },
  ];

  return (
    <div className="analytics-root fade-in">
      {/* Header */}
      <div className="page-header-box">
        <div className="page-title-group">
          <h1>📊 Mandi Market Intelligence & Price Forecasting</h1>
          <p>Real-time agro commodity index, APMC mandi trends, price volatility & spot market analytics</p>
        </div>
      </div>

      {/* KPI Top Cards */}
      <div className="analytics-kpi-grid">
        <div className="glass-card kpi-stat-card">
          <div className="kpi-icon-box">📈</div>
          <div className="kpi-text-block">
            <span className="stat-label">Agri Mandi Spot Index</span>
            <span className="stat-number">₹ 2,620 <small className="text-emerald">+4.8%</small></span>
            <span className="stat-subtext">Weighted APMC TN Composite</span>
          </div>
        </div>

        <div className="glass-card kpi-stat-card">
          <div className="kpi-icon-box">🏛️</div>
          <div className="kpi-text-block">
            <span className="stat-label">Active Mandi Terminals</span>
            <span className="stat-number">28 <small className="text-cyan">Live</small></span>
            <span className="stat-subtext">Integrated TN e-NAM Nodes</span>
          </div>
        </div>

        <div className="glass-card kpi-stat-card">
          <div className="kpi-icon-box">⚡</div>
          <div className="kpi-text-block">
            <span className="stat-label">Market Demand Index</span>
            <span className="stat-number">High <small className="text-emerald">94/100</small></span>
            <span className="stat-subtext">Post-Harvest Bullish Outlook</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="analytics-tabs-bar">
        <button
          className={`tab-chip ${tab === "mandi-trends" ? "active" : ""}`}
          onClick={() => setTab("mandi-trends")}
        >
          📈 Mandi Price Trajectory (2018 - 2026)
        </button>
        <button
          className={`tab-chip ${tab === "volatility" ? "active" : ""}`}
          onClick={() => setTab("volatility")}
        >
          ⚡ Price Volatility & Shelf-Life Matrix
        </button>
        <button
          className={`tab-chip ${tab === "districts" ? "active" : ""}`}
          onClick={() => setTab("districts")}
        >
          📍 District-wise Spot Benchmark
        </button>
      </div>

      {/* Main Chart Card */}
      <div className="glass-card analytics-main-card">
        {tab === "mandi-trends" && (
          <div className="tab-content fade-in">
            <div className="chart-header-row">
              <h3>🌾 Historical & Projected Mandi Prices (₹ per Quintal)</h3>
              <div className="crop-filter-chips">
                {["Rice (Paddy)", "Wheat", "Sugarcane", "Cotton", "Tomato"].map((c) => (
                  <button
                    key={c}
                    className={`filter-btn ${selectedCrop === c ? "active" : ""}`}
                    onClick={() => setSelectedCrop(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: 340, width: "100%", marginTop: "1rem" }}>
              <ResponsiveContainer>
                <AreaChart data={mandiPriceHistory}>
                  <defs>
                    <linearGradient id="colorCrop" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d1726",
                      border: "1px solid rgba(16,185,129,0.3)",
                      borderRadius: 10,
                      color: "#fff",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey={selectedCrop.split(" ")[0]}
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCrop)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="ai-insight-box">
              💡 <b>AI Price Forecast:</b> {selectedCrop} prices in South Indian mandis show strong sustained demand with an estimated <b>+7.2% CAGR</b> through 2026.
            </div>
          </div>
        )}

        {tab === "volatility" && (
          <div className="tab-content fade-in">
            <div className="chart-header-row">
              <h3>⚡ Crop Price Volatility vs Storage Stability</h3>
            </div>

            <div style={{ height: 340, width: "100%", marginTop: "1rem" }}>
              <ResponsiveContainer>
                <BarChart data={volatilityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="crop" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d1726",
                      border: "1px solid rgba(16,185,129,0.3)",
                      borderRadius: 10,
                      color: "#fff",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="volatility" name="Price Volatility Index (%)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="storageLifeMonths" name="Safe Storage Life (Months)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="ai-insight-box">
              🛡️ <b>Risk Mitigation:</b> Highly perishable crops like <b>Tomato (48% Volatility)</b> benefit from fast cold-chain dispatch, while <b>Grains (Rice/Wheat)</b> allow timed mandi sell-offs during peak off-season pricing.
            </div>
          </div>
        )}

        {tab === "districts" && (
          <div className="tab-content fade-in">
            <div className="chart-header-row">
              <h3>📍 Tamil Nadu District Mandi Spot Benchmark</h3>
            </div>

            <div className="table-responsive" style={{ marginTop: "1rem" }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>District Mandi</th>
                    <th>Benchmark Spot Price (₹/Qtl)</th>
                    <th>Daily Arrivals</th>
                    <th>Price Velocity Trend</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {districtPrices.map((d, i) => (
                    <tr key={i}>
                      <td><b>{d.district} Mandi</b></td>
                      <td className="profit-col">₹ {d.price}</td>
                      <td>{d.arrivals}</td>
                      <td>
                        <span className={`trend-tag ${d.trend.startsWith("+") ? "trend-up" : "trend-down"}`}>
                          {d.trend}
                        </span>
                      </td>
                      <td><span className="badge-emerald">Active Trading</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}