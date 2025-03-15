package com.example.ecotrade.dto;

import com.example.ecotrade.model.PlasticSubmission.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlasticSubmissionDTO {
    private Long id;
    private Long userId;
    private String userName;
    private Double weight;
    private String plasticType;
    private String imageUrl;
    private String description;
    private String location;
    private LocalDateTime submissionDate;
    private Double ecoPoints;
    private LocalDateTime verificationDate;
    private String verificationNotes;
    private SubmissionStatus status;
    private String notes;
}