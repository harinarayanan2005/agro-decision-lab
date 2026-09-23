import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TAMIL_PATTAM_CALENDAR } from "../data/tamilNaduAgroZones";
import "./humanizedComponents.css";

export default function TamilPattamCalendarBar({ onSelectSeason, compact = false }) {
  const navigate = useNavigate();
  // Default to the current active season (Purattasi)
  const [activePattamId, setActivePattamId] = useState("purattasi");

  const activePattam =
    TAMIL_PATTAM_CALENDAR.find((p) => p.id === activePattamId) ||
    TAMIL_PATTAM_CALENDAR[0];

  const handleApplyPattam = (pattam) => {
    if (onSelectSeason) {
      onSelectSeason(pattam);
    } else {
      navigate("/crop-planner", {
        state: {
          season: pattam.id === "kuruvai" ? "Zaid" : pattam.id === "navarai" ? "Rabi" : "Kharif",
          pattamName: pattam.name,
          suggestedCrops: pattam.keyCrops,
        },
      });
    }
  };

  return (
    <div className={`pattam-clean-bar fade-in ${compact ? "pattam-compact" : ""}`}>
      <div className="pattam-clean-top">
        <div className="pattam-title-pill">
          <span className="pattam-icon">🌾</span>
          <span className="pattam-main-title">Agro-Seasonal Calendar:</span>
          <span className="pattam-active-name">{activePattam.name}</span>
          <span className="pattam-active-tamil">({activePattam.tamilName})</span>
          <span className="pattam-active-status-badge">Active Sowing Window</span>
        </div>

        <div className="pattam-tabs-clean">
          {TAMIL_PATTAM_CALENDAR.map((p) => {
            const isSelected = activePattamId === p.id;
            return (
              <button
                key={p.id}
                className={`pattam-pill-btn ${isSelected ? "active" : ""}`}
                onClick={() => setActivePattamId(p.id)}
                title={`${p.name} - ${p.period}`}
              >
                <span>{p.name.split(" ")[0]}</span>
                <span className="pill-sub">{p.period.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        <button
          className="btn-secondary btn-sm pattam-apply-btn"
          onClick={() => handleApplyPattam(activePattam)}
        >
          Plan for {activePattam.name.split(" ")[0]} →
        </button>
      </div>

      <div className="pattam-clean-bottom">
        <span className="pattam-crops-label">Recommended Crops:</span>
        <div className="pattam-crops-strip">
          {activePattam.keyCrops.map((c, i) => (
            <span key={i} className="crop-tag-chip-clean">
              🌱 {c}
            </span>
          ))}
        </div>
        <span className="pattam-protocol-hint">
          <b>TNAU Protocol:</b> {activePattam.agronomicAdvisory.split(".")[0]}.
        </span>
      </div>
    </div>
  );
}
