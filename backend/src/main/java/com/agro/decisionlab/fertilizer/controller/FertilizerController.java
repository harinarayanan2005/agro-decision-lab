package com.agro.decisionlab.fertilizer.controller;

import com.agro.decisionlab.fertilizer.service.FertilizerService;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/fertilizer")
@CrossOrigin("*")
public class FertilizerController {

    private final FertilizerService service;

    public FertilizerController(FertilizerService service){
        this.service = service;
    }

    @PostMapping("/predict")
    public Map<String,Object> predict(
            @RequestBody Map<String,Object> input){

        return service.predict(input);
    }

}