package com.example.ecotrade.controller;

import com.example.ecotrade.dto.LoginRequest;
import com.example.ecotrade.dto.RegisterRequest;
import com.example.ecotrade.dto.UserDTO;
import com.example.ecotrade.model.User;
import com.example.ecotrade.repository.UserRepository;
import com.example.ecotrade.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        // Check if email already exists
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Email already in use");
        }

        // Create new user
        User user = new User();
        user.setName(registerRequest.getName());
        user.setFullName(registerRequest.getName()); // Set fullName same as name initially
        // Generate a username from email (part before @)
        String username = registerRequest.getEmail().split("@")[0];
        user.setUsername(username);
        user.setEmail(registerRequest.getEmail());
        user.setPassword(registerRequest.getPassword()); // In a real app, you would hash this
        user.setEcoPoints(100); // Give 100 EcoPoints to new users
        user.setRole("USER"); // Set default role to USER
        
        User savedUser = userRepository.save(user);
        
        // Convert to DTO to avoid sending sensitive information
        UserDTO userDTO = new UserDTO();
        userDTO.setId(savedUser.getId());
        userDTO.setName(savedUser.getName());
        userDTO.setFullName(savedUser.getFullName());
        userDTO.setUsername(savedUser.getUsername());
        userDTO.setEmail(savedUser.getEmail());
        userDTO.setEcoPoints(savedUser.getEcoPoints());
        userDTO.setRole(savedUser.getRole()); // Include role in response
        
        return ResponseEntity.ok(userDTO);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        
        if (userOptional.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
        
        User user = userOptional.get();
        
        // In a real app, you would use a password encoder to check the password
        if (!user.getPassword().equals(loginRequest.getPassword())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
        
        // Convert to DTO to avoid sending sensitive information
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setFullName(user.getFullName());
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setEcoPoints(user.getEcoPoints());
        userDTO.setRole(user.getRole()); // Include role in response
        
        return ResponseEntity.ok(userDTO);
    }
} 