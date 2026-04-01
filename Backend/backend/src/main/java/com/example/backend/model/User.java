package com.example.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // This unique=true prevents the 2-results crash!
    @Column(unique = true, nullable = false)
    private String email;

    private String password;
    
    private String phone;
    
    private String role = "USER"; // Default role
}