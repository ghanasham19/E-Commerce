package com.example.backend.controller;

import com.example.backend.model.Product;
import com.example.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Existing: Get All Products
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return new ResponseEntity<>(productService.getAllProducts(), HttpStatus.OK);
    }

    // Existing: Get Single Product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> product = productService.getProductById(id);
        return product.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // ==========================================
    // NEW PUBLIC HOMEPAGE ENDPOINTS
    // ==========================================

    @GetMapping("/trending")
    public ResponseEntity<List<Product>> getTrendingProducts() {
        return new ResponseEntity<>(productService.getTrendingProducts(), HttpStatus.OK);
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<List<Product>> getNewArrivals() {
        return new ResponseEntity<>(productService.getNewArrivals(), HttpStatus.OK);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Long categoryId) {
        return new ResponseEntity<>(productService.getProductsByCategory(categoryId), HttpStatus.OK);
    }

    // ==========================================
    // NEW ADMIN ENDPOINT
    // ==========================================

    // Admin flips the "Trending" switch on or off
    @PutMapping("/admin/{id}/toggle-trending")
    public ResponseEntity<Product> toggleTrending(@PathVariable Long id) {
        try {
            Product updatedProduct = productService.toggleTrending(id);
            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}