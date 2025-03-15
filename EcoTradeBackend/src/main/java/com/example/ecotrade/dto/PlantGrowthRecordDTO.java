package com.example.ecotrade.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlantGrowthRecordDTO {
    private Long id;
    private Long plantId;
    private String plantName;
    private LocalDate recordDate;
    private Double heightCm;
    private Integer numLeaves;
    private String imageUrl;
    private String notes;
}