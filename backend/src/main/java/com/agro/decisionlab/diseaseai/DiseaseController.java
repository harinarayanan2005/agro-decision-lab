package com.agro.decisionlab.diseaseai;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

@RestController
@RequestMapping("/api/disease")
@CrossOrigin(origins = "*")
public class DiseaseController {

    @Autowired
    private DiseaseService diseaseService;

    @PostMapping("/predict")
    public DiseaseResponse predict(@RequestParam("image") MultipartFile file)
            throws Exception {

        File temp = File.createTempFile("leaf", ".jpg");
        file.transferTo(temp);

        return diseaseService.predict(temp.getAbsolutePath());
    }
}