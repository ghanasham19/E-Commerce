package com.example.backend.service;

import com.example.backend.model.*;
import com.example.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    // Injecting our Email Service!
    @Autowired
    private EmailService emailService;

    @Transactional
    public Order createOrder(Long userId,String shippingAddress) {
        // 1. Get the user's cart
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user"));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cannot checkout: Cart is empty");
        }

        // 2. Create the main Order record
        Order order = new Order();
        order.setUser(cart.getUser());
        order.setStatus("Processing");
        order.setTotalPrice(0.0); 
        
        // Save to generate the Order ID
        order = orderRepository.save(order);
        order.setShippingAddress(shippingAddress);

        double calculateTotal = 0.0;

        // 3. Move items from Cart to Order
        for (CartItem cartItem : cart.getCartItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setSelectedOptions(cartItem.getSelectedOptions());
            orderItem.setCustomText(cartItem.getCustomText());
            orderItem.setDesignImage(cartItem.getDesignImage());
            
            orderItemRepository.save(orderItem);
            
            calculateTotal += (cartItem.getProduct().getPrice() * cartItem.getQuantity());
        }

        // 4. Update the final price and save
        order.setTotalPrice(calculateTotal);
        orderRepository.save(order);

        // 5. BULLETPROOF CART CLEARING: Delete items, clear memory list, and re-save empty cart
        cartItemRepository.deleteAll(cart.getCartItems());
        cart.getCartItems().clear(); 
        cartRepository.save(cart);

        // ==========================================
        // NEW: FIRE THE CONFIRMATION EMAIL!
        // ==========================================
        if (order.getUser() != null && order.getUser().getEmail() != null) {
            emailService.sendOrderConfirmationEmail(
                order.getUser().getEmail(), 
                order.getUser().getName(), 
                order.getId(), 
                order.getTotalPrice()
            );
        }

        return order;
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // ==========================================
    // Sends an email when the status changes
    // ==========================================
    public Order updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        
        // Trigger the automated email in the background
        if (order.getUser() != null && order.getUser().getEmail() != null) {
            // We use the new status directly to inform the customer
            emailService.sendOrderStatusEmail(
                order.getUser().getEmail(), 
                order.getUser().getName(), 
                order.getId(), 
                newStatus
            );
        }
        
        return savedOrder;
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // 1. Manually find and delete all items inside this order to prevent database crashes
        List<OrderItem> allItems = orderItemRepository.findAll();
        for (OrderItem item : allItems) {
            if (item.getOrder().getId().equals(orderId)) {
                orderItemRepository.delete(item);
            }
        }
        
        // 2. Safely delete the empty order
        orderRepository.delete(order);
    }

    @Transactional
    public void deleteAllOrders() {
        // Clear all child items first, then clear the main orders
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
    }
    
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
}