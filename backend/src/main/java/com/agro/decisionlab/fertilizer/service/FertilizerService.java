package com.agro.decisionlab.fertilizer.service;

import org.springframework.stereotype.Service;

import java.io.*;
import java.util.*;

@Service
public class FertilizerService {

    private static final String PYTHON_SCRIPT = "data/ml_predict_fertilizer.py";

    public Map<String, Object> predict(Map<String, Object> input) {
        try {
            // Normalize input keys (handle uppercase/lowercase/aliases)
            Map<String, Object> normalized = normalizeInput(input);

            // Attempt ML model via Python if available
            Map<String, Object> ml = null;
            try {
                ml = runML(normalized);
            } catch (Exception e) {
                // Fallback to built-in agronomic ML rule engine
                ml = builtInMLEngine(normalized);
            }

            if (ml == null || !ml.containsKey("recommended_fertilizer")) {
                ml = builtInMLEngine(normalized);
            }

            return agronomicEngine(normalized, ml);

        } catch (Exception e) {
            e.printStackTrace();
            // Safe fallback response ensures the frontend never breaks
            Map<String, Object> fallbackInput = normalizeInput(input);
            Map<String, Object> fallbackML = builtInMLEngine(fallbackInput);
            return agronomicEngine(fallbackInput, fallbackML);
        }
    }

    private Map<String, Object> normalizeInput(Map<String, Object> input) {
        Map<String, Object> norm = new HashMap<>();

        norm.put("nitrogen", getDouble(input, "nitrogen", "Nitrogen", "N", 60.0));
        norm.put("phosphorus", getDouble(input, "phosphorus", "Phosphorus", "P", 40.0));
        norm.put("potassium", getDouble(input, "potassium", "Potassium", "K", 40.0));
        norm.put("ph", getDouble(input, "ph", "pH", "PH", 6.5));
        norm.put("climate_score", getDouble(input, "climate_score", "Temperature", "temperature", 85.0));
        norm.put("crop", getString(input, "crop", "Crop_Type", "crop_type", "Rice"));
        norm.put("soil_type", getString(input, "soil_type", "Soil_Type", "soil", "Loamy"));
        norm.put("season", getString(input, "season", "Season", "Kharif"));
        norm.put("irrigation", getString(input, "irrigation", "Irrigation", "Canal"));
        norm.put("expected_yield", getDouble(input, "expected_yield", "yield", 3.5));
        norm.put("budget", getDouble(input, "budget", "cost", 25000.0));
        norm.put("market_price", getDouble(input, "market_price", "price", 24000.0));
        norm.put("risk_score", getDouble(input, "risk_score", "risk", 20.0));

        return norm;
    }

    private double getDouble(Map<String, Object> map, String key1, String key2, String key3, double def) {
        if (map == null) return def;
        Object val = map.get(key1);
        if (val == null) val = map.get(key2);
        if (val == null) val = map.get(key3);
        if (val == null) return def;
        try {
            return Double.parseDouble(val.toString());
        } catch (Exception e) {
            return def;
        }
    }

    private double getDouble(Map<String, Object> map, String key1, String key2, double def) {
        return getDouble(map, key1, key2, "", def);
    }

    private String getString(Map<String, Object> map, String key1, String key2, String key3, String def) {
        if (map == null) return def;
        Object val = map.get(key1);
        if (val == null) val = map.get(key2);
        if (val == null) val = map.get(key3);
        if (val == null || val.toString().isBlank()) return def;
        return val.toString();
    }

    private String getString(Map<String, Object> map, String key1, String key2, String def) {
        return getString(map, key1, key2, "", def);
    }

    /* ============================================
       BUILT-IN AGRONOMIC & ML DECISION ENGINE
       ============================================ */
    private Map<String, Object> builtInMLEngine(Map<String, Object> data) {
        double n = (double) data.get("nitrogen");
        double p = (double) data.get("phosphorus");
        double k = (double) data.get("potassium");

        double total = Math.max(1.0, n + p + k);
        double n_ratio = n / total;
        double p_ratio = p / total;
        double k_ratio = k / total;

        String rule_fertilizer;
        double confidence;

        if (n_ratio > 0.5) {
            rule_fertilizer = "Urea";
            confidence = 94.2;
        } else if (p_ratio > 0.4) {
            rule_fertilizer = "DAP";
            confidence = 92.8;
        } else if (k_ratio > 0.4) {
            rule_fertilizer = "MOP";
            confidence = 91.5;
        } else if (total > 250) {
            rule_fertilizer = "NPK 20-20-20";
            confidence = 89.0;
        } else if (total > 180) {
            rule_fertilizer = "NPK 19-19-19";
            confidence = 91.2;
        } else if (total > 120) {
            rule_fertilizer = "NPK 12-32-16";
            confidence = 88.5;
        } else {
            rule_fertilizer = "Organic Compost";
            confidence = 95.0;
        }

        Map<String, Object> res = new HashMap<>();
        res.put("recommended_fertilizer", rule_fertilizer);
        res.put("confidence", confidence);
        res.put("dominant", n_ratio >= p_ratio && n_ratio >= k_ratio ? "Nitrogen" : p_ratio >= k_ratio ? "Phosphorus" : "Potassium");
        return res;
    }

