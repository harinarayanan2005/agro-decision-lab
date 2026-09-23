import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { KNAPSACK_RECIPES } from "../data/tamilNaduAgroZones";
import "./humanizedComponents.css";

export default function KnapsackCalculatorModal({ isOpen, onClose }) {
  const [tankSize, setTankSize] = useState(16); // 16L Standard Hand Knapsack
  const [acreage, setAcreage] = useState(1.0);
  const [selectedRecipeId, setSelectedRecipeId] = useState("neem-oil");
  const [isCopied, setIsCopied] = useState(false);

  // Close on Escape key & lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedRecipe =
    KNAPSACK_RECIPES.find((r) => r.id === selectedRecipeId) ||
    KNAPSACK_RECIPES[0];

  // Agronomic standard in South Indian horticulture/paddy:
  // ~128 Liters spray volume per acre (equivalent to 8 tanks of 16L)
  const sprayVolumePerAcreLiters = 128;
  const totalWaterLiters = Math.ceil(acreage * sprayVolumePerAcreLiters);
  const totalTanks = Math.ceil(totalWaterLiters / tankSize);

  // Per tank dosage
  const perTankDose = Math.round(selectedRecipe.dosePerLiterMl * tankSize * 10) / 10;
  const totalInputAmount = Math.round(perTankDose * totalTanks * 10) / 10;
  const unit =
    selectedRecipe.id === "npk-19" ||
    selectedRecipe.id === "pseudomonas" ||
    selectedRecipe.id === "zinc-urea"
      ? "grams"
      : "ml";

  const handlePrintCard = () => {
    window.print();
  };

  const handleCopyMemo = () => {
    const memoText = `[TNAU Field Sprayer Prescription Memo]
Field Acreage: ${acreage} Acre(s) (${Math.round(acreage * 100)} Cents)
Recipe: ${selectedRecipe.name} (${selectedRecipe.tamilName})
Sprayer Tank Size: ${tankSize}L Knapsack
Tanks Needed: ${totalTanks} Tanks
Per Tank Dose: ${perTankDose} ${unit} (${selectedRecipe.measureVisual})
Total Input Needed: ${totalInputAmount} ${unit} in ${totalWaterLiters}L clean water
Best Spray Window: ${selectedRecipe.bestTime}
Mixing Instructions: ${selectedRecipe.instructions}
Safety Notice: ${selectedRecipe.safetyTip}`;

    navigator.clipboard.writeText(memoText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const modalContent = (
    <div
      className="modal-backdrop-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="knapsack-modal-title"
    >
      <div className="knapsack-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header-strip">
          <div className="modal-title-box">
            <div className="modal-tag-row">
              <span className="modal-tool-tag">🌾 உழவர் களக் கணக்கீடு</span>
              <span className="modal-subtag">TNAU Agronomic Standards</span>
            </div>
            <h3 id="knapsack-modal-title">
              Knapsack Sprayer & Tank Dilution Calculator{" "}
              <span className="modal-tamil-heading">(கைத்தெளிப்பான் கரைசல்)</span>
            </h3>
            <p>Practical hand & battery knapsack sprayer dosages for farm laborers and field officers</p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            title="Close Calculator (Esc)"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Main Grid */}
        <div className="knapsack-grid">
          {/* Left Column: Farm Parameters */}
          <div className="knapsack-inputs-col">
            <h4 className="section-subtitle">1. Plot & Sprayer Settings</h4>

            {/* Acreage Input */}
            <div className="form-group-item">
              <label htmlFor="field-acreage-input">Field Acreage (நிலப்பரப்பு):</label>
              <div className="input-with-pill">
                <input
                  id="field-acreage-input"
                  type="number"
                  min="0.1"
                  max="50"
                  step="0.25"
                  value={acreage}
                  onChange={(e) => setAcreage(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  className="number-field"
                />
                <span className="field-suffix">
                  Acre(s) • <strong>{Math.round(acreage * 100)} Cents</strong>
                </span>
              </div>
              <div className="quick-acre-btns">
                {[0.5, 1.0, 2.0, 2.5, 5.0].map((ac) => (
                  <button
                    key={ac}
                    type="button"
                    className={`quick-acre-chip ${acreage === ac ? "active" : ""}`}
                    onClick={() => setAcreage(ac)}
                  >
                    {ac} Ac
                  </button>
                ))}
              </div>
            </div>

            {/* Sprayer Tank Size Selector */}
            <div className="form-group-item">
              <label>Sprayer Tank Capacity (தெளிப்பான் கொள்ளளவு):</label>
              <div className="tank-size-selector">
                <button
                  type="button"
                  className={`tank-choice-btn ${tankSize === 16 ? "active" : ""}`}
                  onClick={() => setTankSize(16)}
                >
                  <span className="tank-icon">🎒</span>
                  <span className="tank-name">16 Liters</span>
                  <span className="tank-desc">Hand Knapsack</span>
                </button>
                <button
                  type="button"
                  className={`tank-choice-btn ${tankSize === 12 ? "active" : ""}`}
                  onClick={() => setTankSize(12)}
                >
                  <span className="tank-icon">🔋</span>
                  <span className="tank-name">12 Liters</span>
                  <span className="tank-desc">Battery Knapsack</span>
                </button>
                <button
                  type="button"
                  className={`tank-choice-btn ${tankSize === 20 ? "active" : ""}`}
                  onClick={() => setTankSize(20)}
                >
                  <span className="tank-icon">⚡</span>
                  <span className="tank-name">20 Liters</span>
                  <span className="tank-desc">Power Sprayer</span>
                </button>
              </div>
            </div>

            {/* Recipe Selection */}
            <div className="form-group-item" style={{ marginBottom: 0 }}>
              <label>Target Agri Solution / Recipe (தெளிப்பு கரைசல்):</label>
              <div className="recipes-list-group">
                {KNAPSACK_RECIPES.map((r) => {
                  const isSelected = selectedRecipeId === r.id;
                  return (
                    <div
                      key={r.id}
                      className={`recipe-select-card ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedRecipeId(r.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setSelectedRecipeId(r.id);
                        }
                      }}
                    >
                      <div className="recipe-card-header">
                        <span className="recipe-title">{r.name}</span>
                        <span className="recipe-tamil-title">{r.tamilName}</span>
                      </div>
                      <div className="recipe-meta-row">
                        <span className="recipe-cat-badge">{r.category}</span>
                        <span className="recipe-target">🎯 {r.targetIssues}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Computed Field Prescription */}
          <div className="knapsack-results-col">
            <h4 className="section-subtitle">2. Field Labor Prescription Card</h4>

            {/* Humanized Pocket Memo Card */}
            <div className="field-pocket-card">
              <div className="memo-header-row">
                <span className="memo-station-stamp">TNAU EXTENSION SPECIFICATION</span>
                <span className="memo-date">Date: {new Date().toLocaleDateString("en-IN")}</span>
              </div>

              <div className="prescription-hero">
                <div className="hero-tank-count">
                  <span className="hero-num">{totalTanks}</span>
                  <span className="hero-lbl">Tanks Needed</span>
                </div>
                <div className="hero-water-volume">
                  <span className="hero-subnum">{totalWaterLiters} Liters Water</span>
                  <span className="hero-sublbl">Clean well water for {acreage} Acre(s)</span>
                </div>
              </div>

              {/* Exact Per-Tank Dosage Instructions */}
              <div className="tank-measure-box">
                <span className="measure-heading">
                  🥄 Per {tankSize}L Tank Practical Measurement:
                </span>
                <div className="measure-value-highlight">
                  <b>{perTankDose} {unit}</b>
                  <span className="measure-visual-sub">({selectedRecipe.measureVisual})</span>
                </div>
                {selectedRecipe.emulsifierDesc && selectedRecipe.emulsifierDesc !== "None" && (
                  <div className="emulsifier-note">
                    🧼 <b>Emulsifier:</b> Add {selectedRecipe.emulsifierDesc} to prevent oil separation.
                  </div>
                )}
              </div>

              {/* Total Input Required */}
              <div className="total-input-summary">
                <div className="sum-row">
                  <span>Total {selectedRecipe.name} Needed:</span>
                  <b>{totalInputAmount} {unit}</b>
                </div>
                <div className="sum-row">
                  <span>Total Water Volume:</span>
                  <b>{totalWaterLiters} Liters ({totalTanks} loads of {tankSize}L)</b>
                </div>
              </div>

              {/* Step-by-Step Mixing Instructions */}
              <div className="mixing-instructions-box">
                <span className="mix-title">📝 Field Mixing Instructions:</span>
                <p className="mix-text">{selectedRecipe.instructions}</p>
              </div>

              {/* Spraying Timing & Safety */}
              <div className="spray-timing-box">
                <div className="timing-row">
                  <span>⏰ <b>Best Spray Window:</b></span>
                  <span>{selectedRecipe.bestTime}</span>
                </div>
                <div className="timing-row safety">
                  <span>⚠️ <b>Agronomic Safety:</b></span>
                  <span>{selectedRecipe.safetyTip}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="memo-actions-row">
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={handleCopyMemo}
                >
                  {isCopied ? "✓ Copied Prescription!" : "📋 Copy Field Note"}
                </button>
                <button
                  type="button"
                  className="btn-primary btn-sm"
                  onClick={handlePrintCard}
                >
                  🖨️ Print Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
