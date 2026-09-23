package com.agro.decisionlab.agri_ai;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/agri-ai", "/api/ai"})
@CrossOrigin("*")
public class AgriAIController {

    private final AgriAIService ai;

    public AgriAIController(AgriAIService ai){
        this.ai = ai;
    }

    @PostMapping("/ask")
    public Map<String,String> ask(@RequestBody Map<String,String> req){
        String question = req.get("message");
        if(question == null || question.isBlank()) {
            question = req.get("prompt");
        }
        if(question == null || question.isBlank()) {
            question = req.get("question");
        }
        if(question == null || question.isBlank()) {
            question = "What are the best agricultural management practices for current Tamil Nadu cropping?";
        }

        String answer = ai.askAI(question);

        return Map.of(
                "answer", answer,
                "status", "SUCCESS"
        );
    }
}