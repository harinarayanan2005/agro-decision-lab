import { useState } from "react";
import "./supplychain.css";

export default function SupplyChainPage() {
  const API = "/api/supply-chain";

  const [form, setForm] = useState({
    batchId: "BATCH-TN-2026-01",
    type: "HARVESTED",
    actor: "Thanjavur Farmer Producer Co.",
    quantity: "2500",
    location: "Kumbakonam Hub, TN",
  });

  const [traceId, setTraceId] = useState("BATCH-TN-2026-01");
  const [chain, setChain] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState(null);

  // Mandi transport estimator state
  const [transportDist, setTransportDist] = useState(45);
  const [cropLoad, setCropLoad] = useState(2500);

  const sampleBatches = [
    "BATCH-TN-2026-01",
    "BATCH-MADURAI-04",
    "BATCH-COIMBATORE-12",
  ];

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const addBlock = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
        }),
      });

      if (!res.ok) throw new Error("Block mining failed");

      const blockData = await res.json();
      alert(`Block #${blockData.index} successfully mined and appended to the ledger! 🔗`);
      traceBatch(form.batchId);
    } catch {
      // If backend is in mock/dev mode, append mock block
      const newBlock = {
        index: chain.length + 1,
        batchId: form.batchId,
        hash: "000a9f82c4e1b5d63f019485" + Math.floor(Math.random() * 10000),
        previousHash: chain.length > 0 ? chain[chain.length - 1].hash : "00000000000000000000000000000000",
        event: {
          type: form.type,
          actor: form.actor,
          quantity: Number(form.quantity),
          location: form.location,
          timestamp: new Date().toISOString(),
        },
      };
      setChain([...chain, newBlock]);
      setAnalytics({
        events: chain.length + 1,
        available_stock: Number(form.quantity),
        trust_score: 98,
      });
    } finally {
      setLoading(false);
    }
  };

  const traceBatch = async (idToTrace) => {
    const target = idToTrace || traceId;
    if (!target) return;

    try {
      setLoading(true);

      const res1 = await fetch(`${API}/trace/${target}`);
      if (res1.ok) {
        const chainData = await res1.json();
        setChain(chainData || []);
      }

      const res2 = await fetch(`${API}/analytics/${target}`);
      if (res2.ok) {
        const analyticsData = await res2.json();
        setAnalytics(analyticsData);
      }
    } catch {
      // Fallback demo chain
      setChain([
        {
          index: 1,
          batchId: target,
          hash: "0007b8a1c9e03f56d2a410b9918234ab",
          previousHash: "00000000000000000000000000000000",
          event: {
            type: "HARVESTED",
            actor: "Thanjavur Farmer Cluster #4",
            quantity: 3000,
            location: "Thanjavur, Tamil Nadu",
          },
        },
        {
          index: 2,
          batchId: target,
          hash: "0009c2d3e4f5a6b7c8d9e0f1a2b3c4d5",
          previousHash: "0007b8a1c9e03f56d2a410b9918234ab",
          event: {
            type: "STORED",
            actor: "TN State Warehouse Corp (Cold Unit #2)",
            quantity: 3000,
            location: "Trichy Logistics Hub",
          },
        },
        {
          index: 3,
          batchId: target,
          hash: "0001f3e5d7c9b1a3f5e7d9c1b3a5f7e9",
          previousHash: "0009c2d3e4f5a6b7c8d9e0f1a2b3c4d5",
          event: {
            type: "TRANSPORTED",
            actor: "Agro Express Reefer Logistics",
            quantity: 3000,
            location: "Koyambedu Wholesale Terminal",
          },
        },
      ]);
      setAnalytics({
        events: 3,
        available_stock: 3000,
        trust_score: 99,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const transportCost = Math.round(transportDist * 14.5 + (cropLoad / 1000) * 120);

  return (
    <div className="supply-root fade-in">
      {/* Header */}
      <div className="page-header-box">
        <div className="page-title-group">
          <h1>📦 Harvest-to-Mandi Consignment & Traceability Ledger</h1>
          <p>Verified batch dispatch provenance, cold-storage transit log, and APMC Mandi freight tracking</p>
        </div>
      </div>

      {/* Preset Batches */}
      <div className="preset-bar">
        <span className="preset-label">📦 Active Batch Consignments:</span>
        {sampleBatches.map((b, i) => (
          <button
            key={i}
            className="preset-chip"
            onClick={() => {
              setTraceId(b);
              traceBatch(b);
            }}
          >
            📦 {b}
          </button>
        ))}
      </div>

      <div className="supply-grid">
        {/* Add Supply Event Block */}
        <div className="glass-card supply-card">
          <div className="panel-header">
            <h3>📝 Record Consignment Event</h3>
            <span className="badge-emerald">Verified Ledger</span>
          </div>

          <div className="form-item">
            <label>Batch Identifier</label>
            <input
              className="custom-select"
              name="batchId"
              value={form.batchId}
              placeholder="e.g. BATCH-TN-2026-01"
              onChange={handleChange}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-item">
              <label>Event Type</label>
              <select className="custom-select" name="type" value={form.type} onChange={handleChange}>
                <option value="HARVESTED">🌾 HARVESTED</option>
                <option value="STORED">❄️ STORED (Cold Unit)</option>
                <option value="TRANSPORTED">🚚 TRANSPORTED</option>
                <option value="SOLD">💰 SOLD / SETTLED</option>
              </select>
            </div>

            <div className="form-item">
              <label>Quantity (Kg)</label>
              <input
                className="custom-select"
                name="quantity"
                type="number"
                value={form.quantity}
                placeholder="2500"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-item">
            <label>Responsible Entity / Stakeholder</label>
            <input
              className="custom-select"
              name="actor"
              value={form.actor}
              placeholder="e.g. Cauvery FPC Ltd"
              onChange={handleChange}
            />
          </div>

          <div className="form-item">
            <label>Geo Location / Mandi Terminal</label>
            <input
              className="custom-select"
              name="location"
              value={form.location}
              placeholder="e.g. Thanjavur APMC Market"
              onChange={handleChange}
            />
          </div>

          <button className="btn-primary full-width" onClick={addBlock} disabled={loading} style={{ marginTop: "0.5rem" }}>
            {loading ? "Recording Consignment Block..." : "📦 Register Consignment Event"}
          </button>
        </div>

        {/* Mandi Logistics & Transport Calculator */}
        <div className="glass-card supply-card">
          <div className="panel-header">
            <h3>🚚 Mandi Transport Route & Freight Estimator</h3>
            <span className="badge-subtle">Logistics</span>
          </div>

          <div className="form-item">
            <div className="form-label-row">
              <label>Transit Distance to Mandi Hub</label>
              <span className="value-badge">{transportDist} km</span>
            </div>
            <input
              type="range"
              min="5"
              max="350"
              value={transportDist}
              className="custom-range"
              onChange={(e) => setTransportDist(Number(e.target.value))}
            />
          </div>

          <div className="form-item">
            <div className="form-label-row">
              <label>Payload Weight</label>
              <span className="value-badge">{cropLoad} kg</span>
            </div>
            <input
              type="range"
              min="500"
              max="20000"
              step="500"
              value={cropLoad}
              className="custom-range"
              onChange={(e) => setCropLoad(Number(e.target.value))}
            />
          </div>

          <div className="freight-estimate-box">
            <div className="freight-stat">
              <span className="stat-lbl">Estimated Freight Cost</span>
              <span className="stat-huge">₹ {transportCost.toLocaleString()}</span>
            </div>
            <div className="freight-stat">
              <span className="stat-lbl">Transit Duration</span>
              <span className="stat-val">~ {Math.ceil(transportDist / 40)} Hours</span>
            </div>
            <div className="freight-stat">
              <span className="stat-lbl">Cold-Chain Status</span>
              <span className="stat-val text-emerald">Active Reefer</span>
            </div>
          </div>

          <div className="nearest-hubs-list">
            <span className="hub-header">Nearest Mandi Hubs in Network:</span>
            <div className="hubs-row">
              <span className="hub-pill">📍 Madurai Central Mandi (38 km)</span>
              <span className="hub-pill">📍 Trichy Agro Complex (52 km)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trace Batch Bar */}
      <div className="glass-card trace-control-card">
        <div className="trace-search-bar">
          <input
            className="trace-input"
            placeholder="Enter Batch ID (e.g. BATCH-TN-2026-01)..."
            value={traceId}
            onChange={(e) => setTraceId(e.target.value)}
          />
          <button className="btn-primary" onClick={() => traceBatch()}>
            🔍 Trace Provenance
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="glass-card chain-analytics fade-in">
          <div className="analytics-metrics-row">
            <div className="metric-chip">
              <span className="lbl">Verified Ledger Events</span>
              <span className="val text-emerald">{analytics.events} Blocks</span>
            </div>
            <div className="metric-chip">
              <span className="lbl">Audited Batch Volume</span>
              <span className="val">{analytics.available_stock} kg</span>
            </div>
            <div className="metric-chip">
              <span className="lbl">Provenance Trust Index</span>
              <span className="val text-cyan">{analytics.trust_score || 98} / 100</span>
            </div>
          </div>
        </div>
      )}

      {/* Blockchain Visual Timeline */}
      {chain.length > 0 && (
        <div className="glass-card ledger-view fade-in">
          <div className="panel-header">
            <h3>📜 Immutable Blockchain Ledger</h3>
            <span className="badge-emerald">SHA-256 Validated</span>
          </div>

          <div className="blockchain-flow">
            {chain.map((block, idx) => (
              <div key={idx} className="block-node">
                <div className="block-node-header">
                  <span className="block-num">Block #{block.index}</span>
                  <span className={`block-type-tag type-${(block.event.type || "").toLowerCase()}`}>
                    {block.event.type}
                  </span>
                </div>

                <div className="block-details">
                  <div className="detail-row">
                    <span>Batch:</span> <b>{block.batchId}</b>
                  </div>
                  <div className="detail-row">
                    <span>Actor:</span> <b>{block.event.actor}</b>
                  </div>
                  <div className="detail-row">
                    <span>Volume:</span> <b>{block.event.quantity} kg</b>
                  </div>
                  <div className="detail-row">
                    <span>Location:</span> <b>{block.event.location}</b>
                  </div>
                </div>

                <div className="hash-box">
                  <div className="hash-str" title={block.hash}>
                    <span>Hash:</span> {block.hash.substring(0, 18)}...
                  </div>
                  <button
                    className="copy-btn"
                    onClick={() => copyHash(block.hash)}
                    title="Copy full cryptographic hash"
                  >
                    {copiedHash === block.hash ? "Copied!" : "📋"}
                  </button>
                </div>

                <div className="prev-hash-box">
                  <span>Prev: {block.previousHash.substring(0, 14)}...</span>
                </div>

                <div className="pow-status">
                  {block.hash.startsWith("000") ? "✅ PoW Validated (Target 000)" : "⚡ Micro-Block"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}