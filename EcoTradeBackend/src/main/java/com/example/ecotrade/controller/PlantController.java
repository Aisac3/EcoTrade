package com.example.ecotrade.controller;

import com.example.ecotrade.dto.PlantDTO;
import com.example.ecotrade.service.PlantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/plants")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class PlantController {

    @Autowired
    private PlantService plantService;

    @GetMapping
    public ResponseEntity<List<PlantDTO>> getAllPlants() {
        return ResponseEntity.ok(plantService.getAllPlants());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlantDTO> getPlantById(@PathVariable Long id) {
        return ResponseEntity.ok(plantService.getPlantById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PlantDTO>> getPlantsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(plantService.getPlantsByUserId(userId));
    }

    @GetMapping("/user/{userId}/orders")
    public ResponseEntity<List<PlantDTO>> getPlantsFromUserOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(plantService.getPlantsFromUserOrders(userId));
    }

    @PostMapping("/{id}/record-maintenance")
    public ResponseEntity<PlantDTO> recordMaintenance(
            @PathVariable Long id, 
            @RequestParam String maintenanceType,
            @RequestParam(required = false) String notes,
            @RequestBody(required = false) Map<String, Object> requestBody) {
        
        // Check if height is provided in the request body
        Double currentHeightCm = null;
        if (requestBody != null && requestBody.containsKey("currentHeightCm")) {
            try {
                currentHeightCm = Double.parseDouble(requestBody.get("currentHeightCm").toString());
            } catch (NumberFormatException e) {
                // Ignore invalid height values
            }
        }
        
        // Call the appropriate service method based on whether height is provided
        if (currentHeightCm != null) {
            return ResponseEntity.ok(plantService.recordMaintenance(id, maintenanceType, notes, currentHeightCm));
        } else {
            return ResponseEntity.ok(plantService.recordMaintenance(id, maintenanceType, notes));
        }
    }

    @PostMapping
    public ResponseEntity<PlantDTO> createPlant(@RequestBody PlantDTO plantDTO) {
        return new ResponseEntity<>(plantService.createPlant(plantDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlantDTO> updatePlant(@PathVariable Long id, @RequestBody PlantDTO plantDTO) {
        return ResponseEntity.ok(plantService.updatePlant(id, plantDTO));
    }

    @PostMapping("/{id}/water")
    public ResponseEntity<PlantDTO> waterPlant(@PathVariable Long id) {
        return ResponseEntity.ok(plantService.waterPlant(id));
    }

    @PostMapping("/{id}/fertilize")
    public ResponseEntity<PlantDTO> fertilizePlant(@PathVariable Long id) {
        return ResponseEntity.ok(plantService.fertilizePlant(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlant(@PathVariable Long id) {
        plantService.deletePlant(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/update-image-urls")
    public ResponseEntity<String> updateImageUrls() {
        // Map of plant names to local image paths
        java.util.Map<String, String> imageMap = new java.util.HashMap<>();
        imageMap.put("Monstera", "/images/products/610f45f1-ceb0-4566-b838-d9988da27f80.jpg");
        imageMap.put("Snake Plant", "/images/products/b0ddcbe5-0e6a-4cb3-8d47-8f60a5633e4c.jpg");
        
        int updatedCount = 0;
        
        // Get all plants
        List<PlantDTO> plants = plantService.getAllPlants();
        
        for (PlantDTO plant : plants) {
            // Only update if the image URL is an external URL or null
            if (plant.getImageUrl() == null || plant.getImageUrl().startsWith("http")) {
                String localImageUrl = imageMap.get(plant.getName());
                if (localImageUrl != null) {
                    plant.setImageUrl(localImageUrl);
                    plantService.updatePlant(plant.getId(), plant);
                    updatedCount++;
                }
            }
        }
        
        return ResponseEntity.ok("Updated " + updatedCount + " plant image URLs");
    }
} 