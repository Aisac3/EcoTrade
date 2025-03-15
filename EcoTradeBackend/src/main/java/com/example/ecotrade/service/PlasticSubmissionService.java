package com.example.ecotrade.service;

import com.example.ecotrade.dto.PlasticSubmissionDTO;
import com.example.ecotrade.exception.ResourceNotFoundException;
import com.example.ecotrade.model.PlasticSubmission;
import com.example.ecotrade.model.PlasticSubmission.SubmissionStatus;
import com.example.ecotrade.model.User;
import com.example.ecotrade.repository.PlasticSubmissionRepository;
import com.example.ecotrade.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlasticSubmissionService {

    @Autowired
    private PlasticSubmissionRepository plasticSubmissionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;
    
    // Calculate eco points based on weight (1kg = 10 points)
    private double calculateEcoPoints(Double weightKg, String plasticType) {
        // Base calculation: 1kg = 10 points
        double basePoints = weightKg * 10;
        
        // Bonus points based on plastic type (if needed)
        if (plasticType != null) {
            switch (plasticType.toUpperCase()) {
                case "PET":
                case "HDPE":
                    // More valuable plastics get 20% bonus
                    return basePoints * 1.2;
                case "PVC":
                case "LDPE":
                    // Standard plastics get base points
                    return basePoints;
                default:
                    // Other plastics get base points
                    return basePoints;
            }
        }
        
        return basePoints;
    }
    
    public List<PlasticSubmissionDTO> getAllSubmissions() {
        return plasticSubmissionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public PlasticSubmissionDTO getSubmissionById(Long id) {
        PlasticSubmission submission = plasticSubmissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plastic submission not found with id: " + id));
        return convertToDTO(submission);
    }
    
    public List<PlasticSubmissionDTO> getSubmissionsByUserId(Long userId) {
        return plasticSubmissionRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public PlasticSubmissionDTO createSubmission(PlasticSubmissionDTO submissionDTO) {
        User user = userRepository.findById(submissionDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + submissionDTO.getUserId()));
        
        PlasticSubmission submission = new PlasticSubmission();
        submission.setUser(user);
        submission.setSubmissionDate(LocalDateTime.now());
        submission.setStatus(SubmissionStatus.PENDING);
        
        // Set other properties from DTO
        submission.setPlasticType(submissionDTO.getPlasticType());
        submission.setWeight(submissionDTO.getWeight());
        submission.setDescription(submissionDTO.getDescription());
        submission.setImageUrl(submissionDTO.getImageUrl());
        submission.setLocation(submissionDTO.getLocation());
        
        // Calculate eco points based on weight and plastic type
        double ecoPoints = calculateEcoPoints(submissionDTO.getWeight(), submissionDTO.getPlasticType());
        submission.setEcoPoints(ecoPoints);
        
        PlasticSubmission savedSubmission = plasticSubmissionRepository.save(submission);
        return convertToDTO(savedSubmission);
    }
    
    public PlasticSubmissionDTO verifySubmission(Long id, String notes) {
        PlasticSubmission submission = plasticSubmissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plastic submission not found with id: " + id));
        
        submission.setStatus(SubmissionStatus.VERIFIED);
        submission.setNotes(notes);
        submission.setVerificationDate(LocalDateTime.now());
        submission.setVerificationNotes(notes);
        
        // Award eco points to the user
        userService.addEcoPoints(submission.getUser().getId(), (int)Math.round(submission.getEcoPoints()));
        
        PlasticSubmission updatedSubmission = plasticSubmissionRepository.save(submission);
        return convertToDTO(updatedSubmission);
    }
    
    public PlasticSubmissionDTO rejectSubmission(Long id, String notes) {
        PlasticSubmission submission = plasticSubmissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plastic submission not found with id: " + id));
        
        submission.setStatus(SubmissionStatus.REJECTED);
        submission.setNotes(notes);
        submission.setVerificationDate(LocalDateTime.now());
        submission.setVerificationNotes(notes);
        
        PlasticSubmission updatedSubmission = plasticSubmissionRepository.save(submission);
        return convertToDTO(updatedSubmission);
    }
    
    public void deleteSubmission(Long id) {
        PlasticSubmission submission = plasticSubmissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plastic submission not found with id: " + id));
        plasticSubmissionRepository.delete(submission);
    }
    
    private PlasticSubmissionDTO convertToDTO(PlasticSubmission submission) {
        PlasticSubmissionDTO dto = new PlasticSubmissionDTO();
        dto.setId(submission.getId());
        dto.setUserId(submission.getUser().getId());
        dto.setUserName(submission.getUser().getName());
        dto.setWeight(submission.getWeight());
        dto.setPlasticType(submission.getPlasticType());
        dto.setImageUrl(submission.getImageUrl());
        dto.setDescription(submission.getDescription());
        dto.setLocation(submission.getLocation());
        dto.setSubmissionDate(submission.getSubmissionDate());
        dto.setEcoPoints(submission.getEcoPoints());
        dto.setStatus(submission.getStatus());
        dto.setNotes(submission.getNotes());
        return dto;
    }
} 