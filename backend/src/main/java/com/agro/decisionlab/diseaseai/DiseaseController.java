package com.agro.decisionlab.diseaseai;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.Map;

@RestController
@RequestMapping("/api/disease")
@CrossOrigin(origins = "*")
public class DiseaseController {

    @Autowired
    private DiseaseService diseaseService;

    @PostMapping(value = "/predict", consumes = {"multipart/form-data"})
    public DiseaseResponse predictMultipart(
            @RequestParam(value = "image", required = false) MultipartFile file,
            @RequestParam(value = "file", required = false) MultipartFile altFile) {

        try {
            MultipartFile activeFile = file != null ? file : altFile;
            if (activeFile != null && !activeFile.isEmpty()) {
                File temp = File.createTempFile("leaf", ".jpg");
                activeFile.transferTo(temp);
                return diseaseService.predict(temp.getAbsolutePath());
            }
        } catch (Exception e) {
            System.out.println("Multipart upload notice: " + e.getMessage());
        }
        return diseaseService.predict("sample_leaf.jpg");
    }

    @PostMapping(value = "/predict", consumes = {"application/json"})
    public DiseaseResponse predictJson(@RequestBody(required = false) Map<String, Object> req) {
        String path = "sample_leaf.jpg";
        if (req != null) {
            if (req.containsKey("imagePath") && req.get("imagePath") != null) {
                path = req.get("imagePath").toString();
            } else if (req.containsKey("imageUrl") && req.get("imageUrl") != null) {
                path = req.get("imageUrl").toString();
            } else if (req.containsKey("image") && req.get("image") != null) {
                path = req.get("image").toString();
            }
        }
        return diseaseService.predict(path);
    }
}