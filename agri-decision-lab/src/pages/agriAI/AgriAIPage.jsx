import { useState, useRef, useEffect } from "react";
import { askAgriAI } from "../../api/agriAI";
import "./agriAI.css";

export default function AgriAIPage() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([
    {
      type: "bot",
      text: "👋 Welcome to **AgriAI Intelligent Agronomist Assistant**!\n\nI can assist you with:\n- 🌾 Crop selection, rotation, and yield maximization\n- 🧪 Soil health diagnostics and N-P-K nutrient balancing\n- 🐛 Integrated pest and disease management\n- 🌦️ Climate resilience and precision irrigation scheduling\n\nHow can I support your farm today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const suggestionPrompts = [
    "🌾 What are high-yield crop options for Loamy soil in Kharif?",
    "🧪 How to correct severe Nitrogen deficiency organically?",
    "🐛 How to diagnose and treat Leaf Blast disease in Rice?",
    "💧 What is the optimal drip irrigation schedule for Tomatoes?",
  ];

  const handleSendPrompt = (promptText) => {
    sendMessage(promptText);
  };

  async function sendMessage(textToSend) {
    const msg = (textToSend || input).trim();
    if (!msg || loading) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setChat((prev) => [...prev, { type: "user", text: msg, time }]);
    setInput("");
    setLoading(true);

    try {
      const res = await askAgriAI(msg);
      const botResponse = res?.answer || getAgroFallback(msg);

      setChat((prev) => [
        ...prev,
        {
          type: "bot",
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      // Intelligent agronomic fallback for offline/demo scenarios
      const fallback = getAgroFallback(msg);
      setChat((prev) => [
        ...prev,
        {
          type: "bot",
          text: fallback,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function getAgroFallback(query) {
    const q = query.toLowerCase();
    if (q.includes("rice") || q.includes("paddy") || q.includes("blast")) {
      return "🌾 **Rice / Paddy Management Advisory:**\n- **Optimal Varieties:** CO-51, ADT-37, BPT-5204 (Samba Mahsuri)\n- **Nutrient Ratio:** 120:50:50 kg NPK/ha (apply 50% N as basal, split remaining at active tillering and panicle initiation)\n- **Blast Control:** Spray Tricyclazole 75% WP @ 0.6 g/L or Kasugamycin 3% SL @ 2.5 ml/L at first appearance of spindle lesions.";
    }
    if (q.includes("nitrogen") || q.includes("soil") || q.includes("fertilizer") || q.includes("organic")) {
      return "🧪 **Soil Nutrient & Organic Restoration:**\n- **Green Manuring:** Grow and incorporate *Daincha (Sesbania aculeata)* or Sunnhemp 45 days prior to planting.\n- **Bio-fertilizers:** Seed inoculation with *Azospirillum brasilense* (for non-legumes) fixes 20-40 kg atmospheric N/ha.\n- **Organic Amendments:** Apply well-decomposed FYM (Farm Yard Manure) @ 12.5 t/ha or Vermicompost @ 5 t/ha.";
    }
    if (q.includes("tomato") || q.includes("irrigation") || q.includes("drip")) {
      return "💧 **Tomato Precision Irrigation & Care:**\n- **Drip Schedule:** 2.5 - 3.5 Litres/plant/day during vegetative stage, increasing to 4.5 - 5.5 L/day during heavy fruit development.\n- **Mulching:** 25-micron silver-black polyethylene mulch reduces evaporative water loss by 40% and prevents soil-borne fungal splash.\n- **Calcium Nutrition:** Apply Foliar Calcium Nitrate (1%) to prevent Blossom End Rot.";
    }
    return `🌱 **Agronomic Strategic Recommendation:**\nBased on agro-ecological parameters in South India:\n1. Ensure soil testing is conducted every 2 seasons to optimize fertilizer expenditure.\n2. Adopt integrated nutrient management (INM) combining 75% RDF + 25% organic bio-inputs.\n3. Monitor micro-climate and pest vulnerability indices during transition between Kharif and Rabi seasons.`;
  }

  const clearChat = () => {
    setChat([
      {
        type: "bot",
        text: "Chat cleared. Ask me any agronomy or farm planning question!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const [speaking, setSpeaking] = useState(false);

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*#_`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("Message copied to clipboard! 📋");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  return (
    <div className="ai-chat-root fade-in">
      {/* Header */}
      <div className="page-header-box">
        <div className="page-title-group">
          <h1>🤖 AgriAI Agronomic Knowledge Assistant</h1>
          <p>Generative AI assistant trained on agronomy datasets, soil nutrient chemistry & crop pathology</p>
        </div>
        <div className="header-actions">
          {speaking && (
            <button className="btn-secondary" style={{ borderColor: "#f43f5e", color: "#fda4af" }} onClick={() => { window.speechSynthesis.cancel(); setSpeaking(false); }}>
              ⏹️ Stop Audio
            </button>
          )}
          <button className="btn-secondary" onClick={clearChat}>
            🗑️ Clear Chat
          </button>
        </div>
      </div>

      {/* Suggestion Prompts */}
      <div className="preset-bar">
        <span className="preset-label">💡 Suggested Questions:</span>
        {suggestionPrompts.map((prompt, idx) => (
          <button key={idx} className="preset-chip" onClick={() => handleSendPrompt(prompt)}>
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="glass-card chat-viewport-card">
        <div className="messages-stream">
          {chat.map((msg, index) => (
            <div key={index} className={`chat-message-bubble ${msg.type === "user" ? "user-bubble" : "bot-bubble"}`}>
              <div className="bubble-avatar">
                {msg.type === "user" ? "👨‍🌾" : "🌱"}
              </div>
              <div className="bubble-content-wrap">
                <div className="bubble-header">
                  <span className="sender-name">{msg.type === "user" ? "Farmer / Agronomist" : "AgriAI Expert"}</span>
                  <span className="message-time">{msg.time}</span>
                </div>
                <div className="bubble-text">
                  {msg.text.split("\n").map((line, lIdx) => (
                    <p key={lIdx} style={{ marginBottom: line === "" ? "0.5rem" : "0.25rem" }}>
                      {line}
                    </p>
                  ))}
                </div>
                {msg.type === "bot" && (
                  <div className="bubble-actions-row">
                    <button className="bubble-action-btn" onClick={() => speakText(msg.text)} title="Listen in Audio">
                      {speaking ? "🔊 Listening..." : "🔊 Read Aloud"}
                    </button>
                    <button className="bubble-action-btn" onClick={() => copyText(msg.text)} title="Copy advice">
                      📋 Copy
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message-bubble bot-bubble">
              <div className="bubble-avatar">🌱</div>
              <div className="bubble-content-wrap">
                <div className="typing-indicator">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                  <span className="typing-text">AgriAI is analyzing agro database...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="chat-input-bar">
          <input
            className="chat-input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about crops, soil nutrients, pests, seeds, weather, fertilizers..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <button className="btn-primary send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
            <span>Send</span>
            <span>➤</span>
          </button>
        </div>
      </div>
    </div>
  );
}