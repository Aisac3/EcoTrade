package com.example.ecotrade.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "plants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Plant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String species;
    
    @Column(name = "plant_name")
    private String plantName;
    
    @Column(name = "planting_date")
    private LocalDate plantingDate;
    
    @Column(name = "purchase_date", nullable = false)
    private LocalDateTime purchaseDate;
    
    @Column(name = "last_watered")
    private LocalDate lastWatered;
    
    @Column(name = "last_fertilized")
    private LocalDate lastFertilized;
    
    @Column(name = "growth_stage")
    private String growthStage;
    
    @Column(name = "health_status")
    private String healthStatus;
    
    @Column(name = "current_height_cm")
    private Double currentHeightCm;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column
    private String notes;
    
    @OneToMany(mappedBy = "plant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlantGrowthRecord> growthRecords = new ArrayList<>();
} 