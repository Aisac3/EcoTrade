package com.example.ecotrade.controller;

import com.example.ecotrade.dto.PlasticSubmissionDTO;
import com.example.ecotrade.service.PlasticSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/plastic-submissions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class PlasticSubmissionController {

    private final PlasticSubmissionService plasticSubmissionService;

    @Autowired
    public PlasticSubmissionController(PlasticSubmissionService plasticSubmissionService) {
        this.plasticSubmissionService = plasticSubmissionService;
    }

    @GetMapping
    public ResponseEntity<List<PlasticSubmissionDTO>> getAllSubmissions() {
        return ResponseEntity.ok(plasticSubmissionService.getAllSubmissions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlasticSubmissionDTO> getSubmissionById(@PathVariable Long id) {
        return ResponseEntity.ok(plasticSubmissionService.getSubmissionById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PlasticSubmissionDTO>> getSubmissionsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(plasticSubmissionService.getSubmissionsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<PlasticSubmissionDTO> createSubmission(@RequestBody PlasticSubmissionDTO submissionDTO) {
        return new ResponseEntity<>(plasticSubmissionService.createSubmission(submissionDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<PlasticSubmissionDTO> verifySubmission(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String notes = payload.getOrDefault("notes", "");
        return ResponseEntity.ok(plasticSubmissionService.verifySubmission(id, notes));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<PlasticSubmissionDTO> rejectSubmission(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String notes = payload.getOrDefault("notes", "");
        return ResponseEntity.ok(plasticSubmissionService.rejectSubmission(id, notes));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubmission(@PathVariable Long id) {
        plasticSubmissionService.deleteSubmission(id);
        return ResponseEntity.noContent().build();
    }
} 