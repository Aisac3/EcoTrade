package com.example.ecotrade.service;

import com.example.ecotrade.dto.UserDTO;
import com.example.ecotrade.exception.ResourceNotFoundException;
import com.example.ecotrade.model.User;
import com.example.ecotrade.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToDTO(user);
    }

    public UserDTO createUser(UserDTO userDTO) {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        
        // Check if username exists
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new IllegalArgumentException("Username already in use");
        }
        
        User user = convertToEntity(userDTO);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        user.setName(userDTO.getName());
        
        if (userDTO.getFullName() != null) {
            user.setFullName(userDTO.getFullName());
        }
        
        // Only update username if it's changed and not already in use
        if (userDTO.getUsername() != null && !user.getUsername().equals(userDTO.getUsername())) {
            if (userRepository.existsByUsername(userDTO.getUsername())) {
                throw new IllegalArgumentException("Username already in use");
            }
            user.setUsername(userDTO.getUsername());
        }
        
        // Only update email if it's changed and not already in use by another user
        if (!user.getEmail().equals(userDTO.getEmail())) {
            if (userRepository.existsByEmail(userDTO.getEmail())) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(userDTO.getEmail());
        }
        
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }
        
        if (userDTO.getEcoPoints() != null) {
            user.setEcoPoints(userDTO.getEcoPoints());
        }
        
        // Update role if provided
        if (userDTO.getRole() != null) {
            user.setRole(userDTO.getRole());
        }
        
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
    }

    public UserDTO addEcoPoints(Long id, Integer points) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setEcoPoints(user.getEcoPoints() + points);
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }
    
    public UserDTO addEcoPoints(Long id, Integer points, String reason) {
        // Log the reason for adding points
        System.out.println("Adding " + points + " EcoPoints to user " + id + " for: " + reason);
        return addEcoPoints(id, points);
    }

    public UserDTO useEcoPoints(Long id, Integer points) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        if (user.getEcoPoints() < points) {
            throw new IllegalArgumentException("User does not have enough eco points");
        }
        
        user.setEcoPoints(user.getEcoPoints() - points);
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setFullName(user.getFullName());
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setEcoPoints(user.getEcoPoints());
        userDTO.setRole(user.getRole());
        return userDTO;
    }
    
    private User convertToEntity(UserDTO userDTO) {
        User user = new User();
        user.setId(userDTO.getId());
        user.setName(userDTO.getName());
        user.setFullName(userDTO.getFullName() != null ? userDTO.getFullName() : userDTO.getName());
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(userDTO.getPassword());
        user.setEcoPoints(userDTO.getEcoPoints() != null ? userDTO.getEcoPoints() : 0);
        user.setRole(userDTO.getRole() != null ? userDTO.getRole() : "USER");
        return user;
    }
} 