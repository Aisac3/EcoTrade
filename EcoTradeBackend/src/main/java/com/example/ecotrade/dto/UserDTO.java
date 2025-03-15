package com.example.ecotrade.dto;

public class UserDTO {
    private Long id;
    private String name;
    private String fullName;
    private String username;
    private String email;
    private String password;
    private Integer ecoPoints;
    private String role;

    public UserDTO() {
    }

    public UserDTO(Long id, String name, String fullName, String username, String email, Integer ecoPoints, String role) {
        this.id = id;
        this.name = name;
        this.fullName = fullName;
        this.username = username;
        this.email = email;
        this.ecoPoints = ecoPoints;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getEcoPoints() {
        return ecoPoints;
    }

    public void setEcoPoints(Integer ecoPoints) {
        this.ecoPoints = ecoPoints;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
} 