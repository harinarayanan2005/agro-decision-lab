package com.agro.decisionlab.supplychain.service;

import com.agro.decisionlab.supplychain.model.*;

public class SmartContractEngine {

    public static void validate(
            BatchChain chain,
            SupplyEvent event) {

        double available = calculateStock(chain);

        if (event.getQuantity() <= 0)
            throw new RuntimeException(
                    "Invalid quantity");

        if (event.getType().equals("SOLD")
                && available == 0)
            throw new RuntimeException(
                    "Cannot sell before harvest");

        if (event.getType().equals("SOLD")
                && event.getQuantity() > available)
            throw new RuntimeException(
                    "Fraud detected: selling more than stock");
    }

    public static double calculateStock(
            BatchChain chain) {

        double qty = 0;

        for (Block b : chain.getChain()) {

            if (b.getEvent().getType()
                    .equals("HARVESTED"))
                qty += b.getEvent().getQuantity();

            if (b.getEvent().getType()
                    .equals("SOLD"))
                qty -= b.getEvent().getQuantity();
        }

        return qty;
    }
}