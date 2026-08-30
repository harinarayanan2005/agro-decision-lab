# 🌾 Agro DecisionLab — Next-Gen Agri-Intelligence & Decision Support System

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![Python ML](https://img.shields.io/badge/Python-Scikit--Learn-3776AB?style=flat-square&logo=python)](https://python.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

An enterprise-grade **Agricultural Decision Intelligence Platform** designed to maximize farmer net profitability, optimize soil nutrient inputs, diagnose crop diseases in real-time, provide cryptographic supply chain traceability, forecast Mandi commodity prices, and deliver interactive AI agronomic advisory.

---

## 🌟 Key Modules & Capabilities

### 1. 🌾 Crop Profit & Yield Planner
* **Multi-Parameter Optimization:** Analyzes land acreage, budget constraints, irrigation infrastructure (Drip, Canal, Sprinkler, Rainfed), soil taxonomy, and agro-seasons.
* **All-Crops Comparison Grid:** Evaluates and compares all competing crop varieties (*Sugarcane, Rice, Wheat, Tomato, Potato, Capsicum, Millet, Horsegram*) simultaneously.
* **Interactive Data Visualizations:** Real-time **Recharts Bar & Radar Charts** displaying Estimated Profit per Acre vs. Total Expected Yield.
* **1-Click Scenario Presets:** Pre-configured simulations (*High-Yield Kharif*, *Low-Water Rainfed*, *Drip Precision Tech*).
* **Export Feasibility Report:** Instant one-click printable agro-economic feasibility certificate.

### 2. 🧪 Fertilizer Advisory System
* **Real-time N-P-K Nutrient Diagnostics:** Dynamic visual status gauges evaluating Nitrogen, Phosphorus, and Potassium levels against crop baseline standards.
* **3-Stage Nutrient Application Roadmap:** Phased application timeline (*Basal Application at Sowing*, *Active Vegetative Stage*, *Panicle / Flowering Phase*).
* **Organic & Bio-fertilizer Formulations:** Sustainable alternatives incorporating *Azospirillum*, *Phosphobacteria*, and FYM compost.

### 3. 🍃 Crop Disease Vision Diagnostician
* **Drag-and-Drop Leaf Analysis:** Upload crop leaf photographs with an animated laser scanning diagnostic simulation.
* **1-Click Test Samples:** Built-in pathology samples for instant demonstration (*Tomato Early Blight*, *Rice Leaf Blast*, *Healthy Maize*).
* **Actionable Treatment Protocols:** Severity classification (*Low, Moderate, High*), fungicide chemical recipes, and organic cultural practices.

### 4. 🔗 Blockchain Supply Chain & Mandi Logistics
* **Cryptographic Proof-of-Work Ledger:** Immutable batch tracking (*Harvested → Warehoused → Transported → Sold at Mandi*) with SHA-256 hash explorer.
* **Mandi Freight & Transit Estimator:** Real-time freight cost and delivery duration calculator based on distance (km) and cargo tonnage.
* **Integrity & Trust Metrics:** Verifiable block tamper-proofing and timestamp verification.

### 5. 📊 Market Mandi Intelligence & Price Forecasting
* **Historical & Projected Trajectory (2018–2026):** Gradient area charts forecasting crop APMC spot market trends.
* **Price Volatility vs. Shelf-Life Matrix:** Risk index comparing commodity perishability with optimal market holding windows.
* **District Spot Benchmarks:** Live benchmark trading rates across Tamil Nadu APMC Mandis (*Thanjavur, Madurai, Coimbatore, Salem, Tiruchirappalli*).

### 6. 🤖 Agri AI Intelligent Assistant
* **Conversational Agronomist Copilot:** Generative AI assistant trained on agronomic datasets, soil chemistry, and integrated pest management (IPM).
* **🔊 Text-to-Speech (TTS) Voice Reader:** One-click audio narration of farming advice for accessible farm advisory.
* **Offline Agronomic Expert Fallback:** Zero downtime assurance with built-in rule engines.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite 7, React Router 7, Recharts 3, Vanilla CSS (Emerald Glassmorphism Design System) |
| **Backend** | Spring Boot 3 (Java 17/21), RESTful Microservices, ProcessBuilder Engine |
| **Machine Learning** | Python 3, Scikit-Learn, Pandas, NumPy, Joblib |
| **Security & Storage** | SHA-256 Cryptographic Block Ledger, Master Agricultural CSV Datasets |

---

## 🚀 How to Run the Project (Step-by-Step)

### Prerequisites
Make sure you have the following installed on your computer:
* **Java Development Kit (JDK 17 or higher)**
* **Node.js (v18 or higher)** & `npm`
* **Python (v3.9 or higher)**

---

### Option 1: ⚡ 1-Click Automated Launcher (Windows)

1. Open File Explorer and go to the project directory:
   ```text
   D:\FINAL PROJECT\Agri Index\Agri-Intelligence-System (3)\Agri-Intelligence-System
   ```
2. Double-click **`start-agri-system.bat`** (or run `.\run-all.ps1` in PowerShell).
3. The script will automatically:
   * Setup/verify the Python virtual environment (`venv`).
   * Start the Spring Boot backend on **port 8081**.
   * Start the React dev server on **port 5173**.
   * Open **`http://localhost:5173`** in your default browser!

---

### Option 2: 🖥️ Manual Startup (Two Terminals)

#### Terminal 1: Start Backend (Spring Boot)
```cmd
D:
cd "D:\FINAL PROJECT\Agri Index\Agri-Intelligence-System (3)\Agri-Intelligence-System\backend"
python -m venv venv
venv\Scripts\activate
pip install numpy pandas scikit-learn joblib
mvnw.cmd spring-boot:run
```
*(In PowerShell: run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`, then `.\venv\Scripts\Activate.ps1`, then `.\mvnw.cmd spring-boot:run`)*

Wait until the terminal displays:
```text
Agro DecisionLab AI Server Started - http://localhost:8081
```

#### Terminal 2: Start Frontend (React + Vite)
```cmd
D:
cd "D:\FINAL PROJECT\Agri Index\Agri-Intelligence-System (3)\Agri-Intelligence-System\agri-decision-lab"
npm.cmd run dev
```

#### Open in Your Web Browser:
Navigate to:
👉 **`http://localhost:5173`** *(or `http://127.0.0.1:5173`)*

---

## 📡 Backend API Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/crop-planner/calculate` | `POST` | Calculates optimal crop ranking, yield, and profit estimates |
| `/api/crop-planner/health` | `GET` | Health check probe for ML Crop Planner service |
| `/api/fertilizer/predict` | `POST` | Generates soil nutrient balancing & fertilizer schedule |
| `/api/disease/predict` | `POST` | Analyzes uploaded leaf image and returns pathology report |
| `/api/supply-chain/add` | `POST` | Mines and appends a new block to the provenance ledger |
| `/api/supply-chain/trace/{batchId}` | `GET` | Retrieves full immutable lifecycle history for a batch |
| `/api/agri-ai/ask` | `POST` | Queries generative agronomy assistant with fallback engine |

---

## 👤 Author & Maintainer

* **Author:** Harinarayanan N
* **GitHub:** [@harinarayanan2005](https://github.com/harinarayanan2005)
* **Repository:** [agro-decision-lab](https://github.com/harinarayanan2005/agro-decision-lab)

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
