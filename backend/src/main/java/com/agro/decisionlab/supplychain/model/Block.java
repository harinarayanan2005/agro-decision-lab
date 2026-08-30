package com.agro.decisionlab.supplychain.model;

import java.time.LocalDateTime;
import java.security.MessageDigest;
import java.util.UUID;

public class Block {

    private int index;
    private String batchId;
    private SupplyEvent event;
    private LocalDateTime timestamp;
    private String previousHash;
    private String hash;
    private int nonce;
    private int difficulty;
    private String digitalSignature;

    public Block() {
        this.timestamp = LocalDateTime.now();
    }

    public Block(int index,
            String batchId,
            SupplyEvent event,
            String previousHash,
            int difficulty) {

        this.index = index;
        this.batchId = batchId;
        this.event = event;
        this.timestamp = LocalDateTime.now();
        this.previousHash = previousHash;
        this.difficulty = difficulty;

        mineBlock();
        generateDigitalSignature();
    }

    private void mineBlock() {
        String prefix = "0".repeat(difficulty);

        while (true) {
            hash = calculateHash();
            if (hash.startsWith(prefix))
                break;
            nonce++;
        }
    }

    private String calculateHash() {
        try {
            String data = index + batchId + event.toString()
                    + timestamp + previousHash + nonce;

            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] bytes = digest.digest(data.getBytes());

            StringBuilder sb = new StringBuilder();
            for (byte b : bytes)
                sb.append(String.format("%02x", b));

            return sb.toString();

        } catch (Exception e) {
            throw new RuntimeException("Hashing error");
        }
    }

    private void generateDigitalSignature() {
        digitalSignature = UUID.randomUUID().toString()
                + "-" + hash.substring(0, 8);
    }

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    public String getBatchId() {
        return batchId;
    }

    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }

    public SupplyEvent getEvent() {
        return event;
    }

    public void setEvent(SupplyEvent event) {
        this.event = event;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getPreviousHash() {
        return previousHash;
    }

    public void setPreviousHash(String previousHash) {
        this.previousHash = previousHash;
    }

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }

    public int getNonce() {
        return nonce;
    }

    public void setNonce(int nonce) {
        this.nonce = nonce;
    }

    public int getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(int difficulty) {
        this.difficulty = difficulty;
    }

    public String getDigitalSignature() {
        return digitalSignature;
    }

    public void setDigitalSignature(String digitalSignature) {
        this.digitalSignature = digitalSignature;
    }
}