package com.agro.decisionlab.supplychain.repository;

import com.agro.decisionlab.supplychain.model.BatchChain;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class BlockchainRepository {

    private static final String DB_FILE = "data/blockchain_db.json";

    private final ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();

    public Map<String, BatchChain> load() {

        try {

            File file = new File(DB_FILE);

            if (!file.exists())
                return new HashMap<>();

            return mapper.readValue(
                    file,
                    mapper.getTypeFactory()
                            .constructMapType(
                                    HashMap.class,
                                    String.class,
                                    BatchChain.class));

        } catch (Exception e) {
            e.printStackTrace();
            return new HashMap<>();
        }
    }

    public void save(Map<String, BatchChain> chains) {

        try {

            File dir = new File("data");

            if (!dir.exists())
                dir.mkdir();

            mapper.writerWithDefaultPrettyPrinter()
                    .writeValue(new File(DB_FILE), chains);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}