package com.agro.decisionlab.supplychain.controller;

import com.agro.decisionlab.supplychain.model.Block;
import com.agro.decisionlab.supplychain.service.BlockchainService;

import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping({"/api/supply-chain", "/api/blockchain"})
@CrossOrigin("*")
public class BlockchainController {

    private final BlockchainService service;

    public BlockchainController(BlockchainService service) {
        this.service = service;
    }

    @PostMapping("/add")
    public Block add(@RequestBody Map<String, Object> req) {
        String batchId = req.getOrDefault("batchId", "TN-BATCH-001").toString();
        String type = req.getOrDefault("type", "HARVEST_CERTIFIED").toString();
        String actor = req.getOrDefault("actor", "Uzhavar Producer Organization").toString();
        double quantity = 1000.0;
        try {
            quantity = Double.parseDouble(req.getOrDefault("quantity", "1000").toString());
        } catch (Exception ignored) {}
        String location = req.getOrDefault("location", "Thanjavur APMC Hub").toString();

        return service.addEvent(batchId, type, actor, quantity, location);
    }

    @GetMapping("/trace/{batchId}")
    public List<Block> trace(@PathVariable String batchId) {
        return service.trace(batchId);
    }

    @GetMapping({"/chain", "/chain/{batchId}"})
    public List<Block> getChain(@PathVariable(required = false) String batchId) {
        String activeBatch = (batchId != null && !batchId.isBlank()) ? batchId : "TN-BATCH-001";
        List<Block> chain = service.trace(activeBatch);
        if (chain == null || chain.isEmpty()) {
            service.addEvent(activeBatch, "HARVEST_CERTIFIED", "Uzhavar Farmer Producer Org", 2500.0, "Thanjavur Basin");
            chain = service.trace(activeBatch);
        }
        return chain;
    }

    @GetMapping("/validate/{batchId}")
    public Map<String, Object> validate(@PathVariable String batchId) {
        return Map.of(
                "valid", service.validateChain(batchId),
                "batchId", batchId
        );
    }

    @GetMapping("/analytics/{batchId}")
    public Map<String, Object> analytics(@PathVariable String batchId) {
        return service.analytics(batchId);
    }
}