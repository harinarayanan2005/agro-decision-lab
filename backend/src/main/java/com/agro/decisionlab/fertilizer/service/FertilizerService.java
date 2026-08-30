package com.agro.decisionlab.fertilizer.service;

import org.springframework.stereotype.Service;

import java.io.*;
import java.util.*;

@Service
public class FertilizerService {

    private static final String PYTHON_SCRIPT =
            "data/ml_predict_fertilizer.py";

    public Map<String,Object> predict(Map<String,Object> input){

        try{

            Map<String,Object> ml = runML(input);

            return agronomicEngine(input, ml);

        }catch(Exception e){

            e.printStackTrace();

            return Map.of(
                    "status","ERROR",
                    "message",e.getMessage()
            );
        }
    }

    /* ================================
       CALL PYTHON ML MODEL
    ================================= */

    private Map<String,Object> runML(Map<String,Object> input)
            throws Exception{

        writeInputFile(input);

        ProcessBuilder pb =
                new ProcessBuilder("python", PYTHON_SCRIPT);

        pb.redirectErrorStream(true);

        Process process = pb.start();

        BufferedReader reader =
                new BufferedReader(
                        new InputStreamReader(
                                process.getInputStream()
                        )
                );

        StringBuilder output = new StringBuilder();
        String line;

        while((line = reader.readLine()) != null)
            output.append(line);

        process.waitFor();

        return parseJSON(output.toString());
    }

    /* ================================
       AGRONOMIC DECISION ENGINE
    ================================= */

    private Map<String,Object> agronomicEngine(
            Map<String,Object> input,
            Map<String,Object> ml){

        double N = Double.parseDouble(input.get("nitrogen").toString());
        double P = Double.parseDouble(input.get("phosphorus").toString());
        double K = Double.parseDouble(input.get("potassium").toString());
        double ph = Double.parseDouble(input.get("ph").toString());
        double climate =
                Double.parseDouble(input.get("climate_score").toString());

        String crop = input.get("crop").toString();


        /* ================================
           LIMITING NUTRIENT
        ================================= */

        double min = Math.min(N, Math.min(P,K));

        String limiting =
                min == N ? "Nitrogen" :
                min == P ? "Phosphorus" :
                "Potassium";


        /* ================================
           CROP REQUIREMENTS
        ================================= */

        Map<String,double[]> cropNeeds = Map.of(
                "Rice", new double[]{120,60,40},
                "Wheat", new double[]{100,50,40},
                "Maize", new double[]{150,70,60},
                "Sugarcane", new double[]{250,100,100}
        );

        double[] need =
                cropNeeds.getOrDefault(crop,
                        new double[]{100,50,40});

        double deficitN = Math.max(0, need[0]-N);
        double deficitP = Math.max(0, need[1]-P);
        double deficitK = Math.max(0, need[2]-K);


        /* ================================
           SOIL PH ADVICE
        ================================= */

        List<String> soilAdvice = new ArrayList<>();

        if(ph < 5.8)
            soilAdvice.add("Soil acidic → apply agricultural lime");

        if(ph > 7.5)
            soilAdvice.add("Soil alkaline → apply gypsum");

        if(ph >=6 && ph <=7)
            soilAdvice.add("Soil pH optimal for most crops");


        /* ================================
           CLIMATE FACTOR
        ================================= */

        double climateFactor = 1;

        if(climate > 80)
            climateFactor = 1.15;

        if(climate < 40)
            climateFactor = 0.85;


        /* ================================
           DOSAGE
        ================================= */

        double dosage =
                (deficitN + deficitP + deficitK)
                        * climateFactor;

        dosage = Math.max(40, dosage);


        /* ================================
           YIELD BOOST
        ================================= */

        double yieldBoost =
                (deficitN + deficitP + deficitK) / 20;

        yieldBoost = Math.min(30, yieldBoost);


        /* ================================
           CONFIDENCE
        ================================= */

        double mlConf =
                Double.parseDouble(
                        ml.get("confidence").toString());

        double agroConf =
                70 + yieldBoost/2;

        double confidence =
                (mlConf + agroConf)/2;


        /* ================================
           ALTERNATIVE FERTILIZERS
        ================================= */

        List<String> alternatives = new ArrayList<>();

        String main =
                ml.get("recommended_fertilizer").toString();

        switch(main){

            case "Urea":
                alternatives.add("Ammonium Sulphate");
                alternatives.add("Calcium Ammonium Nitrate");
                alternatives.add("Organic Compost");
                break;

            case "DAP":
                alternatives.add("Single Super Phosphate");
                alternatives.add("Rock Phosphate");
                alternatives.add("NPK 10-26-26");
                break;

            case "MOP":
                alternatives.add("Sulphate of Potash");
                alternatives.add("NPK 12-12-36");
                break;

            default:
                alternatives.add("NPK 19-19-19");
                alternatives.add("Organic Compost");
        }


        /* ================================
           FINAL RESULT
        ================================= */

        Map<String,Object> result =
                new LinkedHashMap<>();

        result.put("recommended_fertilizer", main);
        result.put("confidence", Math.round(confidence));

        result.put("limiting_nutrient", limiting);

        result.put("npk_ratio", N+":"+P+":"+K);

        result.put("dosage_per_acre_kg",
                Math.round(dosage));

        result.put("estimated_yield_boost_percent",
                Math.round(yieldBoost));

        result.put("soil_advice", soilAdvice);

        result.put("alternative_fertilizers",
                alternatives);

        result.put("deficit_n", deficitN);
        result.put("deficit_p", deficitP);
        result.put("deficit_k", deficitK);

        return result;
    }

    /* ================================ */

    private void writeInputFile(Map<String,Object> input)
            throws Exception{

        FileWriter writer =
                new FileWriter("data/input.json");

        writer.write(
                new com.fasterxml.jackson.databind.ObjectMapper()
                        .writeValueAsString(input)
        );

        writer.close();
    }

    private Map<String,Object> parseJSON(String json)
            throws Exception{

        return new com.fasterxml.jackson.databind.ObjectMapper()
                .readValue(json, Map.class);
    }
}