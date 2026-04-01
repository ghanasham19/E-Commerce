package com.example.backend.dto;

import lombok.Data;

@Data
public class CartRequest {
    private Long userId;
    private Long productId;
    private Integer quantity;
    
    // NEW: Replaced size and color
    private String selectedOptions; 
    
    private String customText;
    private String designImage;
}