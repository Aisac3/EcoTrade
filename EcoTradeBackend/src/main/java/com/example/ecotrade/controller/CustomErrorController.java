package com.example.ecotrade.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Integer statusCode = (Integer) request.getAttribute("jakarta.servlet.error.status_code");
        Exception exception = (Exception) request.getAttribute("jakarta.servlet.error.exception");
        String path = (String) request.getAttribute("jakarta.servlet.error.request_uri");
        
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("path", path);
        errorDetails.put("status", statusCode != null ? statusCode : 500);
        errorDetails.put("error", HttpStatus.valueOf(statusCode != null ? statusCode : 500).getReasonPhrase());
        errorDetails.put("message", exception != null ? exception.getMessage() : "Unknown error");
        errorDetails.put("timestamp", System.currentTimeMillis());
        
        // For API requests, return JSON
        if (path != null && path.startsWith("/api")) {
            return ResponseEntity.status(statusCode != null ? statusCode : 500).body(errorDetails);
        }
        
        // For frontend routes that should be handled by React, redirect to the frontend
        if (path != null && (
                path.equals("/") || 
                path.equals("/marketplace") || 
                path.equals("/waste-collection") || 
                path.equals("/plant-growth") || 
                path.equals("/community") || 
                path.equals("/profile") || 
                path.equals("/cart"))) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", "http://localhost:5173" + path)
                    .body(null);
        }
        
        // For other errors, return JSON
        return ResponseEntity.status(statusCode != null ? statusCode : 500).body(errorDetails);
    }
} 