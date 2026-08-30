package com.agro.decisionlab.cropplanner.service;

import org.springframework.stereotype.Service;

import java.io.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CropPlannerService {

    private static final String DATASET_PATH =
            "data/crop_recommendation_master_dataset.csv";

    private static final String PYTHON_SCRIPT =
            "data/ml_predict.py";

    private static final String PYTHON_EXEC = "python";


    /* REAL BIOLOGICAL LIMITS */
    private static final Map<String,double[]> YIELD_LIMITS = Map.ofEntries(

            Map.entry("Horsegram", new double[]{0.2,0.8}),
            Map.entry("Millet", new double[]{0.5,1.8}),
            Map.entry("Rice", new double[]{1.5,5}),
            Map.entry("Wheat", new double[]{1.2,4}),
            Map.entry("Sugarcane", new double[]{25,60}),
            Map.entry("Capsicum", new double[]{2,12}),
            Map.entry("Tomato", new double[]{5,25}),
            Map.entry("Potato", new double[]{8,30})
    );


    public List<Map<String,Object>> calculate(Map<String,Object> req){

        double land = dbl(req,"land_acres");
        double budget = dbl(req,"budget");

        String soil = str(req,"soil_type");
        String season = str(req,"season");
        String irrigation = str(req,"irrigation");

        if(soil.isEmpty()) soil="Loamy";
        if(season.isEmpty()) season="Kharif";
        if(irrigation.isEmpty()) irrigation="Rainfed";


        List<String> mlCrops =
                getMLPredictions(soil,season,irrigation);

        List<Map<String,Object>> dataset =
                loadDataset();


        Map<String,Map<String,Object>> bestPerCrop =
                new HashMap<>();


        for(Map<String,Object> row : dataset){

            String crop =
                    row.get("crop").toString();

            /* STRONG ML FILTER */
            if(!mlCrops.isEmpty()
                    &&
                    !mlCrops.contains(crop))
                continue;


            double baseYield =
                    dbl(row,"yield_ton_per_acre");

            double costPerAcre =
                    dbl(row,"cost_rs_per_acre");

            double price =
                    dbl(row,"price_rs_per_ton");

            double climate =
                    dbl(row,"climate_score");

            double riskRaw =
                    dbl(row,"risk_score");


            /* IRRIGATION EFFECT */
            double irrigationFactor =
                    irrigationFactor(irrigation);


            /* CLIMATE EFFECT */
            double climateFactor =
                    0.6 + (climate / 120.0);


            /* FINAL YIELD PER ACRE */
            double yieldPerAcre =
                    baseYield *
                    irrigationFactor *
                    climateFactor;


            /* BIOLOGICAL CLAMP */
            double[] limits =
                    YIELD_LIMITS.getOrDefault(
                            crop,
                            new double[]{0.5,15});

            yieldPerAcre =
                    clamp(yieldPerAcre,
                            limits[0],
                            limits[1]);


            double totalYield =
                    yieldPerAcre * land;


            /* TOTAL COST */
            double totalCost =
                    costPerAcre * land;

            if(totalCost > budget)
                continue;


            /* MARKET PRICE EFFECT */
            double marketFactor =
                    0.9 + climate/200;

            double adjustedPrice =
                    price * marketFactor;


            /* REVENUE */
            double revenue =
                    totalYield * adjustedPrice;


            /* PROFIT */
            double profit =
                    revenue - totalCost;

            double profitPerAcre =
                    profit / land;


            /* RISK CALCULATION */
            int irrigationRisk =
                    irrigation.equals("Rainfed")?30:
                    irrigation.equals("Canal")?20:
                    irrigation.equals("Sprinkler")?10:
                    irrigation.equals("Drip")?5:15;

            int riskScore =
                    clamp(
                            (int)(
                                    riskRaw*40 +
                                    irrigationRisk +
                                    (100-climate)/3
                            ),
                            10,95);


            String riskLevel =
                    riskScore<35?"Low":
                    riskScore<65?"Medium":"High";


            /* CONFIDENCE */
            int confidence =
                    clamp(
                            (int)(
                                    85 -
                                    riskScore/2 +
                                    climate/2
                            ),
                            40,
                            95);


            /* BUDGET EFFICIENCY */
            double efficiency =
                    profit / totalCost;


            /* FINAL AI SCORE */
            double aiScore =
                    profitPerAcre * 0.7 +
                    confidence * 20 +
                    efficiency * 500 -
                    riskScore * 8;


            Map<String,Object> result =
                    new LinkedHashMap<>();

            result.put("crop",crop);
            result.put("expected_yield_tons",
                    round(totalYield));

            result.put("total_net_profit",
                    round(profit));

            result.put("total_net_profit_human",
                    money(profit));

            result.put("profit_per_acre",
                    round(profitPerAcre));

            result.put("profit_per_acre_human",
                    money(profitPerAcre));

            result.put("risk_level",riskLevel);
            result.put("confidence_score",confidence);
            result.put("ai_score",aiScore);


            if(!bestPerCrop.containsKey(crop)
                    ||
                    dbl(bestPerCrop.get(crop),"ai_score")
                            < aiScore){

                bestPerCrop.put(crop,result);
            }
        }

        // Adaptive Fallback: If strict budget/ML constraints yield 0 results, calculate best scalable options
        if (bestPerCrop.isEmpty()) {
            for(Map<String,Object> row : dataset) {
                String crop = row.get("crop").toString();
                double baseYield = dbl(row,"yield_ton_per_acre");
                double costPerAcre = dbl(row,"cost_rs_per_acre");
                double price = dbl(row,"price_rs_per_ton");
                double climate = dbl(row,"climate_score");
                double riskRaw = dbl(row,"risk_score");

                double irrigationFactor = irrigationFactor(irrigation);
                double climateFactor = 0.6 + (climate / 120.0);
                double yieldPerAcre = baseYield * irrigationFactor * climateFactor;
                double[] limits = YIELD_LIMITS.getOrDefault(crop, new double[]{0.5,15});
                yieldPerAcre = clamp(yieldPerAcre, limits[0], limits[1]);

                double totalYield = yieldPerAcre * land;
                double totalCost = costPerAcre * land;
                double revenue = totalYield * price;
                double profit = revenue - totalCost;
                double profitPerAcre = profit / land;

                int riskScore = clamp((int)(riskRaw*35 + (100-climate)/4), 15, 85);
                String riskLevel = riskScore < 35 ? "Low" : riskScore < 65 ? "Medium" : "High";
                int confidence = clamp((int)(82 - riskScore/2 + climate/2), 50, 95);
                double efficiency = totalCost > 0 ? (profit / totalCost) : 1.0;
                double aiScore = profitPerAcre * 0.7 + confidence * 20 + efficiency * 400 - riskScore * 5;

                Map<String,Object> result = new LinkedHashMap<>();
                result.put("crop", crop);
                result.put("expected_yield_tons", round(totalYield));
                result.put("total_net_profit", round(profit));
                result.put("total_net_profit_human", money(profit));
                result.put("profit_per_acre", round(profitPerAcre));
                result.put("profit_per_acre_human", money(profitPerAcre));
                result.put("risk_level", riskLevel);
                result.put("confidence_score", confidence);
                result.put("ai_score", aiScore);

                if(!bestPerCrop.containsKey(crop) || dbl(bestPerCrop.get(crop),"ai_score") < aiScore){
                    bestPerCrop.put(crop, result);
                }
            }
        }

        return bestPerCrop.values()
                .stream()
                .sorted((a,b)->
                        Double.compare(
                                dbl(b,"ai_score"),
                                dbl(a,"ai_score")))
                .limit(5)
                .collect(Collectors.toList());
    }


    /* IRRIGATION EFFECT */
    private double irrigationFactor(String irrigation){

        switch(irrigation){

            case "Drip": return 1.2;
            case "Sprinkler": return 1.0;
            case "Canal": return 0.85;
            case "Rainfed": return 0.6;
        }

        return 0.8;
    }


    private List<String> getMLPredictions(
            String soil,String season,String irrigation){

        List<String> crops=new ArrayList<>();

        try{

            ProcessBuilder pb =
                    new ProcessBuilder(
                            PYTHON_EXEC,
                            PYTHON_SCRIPT,
                            soil,
                            season,
                            irrigation
                    );

            pb.redirectErrorStream(true);

            Process process=pb.start();

            BufferedReader reader =
                    new BufferedReader(
                            new InputStreamReader(
                                    process.getInputStream()
                            )
                    );

            String line;

            while((line=reader.readLine())!=null){

                line=line.trim();

                if(!line.isEmpty()
                        &&
                        !line.contains("Warning"))
                    crops.add(line);
            }

        }catch(Exception e){
            e.printStackTrace();
        }

        return crops;
    }


    private List<Map<String,Object>> loadDataset(){
        List<Map<String,Object>> list = new ArrayList<>();

        File file = new File(DATASET_PATH);
        if (!file.exists()) {
            file = new File("backend/" + DATASET_PATH);
        }
        if (!file.exists()) {
            file = new File("../backend/" + DATASET_PATH);
        }

        if (file.exists()) {
            try (BufferedReader br = new BufferedReader(new FileReader(file))) {
                String header = br.readLine();
                if (header != null) {
                    String[] cols = header.split(",");
                    Map<String,Integer> index = new HashMap<>();
                    for(int i = 0; i < cols.length; i++)
                        index.put(cols[i].trim(), i);

                    String line;
                    while((line = br.readLine()) != null) {
                        String[] t = line.split(",");
                        if (t.length > 0 && index.containsKey("crop")) {
                            Map<String,Object> row = new HashMap<>();
                            row.put("crop", t[index.get("crop")].trim());
                            row.put("yield_ton_per_acre", parse(t[index.get("yield_ton_per_acre")]));
                            row.put("price_rs_per_ton", parse(t[index.get("price_rs_per_ton")]));
                            row.put("cost_rs_per_acre", parse(t[index.get("cost_rs_per_acre")]));
                            row.put("risk_score", parse(t[index.get("risk_score")]));
                            row.put("climate_score", parse(t[index.get("climate_score")]));
                            list.add(row);
                        }
                    }
                }
            } catch(Exception e) {
                System.out.println("Dataset read error: " + e.getMessage());
            }
        }

        // Built-in master crop fallback catalog if CSV is missing
        if (list.isEmpty()) {
            list.add(Map.of("crop", "Rice", "yield_ton_per_acre", 3.2, "price_rs_per_ton", 24500.0, "cost_rs_per_acre", 18000.0, "risk_score", 25.0, "climate_score", 85.0));
            list.add(Map.of("crop", "Wheat", "yield_ton_per_acre", 2.8, "price_rs_per_ton", 25500.0, "cost_rs_per_acre", 15000.0, "risk_score", 20.0, "climate_score", 80.0));
            list.add(Map.of("crop", "Sugarcane", "yield_ton_per_acre", 38.0, "price_rs_per_ton", 3450.0, "cost_rs_per_acre", 32000.0, "risk_score", 15.0, "climate_score", 90.0));
            list.add(Map.of("crop", "Tomato", "yield_ton_per_acre", 14.5, "price_rs_per_ton", 18000.0, "cost_rs_per_acre", 28000.0, "risk_score", 45.0, "climate_score", 75.0));
            list.add(Map.of("crop", "Potato", "yield_ton_per_acre", 16.0, "price_rs_per_ton", 14000.0, "cost_rs_per_acre", 24000.0, "risk_score", 30.0, "climate_score", 82.0));
            list.add(Map.of("crop", "Millet", "yield_ton_per_acre", 1.2, "price_rs_per_ton", 28000.0, "cost_rs_per_acre", 9000.0, "risk_score", 12.0, "climate_score", 92.0));
            list.add(Map.of("crop", "Capsicum", "yield_ton_per_acre", 6.5, "price_rs_per_ton", 38000.0, "cost_rs_per_acre", 35000.0, "risk_score", 40.0, "climate_score", 78.0));
            list.add(Map.of("crop", "Horsegram", "yield_ton_per_acre", 0.6, "price_rs_per_ton", 42000.0, "cost_rs_per_acre", 6000.0, "risk_score", 10.0, "climate_score", 95.0));
        }

        return list;
    }


    private double dbl(Map<String,Object> m,String k){

        Object v=m.get(k);

        if(v==null)return 0;

        return Double.parseDouble(v.toString());
    }


    private double parse(String v){

        try{return Double.parseDouble(v);}
        catch(Exception e){return 0;}
    }


    private int clamp(int v,int min,int max){

        return Math.max(min,Math.min(max,v));
    }


    private double clamp(double v,double min,double max){

        return Math.max(min,Math.min(max,v));
    }


    private double round(double v){

        return Math.round(v*100)/100.0;
    }


    private String money(double v){

        if(v>=10000000)
            return String.format("₹%.2f Cr",v/10000000);

        if(v>=100000)
            return String.format("₹%.2f Lakhs",v/100000);

        if(v>=1000)
            return String.format("₹%.2f K",v/1000);

        return "₹"+Math.round(v);
    }


    private String str(Map<String,Object> m,String k){

        Object v=m.get(k);

        return v==null?"":v.toString();
    }

}