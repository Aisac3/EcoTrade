package com.example.ecotrade.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "plastic_submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlasticSubmission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "weight", nullable = false)
    private Double weight;
    
    @Column(name = "plastic_type")
    private String plasticType;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @Column
    private String description;
    
    @Column
    private String location;
    
    @Column(name = "submission_date", nullable = false)
    private LocalDateTime submissionDate = LocalDateTime.now();
    
    @Column(name = "eco_points", nullable = false)
    private Double ecoPoints = 0.0;
    
    @Column(name = "verification_date")
    private LocalDateTime verificationDate;
    
    @Column(name = "verification_notes")
    private String verificationNotes;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.PENDING;
    
    @Column
    private String notes;
    
    public enum SubmissionStatus {
        PENDING, VERIFIED, REJECTED
    }
} 