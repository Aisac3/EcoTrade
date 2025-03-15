package com.example.ecotrade.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDetailsDTO {
    private String name;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String paymentMethod;
} 