package com.example.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime; // NEW IMPORT

@Data
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private Double price;
    
    @Column(columnDefinition = "LONGTEXT")	
    private String image;

    // Stores a JSON string of what inputs the admin wants the user to fill out
    @Column(columnDefinition = "TEXT")
    private String customizationOptions; 

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    // ==========================================
    // NEW FIELDS FOR THE HOMEPAGE UPGRADE
    // ==========================================

    // Admin toggle for the "Trending" section
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean isTrending = false;

    // Automatically tracks when the product was created for the "Newly Added" section
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // This tells Hibernate to automatically set the current date & time 
    // right before saving a brand new product to the database!
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}