import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { calculateCropPlan } from "../../api/cropPlannerApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import TamilPattamCalendarBar from "../../components/TamilPattamCalendarBar";
import KnapsackCalculatorModal from "../../components/KnapsackCalculatorModal";
import "./cropPlanner.css";

const initialInputs = {
  land_acres: 5,
  budget: 150000,
  irrigation: "Rainfed",
  soil_type: "Loamy",
  season: "Kharif",
};

const fallbackCropsCatalog = [
  { crop: "Rice", baseYield: 3.2, pricePerTon: 24500, costPerAcre: 18000, risk: "Low", conf: 92, soil: ["Loamy", "Clay", "Black"], season: ["Kharif", "Rabi"] },
  { crop: "Wheat", baseYield: 2.8, pricePerTon: 25500, costPerAcre: 15000, risk: "Low", conf: 88, soil: ["Loamy", "Black", "Clay"], season: ["Rabi"] },
  { crop: "Sugarcane", baseYield: 38.0, pricePerTon: 3450, costPerAcre: 32000, risk: "Low", conf: 95, soil: ["Loamy", "Clay", "Black"], season: ["Kharif", "Zaid"] },
  { crop: "Tomato", baseYield: 14.5, pricePerTon: 18000, costPerAcre: 28000, risk: "Medium", conf: 84, soil: ["Loamy", "Red", "Sandy"], season: ["Kharif", "Rabi", "Zaid"] },
  { crop: "Potato", baseYield: 16.0, pricePerTon: 14000, costPerAcre: 24000, risk: "Medium", conf: 86, soil: ["Loamy", "Sandy", "Black"], season: ["Rabi"] },
  { crop: "Millet", baseYield: 1.4, pricePerTon: 28000, costPerAcre: 9000, risk: "Low", conf: 94, soil: ["Sandy", "Red", "Loamy"], season: ["Kharif", "Zaid"] },
  { crop: "Capsicum", baseYield: 6.5, pricePerTon: 38000, costPerAcre: 35000, risk: "Medium", conf: 82, soil: ["Loamy", "Red"], season: ["Rabi", "Zaid"] },
  { crop: "Horsegram", baseYield: 0.7, pricePerTon: 42000, costPerAcre: 6000, risk: "Low", conf: 96, soil: ["Red", "Sandy", "Loamy"], season: ["Rabi", "Zaid"] },
];

const computeClientSidePlan = (params) => {
  const irriMultiplier = params.irrigation === "Drip" ? 1.25 : params.irrigation === "Sprinkler" ? 1.1 : params.irrigation === "Canal" ? 0.95 : 0.75;
  
  return fallbackCropsCatalog.map((item) => {
    const matchScore = (item.soil.includes(params.soil_type) ? 1.1 : 0.85) * (item.season.includes(params.season) ? 1.15 : 0.85);
    const yieldTon = Math.round(item.baseYield * irriMultiplier * matchScore * 100) / 100;
    const totalYield = Math.round(yieldTon * params.land_acres * 100) / 100;
    const totalCost = Math.round(item.costPerAcre * params.land_acres);
    const revenue = Math.round(totalYield * item.pricePerTon);
    const netProfit = Math.round(revenue - totalCost);
    const profitPerAcre = Math.round(netProfit / params.land_acres);

    return {
      crop: item.crop,
      expected_yield_tons: totalYield,
      total_net_profit: netProfit,
      total_net_profit_human: netProfit >= 100000 ? `₹ ${(netProfit / 100000).toFixed(2)} Lakhs` : `₹ ${netProfit.toLocaleString()}`,
      profit_per_acre: profitPerAcre,
      profit_per_acre_human: `₹ ${profitPerAcre.toLocaleString()}`,
      risk_level: item.risk,
      confidence_score: Math.min(96, Math.max(70, Math.round(item.conf * (matchScore > 1 ? 1.05 : 0.9)))),
      ai_score: profitPerAcre * 0.7 + item.conf * 10,
    };
  }).sort((a, b) => b.ai_score - a.ai_score);
};

const presets = [
  { label: "🌾 Cauvery Delta Paddy", acres: 10, budget: 300000, irrigation: "Canal", soil: "Loamy", season: "Kharif" },
  { label: "💧 Dryland Millets & Pulses", acres: 4, budget: 80000, irrigation: "Rainfed", soil: "Red", season: "Rabi" },
  { label: "🌿 Precision Drip Horticulture", acres: 6, budget: 350000, irrigation: "Drip", soil: "Loamy", season: "Zaid" },
];

