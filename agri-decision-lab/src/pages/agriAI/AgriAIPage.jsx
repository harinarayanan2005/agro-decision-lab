import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { askAgriAI } from "../../api/agriAI";
import "./agriAI.css";

const agronomicCategories = [
  { id: "all", label: "🌾 All Domains", icon: "🌾" },
  { id: "crops", label: "🌱 Crop Feasibility", icon: "🌱", promptPrefix: "Regarding crop selection and yield: " },
  { id: "soil", label: "🧪 Soil & Nutrients (N-P-K)", icon: "🧪", promptPrefix: "Regarding soil chemistry and fertilizer balancing: " },
  { id: "pests", label: "🍃 Foliar IPM & Pests", icon: "🍃", promptPrefix: "Regarding foliar disease diagnosis and pest control: " },
  { id: "water", label: "💧 Drip & Water Management", icon: "💧", promptPrefix: "Regarding irrigation schedule and water management: " },
  { id: "pattam", label: "🌦️ Tamil Sowing Pattam", icon: "🌦️", promptPrefix: "Regarding Tamil Nadu seasonal sowing windows: " },
];

const realisticFieldScenarios = [
  { label: "💡 Insert Field Scenario...", value: "" },
  {
    label: "🌾 Samba Nursery Khaira Chlorosis (Zinc Sulphate)",
    value: "What are the recommended zinc sulphate dosage and application protocols for seedling chlorosis (Khaira disease) in Samba paddy nursery beds?",
  },
  {
    label: "🍃 Paddy Leaf Blast Treatment (Tricyclazole & Bio)",
    value: "What is the integrated management protocol for severe blast lesions (Magnaporthe oryzae) on ADT-53 paddy foliage?",
  },
  {
    label: "🧪 Organic Nitrogen Restoration in Red Soils",
    value: "How can a farmer organically correct severe nitrogen deficiency in red laterite soil using green manure and Azospirillum bio-fertilizer?",
  },
  {
    label: "🍅 Tomato Blossom End Rot & Calcium Spray",
    value: "What causes blossom end rot in tomato during the fruit-set phase, and what is the foliar calcium nitrate application schedule?",
  },
  {
    label: "💧 Precision Drip Fertigation for Sugarcane",
    value: "What is the recommended fertigation schedule and water volume per hectare for drip-irrigated sugarcane during the tillering phase?",
  },
];

