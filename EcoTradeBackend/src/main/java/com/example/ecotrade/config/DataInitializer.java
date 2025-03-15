package com.example.ecotrade.config;

import com.example.ecotrade.model.Plant;
import com.example.ecotrade.model.PlasticSubmission;
import com.example.ecotrade.model.Product;
import com.example.ecotrade.model.User;
import com.example.ecotrade.repository.PlantRepository;
import com.example.ecotrade.repository.PlasticSubmissionRepository;
import com.example.ecotrade.repository.ProductRepository;
import com.example.ecotrade.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData(UserRepository userRepository,
                                     ProductRepository productRepository,
                                     PlantRepository plantRepository,
                                     PlasticSubmissionRepository plasticSubmissionRepository) {
        return args -> {
            // Check if data already exists
            if (userRepository.count() > 0) {
                // Update existing products with local image URLs
                updateExistingProductImages(productRepository);
                
                // Only add the new plant products if they don't exist
                if (productRepository.findByName("Fiddle Leaf Fig").isEmpty()) {
                    addNewPlants(productRepository);
                }
                return; // Skip the rest of initialization
            }

            // Create users
            User user1 = new User();
            user1.setUsername("john_doe");
            user1.setEmail("john@example.com");
            user1.setPassword(passwordEncoder.encode("password"));
            user1.setName("John");
            user1.setFullName("John Doe");
            user1.setEcoPoints(100);

            User user2 = new User();
            user2.setUsername("jane_smith");
            user2.setEmail("jane@example.com");
            user2.setPassword(passwordEncoder.encode("password"));
            user2.setName("Jane");
            user2.setFullName("Jane Smith");
            user2.setEcoPoints(150);

            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setName("Admin");
            admin.setFullName("Admin User");
            admin.setEcoPoints(500);

            List<User> users = userRepository.saveAll(Arrays.asList(user1, user2, admin));
            System.out.println("Initialized users: " + users.size());

            // Create products
            Product bambooToothbrush = new Product();
            bambooToothbrush.setName("Bamboo Toothbrush");
            bambooToothbrush.setDescription("Eco-friendly bamboo toothbrush with natural bristles");
            bambooToothbrush.setPrice(5.99);
            bambooToothbrush.setEcoPointsCost(50);
            bambooToothbrush.setEcoPointsReward(10);
            bambooToothbrush.setStock(100);
            bambooToothbrush.setCategory(Product.ProductCategory.ACCESSORIES);
            bambooToothbrush.setIsPlant(false);
            bambooToothbrush.setImageUrl("/images/products/979d5c44-5008-4832-831c-449b830f074c.jpg");
            productRepository.save(bambooToothbrush);

            Product waterBottle = new Product();
            waterBottle.setName("Reusable Water Bottle");
            waterBottle.setDescription("Stainless steel water bottle with eco-friendly design");
            waterBottle.setPrice(24.99);
            waterBottle.setEcoPointsCost(200);
            waterBottle.setEcoPointsReward(40);
            waterBottle.setStock(50);
            waterBottle.setCategory(Product.ProductCategory.ACCESSORIES);
            waterBottle.setIsPlant(false);
            waterBottle.setImageUrl("/images/products/67e834b2-96b4-4a0b-a908-b734b670543d.jpg");
            productRepository.save(waterBottle);

            Product monstera = new Product();
            monstera.setName("Monstera Plant");
            monstera.setDescription("Beautiful Monstera Deliciosa plant");
            monstera.setPrice(29.99);
            monstera.setEcoPointsCost(250);
            monstera.setEcoPointsReward(50);
            monstera.setStock(20);
            monstera.setCategory(Product.ProductCategory.PLANTS);
            monstera.setIsPlant(true);
            monstera.setImageUrl("/images/products/610f45f1-ceb0-4566-b838-d9988da27f80.jpg");
            productRepository.save(monstera);

            Product snakePlant = new Product();
            snakePlant.setName("Snake Plant");
            snakePlant.setDescription("Low-maintenance Snake Plant");
            snakePlant.setPrice(24.99);
            snakePlant.setEcoPointsCost(200);
            snakePlant.setEcoPointsReward(40);
            snakePlant.setStock(15);
            snakePlant.setCategory(Product.ProductCategory.PLANTS);
            snakePlant.setIsPlant(true);
            snakePlant.setImageUrl("/images/products/b0ddcbe5-0e6a-4cb3-8d47-8f60a5633e4c.jpg");
            productRepository.save(snakePlant);

            Product fertilizer = new Product();
            fertilizer.setName("Organic Plant Fertilizer");
            fertilizer.setDescription("Natural organic fertilizer for plants");
            fertilizer.setPrice(14.99);
            fertilizer.setEcoPointsCost(120);
            fertilizer.setEcoPointsReward(25);
            fertilizer.setStock(30);
            fertilizer.setCategory(Product.ProductCategory.FERTILIZERS);
            fertilizer.setIsPlant(false);
            fertilizer.setImageUrl("/images/products/2d129837-54a8-4bcd-97a7-1f36c247b965.jpg");
            productRepository.save(fertilizer);

            // Add 4 more plant products
            Product product6 = new Product();
            product6.setName("Fiddle Leaf Fig");
            product6.setDescription("Trendy indoor plant with large, violin-shaped leaves that adds a dramatic touch to any room");
            product6.setPrice(29.99);
            product6.setEcoPointsCost(220);
            product6.setEcoPointsReward(35);
            product6.setStock(15);
            product6.setImageUrl("/images/products/0c8397d0-44ba-41b9-ba04-25a8db41ba02.jpg");
            product6.setCategory(Product.ProductCategory.PLANTS);
            product6.setIsPlant(true);

            Product product7 = new Product();
            product7.setName("Peace Lily");
            product7.setDescription("Elegant flowering plant that thrives in low light and helps purify indoor air");
            product7.setPrice(22.99);
            product7.setEcoPointsCost(190);
            product7.setEcoPointsReward(28);
            product7.setStock(25);
            product7.setImageUrl("/images/products/f18d563e-3ab8-4ec0-b790-c8280636eaed.jpg");
            product7.setCategory(Product.ProductCategory.PLANTS);
            product7.setIsPlant(true);

            Product product8 = new Product();
            product8.setName("Aloe Vera");
            product8.setDescription("Medicinal succulent plant with healing properties, perfect for sunny windowsills");
            product8.setPrice(18.99);
            product8.setEcoPointsCost(160);
            product8.setEcoPointsReward(22);
            product8.setStock(35);
            product8.setImageUrl("/images/products/6e40da72-9cd9-4937-bcee-fc38b6941b29.jpg");
            product8.setCategory(Product.ProductCategory.PLANTS);
            product8.setIsPlant(true);

            Product product9 = new Product();
            product9.setName("Boston Fern");
            product9.setDescription("Lush, feathery fronds that add a touch of greenery to any space, ideal for hanging baskets");
            product9.setPrice(21.99);
            product9.setEcoPointsCost(175);
            product9.setEcoPointsReward(26);
            product9.setStock(20);
            product9.setImageUrl("/images/products/675fa6ed-5d3a-490a-ba29-a37e9b46662a.jpg");
            product9.setCategory(Product.ProductCategory.PLANTS);
            product9.setIsPlant(true);

            List<Product> products = productRepository.saveAll(Arrays.asList(
                    bambooToothbrush, waterBottle, monstera, snakePlant, fertilizer, product6, product7, product8, product9
            ));
            System.out.println("Initialized products: " + products.size());

            // Create plants for users
            Plant plant1 = new Plant();
            plant1.setName("Monstera");
            plant1.setSpecies("Monstera Deliciosa");
            plant1.setUser(user1);
            plant1.setProduct(monstera);
            plant1.setGrowthStage("SEEDLING");
            plant1.setHealthStatus("HEALTHY");
            plant1.setCurrentHeightCm(5.0);
            plant1.setLastWatered(LocalDate.now().minusDays(2));
            plant1.setPurchaseDate(LocalDateTime.now().minusMonths(1));
            plant1.setPlantingDate(LocalDate.now().minusMonths(1));
            plant1.setImageUrl("/images/products/610f45f1-ceb0-4566-b838-d9988da27f80.jpg");

            Plant plant2 = new Plant();
            plant2.setName("Snake Plant");
            plant2.setSpecies("Sansevieria Trifasciata");
            plant2.setUser(user2);
            plant2.setProduct(snakePlant);
            plant2.setGrowthStage("MATURE");
            plant2.setHealthStatus("HEALTHY");
            plant2.setCurrentHeightCm(30.0);
            plant2.setLastWatered(LocalDate.now().minusDays(5));
            plant2.setPurchaseDate(LocalDateTime.now().minusMonths(2));
            plant2.setPlantingDate(LocalDate.now().minusMonths(2));
            plant2.setImageUrl("/images/products/b0ddcbe5-0e6a-4cb3-8d47-8f60a5633e4c.jpg");

            List<Plant> plants = plantRepository.saveAll(Arrays.asList(plant1, plant2));
            System.out.println("Initialized plants: " + plants.size());

            // Create plastic submissions
            PlasticSubmission submission1 = new PlasticSubmission();
            submission1.setUser(user1);
            submission1.setWeight(2.5);
            submission1.setPlasticType("PET");
            submission1.setEcoPoints(25.0);
            submission1.setStatus(PlasticSubmission.SubmissionStatus.VERIFIED);
            submission1.setSubmissionDate(LocalDateTime.now().minusDays(5));
            submission1.setVerificationDate(LocalDateTime.now().minusDays(4));
            submission1.setNotes("Recycled plastic bottles");

            PlasticSubmission submission2 = new PlasticSubmission();
            submission2.setUser(user1);
            submission2.setWeight(1.8);
            submission2.setPlasticType("HDPE");
            submission2.setEcoPoints(18.0);
            submission2.setStatus(PlasticSubmission.SubmissionStatus.VERIFIED);
            submission2.setSubmissionDate(LocalDateTime.now().minusDays(10));
            submission2.setVerificationDate(LocalDateTime.now().minusDays(9));
            submission2.setNotes("Recycled milk jugs");

            PlasticSubmission submission3 = new PlasticSubmission();
            submission3.setUser(user2);
            submission3.setWeight(3.2);
            submission3.setPlasticType("PET");
            submission3.setEcoPoints(32.0);
            submission3.setStatus(PlasticSubmission.SubmissionStatus.VERIFIED);
            submission3.setSubmissionDate(LocalDateTime.now().minusDays(7));
            submission3.setVerificationDate(LocalDateTime.now().minusDays(6));
            submission3.setNotes("Recycled plastic containers");

            List<PlasticSubmission> submissions = plasticSubmissionRepository.saveAll(
                    Arrays.asList(submission1, submission2, submission3)
            );
            System.out.println("Initialized plastic submissions: " + submissions.size());
        };
    }
    
    private void addNewPlants(ProductRepository productRepository) {
        // Fiddle Leaf Fig
        Product fiddle = new Product();
        fiddle.setName("Fiddle Leaf Fig");
        fiddle.setDescription("Large, beautiful Fiddle Leaf Fig plant");
        fiddle.setPrice(49.99);
        fiddle.setEcoPointsCost(400);
        fiddle.setEcoPointsReward(80);
        fiddle.setStock(10);
        fiddle.setCategory(Product.ProductCategory.PLANTS);
        fiddle.setIsPlant(true);
        fiddle.setImageUrl("/images/products/0c8397d0-44ba-41b9-ba04-25a8db41ba02.jpg");
        productRepository.save(fiddle);

        // Peace Lily
        Product peaceLily = new Product();
        peaceLily.setName("Peace Lily");
        peaceLily.setDescription("Elegant Peace Lily plant");
        peaceLily.setPrice(34.99);
        peaceLily.setEcoPointsCost(280);
        peaceLily.setEcoPointsReward(55);
        peaceLily.setStock(15);
        peaceLily.setCategory(Product.ProductCategory.PLANTS);
        peaceLily.setIsPlant(true);
        peaceLily.setImageUrl("/images/products/f18d563e-3ab8-4ec0-b790-c8280636eaed.jpg");
        productRepository.save(peaceLily);

        // Aloe Vera
        Product aloe = new Product();
        aloe.setName("Aloe Vera");
        aloe.setDescription("Medicinal Aloe Vera plant");
        aloe.setPrice(19.99);
        aloe.setEcoPointsCost(160);
        aloe.setEcoPointsReward(30);
        aloe.setStock(20);
        aloe.setCategory(Product.ProductCategory.PLANTS);
        aloe.setIsPlant(true);
        aloe.setImageUrl("/images/products/6e40da72-9cd9-4937-bcee-fc38b6941b29.jpg");
        productRepository.save(aloe);

        // Boston Fern
        Product fern = new Product();
        fern.setName("Boston Fern");
        fern.setDescription("Lush Boston Fern plant");
        fern.setPrice(29.99);
        fern.setEcoPointsCost(240);
        fern.setEcoPointsReward(45);
        fern.setStock(12);
        fern.setCategory(Product.ProductCategory.PLANTS);
        fern.setIsPlant(true);
        fern.setImageUrl("/images/products/675fa6ed-5d3a-490a-ba29-a37e9b46662a.jpg");
        productRepository.save(fern);
    }

    private void updateExistingProductImages(ProductRepository productRepository) {
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
        
        // Update each product
        for (String productName : imageMap.keySet()) {
            productRepository.findByName(productName).ifPresent(product -> {
                // Only update if the image URL is an external URL or null
                if (product.getImageUrl() == null || product.getImageUrl().startsWith("http")) {
                    product.setImageUrl(imageMap.get(productName));
                    productRepository.save(product);
                    System.out.println("Updated image URL for product: " + productName);
                }
            });
        }
    }
} 