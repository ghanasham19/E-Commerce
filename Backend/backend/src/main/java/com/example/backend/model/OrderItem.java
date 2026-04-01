package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantity;
    
    // NEW: Matches the CartItem
    @Column(columnDefinition = "TEXT")
    private String selectedOptions; 
    
    private String customText;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String designImage;
}