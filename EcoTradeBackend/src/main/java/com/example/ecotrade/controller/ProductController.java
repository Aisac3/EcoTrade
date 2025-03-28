package com.example.ecotrade.controller;

import com.example.ecotrade.dto.ProductDTO;
import com.example.ecotrade.model.Product;
import com.example.ecotrade.model.Product.ProductCategory;
import com.example.ecotrade.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Arrays;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductDTO>> getProductsByCategory(@PathVariable ProductCategory category) {
        return ResponseEntity.ok(productService.getProductsByCategory(category));
    }

    @GetMapping("/plants")
    public ResponseEntity<List<ProductDTO>> getPlants() {
        return ResponseEntity.ok(productService.getPlants());
    }

    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO productDTO) {
        return new ResponseEntity<>(productService.createProduct(productDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody ProductDTO productDTO) {
        return ResponseEntity.ok(productService.updateProduct(id, productDTO));
    }

    @PatchMapping("/{id}/image")
    public ResponseEntity<ProductDTO> updateProductImage(
            @PathVariable Long id, 
            @RequestBody Map<String, String> imageData) {
        String imageUrl = imageData.get("imageUrl");
        if (imageUrl == null || imageUrl.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(productService.updateProductImage(id, imageUrl));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/add-sample-plants")
    public ResponseEntity<List<ProductDTO>> addSamplePlants() {
        // Fiddle Leaf Fig
        ProductDTO fiddle = new ProductDTO();
        fiddle.setName("Fiddle Leaf Fig");
        fiddle.setDescription("Large, beautiful Fiddle Leaf Fig plant");
        fiddle.setPrice(49.99);
        fiddle.setEcoPointsCost(400);
        fiddle.setEcoPointsReward(80);
        fiddle.setStock(10);
        fiddle.setCategory(ProductCategory.PLANTS);
        fiddle.setIsPlant(true);
        fiddle.setImageUrl("/images/products/0c8397d0-44ba-41b9-ba04-25a8db41ba02.jpg");
        productService.createProduct(fiddle);

        // Peace Lily
        ProductDTO peaceLily = new ProductDTO();
        peaceLily.setName("Peace Lily");
        peaceLily.setDescription("Elegant Peace Lily plant");
        peaceLily.setPrice(34.99);
        peaceLily.setEcoPointsCost(280);
        peaceLily.setEcoPointsReward(55);
        peaceLily.setStock(15);
        peaceLily.setCategory(ProductCategory.PLANTS);
        peaceLily.setIsPlant(true);
        peaceLily.setImageUrl("/images/products/f18d563e-3ab8-4ec0-b790-c8280636eaed.jpg");
        productService.createProduct(peaceLily);

        // Aloe Vera
        ProductDTO aloe = new ProductDTO();
        aloe.setName("Aloe Vera");
        aloe.setDescription("Medicinal Aloe Vera plant");
        aloe.setPrice(19.99);
        aloe.setEcoPointsCost(160);
        aloe.setEcoPointsReward(30);
        aloe.setStock(20);
        aloe.setCategory(ProductCategory.PLANTS);
        aloe.setIsPlant(true);
        aloe.setImageUrl("/images/products/6e40da72-9cd9-4937-bcee-fc38b6941b29.jpg");
        productService.createProduct(aloe);

        // Boston Fern
        ProductDTO fern = new ProductDTO();
        fern.setName("Boston Fern");
        fern.setDescription("Lush Boston Fern plant");
        fern.setPrice(29.99);
        fern.setEcoPointsCost(240);
        fern.setEcoPointsReward(45);
        fern.setStock(12);
        fern.setCategory(ProductCategory.PLANTS);
        fern.setIsPlant(true);
        fern.setImageUrl("/images/products/675fa6ed-5d3a-490a-ba29-a37e9b46662a.jpg");
        productService.createProduct(fern);
        
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PostMapping("/update-image-urls")
    public ResponseEntity<String> updateImageUrls() {
        // Map of product names to local image paths
        java.util.Map<String, String> imageMap = new java.util.HashMap<>();
        imageMap.put("Fiddle Leaf Fig", "/images/products/0c8397d0-44ba-41b9-ba04-25a8db41ba02.jpg");
        imageMap.put("Peace Lily", "/images/products/f18d563e-3ab8-4ec0-b790-c8280636eaed.jpg");
        imageMap.put("Aloe Vera", "/images/products/6e40da72-9cd9-4937-bcee-fc38b6941b29.jpg");
        imageMap.put("Boston Fern", "/images/products/675fa6ed-5d3a-490a-ba29-a37e9b46662a.jpg");
        imageMap.put("Bamboo Toothbrush", "/images/products/979d5c44-5008-4832-831c-449b830f074c.jpg");
        imageMap.put("Reusable Water Bottle", "/images/products/67e834b2-96b4-4a0b-a908-b734b670543d.jpg");
        imageMap.put("Monstera Plant", "/images/products/610f45f1-ceb0-4566-b838-d9988da27f80.jpg");
        imageMap.put("Snake Plant", "/images/products/b0ddcbe5-0e6a-4cb3-8d47-8f60a5633e4c.jpg");
        imageMap.put("Organic Plant Fertilizer", "/images/products/2d129837-54a8-4bcd-97a7-1f36c247b965.jpg");
        
        int updatedCount = 0;
        
        // Get all products
        List<ProductDTO> products = productService.getAllProducts();
        
        for (ProductDTO product : products) {
            // Only update if the image URL is an external URL or null
            if (product.getImageUrl() == null || product.getImageUrl().startsWith("http")) {
                String localImageUrl = imageMap.get(product.getName());
                if (localImageUrl != null) {
                    product.setImageUrl(localImageUrl);
                    productService.updateProduct(product.getId(), product);
                    updatedCount++;
                }
            }
        }
        
        return ResponseEntity.ok("Updated " + updatedCount + " product image URLs");
    }

    @PostMapping("/fix-image-urls")
    public ResponseEntity<String> fixImageUrls() {
        // Map of current incorrect paths to correct UUID paths
        java.util.Map<String, String> imageFixMap = new java.util.HashMap<>();
        imageFixMap.put("/images/products/monstera.jpg", "/images/products/610f45f1-ceb0-4566-b838-d9988da27f80.jpg");
        imageFixMap.put("/images/products/snake-plant.jpg", "/images/products/b0ddcbe5-0e6a-4cb3-8d47-8f60a5633e4c.jpg");
        imageFixMap.put("/images/products/boston-fern.jpg", "/images/products/675fa6ed-5d3a-490a-ba29-a37e9b46662a.jpg");
        
        // Get all products
        List<ProductDTO> products = productService.getAllProducts();
        int updatedCount = 0;
        
        for (ProductDTO product : products) {
            String currentUrl = product.getImageUrl();
            if (currentUrl != null && imageFixMap.containsKey(currentUrl)) {
                String correctUrl = imageFixMap.get(currentUrl);
                product.setImageUrl(correctUrl);
                productService.updateProduct(product.getId(), product);
                updatedCount++;
                System.out.println("Fixed image URL for product: " + product.getName() + 
                                   " (ID: " + product.getId() + ") from " + currentUrl + " to " + correctUrl);
            }
        }
        
        // Add name-based mappings as a fallback
        java.util.Map<String, String> nameBasedMap = new java.util.HashMap<>();
        nameBasedMap.put("Fiddle Leaf Fig", "/images/products/0c8397d0-44ba-41b9-ba04-25a8db41ba02.jpg");
        nameBasedMap.put("Peace Lily", "/images/products/f18d563e-3ab8-4ec0-b790-c8280636eaed.jpg");
        nameBasedMap.put("Aloe Vera", "/images/products/6e40da72-9cd9-4937-bcee-fc38b6941b29.jpg");
        nameBasedMap.put("Boston Fern", "/images/products/675fa6ed-5d3a-490a-ba29-a37e9b46662a.jpg");
        nameBasedMap.put("Bamboo Toothbrush", "/images/products/979d5c44-5008-4832-831c-449b830f074c.jpg");
        nameBasedMap.put("Reusable Water Bottle", "/images/products/67e834b2-96b4-4a0b-a908-b734b670543d.jpg");
        nameBasedMap.put("Monstera Plant", "/images/products/610f45f1-ceb0-4566-b838-d9988da27f80.jpg");
        nameBasedMap.put("Snake Plant", "/images/products/b0ddcbe5-0e6a-4cb3-8d47-8f60a5633e4c.jpg");
        nameBasedMap.put("Organic Plant Fertilizer", "/images/products/2d129837-54a8-4bcd-97a7-1f36c247b965.jpg");
        
        // Check for products that still need fixing
        products = productService.getAllProducts(); // Get fresh list after updates
        int nameBasedUpdates = 0;
        
        for (ProductDTO product : products) {
            String correctUrl = nameBasedMap.get(product.getName());
            if (correctUrl != null && !correctUrl.equals(product.getImageUrl())) {
                product.setImageUrl(correctUrl);
                productService.updateProduct(product.getId(), product);
                nameBasedUpdates++;
                System.out.println("Updated image URL by name for product: " + product.getName() + 
                                   " (ID: " + product.getId() + ") to " + correctUrl);
            }
        }
        
        return ResponseEntity.ok("Fixed " + updatedCount + " image URLs by path mapping and " + 
                                nameBasedUpdates + " image URLs by name mapping.");
    }

    @PostMapping("/update-to-new-images")
    public ResponseEntity<String> updateToNewImages() {
        // Map of product names to new image paths
        java.util.Map<String, String> newImageMap = new java.util.HashMap<>();
        
        // Set new image paths for specific products
        newImageMap.put("Monstera Plant", "/images/monstera.jpg");
        newImageMap.put("Snake Plant", "/images/snake-plant.jpg");
        newImageMap.put("Boston Fern", "/images/boston-fern.jpg");
        // Add fallbacks for other products that have the same type
        newImageMap.put("Fiddle Leaf Fig", "/images/monstera.jpg");  // Using monstera as a placeholder
        newImageMap.put("Peace Lily", "/images/monstera.jpg");       // Using monstera as a placeholder
        newImageMap.put("Aloe Vera", "/images/boston-fern.jpg");     // Using boston-fern as a placeholder
        
        // Get all products
        List<ProductDTO> products = productService.getAllProducts();
        int updatedCount = 0;
        
        for (ProductDTO product : products) {
            String newImageUrl = null;
            
            // First try exact name match
            if (newImageMap.containsKey(product.getName())) {
                newImageUrl = newImageMap.get(product.getName());
            } 
            // If no exact match, try fuzzy match based on name
            else {
                if (product.getName().contains("Fern") || product.getName().toLowerCase().contains("fern")) {
                    newImageUrl = "/images/boston-fern.jpg";
                } else if (product.getName().contains("Snake") || product.getName().toLowerCase().contains("snake")) {
                    newImageUrl = "/images/snake-plant.jpg";
                } else {
                    // Default to monstera for other plants
                    newImageUrl = "/images/monstera.jpg";
                }
            }
            
            // Update the product with the new image URL
            if (newImageUrl != null && !newImageUrl.equals(product.getImageUrl())) {
                product.setImageUrl(newImageUrl);
                productService.updateProduct(product.getId(), product);
                updatedCount++;
                System.out.println("Updated image URL for product: " + product.getName() + 
                                   " (ID: " + product.getId() + ") to " + newImageUrl);
            }
        }
        
        return ResponseEntity.ok("Updated " + updatedCount + " products with new image URLs");
    }
}
