package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "cart_items")
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // NEW: Add JsonIgnore to prevent infinite JSON loops
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "cart_id")
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantity;
    
    @Column(columnDefinition = "TEXT")
    private String selectedOptions; 
    
    private String customText;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String designImage; 
}