package com.agro.decisionlab.diseaseai;

public class DiseaseResponse {

    public String disease;
    public double confidence;
    public String severity;
    public String[] remedy;

    public DiseaseResponse(String disease, double confidence,
                           String severity, String[] remedy) {
        this.disease = disease;
        this.confidence = confidence;
        this.severity = severity;
        this.remedy = remedy;
    }
}