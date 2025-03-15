package com.example.ecotrade.repository;

import com.example.ecotrade.model.Plant;
import com.example.ecotrade.model.PlantGrowthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlantGrowthRecordRepository extends JpaRepository<PlantGrowthRecord, Long> {
    List<PlantGrowthRecord> findByPlant(Plant plant);
    List<PlantGrowthRecord> findByPlantId(Long plantId);
} 