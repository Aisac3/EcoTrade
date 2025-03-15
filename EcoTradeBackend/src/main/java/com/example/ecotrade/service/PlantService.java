package com.example.ecotrade.service;

import com.example.ecotrade.dto.PlantDTO;
import com.example.ecotrade.exception.ResourceNotFoundException;
import com.example.ecotrade.model.*;
import com.example.ecotrade.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlantService {

    @Autowired
    private PlantRepository plantRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private PlantGrowthRecordRepository plantGrowthRecordRepository;
    
    @Autowired
    private UserService userService;
    
    public List<PlantDTO> getAllPlants() {
        return plantRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public PlantDTO getPlantById(Long id) {
        Plant plant = plantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plant not found with id: " + id));
        return convertToDTO(plant);
    }
    
    public List<PlantDTO> getPlantsByUserId(Long userId) {
        return plantRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PlantDTO> getPlantsFromUserOrders(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Get all orders for the user
        List<Order> userOrders = orderRepository.findByUserId(userId);
        
        // Create a list to store plants from orders
        List<Plant> plantsFromOrders = new ArrayList<>();
        
        // For each order, check if it contains plant products
        for (Order order : userOrders) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                
                // Check if the product is a plant
                if (product != null && product.getIsPlant()) {
                    // Check if plants from this order and product already exist
                    List<Plant> existingPlants = plantRepository.findByUserIdAndProductId(userId, product.getId());
                    
                    // Filter to find plants specifically from this order
                    List<Plant> existingOrderPlants = existingPlants.stream()
                        .filter(p -> p.getName() != null && p.getName().contains("Order #" + order.getId()))
                        .collect(Collectors.toList());
                    
                    // Count how many plants we need to create based on quantity
                    int quantityOrdered = item.getQuantity();
                    int existingCount = existingOrderPlants.size();
                    int plantsToCreate = quantityOrdered - existingCount;
                    
                    // Add existing plants to the result list
                    plantsFromOrders.addAll(existingOrderPlants);
                    
                    // Create new plants if needed
                    for (int i = 0; i < plantsToCreate; i++) {
                        // Create a new plant for this product and order
                        Plant newPlant = new Plant();
                        newPlant.setUser(user);
                        newPlant.setProduct(product);
                        
                        // Create a unique name with order ID, date, and plastic usage
                        String orderDate = order.getOrderDate().toLocalDate().toString();
                        String plasticInfo = order.getUsePlastic() ? "with plastic" : "eco-friendly";
                        String uniqueName = product.getName() + " (Order #" + order.getId() 
                            + ", " + orderDate + ", " + plasticInfo;
                        
                        // Add a count suffix if there are multiple plants of the same type in one order
                        if (quantityOrdered > 1) {
                            uniqueName += ", #" + (existingCount + i + 1) + " of " + quantityOrdered;
                        }
                        uniqueName += ")";
                        
                        newPlant.setName(uniqueName);
                        newPlant.setSpecies(product.getDescription());
                        newPlant.setPlantingDate(LocalDate.now());
                        newPlant.setPurchaseDate(order.getOrderDate());
                        newPlant.setGrowthStage("Seedling");
                        newPlant.setHealthStatus("Good");
                        newPlant.setImageUrl(product.getImageUrl());
                        
                        // Save the new plant
                        Plant savedPlant = plantRepository.save(newPlant);
                        plantsFromOrders.add(savedPlant);
                    }
                }
            }
        }
        
        // Return the list of plants from orders
        return plantsFromOrders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public PlantDTO recordMaintenance(Long id, String maintenanceType, String notes) {
        Plant plant = plantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plant not found with id: " + id));
        
        // Create a new growth record
        PlantGrowthRecord record = new PlantGrowthRecord();
        record.setPlant(plant);
        record.setRecordDate(LocalDate.now());
        record.setNotes(notes);
        
        // Update plant based on maintenance type
        int ecoPointsEarned = 0;
        
        switch (maintenanceType.toLowerCase()) {
            case "water":
                plant.setLastWatered(LocalDate.now());
                ecoPointsEarned = calculateWateringPoints(plant);
                break;
            case "fertilize":
                plant.setLastFertilized(LocalDate.now());
                ecoPointsEarned = calculateFertilizingPoints(plant);
                break;
            case "prune":
                ecoPointsEarned = 5; // Base points for pruning
                break;
            case "repot":
                ecoPointsEarned = 15; // Base points for repotting
                break;
            default:
                ecoPointsEarned = 2; // Base points for other maintenance
        }
        
        // Update growth stage based on time since planting
        updateGrowthStage(plant);
        
        // Save the growth record
        plantGrowthRecordRepository.save(record);
        
        // Save the updated plant
        Plant updatedPlant = plantRepository.save(plant);
        
        // Award EcoPoints to the user
        if (ecoPointsEarned > 0) {
            userService.addEcoPoints(plant.getUser().getId(), ecoPointsEarned, 
                    "Plant maintenance: " + maintenanceType + " for " + plant.getName());
        }
        
        return convertToDTO(updatedPlant);
    }
    
    public PlantDTO recordMaintenance(Long id, String maintenanceType, String notes, Double currentHeightCm) {
        Plant plant = plantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plant not found with id: " + id));
        
        // Create a new growth record
        PlantGrowthRecord record = new PlantGrowthRecord();
        record.setPlant(plant);
        record.setRecordDate(LocalDate.now());
        record.setNotes(notes);
        
        // Update height if provided
        if (currentHeightCm != null) {
            // Record the height in the growth record
            record.setHeightCm(currentHeightCm);
            
            // Update the plant's current height
            Double previousHeight = plant.getCurrentHeightCm();
            plant.setCurrentHeightCm(currentHeightCm);
            
            // Award bonus points for growth
            if (previousHeight != null && currentHeightCm > previousHeight) {
                // Calculate growth in cm
                double growth = currentHeightCm - previousHeight;
                
                // Award 2 points per cm of growth
                int growthPoints = (int) Math.ceil(growth * 2);
                
                // Add to the user's EcoPoints
                userService.addEcoPoints(plant.getUser().getId(), growthPoints, 
                        "Plant growth: " + growth + " cm for " + plant.getName());
            }
        }
        
        // Update plant based on maintenance type
        int ecoPointsEarned = 0;
        
        switch (maintenanceType.toLowerCase()) {
            case "water":
                plant.setLastWatered(LocalDate.now());
                ecoPointsEarned = calculateWateringPoints(plant);
                break;
            case "fertilize":
                plant.setLastFertilized(LocalDate.now());
                ecoPointsEarned = calculateFertilizingPoints(plant);
                break;
            case "prune":
                ecoPointsEarned = 5; // Base points for pruning
                break;
            case "repot":
                ecoPointsEarned = 15; // Base points for repotting
                break;
            default:
                ecoPointsEarned = 2; // Base points for other maintenance
        }
        
        // Update growth stage based on time since planting
        updateGrowthStage(plant);
        
        // Save the growth record
        plantGrowthRecordRepository.save(record);
        
        // Save the updated plant
        Plant updatedPlant = plantRepository.save(plant);
        
        // Award EcoPoints to the user
        if (ecoPointsEarned > 0) {
            userService.addEcoPoints(plant.getUser().getId(), ecoPointsEarned, 
                    "Plant maintenance: " + maintenanceType + " for " + plant.getName());
        }
        
        return convertToDTO(updatedPlant);
    }
    
    private int calculateWateringPoints(Plant plant) {
        // Base points for watering
        int points = 3;
        
        // Check if this is regular watering (weekly)
        if (plant.getLastWatered() != null) {
            long daysSinceLastWatering = ChronoUnit.DAYS.between(plant.getLastWatered(), LocalDate.now());
            
            // If watering is done on schedule (5-9 days), award bonus points
            if (daysSinceLastWatering >= 5 && daysSinceLastWatering <= 9) {
                points += 2; // Bonus for regular watering
            }
        }
        
        return points;
    }
    
    private int calculateFertilizingPoints(Plant plant) {
        // Base points for fertilizing
        int points = 5;
        
        // Check if this is regular fertilizing (monthly)
        if (plant.getLastFertilized() != null) {
            long daysSinceLastFertilizing = ChronoUnit.DAYS.between(plant.getLastFertilized(), LocalDate.now());
            
            // If fertilizing is done on schedule (25-35 days), award bonus points
            if (daysSinceLastFertilizing >= 25 && daysSinceLastFertilizing <= 35) {
                points += 5; // Bonus for regular fertilizing
            }
        }
        
        return points;
    }
    
    private void updateGrowthStage(Plant plant) {
        if (plant.getPlantingDate() == null) {
            return;
        }
        
        long daysSincePlanting = ChronoUnit.DAYS.between(plant.getPlantingDate(), LocalDate.now());
        
        // Update growth stage based on time
        if (daysSincePlanting < 14) {
            plant.setGrowthStage("Seedling");
        } else if (daysSincePlanting < 45) {
            plant.setGrowthStage("Young Plant");
        } else if (daysSincePlanting < 90) {
            plant.setGrowthStage("Mature Plant");
        } else {
            plant.setGrowthStage("Fully Grown");
        }
    }
    
    public PlantDTO createPlant(PlantDTO plantDTO) {
        User user = userRepository.findById(plantDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + plantDTO.getUserId()));
        
        Product product = null;
        if (plantDTO.getProductId() != null) {
            product = productRepository.findById(plantDTO.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + plantDTO.getProductId()));
        }
        
        Plant plant = new Plant();
        plant.setUser(user);
        plant.setProduct(product);
        
        if (plantDTO.getPlantingDate() == null) {
            plant.setPlantingDate(LocalDate.now());
        } else {
            plant.setPlantingDate(plantDTO.getPlantingDate());
        }
        
        if (plantDTO.getPurchaseDate() == null) {
            plant.setPurchaseDate(LocalDateTime.now());
        } else {
            plant.setPurchaseDate(plantDTO.getPurchaseDate());
        }
        
        plant.setName(plantDTO.getName());
        plant.setSpecies(plantDTO.getSpecies());
        plant.setPlantName(plantDTO.getPlantName());
        plant.setLastWatered(plantDTO.getLastWatered());
        plant.setLastFertilized(plantDTO.getLastFertilized());
        plant.setGrowthStage(plantDTO.getGrowthStage());
        plant.setHealthStatus(plantDTO.getHealthStatus());
        plant.setCurrentHeightCm(plantDTO.getCurrentHeightCm());
        plant.setImageUrl(plantDTO.getImageUrl());
        plant.setNotes(plantDTO.getNotes());
        
        return convertToDTO(plantRepository.save(plant));
    }
    
    public PlantDTO updatePlant(Long id, PlantDTO plantDTO) {
        Plant plant = plantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plant not found with id: " + id));
        
        // Update user if changed
        if (plant.getUser().getId() != plantDTO.getUserId()) {
            User user = userRepository.findById(plantDTO.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + plantDTO.getUserId()));
            plant.setUser(user);
        }
        
        // Update product if changed
        if ((plant.getProduct() == null && plantDTO.getProductId() != null) ||
            (plant.getProduct() != null && !plant.getProduct().getId().equals(plantDTO.getProductId()))) {
            Product product = productRepository.findById(plantDTO.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + plantDTO.getProductId()));
            plant.setProduct(product);
        }
        
        plant.setName(plantDTO.getName());
        plant.setSpecies(plantDTO.getSpecies());
        plant.setPlantName(plantDTO.getPlantName());
        plant.setPlantingDate(plantDTO.getPlantingDate());
        plant.setPurchaseDate(plantDTO.getPurchaseDate());
        plant.setLastWatered(plantDTO.getLastWatered());
        plant.setLastFertilized(plantDTO.getLastFertilized());
        plant.setGrowthStage(plantDTO.getGrowthStage());
        plant.setHealthStatus(plantDTO.getHealthStatus());
        plant.setCurrentHeightCm(plantDTO.getCurrentHeightCm());
        plant.setImageUrl(plantDTO.getImageUrl());
        plant.setNotes(plantDTO.getNotes());
        
        return convertToDTO(plantRepository.save(plant));
    }
    
    public PlantDTO waterPlant(Long id) {
        Plant plant = plantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plant not found with id: " + id));
        
        plant.setLastWatered(LocalDate.now());
        
        return convertToDTO(plantRepository.save(plant));
    }
    
    public PlantDTO fertilizePlant(Long id) {
        Plant plant = plantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plant not found with id: " + id));
        
        plant.setLastFertilized(LocalDate.now());
        
        return convertToDTO(plantRepository.save(plant));
    }
    
    public void deletePlant(Long id) {
        if (!plantRepository.existsById(id)) {
            throw new ResourceNotFoundException("Plant not found with id: " + id);
        }
        plantRepository.deleteById(id);
    }
    
    private PlantDTO convertToDTO(Plant plant) {
        PlantDTO dto = new PlantDTO();
        dto.setId(plant.getId());
        dto.setUserId(plant.getUser().getId());
        dto.setUserName(plant.getUser().getName());
        if (plant.getProduct() != null) {
            dto.setProductId(plant.getProduct().getId());
            dto.setProductName(plant.getProduct().getName());
        }
        dto.setName(plant.getName());
        dto.setSpecies(plant.getSpecies());
        dto.setPlantName(plant.getPlantName());
        dto.setPlantingDate(plant.getPlantingDate());
        dto.setPurchaseDate(plant.getPurchaseDate());
        dto.setLastWatered(plant.getLastWatered());
        dto.setLastFertilized(plant.getLastFertilized());
        dto.setGrowthStage(plant.getGrowthStage());
        dto.setHealthStatus(plant.getHealthStatus());
        dto.setCurrentHeightCm(plant.getCurrentHeightCm());
        dto.setImageUrl(plant.getImageUrl());
        dto.setNotes(plant.getNotes());
        return dto;
    }
} 