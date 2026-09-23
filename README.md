# 🌾 Agro DecisionLab — Agricultural Decision Intelligence Platform

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![Python ML](https://img.shields.io/badge/Python-Scikit--Learn-3776AB?style=flat-square&logo=python)](https://python.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

An enterprise-grade **Agricultural Decision Intelligence Platform** designed to maximize farmer net profitability, optimize soil nutrient inputs, diagnose crop diseases via computer vision, provide cryptographic supply chain traceability, forecast Mandi commodity prices, and deliver interactive AI agronomic advisory.

---

## 🌟 Key Modules & Capabilities

### 1. 🌾 Field & Crop Profit Planner
* **Multi-Parameter Optimization:** Analyzes land acreage, budget constraints, irrigation infrastructure (Drip, Canal, Sprinkler, Rainfed), soil taxonomy, and agro-seasons.
* **Tamil Pattam Seasonal Sowing Integration:** Interactive selector for classical Tamil agricultural seasons (*Chithirai Pattam, Aadi Pattam, Purattasi Pattam, Aippasi Pattam, Thai Pattam, Masi Pattam*).
* **All-Crops Comparison Grid:** Evaluates and ranks competing crops (*Sugarcane, Rice, Wheat, Tomato, Potato, Capsicum, Millet, Horsegram*) simultaneously.
* **Visual Feasibility Projections:** Real-time **Recharts Bar & Radar Charts** evaluating profit per acre, total yield, and risk profiles.
* **1-Click Scenario Presets:** Pre-configured agro simulations (*Cauvery Delta Paddy*, *Dryland Millets & Pulses*, *Precision Drip Horticulture*).

### 2. 🧪 Soil Nutrient Balancing & Fertilizer Advisory
* **Real-time N-P-K Stoichiometry:** Dynamic status gauges assessing Nitrogen, Phosphorus, Potassium, and pH levels against crop benchmarks.
* **Dual-Engine Architecture:** Operates with active Spring Boot REST backend (`/api/fertilizer/predict`) on port `8081` alongside an autonomous client-side agronomic engine for zero downtime.
* **Limiting Nutrient Detection:** Pinpoints the primary limiting element and recommends targeted NPK fertilizer ratios (Urea, DAP, MOP, NPK complexes).
* **3-Stage Nutrient Roadmap:** Application timeline (*Basal Application at Sowing*, *Active Vegetative Phase*, *Panicle / Flowering Phase*).

### 3. 🍃 Plant Health & Leaf Pathology Diagnostic Lab
* **HTML5 Canvas Pixel Color & Lesion Inspection:** Analyzes raw pixel data to quantify:
  * 🌿 **Chlorophyll Index**: Active green foliage saturation
  * 🟤 **Necrosis Density**: Dead cellular tissue surface area
  * 🟡 **Chlorosis Index**: Yellowing toxin diffusion and halo fringes
  * 🔍 **Infection Staging**: *Stage I (Inception)*, *Stage II (Active Sporulation)*, *Stage III (Severe Blight)*
* **Strict Biological Health Guard:** Prevents diseased foliage from misclassifying as healthy.
* **Target Crop Context Selector:** Allows auto-detection or explicit focus on *Paddy/Rice, Tomato, Potato, Cotton, Wheat, Maize, Groundnut*.
* **Precise Singular Pathogen Diagnosis:** Provides singular Latin binomials without generic combined slashes (*Cedar Apple Rust, Rice Leaf Blast, Tomato Early Blight, Potato Late Blight, Cotton Bacterial Blight, Wheat Stripe Rust*).
* **Diagnostic Etiology Card:** Explains the biological basis (Lesion Morphology, Canopy Spectral Profile, Pathological Mechanism).
* **Dedicated 3-Pillar Remedy Advisory (Directly Below Report):**
  * 🧪 **Chemical Treatments:** Specific active ingredients, formulations, and dilution dosages (e.g. *Propiconazole 25% EC @ 1.0 mL/L*, *Tricyclazole 75% WP @ 0.6 g/L*, *Ridomil Gold @ 2.5 g/L*).
  * 🌿 **Organic & Biological Alternatives:** Eco-friendly controls (*Wettable Sulfur 80% WDG*, *Pseudomonas fluorescens*, *Neem Seed Kernel Extract NSKE 5%*).
  * 🚜 **Cultural & Sanitation Practices:** Field hygiene, canopy pruning, drip irrigation transition, and host eradication.

### 4. 🗺️ Agro-Climatic Spatial GIS Map & Live Weather
* **Multi-Layer Base Maps:** Toggle between **Satellite Imagery**, **Topographic Terrain**, and **Carto Clean** tiles.
* **Tamil Nadu 7 Agro-Climatic Zones:** Interactive boundary polygons for *Cauvery Delta, Western Zone, Southern Zone, North Eastern Zone, North Western Zone, High Rainfall Zone, and Hilly Zone*.
* **Live Weather Telemetry:** Integrated with Open-Meteo API for real-time temperature, humidity, wind velocity, and precipitation forecasts.

### 5. 🎒 Knapsack Sprayer Tank & Dilution Calculator
* **Farmer Field Tool:** Quick topbar modal to calculate chemical tank load for standard 16-liter and 20-liter knapsack sprayers.
* **Dosage Conversion:** Computes total water volume (L/acre), required formulation weight (g or mL), and number of tank fills needed.

### 6. 🔗 Blockchain Supply Chain & Mandi Dispatch
* **Cryptographic Proof-of-Work Ledger:** Immutable batch tracking (*Harvested → Warehoused → Transported → Sold at Mandi*) with SHA-256 block explorer.
* **Mandi Freight & Transit Estimator:** Real-time transport cost, duration, and logistics carbon emission calculations.
* **Tamper-Evident Ledger:** Verifiable previous-hash block integrity chaining.

### 7. 📊 Mandi Market Intelligence & Price Forecasting
* **Historical & Projected Trajectories (2018–2026):** Gradient area charts forecasting APMC spot market trends.
* **District Spot Benchmarks:** Live trading rates across Tamil Nadu Mandis (*Thanjavur, Madurai, Coimbatore, Salem, Tiruchirappalli*).
* **Price Volatility vs. Shelf-Life Matrix:** Commodity risk index comparing storage viability with market holding windows.

### 8. 👨‍🌾 Agronomist Advisory Desk
* **Interactive Advisory Console:** Generative AI assistant trained on agronomy, soil chemistry, and plant pathology.
* **Voice Speech-to-Text Dictation:** Hands-free voice inquiry for field workers and farmers.
* **Offline Agronomic Expert Fallback:** Pre-loaded domain guidance for rice blast, zinc chlorosis, tomato blossom end rot, and drip fertigation.

### 9. 🎨 2-Theme Agricultural Design System
* **Instant 1-Click Switcher:** Seamless toggle between **🌿 Forest Dark** (signature emerald theme) and **☀️ Daylight Mode** (crisp high-contrast parchment).
* Clean topbar user profile avatar without visual clutter or overlapping text.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 7, React Router 7, Recharts 3, Leaflet GIS, HTML5 Canvas API, Vanilla CSS Design System |
| **Backend** | Spring Boot 3 / 4 (Java 17/21), RESTful Microservices, ProcessBuilder Engine |
| **Machine Learning** | Python 3, Scikit-Learn, Pandas, NumPy, Joblib |
| **Security & Storage** | SHA-256 Cryptographic Block Ledger, Master Agricultural CSV Datasets |

---

## 🚀 Running the Project Locally

### 1. Start the Backend (Spring Boot — Port 8081)
```powershell
cd "backend"
.\mvnw.cmd spring-boot:run
```
*(Runs Tomcat on port `8081` with active ML crop intelligence).*

### 2. Start the Frontend (Vite — Port 5173)
```powershell
cd "agri-decision-lab"
npm run dev
```
*(Open your browser at **`http://localhost:5173`** to access the complete application).*

### 3. One-Click Startup Script
You can also launch both frontend and backend concurrently by running:
```powershell
.\start-agri-system.bat
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