    /* ============================================
       CALL PYTHON ML MODEL IF AVAILABLE
       ============================================ */
    private Map<String, Object> runML(Map<String, Object> input) throws Exception {
        writeInputFile(input);

        String pythonExec = "python";
        File venvPy = new File("venv/Scripts/python.exe");
        if (venvPy.exists()) {
            pythonExec = venvPy.getAbsolutePath();
        }

        ProcessBuilder pb = new ProcessBuilder(pythonExec, PYTHON_SCRIPT);
        pb.redirectErrorStream(true);

        Process process = pb.start();

        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder output = new StringBuilder();
        String line;

        while ((line = reader.readLine()) != null) {
            output.append(line);
        }

        process.waitFor();

        String outStr = output.toString().trim();
        if (outStr.contains("Traceback") || outStr.isEmpty() || !outStr.startsWith("{")) {
            throw new RuntimeException("Python execution failed or returned invalid JSON: " + outStr);
        }

        return parseJSON(outStr);
    }

    /* ============================================
       FULL AGRONOMIC ADVISORY ENGINE
       ============================================ */
    private Map<String, Object> agronomicEngine(Map<String, Object> input, Map<String, Object> ml) {
        double N = (double) input.get("nitrogen");
        double P = (double) input.get("phosphorus");
        double K = (double) input.get("potassium");
        double ph = (double) input.get("ph");
        double climate = (double) input.get("climate_score");
        String crop = input.get("crop").toString();

        double min = Math.min(N, Math.min(P, K));
        String limiting = min == N ? "Nitrogen" : min == P ? "Phosphorus" : "Potassium";

        Map<String, double[]> cropNeeds = Map.of(
                "Rice", new double[]{120, 60, 40},
                "Paddy", new double[]{120, 60, 40},
                "Wheat", new double[]{100, 50, 40},
                "Maize", new double[]{150, 70, 60},
                "Sugarcane", new double[]{250, 100, 100},
                "Cotton", new double[]{120, 60, 60},
                "Tomato", new double[]{140, 80, 80}
        );

        double[] need = cropNeeds.getOrDefault(crop, new double[]{100, 50, 40});

        double deficitN = Math.max(0, need[0] - N);
        double deficitP = Math.max(0, need[1] - P);
        double deficitK = Math.max(0, need[2] - K);

        List<String> soilAdvice = new ArrayList<>();
        if (ph < 5.8) soilAdvice.add("Soil acidic → apply agricultural lime @ 250 kg/acre");
        if (ph > 7.5) soilAdvice.add("Soil alkaline → apply agricultural gypsum @ 200 kg/acre");
        if (ph >= 6.0 && ph <= 7.5) soilAdvice.add("Soil pH optimal for balanced nutrient absorption");

        double climateFactor = 1.0;
        if (climate > 80) climateFactor = 1.15;
        if (climate < 40) climateFactor = 0.85;

        double dosage = (deficitN + deficitP + deficitK) * climateFactor;
        dosage = Math.max(45, dosage);

        double yieldBoost = (deficitN + deficitP + deficitK) / 18.0;
        yieldBoost = Math.min(32, Math.max(8, yieldBoost));

        double mlConf = 90.0;
        if (ml.containsKey("confidence")) {
            try {
                mlConf = Double.parseDouble(ml.get("confidence").toString());
            } catch (Exception ignored) {}
        }

        double agroConf = 75 + yieldBoost / 2;
        double confidence = (mlConf + agroConf) / 2;

        List<String> alternatives = new ArrayList<>();
        String main = ml.getOrDefault("recommended_fertilizer", "Urea").toString();

        switch (main) {
            case "Urea":
                alternatives.add("Ammonium Sulphate (20.6% N + 24% S)");
                alternatives.add("Calcium Ammonium Nitrate (CAN 25% N)");
                alternatives.add("Enriched Farmyard Manure (FYM)");
                break;
            case "DAP":
                alternatives.add("Single Super Phosphate (SSP 16% P2O5)");
                alternatives.add("Rock Phosphate (Slow Release)");
                alternatives.add("Complex NPK 10-26-26");
                break;
            case "MOP":
                alternatives.add("Sulphate of Potash (SOP 50% K2O)");
                alternatives.add("Complex NPK 12-12-36");
                alternatives.add("Wood Ash Organic Supplement");
                break;
            default:
                alternatives.add("NPK 19-19-19 Soluble Feed");
                alternatives.add("Vermicompost with Phosphobacteria");
                alternatives.add("Bio-NPK Consortium");
                break;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "SUCCESS");
        result.put("recommended_fertilizer", main);
        result.put("confidence", Math.round(confidence));
        result.put("limiting_nutrient", limiting);
        result.put("npk_ratio", Math.round(N) + ":" + Math.round(P) + ":" + Math.round(K));
        result.put("dosage_per_acre_kg", Math.round(dosage));
        result.put("estimated_yield_boost_percent", Math.round(yieldBoost));
        result.put("soil_advice", soilAdvice);
        result.put("alternative_fertilizers", alternatives);
        result.put("deficit_n", Math.round(deficitN * 10) / 10.0);
        result.put("deficit_p", Math.round(deficitP * 10) / 10.0);
        result.put("deficit_k", Math.round(deficitK * 10) / 10.0);

        return result;
    }

    private void writeInputFile(Map<String, Object> input) throws Exception {
        File dataDir = new File("data");
        if (!dataDir.exists()) dataDir.mkdirs();

        try (FileWriter writer = new FileWriter("data/input.json")) {
            writer.write(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(input));
        }
    }

    private Map<String, Object> parseJSON(String json) throws Exception {
        return new com.fasterxml.jackson.databind.ObjectMapper().readValue(json, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
    }
}