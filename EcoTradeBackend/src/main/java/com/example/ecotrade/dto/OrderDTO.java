package com.example.ecotrade.dto;

import com.example.ecotrade.model.Order.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long id;
    private Long userId;
    private List<OrderItemDTO> items = new ArrayList<>();
    private Double totalAmount;
    private LocalDateTime orderDate;
    private Integer ecoPointsEarned;
    private Integer ecoPointsUsed;
    private Boolean usePlastic = true;
    private OrderStatus status;
    private String shippingAddress;
    private String paymentMethod;
    
    // Additional fields for plastic recycling
    private PlasticDetailsDTO plasticDetails;
    
    // Additional fields for payment and shipping
    private PaymentDetailsDTO paymentDetails;
} 