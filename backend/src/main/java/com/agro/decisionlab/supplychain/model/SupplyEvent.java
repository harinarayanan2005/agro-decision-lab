package com.agro.decisionlab.supplychain.model;

public class SupplyEvent {

    private String type;
    private String actor;
    private double quantity;
    private String location;

    public SupplyEvent() {
    }

    public SupplyEvent(String type,
                       String actor,
                       double quantity,
                       String location) {

        this.type = type;
        this.actor = actor;
        this.quantity = quantity;
        this.location = location;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }
    public double getQuantity() { return quantity; }
    public void setQuantity(double quantity) { this.quantity = quantity; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    @Override
    public String toString() {
        return type + actor + quantity + location;
    }
}