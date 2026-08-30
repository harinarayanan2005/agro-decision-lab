package com.agro.decisionlab.cropplanner.controller;

import com.agro.decisionlab.cropplanner.service.CropPlannerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/crop-planner")
@CrossOrigin(origins = "*")
public class CropPlannerController {

    private final CropPlannerService service;

    public CropPlannerController(CropPlannerService service) {
        this.service = service;
    }

    /* =========================================================
       MAIN ML CALCULATION ENDPOINT
       ========================================================= */
    @PostMapping("/calculate")
    public ResponseEntity<?> calculate(
            @RequestBody Map<String,Object> request){

        long start = System.currentTimeMillis();

        try {

            validateAndNormalize(request);

            List<Map<String,Object>> crops =
                    service.calculate(request);

            Map<String,Object> response =
                    new LinkedHashMap<>();

            response.put("status", "SUCCESS");
            response.put("timestamp", Instant.now().toString());
            response.put("input", request);
            response.put("count", crops.size());
            response.put("results", crops);

            response.put(
                    "execution_time_ms",
                    System.currentTimeMillis() - start
            );

            response.put(
                    "ai_engine",
                    "DecisionLab ML Crop Intelligence v4.0"
            );

            return ResponseEntity.ok(response);

        }
        catch(IllegalArgumentException e){

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "status","INVALID_INPUT",
                            "message",e.getMessage()
                    )
            );
        }
        catch(Exception e){

            e.printStackTrace();

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "status","ERROR",
                            "message","AI engine failure",
                            "details",e.getMessage()
                    )
            );
        }
    }

    /* =========================================================
       HEALTH CHECK ENDPOINT
       ========================================================= */
    @GetMapping("/health")
    public ResponseEntity<?> health(){

        return ResponseEntity.ok(
                Map.of(
                        "status","UP",
                        "service","CropPlanner ML Engine",
                        "version","4.0"
                )
        );
    }

    /* =========================================================
       VALIDATION + NORMALIZATION
       ========================================================= */
    private void validateAndNormalize(Map<String,Object> req){

        if(!req.containsKey("land_acres"))
            throw new IllegalArgumentException("land_acres required");

        if(!req.containsKey("budget"))
            throw new IllegalArgumentException("budget required");

        double land =
                Double.parseDouble(req.get("land_acres").toString());

        double budget =
                Double.parseDouble(req.get("budget").toString());

        if(land <= 0)
            throw new IllegalArgumentException("Invalid land");

        if(budget <= 0)
            throw new IllegalArgumentException("Invalid budget");

        req.putIfAbsent("soil_type","Loamy");
        req.putIfAbsent("season","Kharif");
        req.putIfAbsent("irrigation","Rainfed");
    }

}