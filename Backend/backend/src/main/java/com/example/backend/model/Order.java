package com.example.backend.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Double totalPrice;
    @Column(columnDefinition = "TEXT")
    private String shippingAddress;
    private String status; // e.g., "Processing", "Shipped", "Delivered"
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Automatically set the timestamp when a new order is saved
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
 // Tell Spring Boot to fetch the items inside this order
    @OneToMany(mappedBy = "order", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private java.util.List<OrderItem> orderItems;
}