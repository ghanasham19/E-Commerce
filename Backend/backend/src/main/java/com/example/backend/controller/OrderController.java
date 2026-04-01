package com.example.backend.controller;

import com.example.backend.model.Order;
import com.example.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173") // Fixes the CORS issue!
public class OrderController {

    @Autowired
    private OrderService orderService;

    // For Users: Create an order from their cart
    @PostMapping("/create/{userId}")
    public ResponseEntity<Order> createOrder(@PathVariable Long userId,@RequestBody java.util.Map<String, String> payload) {
    	String shippingAddress = payload.get("shippingAddress");
    	return ResponseEntity.ok(orderService.createOrder(userId, shippingAddress));
    }

    // For Users: View their own personal history
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }

    // ==========================================
    // NEW ADMIN ENDPOINTS BELOW
    // ==========================================

    // For Admins: View every order in the database
    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // For Admins: Change status from Processing -> Shipped -> Delivered
    @PutMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId, 
            @RequestParam String newStatus) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, newStatus));
    }
 // For Admins: Delete a single order
    @DeleteMapping("/{orderId}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.ok().build();
    }

    // For Admins: Nuke all orders (Great for cleaning up test data!)
    @DeleteMapping("/all")
    public ResponseEntity<?> deleteAllOrders() {
        orderService.deleteAllOrders();
        return ResponseEntity.ok().build();
    }
 // Get a specific order's full details
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }
}