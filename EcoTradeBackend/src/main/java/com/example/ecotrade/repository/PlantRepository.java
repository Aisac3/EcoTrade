package com.example.ecotrade.repository;

import com.example.ecotrade.model.Plant;
import com.example.ecotrade.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlantRepository extends JpaRepository<Plant, Long> {
    List<Plant> findByUser(User user);
    List<Plant> findByUserId(Long userId);
    List<Plant> findByUserIdAndProductId(Long userId, Long productId);
} 