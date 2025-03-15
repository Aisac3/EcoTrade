package com.example.ecotrade.service;

import com.example.ecotrade.dto.OrderDTO;
import com.example.ecotrade.dto.OrderItemDTO;
import com.example.ecotrade.exception.ResourceNotFoundException;
import com.example.ecotrade.model.Order;
import com.example.ecotrade.model.OrderItem;
import com.example.ecotrade.model.Product;
import com.example.ecotrade.model.User;
import com.example.ecotrade.repository.OrderRepository;
import com.example.ecotrade.repository.ProductRepository;
import com.example.ecotrade.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return convertToDTO(order);
    }

    public List<OrderDTO> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDTO createOrder(OrderDTO orderDTO) {
        User user = userRepository.findById(orderDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + orderDTO.getUserId()));
        
        // Create new order
        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(orderDTO.getTotalAmount());
        order.setEcoPointsEarned(orderDTO.getEcoPointsEarned());
        order.setEcoPointsUsed(orderDTO.getEcoPointsUsed());
        order.setUsePlastic(orderDTO.getUsePlastic());
        order.setStatus(Order.OrderStatus.PENDING);
        
        // Set shipping address from payment details if available
        if (orderDTO.getPaymentDetails() != null) {
            StringBuilder addressBuilder = new StringBuilder();
            addressBuilder.append(orderDTO.getPaymentDetails().getName()).append(", ");
            addressBuilder.append(orderDTO.getPaymentDetails().getAddress()).append(", ");
            addressBuilder.append(orderDTO.getPaymentDetails().getCity()).append(", ");
            addressBuilder.append(orderDTO.getPaymentDetails().getState()).append(" - ");
            addressBuilder.append(orderDTO.getPaymentDetails().getPincode());
            
            order.setShippingAddress(addressBuilder.toString());
            order.setPaymentMethod(orderDTO.getPaymentDetails().getPaymentMethod());
        }
        
        // Save order first to get ID
        Order savedOrder = orderRepository.save(order);
        
        // Process each item
        for (OrderItemDTO itemDTO : orderDTO.getItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemDTO.getProductId()));
            
            if (product.getStock() < itemDTO.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }
            
            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setPrice(itemDTO.getPrice());
            orderItem.setRedeemedWithPoints(itemDTO.getRedeemedWithPoints());
            
            // Add item to order
            savedOrder.addItem(orderItem);
            
            // Update product stock
            product.setStock(product.getStock() - itemDTO.getQuantity());
            productRepository.save(product);
        }
        
        // Update user's EcoPoints
        if (orderDTO.getEcoPointsUsed() > 0) {
            user.setEcoPoints(user.getEcoPoints() - orderDTO.getEcoPointsUsed());
        }
        
        // Add EcoPoints for plastic recycling if applicable
        if (orderDTO.getUsePlastic() && orderDTO.getPlasticDetails() != null) {
            int extraPoints = (int) Math.round(orderDTO.getPlasticDetails().getWeight() * 10);
            user.setEcoPoints(user.getEcoPoints() + extraPoints);
        }
        
        userRepository.save(user);
        
        // Save order again with all items
        Order finalOrder = orderRepository.save(savedOrder);
        return convertToDTO(finalOrder);
    }

    @Transactional
    public OrderDTO updateOrder(Long id, OrderDTO orderDTO) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (orderDTO.getShippingAddress() != null) {
            order.setShippingAddress(orderDTO.getShippingAddress());
        }

        Order updatedOrder = orderRepository.save(order);
        return convertToDTO(updatedOrder);
    }

    @Transactional
    public OrderDTO confirmOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalArgumentException("Order cannot be confirmed in current status: " + order.getStatus());
        }

        order.setStatus(Order.OrderStatus.CONFIRMED);
        Order updatedOrder = orderRepository.save(order);
        return convertToDTO(updatedOrder);
    }

    @Transactional
    public OrderDTO shipOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new IllegalArgumentException("Order cannot be shipped in current status: " + order.getStatus());
        }

        order.setStatus(Order.OrderStatus.SHIPPED);
        Order updatedOrder = orderRepository.save(order);
        return convertToDTO(updatedOrder);
    }

    @Transactional
    public OrderDTO deliverOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (order.getStatus() != Order.OrderStatus.SHIPPED) {
            throw new IllegalArgumentException("Order cannot be delivered in current status: " + order.getStatus());
        }

        order.setStatus(Order.OrderStatus.DELIVERED);
        
        // Award eco points to user
        User user = order.getUser();
        user.setEcoPoints(user.getEcoPoints() + order.getEcoPointsEarned());
        userRepository.save(user);

        Order updatedOrder = orderRepository.save(order);
        return convertToDTO(updatedOrder);
    }

    @Transactional
    public OrderDTO cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (order.getStatus() == Order.OrderStatus.DELIVERED || order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Order cannot be cancelled in current status: " + order.getStatus());
        }

        // Restore product stock for each item
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        Order updatedOrder = orderRepository.save(order);
        return convertToDTO(updatedOrder);
    }

    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (order.getStatus() != Order.OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Only cancelled orders can be deleted");
        }

        orderRepository.delete(order);
    }

    private OrderDTO convertToDTO(Order order) {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setId(order.getId());
        orderDTO.setUserId(order.getUser().getId());
        orderDTO.setTotalAmount(order.getTotalAmount());
        orderDTO.setOrderDate(order.getOrderDate());
        orderDTO.setEcoPointsEarned(order.getEcoPointsEarned());
        orderDTO.setEcoPointsUsed(order.getEcoPointsUsed());
        orderDTO.setUsePlastic(order.getUsePlastic());
        orderDTO.setStatus(order.getStatus());
        orderDTO.setShippingAddress(order.getShippingAddress());
        orderDTO.setPaymentMethod(order.getPaymentMethod());
        
        // Convert order items
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(item -> {
                    OrderItemDTO itemDTO = new OrderItemDTO();
                    itemDTO.setId(item.getId());
                    itemDTO.setProductId(item.getProduct().getId());
                    itemDTO.setProductName(item.getProduct().getName());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setPrice(item.getPrice());
                    itemDTO.setRedeemedWithPoints(item.getRedeemedWithPoints());
                    return itemDTO;
                })
                .collect(Collectors.toList());
        
        orderDTO.setItems(itemDTOs);
        
        return orderDTO;
    }
} 