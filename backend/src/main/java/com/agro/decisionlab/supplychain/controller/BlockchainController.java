package com.agro.decisionlab.supplychain.controller;

import com.agro.decisionlab.supplychain.model.Block;
import com.agro.decisionlab.supplychain.service.BlockchainService;

import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/supply-chain")
@CrossOrigin("*")
public class BlockchainController {

    private final BlockchainService service;

    public BlockchainController(
            BlockchainService service) {
        this.service = service;
    }

    @PostMapping("/add")
    public Block add(@RequestBody Map<String, Object> req) {

        return service.addEvent(
                req.get("batchId").toString(),
                req.get("type").toString(),
                req.get("actor").toString(),
                Double.parseDouble(req.get("quantity").toString()),
                req.get("location").toString());
    }

    @GetMapping("/trace/{batchId}")
    public List<Block> trace(
            @PathVariable String batchId) {
        return service.trace(batchId);
    }

    @GetMapping("/validate/{batchId}")
    public Map<String, Object> validate(
            @PathVariable String batchId) {

        return Map.of(
                "valid",
                service.validateChain(batchId));
    }

    @GetMapping("/analytics/{batchId}")
    public Map<String, Object> analytics(
            @PathVariable String batchId) {

        return service.analytics(batchId);
    }
}