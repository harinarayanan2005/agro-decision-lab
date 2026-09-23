package com.agro.decisionlab.supplychain.model;

import java.util.ArrayList;
import java.util.List;

public class BatchChain {

    private String batchId;
    private List<Block> chain = new ArrayList<>();

    public BatchChain() {
    }

    public BatchChain(String batchId) {
        this.batchId = batchId;
    }

    public String getBatchId() {
        return batchId;
    }

    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }

    public List<Block> getChain() {
        return chain;
    }

    public void setChain(List<Block> chain) {
        this.chain = chain;
    }

    public void addBlock(Block block) {
        chain.add(block);
    }

    public Block getLastBlock() {
        return chain.isEmpty() ? null : chain.get(chain.size() - 1);
    }
}