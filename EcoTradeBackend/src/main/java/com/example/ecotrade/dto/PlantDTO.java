package com.example.ecotrade.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlantDTO {
    private Long id;
    private Long userId;
    private String userName;
    private Long productId;
    private String productName;
    private String name;
    private String species;
    private String plantName;
    private LocalDate plantingDate;
    private LocalDateTime purchaseDate;
    private LocalDate lastWatered;
    private LocalDate lastFertilized;
    private String growthStage;
    private String healthStatus;
    private Double currentHeightCm;
    private String imageUrl;
    private String notes;
} 