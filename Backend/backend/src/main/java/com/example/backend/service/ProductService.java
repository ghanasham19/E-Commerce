package com.example.backend.service;

import com.example.backend.model.Product;
import com.example.backend.repository.ProductRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, Product updatedProduct) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Update the basic info
        existingProduct.setName(updatedProduct.getName());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setDescription(updatedProduct.getDescription());
        
        // NEW: Allow the admin to change the product's category later
        if (updatedProduct.getCategory() != null) {
            existingProduct.setCategory(updatedProduct.getCategory());
        }
        
        // Only update the image if the admin uploaded a new one
        if (updatedProduct.getImage() != null && !updatedProduct.getImage().isEmpty()) {
            existingProduct.setImage(updatedProduct.getImage());
        }
        
        // Update options
        if (updatedProduct.getCustomizationOptions() != null) {
            existingProduct.setCustomizationOptions(updatedProduct.getCustomizationOptions());
        }
        
        return productRepository.save(existingProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        try {
            productRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Cannot delete product because it is already linked to customer orders!");
        }
    }

    // ==========================================
    // NEW HOMEPAGE & ADMIN LOGIC
    // ==========================================

    public List<Product> getTrendingProducts() {
        return productRepository.findByIsTrendingTrue();
    }

    public List<Product> getNewArrivals() {
        // Automatically fetches the 8 most recently added items
        return productRepository.findTop8ByOrderByCreatedAtDesc();
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    @Transactional
    public Product toggleTrending(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        // Flip the boolean switch (if true make false, if false make true)
        product.setTrending(!product.isTrending()); 
        
        return productRepository.save(product);
    }
}