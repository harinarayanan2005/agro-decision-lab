import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";

import LandingPage from "./pages/Landing/LandingPage";
import CropPlannerPage from "./pages/CropPlanner/CropPlannerPage";
import AgroGisPage from "./pages/gisMap/AgroGisPage";
import DiseasePredictorPage from "./pages/disease/DiseasePredictorPage";
import AnalyticsDashboard from "./pages/analytics/AnalyticsDashboard";
import FertilizerPage from "./pages/FertilizerAI/FertilizerPage";
import SupplyChainPage from "./pages/SupplyChain/SupplyChainPage";
import AgriAIPage from "./pages/agriAI/AgriAIPage";

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/crop-planner" element={<CropPlannerPage />} />
        <Route path="/planner" element={<CropPlannerPage />} />
        <Route path="/agro-gis" element={<AgroGisPage />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/disease-ai" element={<DiseasePredictorPage />} />
        <Route path="/fertilizer-ai" element={<FertilizerPage />} />
        <Route path="/supply-chain" element={<SupplyChainPage />} />
        <Route path="/agri-ai" element={<AgriAIPage />} />
      </Route>
    </Routes>
  );
}