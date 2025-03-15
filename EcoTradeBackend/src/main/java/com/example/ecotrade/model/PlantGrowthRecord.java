package com.example.ecotrade.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "plant_growth_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlantGrowthRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "plant_id", nullable = false)
    private Plant plant;
    
    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate = LocalDate.now();
    
    @Column(name = "height_cm")
    private Double heightCm;
    
    @Column(name = "num_leaves")
    private Integer numLeaves;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column
    private String notes;
} 