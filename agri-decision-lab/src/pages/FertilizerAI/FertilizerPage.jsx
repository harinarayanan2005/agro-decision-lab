import { useState } from "react";
import { predictFertilizer } from "../../api/fertilizerApi";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import "./fertilizer.css";

export default function FertilizerPage() {
  const [input, setInput] = useState({
    crop: "Rice",
    soil_type: "Loamy",
    season: "Kharif",
    irrigation: "Canal",
    ph: 6.5,
    nitrogen: 90,
    phosphorus: 42,
    potassium: 38,
    expected_yield: 4.5,
    budget: 35000,
    market_price: 22000,
    climate_score: 80,
    risk_score: 20,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const soilPresets = [
    { label: "🌱 Balanced Loam (Cauvery Paddy)", n: 90, p: 45, k: 45, ph: 6.8, crop: "Rice" },
    { label: "🌾 Nitrogen Deficient Silt", n: 35, p: 50, k: 40, ph: 6.2, crop: "Wheat" },
    { label: "🧱 Low Phosphorus Alluvium", n: 80, p: 18, k: 60, ph: 7.4, crop: "Cotton" },
  ];

  const applySoilPreset = (preset) => {
    setInput((prev) => ({
      ...prev,
      nitrogen: preset.n,
      phosphorus: preset.p,
      potassium: preset.k,
      ph: preset.ph,
      crop: preset.crop,
    }));
  };

  async function runAI() {
    setLoading(true);
    setError(null);

    try {
      const res = await predictFertilizer(input);
      setResult(res);
    } catch {
      setError("Fertilizer advisory service unavailable. Verify backend port 8081 is active.");
    } finally {
      setLoading(false);
    }
  }

  const chartData = [
    { nutrient: "Nitrogen (N)", actual: input.nitrogen, optimal: 80 },
    { nutrient: "Phosphorus (P)", actual: input.phosphorus, optimal: 40 },
    { nutrient: "Potassium (K)", actual: input.potassium, optimal: 40 },
  ];

  const radarData = [
    { subject: "Nitrogen", value: input.nitrogen, fullMark: 150 },
    { subject: "Phosphorus", value: input.phosphorus, fullMark: 100 },
    { subject: "Potassium", value: input.potassium, fullMark: 100 },
    { subject: "pH Level (x10)", value: input.ph * 10, fullMark: 100 },
  ];

  const getNutrientStatus = (val, min, max) => {
    if (val < min) return { text: "Deficient", class: "status-low" };
    if (val > max) return { text: "Surplus", class: "status-high" };
    return { text: "Optimal", class: "status-optimal" };
  };

  return (
    <div className="fertilizer-root fade-in">
      {/* Header */}
      <div className="page-header-box">
        <div className="page-title-group">
          <h1>🧪 Soil Nutrient Balancing & Agronomic Advisory</h1>
          <p>Field soil chemistry diagnostic evaluating Nitrogen, Phosphorus, Potassium, pH, and crop-specific dosage schedules</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={runAI} disabled={loading}>
            {loading ? "Diagnosing Soil Profile..." : "🌾 Prescribe Fertilizer Formulation"}
          </button>
        </div>
      </div>

      {/* Preset Soil Test Scenarios */}
      <div className="preset-bar">
        <span className="preset-label">🧪 Soil Test Presets:</span>
        {soilPresets.map((p, idx) => (
          <button key={idx} className="preset-chip" onClick={() => applySoilPreset(p)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="fert-main-grid">
        {/* Soil & Crop Parameter Form */}
        <div className="glass-card fert-input-panel">
          <div className="panel-header">
            <h3>🔬 Soil & Crop Test Parameters</h3>
            <span className="badge-subtle">Lab Values</span>
          </div>

          <div className="form-grid-2">
            <div className="form-item">
              <label>Target Crop</label>
              <select
                className="custom-select"
                value={input.crop}
                onChange={(e) => setInput({ ...input, crop: e.target.value })}
              >
                <option>Rice</option>
                <option>Wheat</option>
                <option>Cotton</option>
                <option>Sugarcane</option>
                <option>Maize</option>
                <option>Tomato</option>
                <option>Potato</option>
                <option>Capsicum</option>
              </select>
            </div>

            <div className="form-item">
              <label>Soil pH Level ({input.ph})</label>
              <input
                type="range"
                min="4.0"
                max="9.0"
                step="0.1"
                value={input.ph}
                className="custom-range"
                onChange={(e) => setInput({ ...input, ph: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* NPK Sliders with Dynamic Badges */}
          <div className="npk-sliders-group">
            <div className="npk-item">
              <div className="form-label-row">
                <label>Nitrogen (N) - kg/ha</label>
                <div className="val-group">
                  <span className={`pill-badge ${getNutrientStatus(input.nitrogen, 60, 100).class}`}>
                    {getNutrientStatus(input.nitrogen, 60, 100).text}
                  </span>
                  <span className="value-badge">{input.nitrogen} kg/ha</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                value={input.nitrogen}
                className="custom-range"
                onChange={(e) => setInput({ ...input, nitrogen: Number(e.target.value) })}
              />
            </div>

            <div className="npk-item">
              <div className="form-label-row">
                <label>Phosphorus (P) - kg/ha</label>
                <div className="val-group">
                  <span className={`pill-badge ${getNutrientStatus(input.phosphorus, 30, 60).class}`}>
                    {getNutrientStatus(input.phosphorus, 30, 60).text}
                  </span>
                  <span className="value-badge">{input.phosphorus} kg/ha</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                value={input.phosphorus}
                className="custom-range"
                onChange={(e) => setInput({ ...input, phosphorus: Number(e.target.value) })}
              />
            </div>

            <div className="npk-item">
              <div className="form-label-row">
                <label>Potassium (K) - kg/ha</label>
                <div className="val-group">
                  <span className={`pill-badge ${getNutrientStatus(input.potassium, 30, 60).class}`}>
                    {getNutrientStatus(input.potassium, 30, 60).text}
                  </span>
                  <span className="value-badge">{input.potassium} kg/ha</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                value={input.potassium}
                className="custom-range"
                onChange={(e) => setInput({ ...input, potassium: Number(e.target.value) })}
              />
            </div>
          </div>

          <button className="btn-primary full-width" onClick={runAI} disabled={loading} style={{ marginTop: "0.5rem" }}>
            {loading ? "Analyzing NPK Stoichiometry..." : "Prescribe Fertilizer Formulation"}
          </button>

          {error && <div className="error-alert">⚠️ {error}</div>}
        </div>

        {/* AI Prescription Result Card */}
        <div className="glass-card fert-result-panel">
          <div className="panel-header">
            <h3>💊 AI Agronomic Prescription</h3>
            <span className="badge-emerald">{result ? "Generated" : "Awaiting Run"}</span>
          </div>

          {result ? (
            <div className="prescription-body fade-in">
              <div className="prescription-hero">
                <span className="rx-label">Recommended Formula</span>
                <h2 className="rx-name">{result.recommended_fertilizer || "NPK Custom Blend"}</h2>
                <div className="rx-tags-row">
                  <span className="rx-pill">
                    🎯 Dosage: <b>{result.dosage_per_acre_kg || "50"} kg / Acre</b>
                  </span>
                  <span className="rx-pill boost">
                    🚀 Yield Boost: <b>+{result.estimated_yield_boost_percent || "18"}%</b>
                  </span>
                  <span className="rx-pill confidence">
                    ⚡ Confidence: <b>{result.confidence || "94"}%</b>
                  </span>
                </div>
              </div>

              <div className="limiting-factor-card">
                <div className="limit-icon">⚠️</div>
                <div className="limit-info">
                  <span className="limit-title">Primary Limiting Nutrient</span>
                  <span className="limit-desc">
                    Soil is critically constrained by <b>{result.limiting_nutrient || "Nitrogen"}</b>. Recommended NPK Target Ratio: <b>{result.npk_ratio || "4:2:1"}</b>.
                  </span>
                </div>
              </div>

              {/* 3-Stage Application Schedule */}
              <div className="schedule-timeline">
                <h4>📅 Recommended Application Schedule</h4>
                <div className="timeline-steps">
                  <div className="timeline-step">
                    <div className="step-circle">1</div>
                    <div className="step-content">
                      <b>Basal Application (At Sowing)</b>
                      <span>Apply 50% N + 100% P & K into soil furrow</span>
                    </div>
                  </div>
                  <div className="timeline-step">
                    <div className="step-circle">2</div>
                    <div className="step-content">
                      <b>Vegetative Stage (Day 25-30)</b>
                      <span>Apply 25% remaining Nitrogen via top dressing</span>
                    </div>
                  </div>
                  <div className="timeline-step">
                    <div className="step-circle">3</div>
                    <div className="step-content">
                      <b>Panicle / Flowering (Day 50-60)</b>
                      <span>Apply final 25% Nitrogen + micronutrient spray</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Soil Advice & Alternatives */}
              <div className="advice-grid">
                {result.alternative_fertilizers && result.alternative_fertilizers.length > 0 && (
                  <div className="advice-box">
                    <h5>🌿 Organic & Alternative Formulations</h5>
                    <ul>
                      {result.alternative_fertilizers.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.soil_advice && result.soil_advice.length > 0 && (
                  <div className="advice-box">
                    <h5>🌾 Soil Health Conditioning</h5>
                    <ul>
                      {result.soil_advice.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">🧪</span>
              <p>Adjust soil test parameters on the left and click <b>Prescribe Fertilizer</b> to calculate custom nutrient dosage.</p>
            </div>
          )}
        </div>
      </div>

      {/* Nutrient Visualization Radar & Bar Chart */}
      <div className="glass-card nutrient-analytics-card">
        <div className="panel-header">
          <h3>📊 Soil Nutrient Balance Analysis</h3>
          <span className="badge-subtle">Diagnostic Breakdown</span>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h4>Current vs Optimal Nutrient Levels (kg/ha)</h4>
            <div style={{ height: 220, width: "100%" }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(244, 241, 234, 0.07)" />
                  <XAxis dataKey="nutrient" stroke="#859882" tick={{ fill: "#cad5c7", fontSize: 12 }} />
                  <YAxis stroke="#859882" tick={{ fill: "#cad5c7", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#15241d", border: "1px solid rgba(82, 183, 136, 0.4)", borderRadius: 8, color: "#f5f2eb" }} />
                  <Bar dataKey="actual" name="Current Soil Level" fill="#40916c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="optimal" name="Benchmark Target" fill="#d4973b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h4>Soil Nutrient Radar Profile</h4>
            <div style={{ height: 220, width: "100%" }}>
              <ResponsiveContainer>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(244, 241, 234, 0.08)" />
                  <PolarAngleAxis dataKey="subject" stroke="#859882" tick={{ fill: "#cad5c7", fontSize: 11 }} />
                  <PolarRadiusAxis stroke="rgba(244, 241, 234, 0.15)" />
                  <Radar name="Soil Level" dataKey="value" stroke="#52b788" fill="#40916c" fillOpacity={0.35} />
                  <Tooltip contentStyle={{ backgroundColor: "#15241d", border: "1px solid rgba(82, 183, 136, 0.4)", borderRadius: 8, color: "#f5f2eb" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
