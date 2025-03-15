package com.example.ecotrade.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, length = 1000)
    private String description;
    
    @Column(nullable = false)
    private Double price;
    
    @Column(name = "eco_points_cost", nullable = false)
    private Integer ecoPointsCost = 0;
    
    @Column(name = "eco_points_reward")
    private Integer ecoPointsReward;
    
    @Column(nullable = false)
    private Integer stock = 0;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category;
    
    @Column(name = "is_plant")
    private Boolean isPlant = false;
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems = new ArrayList<>();
    
    public enum ProductCategory {
        PLANTS, SEEDS, POTS, TOOLS, FERTILIZERS, ACCESSORIES, ECO_FRIENDLY_PRODUCTS
    }
} 