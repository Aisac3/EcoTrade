package com.example.ecotrade.repository;

import com.example.ecotrade.model.PlasticSubmission;
import com.example.ecotrade.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlasticSubmissionRepository extends JpaRepository<PlasticSubmission, Long> {
    List<PlasticSubmission> findByUser(User user);
    List<PlasticSubmission> findByUserId(Long userId);
} 