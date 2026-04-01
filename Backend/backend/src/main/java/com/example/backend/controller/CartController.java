package com.example.backend.controller;

import com.example.backend.dto.CartRequest;
import com.example.backend.model.Cart;
import com.example.backend.model.CartItem;
import com.example.backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173") // Fixes any CORS issues
public class CartController {

    @Autowired
    private CartService cartService;

    // 1. Add item to cart
    @PostMapping("/add")
    public ResponseEntity<CartItem> addToCart(@RequestBody CartRequest request) {
        return ResponseEntity.ok(cartService.addToCart(request));
    }

    // 2. Fetch the user's cart
    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCartByUserId(@PathVariable Long userId) {
        Cart cart = cartService.getCartByUserId(userId);
        if (cart == null) {
            return ResponseEntity.notFound().build(); // Triggers the empty cart UI in React
        }
        return ResponseEntity.ok(cart);
    }

    // ==========================================
    // THE FIX: THE MISSING REMOVE ENDPOINT
    // ==========================================
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<?> removeCartItem(@PathVariable Long cartItemId) {
        cartService.removeCartItem(cartItemId);
        return ResponseEntity.ok().build(); // Returns a success status to React
    }
}