export default function AgriAIPage() {
  const location = useLocation();
  const [input, setInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  const [chat, setChat] = useState([
    {
      type: "bot",
      text: "👋 Welcome to the **Agro DecisionLab Field Agronomist Advisory Desk**!\n\nI assist agricultural extension officers, field workers, and farmers with:\n- 🌾 Crop selection, multi-crop economics, and harvest yield schedules\n- 🧪 Soil health diagnostics and N-P-K nutrient balancing\n- 🍃 Foliar pathology diagnosis and botanical IPM remedies\n- 💧 Micro-irrigation and Tamil Nadu seasonal pattam sowing windows\n\nHow can I support your field operations today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const initialSentRef = useRef(false);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-IN"; // South Asian English with regional clarity

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, []);

  // Handle passed question from Landing Page
  useEffect(() => {
    if (location.state?.initialQuestion && !initialSentRef.current) {
      initialSentRef.current = true;
      sendMessage(location.state.initialQuestion);
    }
  }, [location.state]);

  const toggleSpeechRecognition = () => {
    if (!speechSupported) {
      alert("Speech-to-text dictation is not supported in this browser. Please use Chrome or Edge for voice input.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat.id);
    if (cat.promptPrefix && !input.startsWith(cat.promptPrefix)) {
      setInput(cat.promptPrefix);
      textareaRef.current?.focus();
    }
  };

  const handleScenarioSelect = (e) => {
    const selected = e.target.value;
    if (selected) {
      setInput(selected);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  async function sendMessage(textToSend) {
    const msg = (textToSend || input).trim();
    if (!msg || loading) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setChat((prev) => [...prev, { type: "user", text: msg, time }]);
    setInput("");
    setLoading(false);
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
    } catch {
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
    if (q.includes("zinc") || q.includes("khaira") || q.includes("chlorosis")) {
      return "🧪 **Zinc Deficiency & Khaira Chlorosis Protocol:**\n- **Diagnosis:** Interveinal bronzing and yellowing of young leaves 2–3 weeks after transplanting in heavy delta clay.\n- **Treatment:** Foliar spray of 0.5% Zinc Sulphate (ZnSO4 @ 5 g/L) combined with 1% Urea (10 g/L) twice at 10-day intervals.\n- **Preventative:** Soil application of 25 kg/ha ZnSO4 prior to last puddling.";
    }
    if (q.includes("nitrogen") || q.includes("soil") || q.includes("fertilizer") || q.includes("organic")) {
      return "🧪 **Soil Nutrient & Organic Restoration:**\n- **Green Manuring:** Grow and incorporate *Daincha (Sesbania aculeata)* or Sunnhemp 45 days prior to planting.\n- **Bio-fertilizers:** Seed inoculation with *Azospirillum brasilense* (for non-legumes) fixes 20-40 kg atmospheric N/ha.\n- **Organic Amendments:** Apply well-decomposed FYM (Farm Yard Manure) @ 12.5 t/ha or Vermicompost @ 5 t/ha.";
    }
    if (q.includes("tomato") || q.includes("irrigation") || q.includes("drip") || q.includes("calcium")) {
      return "💧 **Tomato Precision Irrigation & Blossom End Rot:**\n- **Drip Schedule:** 2.5 - 3.5 Litres/plant/day during vegetative stage, increasing to 4.5 - 5.5 L/day during heavy fruit development.\n- **Mulching:** 25-micron silver-black polyethylene mulch reduces evaporative water loss by 40% and prevents soil-borne fungal splash.\n- **Calcium Nutrition:** Spray Foliar Calcium Nitrate @ 1% (10 g/L) during early fruit enlargement to prevent blossom end rot necrosis.";
    }
    return `🌱 **Agronomic Strategic Recommendation:**\nBased on agro-ecological parameters in South India:\n1. Ensure soil testing is conducted every 2 seasons to optimize fertilizer expenditure.\n2. Adopt integrated nutrient management (INM) combining 75% RDF + 25% organic bio-inputs.\n3. Monitor micro-climate and pest vulnerability indices during transition between Kharif and Rabi seasons.`;
  }

  const clearChat = () => {
    setChat([
      {
        type: "bot",
        text: "Chat cleared. Ask me any field agronomy or farm planning question!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const [speaking, setSpeaking] = useState(false);

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) {
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

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

  return (
    <div className="ai-chat-root fade-in">
      {/* Header */}
      <div className="page-header-box">
        <div className="page-title-group">
          <h1>👨‍🌾 Field Agronomist Advisory Desk</h1>
          <p>Practical agricultural guidance calibrated with Tamil Nadu Agricultural University (TNAU) agronomic packages and integrated pest management (IPM)</p>
        </div>
        <div className="header-actions">
          {speaking && (
            <button
              className="btn-secondary"
              style={{ borderColor: "#f43f5e", color: "#fda4af" }}
              onClick={() => {
                window.speechSynthesis.cancel();
                setSpeaking(false);
              }}
            >
              ⏹️ Stop Audio
            </button>
          )}
          <button className="btn-secondary" onClick={clearChat}>
            🗑️ Clear Transcript
          </button>
        </div>
      </div>

      {/* Main Chat & Prompt Viewport */}
      <div className="chat-viewport-card">
        {/* Messages Stream */}
        <div className="messages-stream">
          {chat.map((msg, index) => (
            <div
              key={index}
              className={`chat-message-bubble ${msg.type === "user" ? "user-bubble" : "bot-bubble"}`}
            >
              <div className="bubble-avatar">
                {msg.type === "user" ? "👨‍🌾" : "🌱"}
              </div>
              <div className="bubble-content-wrap">
                <div className="bubble-header">
                  <span className="sender-name">
                    {msg.type === "user" ? "Field Officer / Farmer" : "Senior Agronomist Desk"}
                  </span>
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
                    <button
                      className="bubble-action-btn"
                      onClick={() => speakText(msg.text)}
                      title="Listen to audio advisory"
                    >
                      {speaking ? "🔊 Playing..." : "🔊 Read Aloud (TTS)"}
                    </button>
                    <button
                      className="bubble-action-btn"
                      onClick={() => copyText(msg.text)}
                      title="Copy advice text"
                    >
                      📋 Copy Note
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
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-text">Agronomy desk evaluating soil chemistry and crop records...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Upgraded Agronomist Prompt Studio Console */}
        <div className="agronomy-prompt-console">
          {/* Category Filter Chips */}
          <div className="prompt-category-bar">
            <span className="category-bar-label">Focus Area:</span>
            {agronomicCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`prompt-cat-chip ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => handleCategoryClick(cat)}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Prompt Box */}
          <div className="prompt-box-wrapper">
            {/* Live Voice Dictation Banner if Active */}
            {isListening && (
              <div className="voice-listening-banner">
                <div className="voice-wave-group">
                  <span className="voice-pulse-dot" />
                  <span>
                    <strong>Microphone Active:</strong> Listening for speech (English / Tamil field terms)...
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-stop-voice"
                  onClick={toggleSpeechRecognition}
                >
                  Done Speaking
                </button>
              </div>
            )}

            {/* Auto-expanding Textarea */}
            <textarea
              ref={textareaRef}
              className="prompt-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about crop selection, soil deficiency, N-P-K balancing, pest management, or seasonal pattam sowing..."
              disabled={loading}
              rows={2}
            />

            {/* Bottom Toolbar inside the prompt box */}
            <div className="prompt-bottom-toolbar">
              <div className="prompt-tools-left">
                {/* Voice Speech Recognition Button */}
                <button
                  type="button"
                  className={`tool-icon-btn ${isListening ? "active-mic" : ""}`}
                  onClick={toggleSpeechRecognition}
                  title="Speech-to-text voice dictation"
                >
                  <span>{isListening ? "⏹️" : "🎙️"}</span>
                  <span>{isListening ? "Listening..." : "Voice Input"}</span>
                </button>

                {/* Field Scenario Dropdown */}
                <select
                  className="scenario-select-dropdown"
                  onChange={handleScenarioSelect}
                  value=""
                  title="Insert standard field scenario"
                >
                  {realisticFieldScenarios.map((sc, sIdx) => (
                    <option key={sIdx} value={sc.value}>
                      {sc.label}
                    </option>
                  ))}
                </select>

                {/* Clear text button */}
                {input.length > 0 && (
                  <button
                    type="button"
                    className="btn-clear-text"
                    onClick={() => setInput("")}
                    title="Clear prompt"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>

              <div className="prompt-tools-right">
                <span className="prompt-char-count">
                  {input.length} chars • {wordCount} words
                </span>

                <div className="keyboard-hint">
                  <kbd>↵ Enter</kbd> to Send • <kbd>Shift+↵</kbd> line
                </div>

                <button
                  type="button"
                  className="prompt-send-btn"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                >
                  <span>{loading ? "Consulting..." : "Consult Desk"}</span>
                  <span className="prompt-send-icon">➤</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}