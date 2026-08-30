import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";

import CropPlannerPage from "./pages/CropPlanner/CropPlannerPage";
import DiseasePredictorPage from "./pages/disease/DiseasePredictorPage";
import AnalyticsDashboard from "./pages/analytics/AnalyticsDashboard";
import FertilizerPage from "./pages/FertilizerAI/FertilizerPage";
import SupplyChainPage from "./pages/SupplyChain/SupplyChainPage";

/* ADD THIS IMPORT */
import AgriAIPage from "./pages/agriAI/AgriAIPage";


export default function App() {
  return (
    <Routes>

      <Route element={<DashboardLayout />}>

        {/* EXISTING ROUTES */}

        <Route path="/" element={<CropPlannerPage />} />

        <Route path="/analytics" element={<AnalyticsDashboard />} />

        <Route path="/disease-ai" element={<DiseasePredictorPage />} />

        <Route path="/fertilizer-ai" element={<FertilizerPage />} />

        <Route path="/supply-chain" element={<SupplyChainPage />} />


        {/* ADD THIS NEW ROUTE */}
        <Route path="/agri-ai" element={<AgriAIPage />} />


      </Route>

    </Routes>
  );
}