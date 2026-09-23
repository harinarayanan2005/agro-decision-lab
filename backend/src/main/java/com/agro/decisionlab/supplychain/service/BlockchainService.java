package com.agro.decisionlab.supplychain.service;

import com.agro.decisionlab.supplychain.model.BatchChain;
import com.agro.decisionlab.supplychain.model.Block;
import com.agro.decisionlab.supplychain.model.SupplyEvent;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class BlockchainService {

        // private final BlockchainRepository repo = new BlockchainRepository();

        private final Map<String, BatchChain> chains;

        private final int difficulty = 3;

        public BlockchainService() {

                // chains = repo.load();
                chains = new HashMap<>();
        }

        public Block addEvent(String batchId,
                        String type,
                        String actor,
                        double quantity,
                        String location) {

                chains.putIfAbsent(batchId,
                                new BatchChain(batchId));

                BatchChain chain = chains.get(batchId);

                SupplyEvent event = new SupplyEvent(type, actor,
                                quantity, location);

                SmartContractEngine.validate(chain, event);

                String prevHash = chain.getLastBlock() == null ? "0" : chain.getLastBlock().getHash();

                Block block = new Block(
                                chain.getChain().size(),
                                batchId,
                                event,
                                prevHash,
                                difficulty);

                chain.addBlock(block);

                // repo.save(chains);

                return block;
        }

        public List<Block> trace(String batchId) {

                if (!chains.containsKey(batchId))
                        return List.of();

                return chains.get(batchId).getChain();
        }

        public boolean validateChain(String batchId) {

                BatchChain chain = chains.get(batchId);

                if (chain == null)
                        return false;

                for (int i = 1; i < chain.getChain().size(); i++) {

                        Block current = chain.getChain().get(i);

                        Block prev = chain.getChain().get(i - 1);

                        if (!current.getPreviousHash()
                                        .equals(prev.getHash()))
                                return false;
                }

                return true;
        }

        public Map<String, Object> analytics(String batchId) {

                BatchChain chain = chains.get(batchId);

                if (chain == null)
                        return Map.of("events", 0);

                double stock = SmartContractEngine.calculateStock(chain);

                int trust = validateChain(batchId) ? 95 : 40;

                int harvested = 0;
                int sold = 0;

                for (Block b : chain.getChain()) {

                        if (b.getEvent().getType()
                                        .equals("HARVESTED"))
                                harvested++;

                        if (b.getEvent().getType()
                                        .equals("SOLD"))
                                sold++;
                }

                return Map.of(
                                "events", chain.getChain().size(),
                                "available_stock", stock,
                                "harvest_events", harvested,
                                "sold_events", sold,
                                "trust_score", trust);
        }
}