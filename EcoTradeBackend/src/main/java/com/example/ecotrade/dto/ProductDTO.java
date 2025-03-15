package com.example.ecotrade.dto;

import com.example.ecotrade.model.Product.ProductCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer ecoPointsCost;
    private Integer ecoPointsReward;
    private Integer stock;
    private String imageUrl;
    private ProductCategory category;
    private Boolean isPlant;
} 