export default function CropPlannerPage() {
  const location = useLocation();
  const districtState = location.state;

  const [inputs, setInputs] = useState(() => {
    if (districtState && districtState.soil_type) {
      return {
        ...initialInputs,
        soil_type: districtState.soil_type,
        irrigation: districtState.irrigation || initialInputs.irrigation,
        season: districtState.season || initialInputs.season,
      };
    }
    return initialInputs;
  });

  const [results, setResults] = useState(() => computeClientSidePlan(inputs));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("charts");
  const [engineMode, setEngineMode] = useState("Agronomic Yield Model Active");

  async function runAnalysis(customInputs) {
    const targetInputs = customInputs || inputs;
    setLoading(true);
    setError(null);

    try {
      const response = await calculateCropPlan(targetInputs);

      if (response && response.results && response.results.length > 0) {
        setResults(response.results);
        setEngineMode("Agronomic ML Active");
      } else {
        const fallbackResults = computeClientSidePlan(targetInputs);
        setResults(fallbackResults);
        setEngineMode("Agronomic Intelligence Engine");
      }
    } catch {
      const fallbackResults = computeClientSidePlan(targetInputs);
      setResults(fallbackResults);
      setEngineMode("Agronomic Intelligence Engine");
    } finally {
      setLoading(false);
    }
  }

  // Automatically compute strategy on initial component mount or GIS state sync
  useEffect(() => {
    if (districtState && districtState.soil_type) {
      const synced = {
        ...inputs,
        soil_type: districtState.soil_type,
        irrigation: districtState.irrigation || inputs.irrigation,
        season: districtState.season || inputs.season,
      };
      setInputs(synced);
      runAnalysis(synced);
    } else {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districtState]);

  const applyPreset = (preset) => {
    const updated = {
      land_acres: preset.acres,
      budget: preset.budget,
      irrigation: preset.irrigation,
      soil_type: preset.soil,
      season: preset.season,
    };
    setInputs(updated);
    runAnalysis(updated);
  };

  const [selectedCropIndex, setSelectedCropIndex] = useState(0);
  const [showSprayerModal, setShowSprayerModal] = useState(false);

  const handleSelectPattam = (pattam) => {
    const seasonMap = {
      purattasi: "Kharif",
      samba: "Kharif",
      karthigai: "Rabi",
      navarai: "Rabi",
      kuruvai: "Zaid",
    };
    const targetSeason = seasonMap[pattam.id] || "Kharif";
    const updated = { ...inputs, season: targetSeason };
    setInputs(updated);
    runAnalysis(updated);
  };

  const activeCrop = useMemo(() => {
    if (!results.length) return null;
    return results[selectedCropIndex] || results[0];
  }, [results, selectedCropIndex]);

  const chartData = useMemo(() => {
    return results.map((c) => ({
      crop: c.crop,
      profit: Number(c.profit_per_acre) || 0,
      yield: Number(c.expected_yield_tons) || 0,
      confidence: Number(c.confidence_score) || 0,
    }));
  }, [results]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="planner-root fade-in">
      {/* Header */}
      <div className="page-header-box">
        <div className="page-title-group">
          <h1>🌾 Field & Crop Profit Planner</h1>
          <p>Multi-parameter agronomic engine calculating optimal crop feasibility, expected yields, and net farmer profitability</p>
        </div>
        <div className="header-actions">
          <span className="badge-emerald" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <span className="status-dot" /> {engineMode}
          </span>
          {results.length > 0 && (
            <button className="btn-secondary" onClick={handlePrint}>
              📄 Export Feasibility Report
            </button>
          )}
          <button className="btn-primary" onClick={() => runAnalysis()} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-dot" /> Calculating Field Strategy...
              </>
            ) : (
              <>🌾 Calculate Field Strategy</>
            )}
          </button>
        </div>
      </div>

      {/* Traditional Tamil Agro-Calendar & Seasonal Pattam Sowing Bar */}
      <TamilPattamCalendarBar compact={true} onSelectSeason={handleSelectPattam} />

      {/* GIS Sync Banner if navigated from Agro GIS Map */}
      {districtState?.districtName && (
        <div className="advisory-pill" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(45, 106, 79, 0.25)", borderLeft: "3px solid var(--accent-leaf)" }}>
          <span>📍 <b>Regional Agro-GIS Sync:</b> Automatically loaded parameters for <b>{districtState.districtName} District</b> ({districtState.soil_type} Soil • {districtState.irrigation} Irrigation).</span>
          <span className="badge-emerald">GIS Active</span>
        </div>
      )}

      {/* Preset Quick Actions */}
      <div className="preset-bar">
        <span className="preset-label">🌾 Regional Field Presets:</span>
        {presets.map((p, idx) => (
          <button key={idx} className="preset-chip" onClick={() => applyPreset(p)}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="planner-grid">
        {/* Farm Configuration Card */}
        <div className="glass-card config-panel">
          <div className="panel-header">
            <h3>⚙️ Farm Configuration</h3>
            <span className="badge-subtle">Inputs</span>
          </div>

          <div className="config-section-title">
            <span>📐 Land Area & Investment Capital</span>
          </div>

          <div className="form-item">
            <div className="form-label-row">
              <label>Farm Land Size</label>
              <span className="value-badge">{inputs.land_acres} Acres</span>
            </div>
            <input
              type="range"
              min="1"
              max="200"
              value={inputs.land_acres}
              className="custom-range"
              onChange={(e) => setInputs({ ...inputs, land_acres: Number(e.target.value) })}
            />
          </div>

          <div className="form-item">
            <div className="form-label-row">
              <label>Available Investment Budget</label>
              <span className="value-badge">₹ {inputs.budget.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="2000000"
              step="10000"
              value={inputs.budget}
              className="custom-range"
              onChange={(e) => setInputs({ ...inputs, budget: Number(e.target.value) })}
            />
          </div>

          <div className="config-section-title" style={{ marginTop: "0.25rem" }}>
            <span>🌦️ Agro-Climatic & Soil Taxonomy</span>
          </div>

          <div className="form-grid-3">
            <div className="form-item">
              <label>Irrigation Type</label>
              <select
                className="custom-select"
                value={inputs.irrigation}
                onChange={(e) => setInputs({ ...inputs, irrigation: e.target.value })}
              >
                <option value="Rainfed">🌧️ Rainfed</option>
                <option value="Canal">🌊 Canal</option>
                <option value="Drip">💧 Drip Tech</option>
                <option value="Sprinkler">🚿 Sprinkler</option>
              </select>
            </div>

            <div className="form-item">
              <label>Soil Texture</label>
              <select
                className="custom-select"
                value={inputs.soil_type}
                onChange={(e) => setInputs({ ...inputs, soil_type: e.target.value })}
              >
                <option value="Loamy">🌱 Loamy Soil</option>
                <option value="Clay">🧱 Clay Soil</option>
                <option value="Sandy">🏜️ Sandy Soil</option>
                <option value="Black">🌑 Black Cotton</option>
                <option value="Red">🔴 Red Laterite</option>
              </select>
            </div>

            <div className="form-item">
              <label>Agro Season</label>
              <select
                className="custom-select"
                value={inputs.season}
                onChange={(e) => setInputs({ ...inputs, season: e.target.value })}
              >
                <option value="Kharif">☀️ Kharif (Monsoon)</option>
                <option value="Rabi">❄️ Rabi (Winter)</option>
                <option value="Zaid">🌤️ Zaid (Summer)</option>
              </select>
            </div>
          </div>

          <button className="btn-primary full-width" onClick={() => runAnalysis()} disabled={loading} style={{ marginTop: "1rem" }}>
            {loading ? "Evaluating Field Yields & Costs..." : "Calculate Crop Economics & Net Returns"}
          </button>

          {error && <div className="error-alert">⚠️ {error}</div>}
        </div>

        {/* Selected Crop Inspection Spotlight */}
        <div className="glass-card highlight-panel">
          <div className="panel-header">
            <h3>🌟 {selectedCropIndex === 0 ? "Recommended Primary Cultivation (Rank #1 Choice)" : `Inspecting: ${activeCrop?.crop} (Rank #${selectedCropIndex + 1})`}</h3>
            <span className="badge-emerald">{selectedCropIndex === 0 ? "Optimal Sowing Choice" : "Alternative Variety"}</span>
          </div>

          {activeCrop ? (
            <div className="best-showcase">
              <div className="crop-hero-badge">
                <span className="crop-title">{activeCrop.crop}</span>
                <span className={`risk-tag risk-${(activeCrop.risk_level || "low").toLowerCase()}`}>
                  {activeCrop.risk_level || "Low"} Risk
                </span>
              </div>

              <div className="profit-spotlight">
                <span className="profit-caption">Estimated Net Farm Profit</span>
                <span className="profit-huge">{activeCrop.total_net_profit_human || `₹ ${(activeCrop.profit_per_acre * inputs.land_acres).toLocaleString()}`}</span>
              </div>

              <div className="kpi-grid">
                <div className="kpi-box">
                  <span className="kpi-label">Profit / Acre</span>
                  <span className="kpi-val highlight">{activeCrop.profit_per_acre_human || `₹ ${activeCrop.profit_per_acre}`}</span>
                </div>
                <div className="kpi-box">
                  <span className="kpi-label">Expected Yield</span>
                  <span className="kpi-val">{activeCrop.expected_yield_tons} tons</span>
                </div>
                <div className="kpi-box">
                  <span className="kpi-label">Agronomic Match</span>
                  <span className="kpi-val">{activeCrop.confidence_score}%</span>
                </div>
                <div className="kpi-box">
                  <span className="kpi-label">Land Allocated</span>
                  <span className="kpi-val">{inputs.land_acres} Acres</span>
                </div>
              </div>

              <div className="advisory-pill">
                💡 <b>Extension Advisory:</b> Optimal for {inputs.season} cultivation in {inputs.soil_type} soil with {inputs.irrigation} irrigation system.
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">🌱</span>
              <p>Configure parameters on the left and click <b>Calculate Crop Economics</b>.</p>
            </div>
          )}
        </div>
      </div>

      {/* Remaining Alternative Crops in Small Card Format */}
      {results.length > 1 && (
        <div className="remaining-crops-section fade-in">
          <div className="section-title-row">
            <div>
              <h3>🌿 Alternative Recommended Crops (#{2} to #{results.length})</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "3px 0 0" }}>
                Viable secondary crops matching your {inputs.soil_type} soil & {inputs.irrigation} irrigation system
              </p>
            </div>
            <span className="badge-subtle">{results.length - 1} Alternatives</span>
          </div>

          <div className="small-cards-grid">
            {results.slice(1).map((c, idx) => {
              const rank = idx + 2;
              const isSelected = selectedCropIndex === idx + 1;
              return (
                <div
                  key={rank}
                  className={`crop-small-card ${isSelected ? "active-small-card" : ""}`}
                  onClick={() => setSelectedCropIndex(idx + 1)}
                >
                  <div className="small-card-header">
                    <span className="small-card-rank">#{rank}</span>
                    <span className="small-card-crop">{c.crop}</span>
                    <span className={`risk-tag-small risk-${(c.risk_level || "low").toLowerCase()}`}>
                      {c.risk_level}
                    </span>
                  </div>

                  <div className="small-card-profit">
                    <span className="small-profit-val">{c.profit_per_acre_human || `₹ ${c.profit_per_acre}`}</span>
                    <span className="small-profit-unit">/ acre</span>
                  </div>

                  <div className="small-card-stats">
                    <div className="small-stat-item">
                      <span className="small-stat-lbl">Yield</span>
                      <span className="small-stat-val">{c.expected_yield_tons}t</span>
                    </div>
                    <div className="small-stat-item">
                      <span className="small-stat-lbl">Total Net</span>
                      <span className="small-stat-val">{c.total_net_profit_human || `₹ ${c.total_net_profit}`}</span>
                    </div>
                    <div className="small-stat-item">
                      <span className="small-stat-lbl">Match</span>
                      <span className="small-stat-val highlight">{c.confidence_score}%</span>
                    </div>
                  </div>

                  <button className="small-inspect-btn">
                    {isSelected ? "✓ Inspected in Spotlight" : "Inspect Crop →"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytics & Comparison Area */}
      {results.length > 0 && (
        <div className="glass-card results-section fade-in">
          <div className="results-tabs">
            <button
              className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              📊 Visual Charts & Comparative Table
            </button>
            <button
              className={`tab-btn ${activeTab === "table" ? "active" : ""}`}
              onClick={() => setActiveTab("table")}
            >
              📋 Full Crops Ranking Matrix ({results.length})
            </button>
          </div>

          {activeTab === "all" ? (
            <div className="charts-and-table-layout">
              <div className="charts-grid">
                <div className="chart-card">
                  <h4>Estimated Profit per Acre Comparison (₹)</h4>
                  <div style={{ height: 260, width: "100%" }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(244, 241, 234, 0.07)" />
                        <XAxis dataKey="crop" stroke="#859882" tick={{ fill: "#cad5c7", fontSize: 12 }} />
                        <YAxis stroke="#859882" tick={{ fill: "#cad5c7", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#15241d",
                            border: "1px solid rgba(82, 183, 136, 0.4)",
                            borderRadius: 8,
                            color: "#f5f2eb",
                          }}
                        />
                        <Bar dataKey="profit" fill="#40916c" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-card">
                  <h4>Total Expected Yield (Tons) Radar</h4>
                  <div style={{ height: 260, width: "100%" }}>
                    <ResponsiveContainer>
                      <RadarChart data={chartData}>
                        <PolarGrid stroke="rgba(244, 241, 234, 0.08)" />
                        <PolarAngleAxis dataKey="crop" stroke="#859882" tick={{ fill: "#cad5c7", fontSize: 11 }} />
                        <PolarRadiusAxis stroke="rgba(244, 241, 234, 0.15)" />
                        <Radar name="Yield" dataKey="yield" stroke="#d4973b" fill="#d4973b" fillOpacity={0.35} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#15241d",
                            border: "1px solid rgba(212, 151, 59, 0.4)",
                            borderRadius: 8,
                            color: "#f5f2eb",
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Matrix Table */}
              <div className="table-responsive" style={{ marginTop: "1.5rem" }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Crop Name</th>
                      <th>Profit / Acre</th>
                      <th>Expected Yield</th>
                      <th>Risk Rating</th>
                      <th>AI Confidence</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((c, i) => (
                      <tr key={i} className={selectedCropIndex === i ? "highlight-row" : ""}>
                        <td>
                          <span className={`rank-badge ${i === 0 ? "gold" : ""}`}>#{i + 1}</span>
                        </td>
                        <td>
                          <b>{c.crop}</b> {i === 0 && <span className="best-tag">Top ROI</span>}
                        </td>
                        <td className="profit-col">{c.profit_per_acre_human || `₹ ${c.profit_per_acre}`}</td>
                        <td>{c.expected_yield_tons} tons</td>
                        <td>
                          <span className={`risk-tag risk-${(c.risk_level || "low").toLowerCase()}`}>
                            {c.risk_level || "Low"}
                          </span>
                        </td>
                        <td>
                          <div className="confidence-bar-wrap">
                            <div className="confidence-fill" style={{ width: `${c.confidence_score}%` }} />
                            <span>{c.confidence_score}%</span>
                          </div>
                        </td>
                        <td>
                          <button
                            className={`btn-secondary ${selectedCropIndex === i ? "active" : ""}`}
                            style={{ padding: "0.25rem 0.65rem", fontSize: "0.75rem" }}
                            onClick={() => setSelectedCropIndex(i)}
                          >
                            {selectedCropIndex === i ? "Inspecting" : "Select"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Crop Name</th>
                    <th>Profit / Acre</th>
                    <th>Expected Yield</th>
                    <th>Risk Rating</th>
                    <th>AI Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((c, i) => (
                    <tr key={i} className={i === 0 ? "highlight-row" : ""}>
                      <td>
                        <span className={`rank-badge ${i === 0 ? "gold" : ""}`}>#{i + 1}</span>
                      </td>
                      <td>
                        <b>{c.crop}</b> {i === 0 && <span className="best-tag">Optimal</span>}
                      </td>
                      <td className="profit-col">{c.profit_per_acre_human || `₹ ${c.profit_per_acre}`}</td>
                      <td>{c.expected_yield_tons} tons</td>
                      <td>
                        <span className={`risk-tag risk-${(c.risk_level || "low").toLowerCase()}`}>
                          {c.risk_level || "Low"}
                        </span>
                      </td>
                      <td>
                        <div className="confidence-bar-wrap">
                          <div className="confidence-fill" style={{ width: `${c.confidence_score}%` }} />
                          <span>{c.confidence_score}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Interactive Knapsack Sprayer Modal */}
      <KnapsackCalculatorModal
        isOpen={showSprayerModal}
        onClose={() => setShowSprayerModal(false)}
      />
    </div>
  );
}