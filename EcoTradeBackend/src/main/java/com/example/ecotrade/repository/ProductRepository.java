package com.example.ecotrade.repository;

import com.example.ecotrade.model.Product;
import com.example.ecotrade.model.Product.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(ProductCategory category);
    List<Product> findByIsPlant(Boolean isPlant);
    Optional<Product> findByName(String name);
} 