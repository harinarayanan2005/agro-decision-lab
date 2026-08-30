package com.agro.decisionlab.agri_ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import java.time.Duration;

@Service
public class AgriAIService {

    /* ============================================
       API KEY from application.properties
       ============================================ */

    @Value("${openai.api.key}")
    private String API_KEY;


    private static final String API_URL =
            "https://api.openai.com/v1/chat/completions";


    private final HttpClient client =
            HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(30))
                    .build();


    private final ObjectMapper mapper =
            new ObjectMapper();


    /* ============================================
       MAIN AI FUNCTION
       ============================================ */

    public String askAI(String question){

        try{

            if(API_KEY == null || API_KEY.isBlank()){

                return "API key missing in application.properties";
            }

            if(question == null || question.isBlank()){

                return "Please ask a valid agriculture question.";
            }


            String requestBody =
                    buildRequestBody(question);


            HttpRequest request =
                    HttpRequest.newBuilder()
                            .uri(URI.create(API_URL))
                            .timeout(Duration.ofSeconds(60))
                            .header("Authorization", "Bearer " + API_KEY)
                            .header("Content-Type", "application/json")
                            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                            .build();


            HttpResponse<String> response =
                    client.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );


            if(response.statusCode() != 200){
                System.out.println("OpenAI API returned status " + response.statusCode() + ". Using Built-in Agronomic Expert Engine.");
                return getFallbackAdvice(question);
            }

            return parseResponse(response.body());

        }
        catch(Exception e){
            System.out.println("AI system exception: " + e.getMessage() + ". Using Built-in Agronomic Expert Engine.");
            return getFallbackAdvice(question);
        }
    }

    /* ============================================
       BUILT-IN AGRONOMIC EXPERT FALLBACK ENGINE
       ============================================ */
    private String getFallbackAdvice(String question) {
        String q = question.toLowerCase();

        if (q.contains("rice") || q.contains("paddy") || q.contains("blast")) {
            return """
            🌾 **Paddy / Rice Strategic Agronomy Advisory:**
            - **Target High-Yield Cultivars:** CO-51, ADT-37, BPT-5204 (Samba Mahsuri).
            - **Nutrient Scheduling:** 120:50:50 kg NPK/ha (50% N as Basal at puddling; 25% at maximum tillering; 25% at panicle emergence).
            - **Blast Disease Management:** Spray Tricyclazole 75% WP @ 0.6 g/L or Kasugamycin 3% SL @ 2.5 ml/L at first appearance of spindle lesions.
            - **Water Management:** Maintain 2-3 cm shallow water layer; adopt Alternate Wetting and Drying (AWD) to save 25% water.
            """;
        }
        if (q.contains("fertilizer") || q.contains("nitrogen") || q.contains("urea") || q.contains("soil") || q.contains("npk")) {
            return """
            🧪 **Precision Soil & Nutrient Optimization:**
            - **Basal Soil Conditioning:** Apply 12.5 tonnes of well-rotted FYM or 5 tonnes of Vermicompost per hectare.
            - **Biological Nitrogen Fixation:** Treat seeds with *Azospirillum brasilense* (for non-legumes) or *Rhizobium* (for pulses) @ 200g/acre.
            - **Phosphorus Mobilization:** Apply *Phosphobacteria* (PSB) @ 2 kg/ha mixed with 50 kg organic manure to unlock fixed soil phosphorus.
            - **Micronutrient Correction:** Foliar spray of Zinc Sulphate (0.5%) + Ferrous Sulphate (0.5%) during active vegetative growth.
            """;
        }
        if (q.contains("tomato") || q.contains("irrigation") || q.contains("drip") || q.contains("water")) {
            return """
            💧 **Horticultural Water & Micro-Irrigation Protocol:**
            - **Drip Emitter Flow:** Maintain 2.0 - 4.0 LPH discharge rate operating for 1.5 to 2.5 hours daily depending on evapotranspiration.
            - **Mulching:** 25-micron UV-stabilized silver-black reflective mulch suppresses weed proliferation and reduces soil evaporation by 40%.
            - **Blossom End Rot Prevention:** Maintain steady soil moisture and spray Foliar Calcium Nitrate @ 1.0% during fruit enlargement.
            """;
        }
        if (q.contains("cotton") || q.contains("pest") || q.contains("bollworm")) {
            return """
            🌿 **Cotton & Commercial Crop IPM Advisory:**
            - **Sucking Pest Control:** Install yellow/blue sticky traps @ 10/acre. Spray Neem Oil (10,000 ppm) @ 3 ml/L for early aphid and whitefly control.
            - **Bollworm Protection:** Install pheromone traps @ 5/acre for monitoring; apply *Bacillus thuringiensis* (Bt) formulations or Chlorantraniliprole 18.5% SC @ 0.3 ml/L.
            - **Square Dropping Prevention:** Spray NAA (Planofix) @ 4.5 ml per 15 litres of water during peak flowering.
            """;
        }

        return """
        🌱 **Comprehensive Agro-Decision Recommendation:**
        1. **Soil Health:** Perform electrical conductivity (EC) and pH testing before each cropping cycle.
        2. **Integrated Pest Management (IPM):** Combine biological biocontrol agents (Trichoderma viride, Pseudomonas) with targeted precision chemicals.
        3. **Climate Resilience:** Adopt weather-indexed crop planning aligned with Tamil Nadu Kharif/Rabi monsoon calendars for maximum market profitability.
        """;
    }


    /* ============================================
       BUILD REQUEST BODY
       ============================================ */

    private String buildRequestBody(String question){

        return """
        {
          "model": "gpt-4o-mini",
          "temperature": 0.7,
          "max_tokens": 800,
          "messages": [
            {
              "role": "system",
              "content": "You are a professional agriculture scientist AI. Give accurate, practical, real-world farming advice for India and global agriculture. Include crops, soil, irrigation, fertilizer, yield, climate, and profit guidance when relevant."
            },
            {
              "role": "user",
              "content": "%s"
            }
          ]
        }
        """.formatted(question);
    }


    /* ============================================
       PARSE RESPONSE SAFELY
       ============================================ */

    private String parseResponse(String json){

        try{

            JsonNode root =
                    mapper.readTree(json);


            JsonNode choices =
                    root.get("choices");


            if(choices == null || choices.isEmpty()){

                return "No AI response.";
            }


            JsonNode content =
                    choices.get(0)
                           .get("message")
                           .get("content");


            if(content == null){

                return "Invalid AI response.";
            }


            return content.asText().trim();
        }
        catch(Exception e){

            e.printStackTrace();

            return "Failed to parse AI response.";
        }
    }

}