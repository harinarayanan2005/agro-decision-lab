import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "3rem", color: "#fff", background: "#0f172a", minHeight: "100vh", fontFamily: "sans-serif" }}>
          <h2 style={{ color: "#f43f5e" }}>⚠️ Interface Rendering Notice</h2>
          <p style={{ marginTop: "1rem", color: "#94a3b8" }}>{this.state.error?.message || "An unexpected render event occurred."}</p>
          <button 
            style={{ marginTop: "1.5rem", padding: "0.75rem 1.5rem", background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
            onClick={() => window.location.reload()}
          >
            🔄 Reload Platform
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);